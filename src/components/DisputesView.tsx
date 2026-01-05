import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { filterOrdersByDate } from '../utils/helpers';

export function DisputesView() {
  const { orders, currentUser, refreshData } = useApp();
  const [loading, setLoading] = useState(false);
  const [dateStart, setDateStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [dateEnd, setDateEnd] = useState(new Date());

  const disputedOrders = useMemo(() => {
    let filtered = orders.filter(o => o.status === 'Disputed');
    return filterOrdersByDate(filtered, dateStart, dateEnd);
  }, [orders, dateStart, dateEnd]);

  const handleResolve = async (orderID: string) => {
    const resolution = window.prompt('Enter resolution details:');
    if (!resolution) return;

    setLoading(true);

    try {
      await ApiService.resolveDispute(orderID, currentUser!.id, resolution);
      await refreshData();
      alert(`✅ Dispute for order ${orderID} marked as RESOLVED!`);
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('❌ Error resolving dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">⚠️ Resolve Disputes</h2>
        <button className="btn btn-secondary" onClick={refreshData} disabled={loading}>
          Refresh
        </button>
      </div>

      {disputedOrders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
          No disputed orders
        </p>
      ) : (
        <div>
          {disputedOrders.map((order) => (
            <div
              key={order.orderID}
              className="card"
              style={{ borderLeft: '4px solid var(--warning)', marginBottom: '1rem' }}
            >
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>
                      {order.orderID} - {order.clientName}
                    </h3>
                    <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>
                      {order.quantity} {order.unit} of {order.productType}
                    </p>
                    {order.driverName && (
                      <p style={{ color: '#065F46', marginBottom: '0.5rem' }}>
                        🚛 Driver: <strong>{order.driverName}</strong> | Truck: <strong>{order.truckPlate}</strong>
                      </p>
                    )}
                    <p style={{ color: '#D97706', fontWeight: 500 }}>
                      ⚠️ Dispute Reason: {order.rejectionReason || 'Not specified'}
                    </p>
                  </div>
                  <span className="status-badge status-disputed">{order.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-success"
                    onClick={() => handleResolve(order.orderID)}
                    disabled={loading}
                  >
                    ✅ Mark as Resolved
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
