/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';

interface QuotationItem {
  product: Product;
  quantity: number;
}

export const generateQuotationPDF = (items: QuotationItem[]) => {
  const quotationNumber = `QT-${Math.floor(100000 + Math.random() * 900000)}` ;
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download quotation PDF.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Quotation ${quotationNumber} - Delta Industrial Solutions</title>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace, Arial, sans-serif;
          color: #111;
          background: #fff;
          margin: 0;
          padding: 40px;
          line-height: 1.5;
        }
        .header {
          border-bottom: 2px solid #00f0ff;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .company-title {
          font-size: 20px;
          font-weight: bold;
          color: #0b0f19;
          text-transform: uppercase;
        }
        .company-meta {
          font-size: 11px;
          color: #555;
          margin-top: 4px;
        }
        .quote-meta {
          text-align: right;
          font-size: 12px;
        }
        .quote-meta h2 {
          font-size: 18px;
          color: #0088cc;
          margin: 0 0 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px 12px;
          font-size: 12px;
          text-align: left;
        }
        th {
          background-color: #0b0f19;
          color: #fff;
          text-transform: uppercase;
          font-size: 11px;
        }
        td.num, th.num {
          text-align: right;
        }
        .totals {
          width: 300px;
          margin-left: auto;
          font-size: 13px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #eee;
        }
        .totals-row.grand {
          font-weight: bold;
          font-size: 15px;
          color: #0b0f19;
          border-top: 2px solid #0b0f19;
          border-bottom: 2px solid #0b0f19;
          margin-top: 5px;
          padding: 10px 0;
        }
        .footer {
          margin-top: 50px;
          border-top: 1px solid #eee;
          padding-top: 20px;
          font-size: 10px;
          color: #666;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="company-title">Delta Industrial Solutions Private Limited</div>
          <div class="company-meta">Tree House, Garden Town, Cantt Multan</div>
          <div class="company-meta">Mobile / WhatsApp: +92 347 1980150 | Email: info@deltaindustrial.com</div>
        </div>
        <div class="quote-meta">
          <h2>OFFICIAL QUOTATION</h2>
          <div><strong>Reference:</strong> ${quotationNumber}</div>
          <div><strong>Date:</strong> ${dateStr}</div>
          <div><strong>Validity:</strong> 30 Days</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item / Description</th>
            <th>SKU</th>
            <th class="num">Unit Price (USD)</th>
            <th class="num">Qty</th>
            <th class="num">Total (USD)</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td><strong>${item.product.name}</strong></td>
              <td>${item.product.sku || 'N/A'}</td>
              <td class="num">$${item.product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td class="num">${item.quantity}</td>
              <td class="num"><strong>$${(item.product.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="totals-row">
          <span>Shipping & Freight:</span>
          <span>Calculated at Dispatch</span>
        </div>
        <div class="totals-row grand">
          <span>Grand Total:</span>
          <span>$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div class="footer">
        <div>
          <p><strong>Terms & Conditions:</strong> Payment via Corporate PO (Net 30) or Wire Transfer. ISO 9001 Certified Quality Assurance.</p>
        </div>
        <div style="text-align: right;">
          <p>Authorized Procurement Desk<br>Delta Industrial Solutions Private Limited</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
