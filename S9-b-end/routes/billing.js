const express = require('express');
const { supabase } = require('../lib/supabase');
const { buildInvoicePdfBuffer, buildPayslipPdfBuffer } = require('../services/pdfService');
const { sendEmailWithAttachments } = require('../services/emailService');

const router = express.Router();

async function fetchBookingBundle(bookingId) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id,
      service_id,
      user_id,
      assigned_provider_id,
      created_at,
      scheduled_date,
      scheduled_time,
      service_address,
      service_city,
      service_state,
      service_country,
      contact_phone,
      contact_email,
      base_price,
      service_fee,
      tax_amount,
      total_amount,
      offer_discount_amount,
      payment_method,
      payment_status,
      payment_transaction_id,
      worker_payout_amount,
      worker_payout_status,
      company_commission_amount
    `)
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    const msg = error?.message || 'Booking not found';
    const err = new Error(msg);
    err.statusCode = 404;
    throw err;
  }

  const [{ data: customerRow }, { data: serviceRow }] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, user_profiles(first_name, last_name)')
      .eq('id', booking.user_id)
      .maybeSingle(),
    supabase
      .from('services')
      .select('id, name')
      .eq('id', booking.service_id)
      .maybeSingle()
  ]);

  const customerProfileRaw = customerRow?.user_profiles;
  const customerProfile = Array.isArray(customerProfileRaw) ? customerProfileRaw[0] : customerProfileRaw;
  const customerName = customerProfile
    ? `${String(customerProfile.first_name || '').trim()} ${String(customerProfile.last_name || '').trim()}`.trim()
    : null;

  return {
    booking,
    customer: {
      id: customerRow?.id || booking.user_id,
      email: customerRow?.email || booking.contact_email || null,
      name: customerName || customerRow?.email || 'Customer'
    },
    service: {
      id: serviceRow?.id || booking.service_id,
      name: serviceRow?.name || 'Service'
    }
  };
}

// Download invoice PDF for a booking
router.get('/invoice/:bookingId/pdf', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bundle = await fetchBookingBundle(bookingId);
    const pdf = await buildInvoicePdfBuffer(bundle);
    const fileName = `Invoice_${String(bundle.booking.id).slice(-8)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(pdf);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to generate invoice PDF' });
  }
});

// Email invoice PDF to customer
router.post('/invoice/email', async (req, res) => {
  try {
    const { booking_id } = req.body || {};
    if (!booking_id) return res.status(400).json({ error: 'booking_id is required' });

    const bundle = await fetchBookingBundle(booking_id);
    const to = bundle.customer.email;
    if (!to) return res.status(400).json({ error: 'Customer email not available for this booking' });

    const pdf = await buildInvoicePdfBuffer(bundle);
    const base64 = pdf.toString('base64');
    const fileName = `Invoice_${String(bundle.booking.id).slice(-8)}.pdf`;

    const subject = `Invoice from Nexus • Booking ${String(bundle.booking.id).slice(-8).toUpperCase()}`;
    const text = `Hi ${bundle.customer.name},\n\nAttached is your invoice for ${bundle.service.name}.\n\nThank you,\nNexus`;
    const html = `<p>Hi <strong>${bundle.customer.name}</strong>,</p><p>Attached is your invoice for <strong>${bundle.service.name}</strong>.</p><p>Thank you,<br/>Nexus</p>`;

    const emailResp = await sendEmailWithAttachments({
      to,
      subject,
      text,
      html,
      attachments: [
        { filename: fileName, contentBase64: base64, type: 'application/pdf', disposition: 'attachment' }
      ]
    });

    return res.json({ success: true, email: emailResp });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to email invoice' });
  }
});

// Download payslip PDF for a booking payout
router.get('/payslip/:bookingId/pdf', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bundle = await fetchBookingBundle(bookingId);

    if (!bundle.booking.assigned_provider_id) {
      return res.status(400).json({ error: 'No worker assigned to this booking' });
    }

    const { data: payoutRow } = await supabase
      .from('booking_worker_payouts')
      .select('id, booking_id, worker_id, total_amount, company_commission_amount, worker_payout_amount, payout_status, paid_at')
      .eq('booking_id', bookingId)
      .order('paid_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const workerId = bundle.booking.assigned_provider_id;
    const { data: workerRow } = await supabase
      .from('users')
      .select('id, email, user_profiles(first_name, last_name)')
      .eq('id', workerId)
      .maybeSingle();

    const profileRaw = workerRow?.user_profiles;
    const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
    const workerName = profile
      ? `${String(profile.first_name || '').trim()} ${String(profile.last_name || '').trim()}`.trim()
      : null;

    const worker = { id: workerId, email: workerRow?.email || null, name: workerName || workerRow?.email || 'Worker' };
    const pdf = await buildPayslipPdfBuffer({ booking: bundle.booking, worker, payout: payoutRow || {} });
    const fileName = `Payslip_${String(bundle.booking.id).slice(-8)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(pdf);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to generate payslip PDF' });
  }
});

// Email payslip PDF to worker after payout
router.post('/payslip/email', async (req, res) => {
  try {
    const { booking_id } = req.body || {};
    if (!booking_id) return res.status(400).json({ error: 'booking_id is required' });

    const bundle = await fetchBookingBundle(booking_id);
    const workerId = bundle.booking.assigned_provider_id;
    if (!workerId) return res.status(400).json({ error: 'No worker assigned to this booking' });

    const { data: payoutRow } = await supabase
      .from('booking_worker_payouts')
      .select('id, booking_id, worker_id, total_amount, company_commission_amount, worker_payout_amount, payout_status, paid_at')
      .eq('booking_id', booking_id)
      .order('paid_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const paid = String(payoutRow?.payout_status || bundle.booking.worker_payout_status || '').toLowerCase() === 'paid';
    if (!paid) {
      return res.status(400).json({ error: 'Worker payout is not marked as paid for this booking yet' });
    }

    const { data: workerRow } = await supabase
      .from('users')
      .select('id, email, user_profiles(first_name, last_name)')
      .eq('id', workerId)
      .maybeSingle();

    const profileRaw = workerRow?.user_profiles;
    const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
    const workerName = profile
      ? `${String(profile.first_name || '').trim()} ${String(profile.last_name || '').trim()}`.trim()
      : null;

    const to = workerRow?.email;
    if (!to) return res.status(400).json({ error: 'Worker email not available' });

    const worker = { id: workerId, email: to, name: workerName || to };
    const pdf = await buildPayslipPdfBuffer({ booking: bundle.booking, worker, payout: payoutRow || {} });
    const base64 = pdf.toString('base64');
    const fileName = `Payslip_${String(bundle.booking.id).slice(-8)}.pdf`;

    const subject = `Payslip from Nexus • Booking ${String(bundle.booking.id).slice(-8).toUpperCase()}`;
    const text = `Hi ${worker.name},\n\nAttached is your payslip for the completed job (${bundle.service.name}).\n\nThank you,\nNexus`;
    const html = `<p>Hi <strong>${worker.name}</strong>,</p><p>Attached is your payslip for the completed job (<strong>${bundle.service.name}</strong>).</p><p>Thank you,<br/>Nexus</p>`;

    const emailResp = await sendEmailWithAttachments({
      to,
      subject,
      text,
      html,
      attachments: [
        { filename: fileName, contentBase64: base64, type: 'application/pdf', disposition: 'attachment' }
      ]
    });

    return res.json({ success: true, email: emailResp });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to email payslip' });
  }
});

module.exports = router;

