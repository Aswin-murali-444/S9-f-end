import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, DollarSign, Calendar, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import './AdminPages.css';

const CreateBillPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    amount: '',
    dueDate: '',
    status: 'pending',
    description: '',
    taxRate: '0',
    discountAmount: '0'
  });
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    setCustomers([
      { 
        id: 1, 
        name: 'John Smith', 
        email: 'john.smith@example.com',
        phone: '+1 555-0101',
        address: '123 Main St, City, State 12345'
      },
      { 
        id: 2, 
        name: 'Sarah Johnson', 
        email: 'sarah.j@example.com',
        phone: '+1 555-0102',
        address: '456 Oak Ave, City, State 12345'
      },
      { 
        id: 3, 
        name: 'Emily Davis', 
        email: 'emily.d@example.com',
        phone: '+1 555-0103',
        address: '789 Pine Rd, City, State 12345'
      }
    ]);
    
    setServices([
      { id: 1, name: 'Plumbing Repair', basePrice: 75.00, category: 'Home Maintenance' },
      { id: 2, name: 'Electrical Work', basePrice: 90.00, category: 'Home Maintenance' },
      { id: 3, name: 'Elder Care (4 hours)', basePrice: 120.00, category: 'Healthcare' },
      { id: 4, name: 'Airport Transfer', basePrice: 45.00, category: 'Transport' },
      { id: 5, name: 'Medicine Delivery', basePrice: 15.00, category: 'Delivery' }
    ]);

    // Set default due date to 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      dueDate: defaultDueDate.toISOString().split('T')[0]
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceSelect = (e) => {
    const serviceId = e.target.value;
    const selectedService = services.find(s => s.id === parseInt(serviceId));
    
    setFormData(prev => ({
      ...prev,
      serviceId,
      amount: selectedService ? selectedService.basePrice.toString() : ''
    }));
  };

  const handleStatusSelect = (status) => {
    setFormData(prev => ({
      ...prev,
      status
    }));
  };

  const calculateTotal = () => {
    const baseAmount = parseFloat(formData.amount) || 0;
    const taxRate = parseFloat(formData.taxRate) || 0;
    const discountAmount = parseFloat(formData.discountAmount) || 0;
    
    const taxAmount = (baseAmount * taxRate) / 100;
    const total = baseAmount + taxAmount - discountAmount;
    
    return {
      baseAmount,
      taxAmount,
      discountAmount,
      total: Math.max(0, total)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const billData = {
        ...formData,
        calculations: calculateTotal(),
        createdAt: new Date().toISOString(),
        billNumber: `INV-${Date.now()}`
      };
      
      console.log('Bill data:', billData);
      
      // Navigate back to billing tab
      navigate('/dashboard/admin?tab=billing');
    } catch (error) {
      console.error('Error creating bill:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === parseInt(formData.customerId));
  const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
  const calculations = calculateTotal();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <AdminLayout>
      <motion.div
        className="admin-page-content"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Page Header */}
        <motion.div className="page-header" variants={itemVariants}>
          <div className="page-title">
            <h1>Create Bill</h1>
            <p>Generate a new invoice for customer services</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form 
          className="admin-form"
          onSubmit={handleSubmit}
          variants={itemVariants}
        >
          <div className="form-sections">
            {/* Customer Selection */}
            <div className="form-section">
              <h3>Customer Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="customerId">Select Customer *</label>
                  <select
                    id="customerId"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Choose a customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.email})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCustomer && (
                  <div className="form-group">
                    <label>Customer Details</label>
                    <div style={{ 
                      padding: '1rem', 
                      background: '#f8fafc', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                        {selectedCustomer.name}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        📧 {selectedCustomer.email}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        📞 {selectedCustomer.phone}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        📍 {selectedCustomer.address}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service & Billing Details */}
            <div className="form-section">
              <h3>Service & Billing Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="serviceId">Service Availed *</label>
                  <select
                    id="serviceId"
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleServiceSelect}
                    required
                  >
                    <option value="">Choose a service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ${service.basePrice}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="amount">Bill Amount *</label>
                  <div className="price-input-group">
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="dueDate">Due Date *</label>
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="taxRate">Tax Rate (%)</label>
                  <input
                    id="taxRate"
                    name="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="discountAmount">Discount Amount</label>
                  <div className="price-input-group">
                    <input
                      id="discountAmount"
                      name="discountAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discountAmount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description / Notes</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Additional details about the service provided..."
                  />
                </div>
              </div>
            </div>

            {/* Bill Status */}
            <div className="form-section">
              <h3>Bill Status</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Payment Status *</label>
                  <div className="status-grid">
                    {['pending', 'paid', 'overdue'].map(status => (
                      <div
                        key={status}
                        className={`status-option ${status} ${formData.status === status ? 'selected' : ''}`}
                        onClick={() => handleStatusSelect(status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    ))}
                  </div>
                  <small style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    {formData.status === 'pending' && 'Bill is awaiting payment from customer'}
                    {formData.status === 'paid' && 'Payment has been received and processed'}
                    {formData.status === 'overdue' && 'Payment is past due date'}
                  </small>
                </div>

                {/* Bill Summary */}
                {formData.amount && (
                  <div className="form-group">
                    <label>Bill Summary</label>
                    <div style={{ 
                      padding: '1rem', 
                      background: '#f8fafc', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Service Amount:</span>
                        <span>${calculations.baseAmount.toFixed(2)}</span>
                      </div>
                      {calculations.taxAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b' }}>
                          <span>Tax ({formData.taxRate}%):</span>
                          <span>+${calculations.taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {calculations.discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#059669' }}>
                          <span>Discount:</span>
                          <span>-${calculations.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '1.1rem' }}>
                        <span>Total Amount:</span>
                        <span>${calculations.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <motion.div className="form-actions" variants={itemVariants}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard/admin?tab=billing')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !formData.customerId || !formData.serviceId || !formData.amount || !formData.dueDate}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Bill
                </>
              )}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </AdminLayout>
  );
};

export default CreateBillPage;
