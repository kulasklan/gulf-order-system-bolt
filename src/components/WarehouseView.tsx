import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { getStatusClass } from '../utils/helpers';

export function WarehouseView() {
  const { orders, currentUser, refreshData } = useApp();
  const [loading, setLoading] = useState(false);

  const warehouseOrders = useMemo(() => {
    return orders.filter(o =>
      ['Truck Assigned', 'In Warehouse', 'Loading'].includes(o.status)
    );
  }, [orders]);

  const handleStatusUpdate = async (orderID: string, newStatus: string) => {
    const confirmMsg = `Mark "${newStatus}" as complete?\n\nThis will update the order status.`;

    if (!window.confirm(confirmMsg)) return;

    const note = window.prompt('Add note (optional - e.g., time, observations):') || '';
    setLoading(true);

    try {
      await ApiService.updateWarehouseStatus(orderID, currentUser!.id, newStatus, note);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await refreshData();
      alert(`✅ Status updated to "${newStatus}"!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const getStageInfo = (status: string) => {
    const stages = {
      'Truck Assigned': 0,
      'In Warehouse': 1,
      'Loading': 2
    };
    return stages[status as keyof typeof stages] || 0;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📦 Warehouse Dashboard</h2>
        <button className="btn btn-secondary" onClick={refreshData}>
          Refresh
        </button>
      </div>

      {warehouseOrders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
          No orders in warehouse
        </p>
      ) : (
        <div>
          {warehouseOrders.map((order) => {
            const currentStage = getStageInfo(order.status);

            return (
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
                        Warehouse: {order.warehouse}
                      </p>
                      {order.driverName && (
                        <>
                          <p style={{ color: '#065F46', marginBottom: '0.5rem' }}>
                            🚛 Driver: <strong>{order.driverName}</strong> |
                            Truck: <strong>{order.truckPlate}</strong> |
                            Company: <strong>{order.transportCompany}</strong>
                          </p>
                          <p style={{ color: '#059669', marginBottom: '0.25rem' }}>
                            ⏰ Est. Delivery: <strong>{order.estimatedDelivery}</strong>
                          </p>
                        </>
                      )}
                    </div>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--light)', borderRadius: '4px' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>📋 Warehouse Checklist</h4>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                        <input
                          type="checkbox"
                          checked={currentStage >= 1}
                          onChange={() => handleStatusUpdate(order.orderID, 'In Warehouse')}
                          disabled={currentStage >= 1 || loading}
                          style={{ width: '20px', height: '20px' }}
                        />
                        <label style={{ flex: 1, margin: 0 }}>
                          <strong>1. Truck Arrived in Warehouse</strong>
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                        <input
                          type="checkbox"
                          checked={currentStage >= 2}
                          onChange={() => handleStatusUpdate(order.orderID, 'Loading')}
                          disabled={currentStage >= 2 || currentStage < 1 || loading}
                          style={{ width: '20px', height: '20px' }}
                        />
                        <label style={{ flex: 1, margin: 0 }}>
                          <strong>2. Start Loading (~1 hour)</strong>
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleStatusUpdate(order.orderID, 'Left Warehouse')}
                          disabled={currentStage < 2 || loading}
                          style={{ width: '20px', height: '20px' }}
                        />
                        <label style={{ flex: 1, margin: 0 }}>
                          <strong>3. Truck Left Warehouse</strong>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
