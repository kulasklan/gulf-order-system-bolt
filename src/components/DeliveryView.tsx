import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';

export function DeliveryView() {
  const { orders, currentUser, refreshData } = useApp();
  const [loading, setLoading] = useState(false);

  const deliveryOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Left Warehouse');
  }, [orders]);

  const handleMarkDelivered = async (orderID: string) => {
    if (!window.confirm(`Mark order ${orderID} as DELIVERED?`)) return;

    const deliveryNote = window.prompt('Add delivery note (optional):') || '';
    setLoading(true);

    try {
      await ApiService.markAsDelivered(orderID, currentUser!.id, deliveryNote);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await refreshData();
      alert(`✅ Order ${orderID} marked as DELIVERED!`);
    } catch (error) {
      console.error('Error marking as delivered:', error);
      alert('❌ Error marking order as delivered');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDisputed = async (orderID: string) => {
    const reason = window.prompt('Enter dispute reason:');
    if (!reason) return;

    setLoading(true);

    try {
      await ApiService.markAsDisputed(orderID, currentUser!.id, reason);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await refreshData();
      alert(`⚠️ Order ${orderID} marked as DISPUTED!`);
    } catch (error) {
      console.error('Error marking as disputed:', error);
      alert('❌ Error marking order as disputed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📦 Delivery - Mark Orders</h2>
        <button className="btn btn-secondary" onClick={refreshData}>
          Refresh
        </button>
      </div>

      {deliveryOrders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
          No orders ready for delivery confirmation
        </p>
      ) : (
        <div>
          {deliveryOrders.map((order) => (
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
                      {order.quantity} {order.unit} of {order.productType}
                    </p>
                    <p style={{ color: '#065F46', marginBottom: '0.5rem' }}>
                      🚛 Driver: <strong>{order.driverName}</strong> |
                      Truck: <strong>{order.truckPlate}</strong>
                    </p>
                    <p style={{ color: '#059669' }}>
                      📍 Delivery Address: <strong>{order.clientName}</strong>
                    </p>
                  </div>
                  <span className="status-badge" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                    {order.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-success"
                    onClick={() => handleMarkDelivered(order.orderID)}
                    disabled={loading}
                  >
                    ✅ Mark as Delivered
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleMarkDisputed(order.orderID)}
                    disabled={loading}
                  >
                    ⚠️ Mark as Disputed
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
