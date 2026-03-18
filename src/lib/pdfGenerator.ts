import { InvoiceWithDetails, CompanySettings } from './supabase';
import { formatCurrency, formatDate } from './invoiceUtils';

export function generateInvoicePDF(invoice: InvoiceWithDetails, companySettings: CompanySettings) {
  const statusColors = {
    'Paid': { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
    'Pending': { bg: '#fef3c7', text: '#854d0e', border: '#f59e0b' },
    'Overdue': { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
  };

  const statusColor = statusColors[invoice.status];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice-${invoice.invoice_number}</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      background: #ffffff;
      color: #000000;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 100%;
      margin: 0 auto;
    }
    .invoice-card {
      background: white;
      border-top: 4px solid #f97316;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
      color: white;
      padding: 28px 36px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -80px;
      right: -80px;
      width: 200px;
      height: 200px;
      background: rgba(249, 115, 22, 0.1);
      border-radius: 50%;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -60px;
      left: -60px;
      width: 150px;
      height: 150px;
      background: rgba(251, 146, 60, 0.1);
      border-radius: 50%;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      z-index: 10;
    }
    .invoice-info h1 {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 6px;
      letter-spacing: 1.5px;
    }
    .invoice-number {
      font-size: 16px;
      color: #fdba74;
      font-weight: 700;
    }
    .company-info {
      text-align: right;
    }
    .company-logo {
      max-height: 56px;
      margin-left: auto;
      margin-bottom: 10px;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
    }
    .company-name {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 6px;
    }
    .company-details {
      font-size: 12px;
      color: #cbd5e1;
      line-height: 1.4;
    }
    .body {
      padding: 24px 36px 28px;
      background: linear-gradient(to bottom, #f9fafb, #ffffff);
    }
    .info-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 18px;
    }
    .info-box {
      background: white;
      padding: 14px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .info-box.bill {
      border-left: 4px solid #475569;
    }
    .info-box.date {
      border-left: 4px solid #14b8a6;
    }
    .info-box.due {
      border-left: 4px solid #f97316;
    }
    .info-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      letter-spacing: 0.5px;
    }
    .info-box.bill .info-label {
      color: #475569;
    }
    .info-box.date .info-label {
      color: #0f766e;
    }
    .info-box.due .info-label {
      color: #c2410c;
    }
    .info-label::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 6px;
    }
    .info-box.bill .info-label::before {
      background: #475569;
    }
    .info-box.date .info-label::before {
      background: #14b8a6;
    }
    .info-box.due .info-label::before {
      background: #f97316;
    }
    .info-value {
      font-size: 15px;
      color: #111827;
      font-weight: bold;
    }
    .client-details {
      font-size: 10px;
      color: #4b5563;
      margin-top: 5px;
      line-height: 1.3;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 14px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 16px;
      border: 2px solid ${statusColor.border};
      background: ${statusColor.bg};
      color: ${statusColor.text};
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      background: white;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .items-table thead {
      background: linear-gradient(to right, #475569, #64748b);
      border-bottom: 2px solid #fb923c;
    }
    .items-table th {
      padding: 10px 14px;
      text-align: left;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      color: #ffffff;
      letter-spacing: 0.5px;
    }
    .items-table th.right {
      text-align: right;
    }
    .items-table th.total-header {
      color: #fdba74;
    }
    .items-table tbody tr {
      border-bottom: 1px solid #f3f4f6;
    }
    .items-table tbody tr:nth-child(even) {
      background: rgba(248, 250, 252, 0.5);
    }
    .items-table tbody tr:last-child {
      border-bottom: none;
    }
    .items-table td {
      padding: 8px 14px;
      font-size: 11px;
      color: #374151;
    }
    .items-table td.desc {
      color: #111827;
      font-weight: 600;
    }
    .items-table td.right {
      text-align: right;
      font-weight: 500;
    }
    .items-table td.total {
      font-weight: bold;
      color: #1e293b;
    }
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }
    .totals {
      width: 270px;
      background: linear-gradient(to bottom right, #f8fafc, #fff7ed);
      padding: 16px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      color: #374151;
      font-size: 12px;
    }
    .total-row .label {
      font-weight: 500;
    }
    .total-row .amount {
      font-weight: 600;
    }
    .total-row.subtotal {
      padding-bottom: 5px;
    }
    .total-row.tax {
      padding-bottom: 7px;
      border-bottom: 1px solid #9ca3af;
    }
    .grand-total {
      display: flex;
      justify-content: space-between;
      background: linear-gradient(to right, #475569, #1e293b);
      color: white;
      padding: 10px;
      margin-top: 7px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
    }
    .grand-total .amount {
      color: #fdba74;
    }
    .notes-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
    .notes-box {
      background: #fffbeb;
      border-left: 4px solid #fbbf24;
      padding: 12px;
      border-radius: 0 6px 6px 0;
    }
    .notes-title {
      font-size: 10px;
      text-transform: uppercase;
      color: #78350f;
      font-weight: bold;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      letter-spacing: 0.5px;
    }
    .notes-title::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #f59e0b;
      margin-right: 6px;
    }
    .notes-content {
      font-size: 11px;
      color: #374151;
      white-space: pre-wrap;
      line-height: 1.4;
    }
    .signature-section {
      margin-top: 18px;
      display: flex;
      justify-content: flex-end;
    }
    .signature-box {
      text-align: center;
      min-width: 160px;
    }
    .signature-image {
      max-width: 140px;
      max-height: 45px;
      margin-bottom: 5px;
    }
    .signature-line {
      border-top: 2px solid #1e293b;
      padding-top: 5px;
      min-width: 160px;
    }
    .signature-label {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
    }
    .footer {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
    }
    .footer-box {
      background: linear-gradient(to right, #f1f5f9, #f8fafc, #fff7ed);
      padding: 14px;
      border-radius: 6px;
      display: inline-block;
      border: 1px solid #e2e8f0;
    }
    .footer-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 5px;
    }
    .footer-text {
      font-size: 11px;
      color: #4b5563;
      margin-top: 4px;
    }
    .footer-text .days {
      font-weight: bold;
      color: #ea580c;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      @page {
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="invoice-card">
      <div class="header">
        <div class="header-content">
          <div class="invoice-info">
            <h1>INVOICE</h1>
            <div class="invoice-number">#${invoice.invoice_number}</div>
          </div>
          <div class="company-info">
            ${companySettings.logo_url ? `<img src="${companySettings.logo_url}" alt="Company Logo" class="company-logo">` : ''}
            <div class="company-name">${companySettings.company_name}</div>
            <div class="company-details">
              ${companySettings.company_address.split('\n').join('<br>')}<br>
              ${companySettings.company_email}<br>
              ${companySettings.company_phone}
            </div>
          </div>
        </div>
      </div>

      <div class="body">
        <div class="info-row">
          <div class="info-box bill">
            <div class="info-label">Bill To</div>
            <div class="info-value">${invoice.client.name}</div>
            ${invoice.client.address || invoice.client.email || invoice.client.phone ? `
            <div class="client-details">
              ${invoice.client.address ? invoice.client.address + '<br>' : ''}
              ${invoice.client.email ? invoice.client.email + '<br>' : ''}
              ${invoice.client.phone || ''}
            </div>
            ` : ''}
          </div>
          <div class="info-box date">
            <div class="info-label">Invoice Date</div>
            <div class="info-value">${formatDate(invoice.invoice_date)}</div>
          </div>
          <div class="info-box due">
            <div class="info-label">Due Date</div>
            <div class="info-value">${formatDate(invoice.due_date)}</div>
          </div>
        </div>

        <div>
          <span class="status-badge">${invoice.status}</span>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="right">Quantity</th>
              <th class="right">Price</th>
              <th class="right total-header">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.invoice_items
              .map(
                (item) => `
            <tr>
              <td class="desc">${item.description}</td>
              <td class="right">${item.quantity}</td>
              <td class="right">${formatCurrency(item.price, invoice.currency)}</td>
              <td class="right total">${formatCurrency(item.total, invoice.currency)}</td>
            </tr>
          `
              )
              .join('')}
          </tbody>
        </table>

        <div class="totals-wrapper">
          <div class="totals">
            <div class="total-row subtotal">
              <span class="label">Subtotal:</span>
              <span class="amount">${formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div class="total-row tax">
              <span class="label">Tax:</span>
              <span class="amount">${formatCurrency(invoice.tax, invoice.currency)}</span>
            </div>
            <div class="grand-total">
              <span>Total:</span>
              <span class="amount">${formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
          </div>
        </div>

        ${
          invoice.notes
            ? `
        <div class="notes-section">
          <div class="notes-box">
            <div class="notes-title">Notes</div>
            <div class="notes-content">${invoice.notes}</div>
          </div>
        </div>
        `
            : ''
        }

        ${
          companySettings.signature_url
            ? `
        <div class="signature-section">
          <div class="signature-box">
            <img src="${companySettings.signature_url}" alt="Signature" class="signature-image">
            <div class="signature-line">
              <div class="signature-label">Authorized Signature</div>
            </div>
          </div>
        </div>
        `
            : ''
        }

        <div class="footer">
          <div class="footer-box">
            <div class="footer-title">Thank you for your business!</div>
            <div class="footer-text">
              Please make payment within <span class="days">${Math.ceil(
                (new Date(invoice.due_date).getTime() - new Date(invoice.invoice_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}</span> days.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');

  if (!newWindow) {
    alert('Please allow popups to download the PDF');
  }
}
