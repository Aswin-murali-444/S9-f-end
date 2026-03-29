import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, IndianRupee, Mail, Download, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { apiService } from '../../services/api';
import './AdminPages.css';

const fmtMoney = (n) => `₹${(Number(n) || 0).toFixed(2)}`;

const CreateBillPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [billingSummary, setBillingSummary] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [bookingsResp, billingResp] = await Promise.all([
          apiService.getAdminBookings({ limit: 200, status: 'all' }),
          apiService.getAdminBillingSummary(200)
        ]);
        if (cancelled) return;
        setBookings(Array.isArray(bookingsResp?.data) ? bookingsResp.data : []);
        setBillingSummary(billingResp?.data || null);
      } catch (e) {
        if (!cancelled) toast.error(String(e?.message || 'Failed to load billing data'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null;
    return bookings.find((b) => String(b.id) === String(selectedBookingId)) || null;
  }, [bookings, selectedBookingId]);

  const payoutRow = useMemo(() => {
    if (!selectedBooking) return null;
    const rows = Array.isArray(billingSummary?.provider_payouts) ? billingSummary.provider_payouts : [];
    return rows.find((r) => String(r.booking_id) === String(selectedBooking.id)) || null;
  }, [billingSummary?.provider_payouts, selectedBooking]);

  const payoutStatus = String(payoutRow?.status || '').toLowerCase();
  const isWorkerPaid = payoutStatus === 'paid' || payoutStatus === 'earned' || payoutStatus === 'completed' || payoutStatus === 'success';

  const canInvoice = Boolean(selectedBooking);
  const canPayslip = Boolean(selectedBooking && selectedBooking.assigned_provider_id);

  const invoicePdfUrl = selectedBooking ? apiService.getInvoicePdfUrl(selectedBooking.id) : '#';
  const payslipPdfUrl = selectedBooking ? apiService.getPayslipPdfUrl(selectedBooking.id) : '#';

  const handleEmailInvoice = async () => {
    if (!selectedBooking) return;
    setBusy(true);
    try {
      await apiService.emailInvoicePdf(selectedBooking.id);
      toast.success('Invoice emailed to customer (if SendGrid is configured).');
    } catch (e) {
      toast.error(String(e?.message || 'Failed to email invoice'));
    } finally {
      setBusy(false);
    }
  };

  const handleMarkWorkerPaid = async () => {
    if (!selectedBooking) return;
    setBusy(true);
    try {
      const resp = await apiService.markWorkerPayoutPaid({
        bookingId: selectedBooking.id,
        payout_method: 'manual',
        notes: 'Paid from admin billing page'
      });
      toast.success(resp?.message || 'Worker payout marked as paid.');
      // Refresh billing summary so status updates in UI
      const billingResp = await apiService.getAdminBillingSummary(200);
      setBillingSummary(billingResp?.data || null);
    } catch (e) {
      toast.error(String(e?.message || 'Failed to mark worker as paid'));
    } finally {
      setBusy(false);
    }
  };

  const handleEmailPayslip = async () => {
    if (!selectedBooking) return;
    setBusy(true);
    try {
      await apiService.emailPayslipPdf(selectedBooking.id);
      toast.success('Payslip emailed to worker (if SendGrid is configured).');
    } catch (e) {
      toast.error(String(e?.message || 'Failed to email payslip'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout>
      <motion.div
        className="admin-page-content"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="page-header">
          <div className="page-title">
            <h1>Billing (Create Bill)</h1>
            <p>Create correct invoices/payslips and email PDFs to the customer/worker.</p>
          </div>
        </div>

        <div className="admin-form">
          <div className="form-sections">
            <div className="form-section">
              <h3>Select booking</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="bookingId">Booking *</label>
                  <select
                    id="bookingId"
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">{loading ? 'Loading…' : 'Choose a booking'}</option>
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {String(b.id).slice(-8).toUpperCase()} • {b.customer_name || b.customer_email || 'Customer'} • {b.service_name || 'Service'} • {fmtMoney(b.total_amount)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBooking && (
                  <div className="form-group full-width">
                    <label>Details</label>
                    <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedBooking.service_name || 'Service'}</div>
                          <div style={{ color: '#64748b', fontSize: 14 }}>
                            Customer: {selectedBooking.customer_name || selectedBooking.customer_email || '—'}
                          </div>
                          <div style={{ color: '#64748b', fontSize: 14 }}>
                            Payment: {selectedBooking.payment_status || '—'} • Booking: {selectedBooking.booking_status || '—'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#64748b', fontSize: 13 }}>Total</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                            <IndianRupee size={18} />
                            {fmtMoney(selectedBooking.total_amount)}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 10, color: '#64748b', fontSize: 13 }}>
                        Address: {selectedBooking.service_address || '—'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Customer invoice</h3>
              <div className="form-actions" style={{ justifyContent: 'flex-start', gap: 10 }}>
                <a
                  className={`btn-secondary ${!canInvoice ? 'disabled' : ''}`}
                  href={invoicePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => { if (!canInvoice) e.preventDefault(); }}
                >
                  <Download size={18} />
                  Download invoice PDF
                </a>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleEmailInvoice}
                  disabled={!canInvoice || busy}
                >
                  <Mail size={18} />
                  Email invoice PDF
                </button>
              </div>
            </div>

            <div className="form-section">
              <h3>Worker payment + payslip</h3>
              <div style={{ color: '#64748b', fontSize: 14, marginBottom: 10 }}>
                Status: {isWorkerPaid ? <span style={{ color: '#059669', fontWeight: 700 }}><CheckCircle size={16} style={{ verticalAlign: 'text-bottom' }} /> Paid</span> : 'Not paid'}
              </div>

              <div className="form-actions" style={{ justifyContent: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleMarkWorkerPaid}
                  disabled={!selectedBooking || busy || isWorkerPaid}
                  title={isWorkerPaid ? 'Already paid' : 'Mark payout as paid'}
                >
                  <IndianRupee size={18} />
                  Mark worker as paid
                </button>

                <a
                  className={`btn-secondary ${!canPayslip ? 'disabled' : ''}`}
                  href={payslipPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => { if (!canPayslip) e.preventDefault(); }}
                  title={!canPayslip ? 'No worker assigned to this booking' : 'Download payslip'}
                >
                  <FileText size={18} />
                  Download payslip PDF
                </a>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleEmailPayslip}
                  disabled={!canPayslip || busy || !isWorkerPaid}
                  title={!isWorkerPaid ? 'Pay the worker first' : 'Email payslip'}
                >
                  <Mail size={18} />
                  Email payslip PDF
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard/admin?tab=billing')}>
              Back to billing
            </button>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default CreateBillPage;
