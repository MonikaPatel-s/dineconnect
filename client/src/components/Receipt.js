import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../App.css';

export default function Receipt({ order, onClose, restaurantInfo }) {
  const receiptRef = useRef();

  const downloadPDF = async () => {
    const element = receiptRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`receipt-${order.orderNumber}.pdf`);
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt-container { max-width: 400px; margin: 0 auto; }
            .receipt-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .receipt-item { display: flex; justify-content: space-between; margin: 5px 0; }
            .receipt-total { border-top: 2px solid #333; padding-top: 10px; margin-top: 20px; font-weight: bold; }
            .receipt-footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="receipt-modal-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-actions">
          <button className="receipt-action-btn download" onClick={downloadPDF}>
            📄 Download PDF
          </button>
          <button className="receipt-action-btn print" onClick={printReceipt}>
            🖨️ Print
          </button>
          <button className="receipt-action-btn close" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        <div ref={receiptRef} className="receipt-container">
          <div className="receipt-header">
            <h2>🍽️ {restaurantInfo?.name || 'DineConnect'}</h2>
            <p>{restaurantInfo?.address || 'Digital Restaurant'}</p>
            <p>{restaurantInfo?.phone || 'Phone: +91-XXXXXXXXXX'}</p>
            <p>GST: {restaurantInfo?.gst || 'XXXXXXXXXXXX'}</p>
          </div>

          <div className="receipt-order-info">
            <div className="receipt-item">
              <span><strong>Order #:</strong></span>
              <span>{order.orderNumber}</span>
            </div>
            <div className="receipt-item">
              <span><strong>Table:</strong></span>
              <span>{order.tableId?.number || 'N/A'}</span>
            </div>
            <div className="receipt-item">
              <span><strong>Date:</strong></span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="receipt-item">
              <span><strong>Status:</strong></span>
              <span className={`status-${order.status}`}>{order.status.toUpperCase()}</span>
            </div>
            {order.customerId && (
              <div className="receipt-item">
                <span><strong>Customer:</strong></span>
                <span>{order.customerId.name}</span>
              </div>
            )}
          </div>

          <div className="receipt-items">
            <h3>Order Items:</h3>
            {order.items.map((item, index) => (
              <div key={index} className="receipt-item">
                <div className="item-details">
                  <div>{item.menuItemId?.name || 'Unknown Item'}</div>
                  <div className="item-note">
                    {item.qty} × ₹{item.price}
                    {item.note && <div className="note">Note: {item.note}</div>}
                  </div>
                </div>
                <div className="item-total">₹{item.qty * item.price}</div>
              </div>
            ))}
          </div>

          <div className="receipt-totals">
            <div className="receipt-item">
              <span>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="receipt-item">
              <span>Tax (10%):</span>
              <span>₹{order.tax}</span>
            </div>
            <div className="receipt-item receipt-total">
              <span>TOTAL:</span>
              <span>₹{order.total}</span>
            </div>
          </div>

          {/* Payment Details */}
          {order.paymentData && (
            <div className="receipt-payment">
              <h3>💳 Payment Details:</h3>
              <div className="receipt-item">
                <span>Payment Method:</span>
                <span className="payment-method">
                  {order.paymentData.method === 'upi' && '📱 UPI'}
                  {order.paymentData.method === 'card' && '💳 Card'}
                  {order.paymentData.method === 'wallet' && '👛 Wallet'}
                  {order.paymentData.method === 'cash' && '💵 Cash'}
                  {order.paymentData.method === 'cod' && '💵 Cash on Delivery'}
                </span>
              </div>
              {order.paymentData.upiId && (
                <div className="receipt-item">
                  <span>UPI ID:</span>
                  <span>{order.paymentData.upiId}</span>
                </div>
              )}
              {order.paymentData.cardLast4 && (
                <div className="receipt-item">
                  <span>Card:</span>
                  <span>**** **** **** {order.paymentData.cardLast4} ({order.paymentData.cardType})</span>
                </div>
              )}
              <div className="receipt-item">
                <span>Transaction ID:</span>
                <span className="transaction-id">{order.paymentData.transactionId}</span>
              </div>
              <div className="receipt-item">
                <span>Payment Status:</span>
                <span className={`payment-${order.paymentData.status}`}>
                  {order.paymentData.status === 'success' && '✅ PAID'}
                  {order.paymentData.status === 'pending' && '⏳ PENDING'}
                  {order.paymentData.method === 'cod' && order.paymentData.status === 'pending' && '💵 PAY ON DELIVERY'}
                </span>
              </div>
              <div className="receipt-item">
                <span>Payment Time:</span>
                <span>{formatDate(order.paymentData.timestamp)}</span>
              </div>
            </div>
          )}

          <div className="receipt-footer">
            <p>Thank you for dining with us! 🙏</p>
            <p>Visit us again soon!</p>
            <p>Generated on: {formatDate(new Date())}</p>
            <div className="qr-note">
              <p>📱 Scan QR code on your table for future orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}