
interface CompanyInfo {
  name: string;
  address: string;
  telephone: string;
  email: string;
  logo?: string;
}

interface ReceiptData {
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total: number;
  timestamp: Date;
}

export const printReceipt = (receiptData: ReceiptData, companyInfo: CompanyInfo) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=300,height=600');
  
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 5mm;
          }
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.2;
          width: 70mm;
          margin: 0 auto;
          padding: 5mm;
        }
        
        .header {
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        
        .logo {
          max-width: 50mm;
          max-height: 20mm;
          margin-bottom: 5px;
        }
        
        .company-name {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 2px;
        }
        
        .company-tel {
          font-size: 11px;
          margin-bottom: 5px;
        }
        
        .order-info {
          margin: 10px 0;
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        
        .order-number {
          font-weight: bold;
          font-size: 13px;
        }
        
        .datetime {
          font-size: 10px;
          margin-top: 2px;
        }
        
        .items-table {
          width: 100%;
          margin: 10px 0;
        }
        
        .item-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-size: 11px;
        }
        
        .item-name {
          flex: 1;
          padding-right: 5px;
        }
        
        .item-qty-price {
          white-space: nowrap;
        }
        
        .item-total {
          white-space: nowrap;
          text-align: right;
          min-width: 15mm;
        }
        
        .separator {
          border-top: 1px dashed #000;
          margin: 10px 0;
        }
        
        .total-section {
          margin-top: 10px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .footer {
          text-align: center;
          margin-top: 15px;
          font-size: 10px;
          border-top: 1px dashed #000;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${companyInfo.logo ? `<img src="${companyInfo.logo}" alt="Logo" class="logo" />` : ''}
        <div class="company-name">${companyInfo.name || 'Company Name'}</div>
        <div class="company-tel">Tel: ${companyInfo.telephone || 'N/A'}</div>
      </div>
      
      <div class="order-info">
        <div class="order-number">Order #${receiptData.orderNumber}</div>
        <div class="datetime">${receiptData.timestamp.toLocaleString()}</div>
      </div>
      
      <div class="items-table">
        ${receiptData.items.map(item => `
          <div class="item-row">
            <div class="item-name">${item.name}</div>
          </div>
          <div class="item-row">
            <div class="item-qty-price">${item.quantity} x $${item.price.toFixed(2)}</div>
            <div class="item-total">$${item.total.toFixed(2)}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="separator"></div>
      
      <div class="total-section">
        <div class="total-row">
          <span>TOTAL:</span>
          <span>$${receiptData.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="footer">
        Thank you for your business!
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
};
