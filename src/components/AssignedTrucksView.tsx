import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { filterOrdersByDate, getStatusClass } from '../utils/helpers';

export function AssignedTrucksView() {
  const { orders, refreshData } = useApp();

  const assignedOrders = useMemo(() => {
    return orders.filter(o =>
      o.driverName && ['Truck Assigned', 'In Warehouse', 'Loading'].includes(o.status)
    );
  }, [orders]);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">🚛 Assigned Trucks</h2>
        <button className="btn btn-secondary" onClick={refreshData}>
          Refresh
        </button>
      </div>

      {assignedOrders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
          No assigned trucks in warehouse
        </p>
      ) : (
        <div>
          {assignedOrders.map((order) => (
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
                    <p style={{ color: '#065F46', marginBottom: '0.5rem' }}>
                      🚛 Driver: <strong>{order.driverName}</strong> |
                      Truck: <strong>{order.truckPlate}</strong> |
                      Company: <strong>{order.transportCompany}</strong>
                    </p>
                    <p style={{ color: '#059669', marginBottom: '0.25rem' }}>
                      ⏰ Est. Delivery: <strong>{order.estimatedDelivery}</strong>
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
