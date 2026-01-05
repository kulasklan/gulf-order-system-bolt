import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { filterOrdersByDate, getStatusClass } from '../utils/helpers';

export function InvoiceView() {
  const { orders, currentUser, refreshData } = useApp();
  const [loading, setLoading] = useState(false);
  const [dateStart, setDateStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [dateEnd, setDateEnd] = useState(new Date());

  const invoiceOrders = useMemo(() => {
    let filtered = orders.filter(o => o.proformaNumber && !o.invoiceNumber);
    return filterOrdersByDate(filtered, dateStart, dateEnd);
  }, [orders, dateStart, dateEnd]);

  const handleEnterInvoice = async (orderID: string) => {
    const invoiceNumber = window.prompt(`Enter Invoice Number for order ${orderID}:`);
    if (!invoiceNumber) return;

    const invoiceTotalAmount = window.prompt(`Enter Invoice Total Amount (MKD) - optional:`) || '';
    const note = window.prompt(`Add note about this invoice (optional):`) || '';

    setLoading(true);

    try {
      await ApiService.enterInvoice(orderID, invoiceNumber, invoiceTotalAmount, currentUser!.id, note);
      await refreshData();
      alert(`✅ Invoice ${invoiceNumber} saved for order ${orderID}!`);
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('❌ Error saving invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📄 Enter Invoice</h2>
        <button className="btn btn-secondary" onClick={refreshData} disabled={loading}>
          Refresh
        </button>
      </div>

      {invoiceOrders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
          No orders need invoice
        </p>
      ) : (
        <div>
          {invoiceOrders.map((order) => (
            <div
              key={order.orderID}
              className="card"
              style={{ marginBottom: '1rem' }}
            >
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>
                      {order.orderID} - {order.clientName}
                    </h3>
                    <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>
                      {order.quantity} {order.unit} of {order.productType} |
                      Total: {order.totalAmount} MKD
                    </p>
                    <p style={{ color: '#065F46', marginBottom: '0.5rem' }}>
                      🧾 Proforma: <strong>{order.proformaNumber}</strong>
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-success"
                    onClick={() => handleEnterInvoice(order.orderID)}
                    disabled={loading}
                  >
                    📄 Enter Invoice Number
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
