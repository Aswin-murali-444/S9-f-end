import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class InvoiceService {
  constructor() {
    this.companyInfo = {
      name: 'Nexus Services',
      tagline: 'Professional Home & Business Services',
      address: '123 Service Street, Business District',
      city: 'Mumbai, Maharashtra 400001',
      phone: '+91 98765 43210',
      email: 'billing@nexusservices.com',
      website: 'www.nexusservices.com',
      gstin: '27ABCDE1234F1Z5',
      pan: 'ABCDE1234F'
    };
  }

  // Generate individual invoice PDF - Fixed version
  async generateInvoicePDF(bookingData) {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Set up basic styling
      doc.setFont('helvetica');
      
      // Add Nexus Logo (draw the actual logo design)
      this.drawNexusLogo(doc, 20, 15, 50, 20);
      
      // Company name next to logo
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 156, 249); // Nexus blue
      doc.text('Nexus', 75, 30);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Professional Services', 75, 35);
      
      // Invoice title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 150, 25);
      
      // Invoice details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice #: INV-${bookingData.id.slice(-8).toUpperCase()}`, 20, 45);
      doc.text(`Date: ${new Date(bookingData.created_at).toLocaleDateString('en-IN')}`, 20, 52);
      doc.text(`Due Date: ${new Date(bookingData.scheduled_date).toLocaleDateString('en-IN')}`, 20, 59);
      
      // Customer details
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', 20, 75);
      doc.setFont('helvetica', 'normal');
      doc.text(bookingData.user_name || 'Customer', 20, 82);
      doc.text(bookingData.service_address || 'Address not provided', 20, 89);
      if (bookingData.service_city) {
        doc.text(`${bookingData.service_city}, ${bookingData.service_state || ''}`, 20, 96);
      }
      doc.text(`Phone: ${bookingData.contact_phone || 'Not provided'}`, 20, 103);
      if (bookingData.contact_email) {
        doc.text(`Email: ${bookingData.contact_email}`, 20, 110);
      }
      
      // Service details
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Service Details:', 20, 125);
      doc.setFont('helvetica', 'normal');
      doc.text(`Service: ${bookingData.service_name || 'Professional Service'}`, 20, 132);
      doc.text(`Date: ${new Date(bookingData.scheduled_date).toLocaleDateString('en-IN')}`, 20, 139);
      doc.text(`Time: ${bookingData.scheduled_time || '10:00'}`, 20, 146);
      if (bookingData.duration_minutes) {
        doc.text(`Duration: ${bookingData.duration_minutes} minutes`, 20, 153);
      }
      
      // Pricing section
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Pricing Details:', 20, 170);
      doc.setFont('helvetica', 'normal');
      
      const rightAlign = 150;
      doc.text(`Service Amount:`, 20, 177);
      doc.text(`Rs. ${(bookingData.base_price || 0).toFixed(2)}`, rightAlign, 177);
      
      if (bookingData.service_fee > 0) {
        doc.text(`Service Fee:`, 20, 184);
        doc.text(`Rs. ${bookingData.service_fee.toFixed(2)}`, rightAlign, 184);
      }
      
      if (bookingData.tax_amount > 0) {
        doc.text(`Tax (18%):`, 20, 191);
        doc.text(`Rs. ${bookingData.tax_amount.toFixed(2)}`, rightAlign, 191);
      }
      
      if (bookingData.offer_applied && bookingData.offer_discount_amount > 0) {
        doc.text(`Discount:`, 20, 198);
        doc.text(`-Rs. ${bookingData.offer_discount_amount.toFixed(2)}`, rightAlign, 198);
      }
      
      // Total amount
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount:', 20, 210);
      doc.text(`Rs. ${(bookingData.total_amount || bookingData.base_price || 0).toFixed(2)}`, rightAlign, 210);
      
      // Payment info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Information:', 20, 230);
      doc.setFont('helvetica', 'normal');
      doc.text(`Method: ${this.formatPaymentMethod(bookingData.payment_method)}`, 20, 237);
      doc.text(`Status: ${this.formatPaymentStatus(bookingData.payment_status)}`, 20, 244);
      
      if (bookingData.payment_transaction_id) {
        doc.text(`Transaction ID: ${bookingData.payment_transaction_id}`, 20, 251);
      }
      
      if (bookingData.payment_status === 'completed') {
        const paymentDate = new Date(bookingData.confirmed_at || bookingData.created_at).toLocaleDateString('en-IN');
        doc.text(`Payment Date: ${paymentDate}`, 20, 258);
      }
      
      // Footer
      doc.setFontSize(9);
      doc.text('Thank you for choosing Nexus Services!', 20, 275);
      doc.text('For any queries, contact us at billing@nexusservices.com', 20, 282);
      doc.text(`GSTIN: ${this.companyInfo.gstin} | PAN: ${this.companyInfo.pan}`, 20, 289);

      return doc;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  addHeader(doc, pageWidth, primaryColor, secondaryColor) {
    // Company Logo - Draw the Nexus logo
    this.drawNexusLogo(doc, 20, 20, 40, 20);
    
    // Company Name
    doc.setFontSize(24);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(this.companyInfo.name, 70, 30);
    
    // Tagline
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text(this.companyInfo.tagline, 70, 37);
    
    // Company Address
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(this.companyInfo.address, 70, 45);
    doc.text(this.companyInfo.city, 70, 52);
    doc.text(`Phone: ${this.companyInfo.phone}`, 70, 59);
    doc.text(`Email: ${this.companyInfo.email}`, 70, 66);
    
    // Invoice Title
    doc.setFontSize(20);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 60, 30);
    
    // Line separator
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, 75, pageWidth - 20, 75);
  }

  // Draw the Nexus logo - Accurate hexagonal design
  drawNexusLogo(doc, x, y, width, height) {
    const scale = Math.min(width / 60, height / 20);
    const logoWidth = 60 * scale;
    const logoHeight = 20 * scale;
    
    // Position the hexagon
    const hexX = x + logoWidth * 0.4;
    const hexY = y + logoHeight * 0.5;
    const hexSize = Math.min(logoWidth, logoHeight) * 0.4;
    
    // Draw hexagon - create proper hexagonal shape
    doc.setFillColor(79, 156, 249); // #4f9cf9 - Nexus blue
    doc.setDrawColor(79, 156, 249);
    doc.setLineWidth(0.5);
    
    // Create hexagon using lines to approximate the shape
    const hexRadius = hexSize * 0.6;
    const hexWidth = hexRadius * 1.732; // sqrt(3) for hexagon width
    const hexHeight = hexRadius * 2;
    
    // Draw hexagon as filled shape (simplified for PDF)
    doc.rect(hexX - hexWidth/2, hexY - hexHeight/2, hexWidth, hexHeight, 'F');
    
    // Draw the eye shape inside the hexagon
    doc.setFillColor('white');
    doc.setDrawColor('white');
    doc.setLineWidth(1);
    
    // Eye shape - horizontal diamond/oval
    const eyeWidth = hexSize * 0.5;
    const eyeHeight = hexSize * 0.15;
    
    // Draw eye as horizontal rectangle
    doc.rect(hexX - eyeWidth/2, hexY - eyeHeight/2, eyeWidth, eyeHeight, 'F');
    
    // Draw pupil (center circle)
    const pupilSize = hexSize * 0.08;
    doc.circle(hexX, hexY, pupilSize, 'F');
    
    // Add border to make it look more hexagonal
    doc.setDrawColor(79, 156, 249);
    doc.setLineWidth(1);
    doc.rect(hexX - hexWidth/2, hexY - hexHeight/2, hexWidth, hexHeight, 'S');
  }

  addInvoiceDetails(doc, bookingData, pageWidth, primaryColor, secondaryColor, lightGray, darkGray) {
    const invoiceNumber = `INV-${bookingData.id.slice(-8).toUpperCase()}`;
    const invoiceDate = new Date(bookingData.created_at).toLocaleDateString('en-IN');
    const dueDate = new Date(bookingData.scheduled_date).toLocaleDateString('en-IN');
    
    // Invoice Details Box
    doc.setFillColor(lightGray);
    doc.rect(pageWidth - 80, 85, 60, 35, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details', pageWidth - 75, 95);
    
    doc.setFontSize(10);
    doc.setTextColor(darkGray);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoiceNumber}`, pageWidth - 75, 102);
    doc.text(`Date: ${invoiceDate}`, pageWidth - 75, 109);
    doc.text(`Due Date: ${dueDate}`, pageWidth - 75, 116);
    
    // Booking Reference
    doc.text(`Booking #: ${bookingData.id.slice(-8).toUpperCase()}`, pageWidth - 75, 123);
  }

  addCustomerDetails(doc, bookingData, pageWidth, secondaryColor, darkGray) {
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 95);
    
    doc.setFontSize(10);
    doc.setTextColor(darkGray);
    doc.setFont('helvetica', 'normal');
    
    // Customer name (from user data if available)
    const customerName = bookingData.user_name || 'Customer';
    doc.text(customerName, 20, 102);
    
    // Service address
    doc.text(bookingData.service_address, 20, 109);
    if (bookingData.service_city) {
      doc.text(`${bookingData.service_city}, ${bookingData.service_state || ''}`, 20, 116);
    }
    if (bookingData.service_postal_code) {
      doc.text(`PIN: ${bookingData.service_postal_code}`, 20, 123);
    }
    
    // Contact information
    doc.text(`Phone: ${bookingData.contact_phone}`, 20, 130);
    if (bookingData.contact_email) {
      doc.text(`Email: ${bookingData.contact_email}`, 20, 137);
    }
  }

  addServiceDetails(doc, bookingData, pageWidth, primaryColor, darkGray) {
    const startY = 150;
    
    // Service Details Header
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Service Details', 20, startY);
    
    // Service Details Table Header
    doc.setFillColor(primaryColor);
    doc.rect(20, startY + 5, pageWidth - 40, 8, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 25, startY + 10);
    doc.text('Date & Time', 100, startY + 10);
    doc.text('Duration', 140, startY + 10);
    doc.text('Amount', pageWidth - 35, startY + 10);
    
    // Service Details Row
    doc.setFillColor(255);
    doc.rect(20, startY + 13, pageWidth - 40, 12, 'F');
    doc.setDrawColor(200);
    doc.rect(20, startY + 13, pageWidth - 40, 12, 'S');
    
    doc.setFontSize(9);
    doc.setTextColor(darkGray);
    doc.setFont('helvetica', 'normal');
    
    // Service description
    const serviceDescription = bookingData.service_name || 'Professional Service';
    doc.text(serviceDescription, 25, startY + 20);
    
    // Date and time
    const serviceDateTime = `${new Date(bookingData.scheduled_date).toLocaleDateString('en-IN')} at ${bookingData.scheduled_time}`;
    doc.text(serviceDateTime, 100, startY + 20);
    
    // Duration
    const duration = bookingData.duration_minutes ? `${bookingData.duration_minutes} mins` : '1 hour';
    doc.text(duration, 140, startY + 20);
    
    // Amount
    doc.text(`₹${bookingData.base_price.toFixed(2)}`, pageWidth - 35, startY + 20);
    
    // Special instructions if any
    if (bookingData.special_instructions) {
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Special Instructions: ${bookingData.special_instructions}`, 25, startY + 28);
    }
  }

  addPricingDetails(doc, bookingData, pageWidth, primaryColor, secondaryColor, darkGray) {
    const startY = 200;
    const rightAlign = pageWidth - 35;
    
    // Pricing Details
    doc.setFontSize(10);
    doc.setTextColor(darkGray);
    doc.setFont('helvetica', 'normal');
    
    // Base Price
    doc.text('Service Amount:', rightAlign - 50, startY);
    doc.text(`₹${bookingData.base_price.toFixed(2)}`, rightAlign, startY);
    
    // Service Fee
    if (bookingData.service_fee > 0) {
      doc.text('Service Fee:', rightAlign - 50, startY + 7);
      doc.text(`₹${bookingData.service_fee.toFixed(2)}`, rightAlign, startY + 7);
    }
    
    // Tax
    if (bookingData.tax_amount > 0) {
      doc.text('Tax (18%):', rightAlign - 50, startY + 14);
      doc.text(`₹${bookingData.tax_amount.toFixed(2)}`, rightAlign, startY + 14);
    }
    
    // Discount
    if (bookingData.offer_applied && bookingData.offer_discount_amount > 0) {
      doc.setTextColor(34, 197, 94); // Green for discount
      doc.text('Discount:', rightAlign - 50, startY + 21);
      doc.text(`-₹${bookingData.offer_discount_amount.toFixed(2)}`, rightAlign, startY + 21);
      doc.setTextColor(darkGray);
    }
    
    // Total Amount
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(rightAlign - 50, startY + 25, rightAlign, startY + 25);
    
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', rightAlign - 50, startY + 32);
    doc.text(`₹${bookingData.total_amount.toFixed(2)}`, rightAlign, startY + 32);
  }

  addPaymentDetails(doc, bookingData, pageWidth, darkGray) {
    const startY = 250;
    
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information', 20, startY);
    
    doc.setFontSize(10);
    doc.setTextColor(darkGray);
    doc.setFont('helvetica', 'normal');
    
    const paymentMethod = this.formatPaymentMethod(bookingData.payment_method);
    const paymentStatus = this.formatPaymentStatus(bookingData.payment_status);
    
    doc.text(`Payment Method: ${paymentMethod}`, 20, startY + 10);
    doc.text(`Payment Status: ${paymentStatus}`, 20, startY + 17);
    
    if (bookingData.payment_transaction_id) {
      doc.text(`Transaction ID: ${bookingData.payment_transaction_id}`, 20, startY + 24);
    }
    
    if (bookingData.payment_status === 'completed') {
      const paymentDate = new Date(bookingData.confirmed_at || bookingData.created_at).toLocaleDateString('en-IN');
      doc.text(`Payment Date: ${paymentDate}`, 20, startY + 31);
    }
  }

  addFooter(doc, pageWidth, pageHeight, darkGray) {
    const footerY = pageHeight - 30;
    
    // Footer line
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(darkGray);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Thank you for choosing Nexus Services!', 20, footerY);
    doc.text('For any queries, contact us at billing@nexusservices.com', 20, footerY + 5);
    
    // GST and PAN information
    doc.text(`GSTIN: ${this.companyInfo.gstin}`, pageWidth - 80, footerY);
    doc.text(`PAN: ${this.companyInfo.pan}`, pageWidth - 80, footerY + 5);
  }

  formatPaymentMethod(method) {
    const methods = {
      'card': 'Credit/Debit Card',
      'upi': 'UPI',
      'cod': 'Cash on Delivery',
      'wallet': 'Digital Wallet',
      'netbanking': 'Net Banking'
    };
    return methods[method] || method;
  }

  formatPaymentStatus(status) {
    const statuses = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed',
      'refunded': 'Refunded',
      'cancelled': 'Cancelled'
    };
    return statuses[status] || status;
  }

  // Download individual invoice
  async downloadInvoice(bookingData) {
    try {
      // Validate booking data
      if (!bookingData || !bookingData.id) {
        throw new Error('Invalid booking data provided');
      }

      console.log('Booking data received:', bookingData);

      // Ensure required fields have default values and proper formatting
      const safeBookingData = {
        ...bookingData,
        id: bookingData.id || 'UNKNOWN',
        created_at: bookingData.created_at || new Date().toISOString(),
        scheduled_date: bookingData.scheduled_date || new Date().toISOString().split('T')[0],
        scheduled_time: bookingData.scheduled_time || '10:00',
        service_name: bookingData.service_name || 'Professional Service',
        service_address: bookingData.service_address || 'Address not provided',
        service_city: bookingData.service_city || '',
        service_state: bookingData.service_state || '',
        contact_phone: bookingData.contact_phone || 'Phone not provided',
        contact_email: bookingData.contact_email || '',
        base_price: parseFloat(bookingData.base_price) || 0,
        service_fee: parseFloat(bookingData.service_fee) || 0,
        tax_amount: parseFloat(bookingData.tax_amount) || 0,
        total_amount: parseFloat(bookingData.total_amount) || parseFloat(bookingData.base_price) || 0,
        payment_method: bookingData.payment_method || 'card',
        payment_status: bookingData.payment_status || 'pending',
        user_name: bookingData.user_name || 'Customer',
        duration_minutes: bookingData.duration_minutes || 60,
        offer_applied: bookingData.offer_applied || false,
        offer_discount_amount: parseFloat(bookingData.offer_discount_amount) || 0,
        payment_transaction_id: bookingData.payment_transaction_id || '',
        confirmed_at: bookingData.confirmed_at || bookingData.created_at
      };

      console.log('Safe booking data:', safeBookingData);

      const doc = await this.generateInvoicePDF(safeBookingData);
      const fileName = `Invoice_${safeBookingData.id.slice(-8)}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      return { success: true, fileName };
    } catch (error) {
      console.error('Error downloading invoice:', error);
      return { success: false, error: error.message };
    }
  }

  // Download multiple invoices as ZIP
  async downloadMultipleInvoices(bookingsData) {
    try {
      // For now, we'll download them individually
      // In a production app, you'd use a library like JSZip to create a ZIP file
      const results = [];
      
      for (const booking of bookingsData) {
        const result = await this.downloadInvoice(booking);
        results.push(result);
        // Small delay between downloads to avoid browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return { success: true, results };
    } catch (error) {
      console.error('Error generating multiple invoices:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate invoice HTML for preview
  generateInvoiceHTML(bookingData) {
    const invoiceNumber = `INV-${bookingData.id.slice(-8).toUpperCase()}`;
    const invoiceDate = new Date(bookingData.created_at).toLocaleDateString('en-IN');
    const dueDate = new Date(bookingData.scheduled_date).toLocaleDateString('en-IN');
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
          <div style="display: flex; align-items: center;">
            <!-- Nexus Logo -->
            <!-- Nexus Logo - Simplified accurate design -->
            <div style="width: 40px; height: 40px; background: #4f9cf9; margin-right: 15px; position: relative; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);">
              <!-- Eye shape inside hexagon -->
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 4px; background: white; border-radius: 2px;"></div>
              <!-- Pupil -->
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 3px; height: 3px; background: white; border-radius: 50%;"></div>
            </div>
            <div>
              <h1 style="color: #4f9cf9; margin: 0; font-size: 28px; font-weight: bold;">Nexus</h1>
              <p style="color: #3b82f6; margin: 5px 0; font-size: 14px;">${this.companyInfo.tagline}</p>
              <p style="color: #64748b; margin: 0; font-size: 12px;">${this.companyInfo.address}</p>
              <p style="color: #64748b; margin: 0; font-size: 12px;">${this.companyInfo.city}</p>
              <p style="color: #64748b; margin: 0; font-size: 12px;">Phone: ${this.companyInfo.phone} | Email: ${this.companyInfo.email}</p>
            </div>
          </div>
          <div style="text-align: right;">
            <h2 style="color: #1e293b; margin: 0; font-size: 24px;">INVOICE</h2>
            <p style="color: #64748b; margin: 5px 0; font-size: 12px;">${invoiceNumber}</p>
          </div>
        </div>

        <!-- Invoice Details -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h3 style="color: #1e293b; margin-bottom: 10px;">Bill To:</h3>
            <p style="margin: 2px 0; color: #64748b;">${bookingData.user_name || 'Customer'}</p>
            <p style="margin: 2px 0; color: #64748b;">${bookingData.service_address}</p>
            <p style="margin: 2px 0; color: #64748b;">${bookingData.service_city}, ${bookingData.service_state || ''}</p>
            <p style="margin: 2px 0; color: #64748b;">Phone: ${bookingData.contact_phone}</p>
            ${bookingData.contact_email ? `<p style="margin: 2px 0; color: #64748b;">Email: ${bookingData.contact_email}</p>` : ''}
          </div>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <h4 style="color: #1e293b; margin-bottom: 10px;">Invoice Details</h4>
            <p style="margin: 2px 0; color: #64748b;">Invoice #: ${invoiceNumber}</p>
            <p style="margin: 2px 0; color: #64748b;">Date: ${invoiceDate}</p>
            <p style="margin: 2px 0; color: #64748b;">Due Date: ${dueDate}</p>
            <p style="margin: 2px 0; color: #64748b;">Booking #: ${bookingData.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <!-- Service Details -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e293b; margin-bottom: 15px;">Service Details</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
            <thead>
              <tr style="background: #3b82f6; color: white;">
                <th style="padding: 12px; text-align: left;">Description</th>
                <th style="padding: 12px; text-align: left;">Date & Time</th>
                <th style="padding: 12px; text-align: left;">Duration</th>
                <th style="padding: 12px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${bookingData.service_name || 'Professional Service'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${new Date(bookingData.scheduled_date).toLocaleDateString('en-IN')} at ${bookingData.scheduled_time}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${bookingData.duration_minutes ? `${bookingData.duration_minutes} mins` : '1 hour'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">Rs. ${bookingData.base_price.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          ${bookingData.special_instructions ? `<p style="margin-top: 10px; color: #64748b; font-size: 12px;"><strong>Special Instructions:</strong> ${bookingData.special_instructions}</p>` : ''}
        </div>

        <!-- Pricing -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #64748b;">Service Amount:</span>
              <span>Rs. ${bookingData.base_price.toFixed(2)}</span>
            </div>
            ${bookingData.service_fee > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #64748b;">Service Fee:</span>
              <span>Rs. ${bookingData.service_fee.toFixed(2)}</span>
            </div>
            ` : ''}
            ${bookingData.tax_amount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #64748b;">Tax (18%):</span>
              <span>Rs. ${bookingData.tax_amount.toFixed(2)}</span>
            </div>
            ` : ''}
            ${bookingData.offer_applied && bookingData.offer_discount_amount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #22c55e;">Discount:</span>
              <span style="color: #22c55e;">-Rs. ${bookingData.offer_discount_amount.toFixed(2)}</span>
            </div>
            ` : ''}
            <hr style="border: none; border-top: 1px solid #3b82f6; margin: 10px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #1e293b;">
              <span>Total Amount:</span>
              <span>Rs. ${bookingData.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e293b; margin-bottom: 10px;">Payment Information</h3>
          <p style="margin: 2px 0; color: #64748b;">Payment Method: ${this.formatPaymentMethod(bookingData.payment_method)}</p>
          <p style="margin: 2px 0; color: #64748b;">Payment Status: ${this.formatPaymentStatus(bookingData.payment_status)}</p>
          ${bookingData.payment_transaction_id ? `<p style="margin: 2px 0; color: #64748b;">Transaction ID: ${bookingData.payment_transaction_id}</p>` : ''}
          ${bookingData.payment_status === 'completed' ? `<p style="margin: 2px 0; color: #64748b;">Payment Date: ${new Date(bookingData.confirmed_at || bookingData.created_at).toLocaleDateString('en-IN')}</p>` : ''}
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p style="margin: 5px 0;">Thank you for choosing ${this.companyInfo.name}!</p>
          <p style="margin: 5px 0;">For any queries, contact us at ${this.companyInfo.email}</p>
          <p style="margin: 5px 0;">GSTIN: ${this.companyInfo.gstin} | PAN: ${this.companyInfo.pan}</p>
        </div>
      </div>
    `;
  }
}

export default new InvoiceService();
