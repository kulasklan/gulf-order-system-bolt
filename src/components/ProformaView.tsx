import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { filterOrdersByDate, getStatusClass } from '../utils/helpers';

export function ProformaView() {
  const { orders, currentUser, refreshData } = useApp();
  const [loading, setLoading] = useState(false);
  const [dateStart, setDateStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [dateEnd, setDateEnd] = useState(new Date());

  const proformaOrders = useMemo(() => {
    let filtered = orders.filter(o =>
      o.status !== 'Pending Approval' &&
      o.status !== 'Rejected' &&
      !o.proformaNumber
    );
    return filterOrdersByDate(filtered, dateStart, dateEnd);
  }, [orders, dateStart, dateEnd]);

  const handleEnterProforma = async (orderID: string) => {
    const proformaNumber = window.prompt(`Enter Proforma Number for order ${orderID}:`);
    if (!proformaNumber) return;

    const proformaTotalAmount = window.prompt(`Enter Proforma Total Amount (MKD) - optional:`) || '';
    const note = window.prompt(`Add note about this proforma (optional):`) || '';

    setLoading(true);

    try {
      await ApiService.enterProforma(orderID, proformaNumber, proformaTotalAmount, currentUser!.id, note);
      await refreshData();
      alert(`✅ Proforma ${proformaNumber} saved for order ${orderID}!`);
    } catch (error) {
      console.error('Error saving proforma:', error);
      alert('❌ Error saving proforma');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">🧾 Enter Proforma</h2>
        <button className="btn btn-secondary" onClick={refreshData} disabled={loading}>
          Refresh
        </button>
      </div>

      {proformaOrders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
          No orders need proforma
        </p>
      ) : (
        <div>
          {proformaOrders.map((order) => (
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
                    <p style={{ color: '#059669' }}>
                      💰 Margin: <strong>{order.margin} MKD</strong>
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEnterProforma(order.orderID)}
                    disabled={loading}
                  >
                    🧾 Enter Proforma Number
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
