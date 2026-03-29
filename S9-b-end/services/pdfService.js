const PDFDocument = require('pdfkit');

const money = (n) => {
  const num = Number(n) || 0;
  return `₹${num.toFixed(2)}`;
};

const safe = (v, fallback = '—') => {
  const s = String(v ?? '').trim();
  return s ? s : fallback;
};

function bufferFromDoc(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

function buildInvoicePdfBuffer({ booking, customer, service }) {
  const doc = new PDFDocument({ size: 'A4', margin: 48 });

  const invoiceNo = `INV-${safe(booking?.id).slice(-8).toUpperCase()}`;
  const createdAt = booking?.created_at ? new Date(booking.created_at) : new Date();

  // Header
  doc
    .fontSize(22)
    .fillColor('#1e293b')
    .text('Nexus', { continued: true })
    .fillColor('#4f9cf9')
    .text('  Invoice');

  doc
    .moveDown(0.5)
    .fillColor('#475569')
    .fontSize(10)
    .text('Nexus Services • Kerala, India')
    .text('billing@nexusservices.com');

  doc
    .moveDown(1)
    .fillColor('#0f172a')
    .fontSize(12)
    .text(`Invoice #: ${invoiceNo}`)
    .text(`Date: ${createdAt.toLocaleDateString('en-IN')}`);

  doc.moveDown(1);
  doc.fontSize(11).fillColor('#0f172a').text('Bill To');
  doc
    .fontSize(10)
    .fillColor('#334155')
    .text(safe(customer?.name))
    .text(safe(customer?.email))
    .text(safe(booking?.service_address))
    .text(
      [booking?.service_city, booking?.service_state, booking?.service_country]
        .filter(Boolean)
        .join(', ') || '—'
    )
    .text(`Phone: ${safe(booking?.contact_phone)}`);

  doc.moveDown(1);
  doc.fontSize(11).fillColor('#0f172a').text('Service');
  doc
    .fontSize(10)
    .fillColor('#334155')
    .text(`Name: ${safe(service?.name)}`)
    .text(`Scheduled: ${safe(booking?.scheduled_date)} ${booking?.scheduled_time ? `at ${booking.scheduled_time}` : ''}`.trim())
    .text(`Booking ID: ${safe(booking?.id)}`);

  doc.moveDown(1);
  doc.fontSize(11).fillColor('#0f172a').text('Amount');

  const base = Number(booking?.base_price) || 0;
  const fee = Number(booking?.service_fee) || 0;
  const tax = Number(booking?.tax_amount) || 0;
  const discount = Number(booking?.offer_discount_amount) || 0;
  const total = Number(booking?.total_amount) || base + fee + tax - discount;

  const leftX = doc.x;
  const rightX = 520;
  const row = (label, value) => {
    doc.fontSize(10).fillColor('#334155').text(label, leftX, doc.y, { continued: true });
    doc.text(value, rightX, doc.y, { align: 'right' });
  };

  row('Service amount', money(base));
  if (fee) row('Service fee', money(fee));
  if (tax) row('Tax', money(tax));
  if (discount) row('Discount', `- ${money(discount)}`);
  doc.moveDown(0.5);
  doc.moveTo(leftX, doc.y).lineTo(rightX, doc.y).strokeColor('#e2e8f0').stroke();
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor('#0f172a').text('Total', leftX, doc.y, { continued: true });
  doc.text(money(total), rightX, doc.y, { align: 'right' });

  doc.moveDown(2);
  doc
    .fontSize(9)
    .fillColor('#64748b')
    .text('Thank you for choosing Nexus Services.', { align: 'center' })
    .text('This is a system-generated invoice.', { align: 'center' });

  return bufferFromDoc(doc);
}

function buildPayslipPdfBuffer({ booking, worker, payout }) {
  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  const slipNo = `PAY-${safe(booking?.id).slice(-8).toUpperCase()}`;
  const paidAt = payout?.paid_at ? new Date(payout.paid_at) : new Date();

  doc
    .fontSize(22)
    .fillColor('#1e293b')
    .text('Nexus', { continued: true })
    .fillColor('#10b981')
    .text('  Payslip');

  doc
    .moveDown(0.5)
    .fillColor('#475569')
    .fontSize(10)
    .text('Nexus Services • Kerala, India')
    .text('payments@nexusservices.com');

  doc
    .moveDown(1)
    .fillColor('#0f172a')
    .fontSize(12)
    .text(`Payslip #: ${slipNo}`)
    .text(`Paid on: ${paidAt.toLocaleDateString('en-IN')}`)
    .text(`Booking ID: ${safe(booking?.id)}`);

  doc.moveDown(1);
  doc.fontSize(11).fillColor('#0f172a').text('Paid To');
  doc
    .fontSize(10)
    .fillColor('#334155')
    .text(safe(worker?.name))
    .text(safe(worker?.email));

  doc.moveDown(1);
  doc.fontSize(11).fillColor('#0f172a').text('Payout Details');

  const totalAmount = Number(payout?.total_amount) || Number(booking?.total_amount) || 0;
  const workerAmount = Number(payout?.worker_payout_amount) || Number(booking?.worker_payout_amount) || 0;
  const commission = Number(payout?.company_commission_amount) || Number(booking?.company_commission_amount) || 0;

  const leftX = doc.x;
  const rightX = 520;
  const row = (label, value) => {
    doc.fontSize(10).fillColor('#334155').text(label, leftX, doc.y, { continued: true });
    doc.text(value, rightX, doc.y, { align: 'right' });
  };

  row('Customer paid (booking total)', money(totalAmount));
  row('Company commission', money(commission));
  doc.moveDown(0.25);
  doc.moveTo(leftX, doc.y).lineTo(rightX, doc.y).strokeColor('#e2e8f0').stroke();
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor('#0f172a').text('Net payout to worker', leftX, doc.y, { continued: true });
  doc.text(money(workerAmount), rightX, doc.y, { align: 'right' });

  doc.moveDown(2);
  doc
    .fontSize(9)
    .fillColor('#64748b')
    .text('This is a system-generated payslip.', { align: 'center' });

  return bufferFromDoc(doc);
}

module.exports = {
  buildInvoicePdfBuffer,
  buildPayslipPdfBuffer
};

