import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { filterOrdersByDate, getPriorityClass } from '../utils/helpers';
import { Order } from '../types';

export function ApprovalView() {
  const { orders, currentUser, refreshData } = useApp();
  const [loading, setLoading] = useState(false);
  const [dateStart, setDateStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [dateEnd, setDateEnd] = useState(new Date());

  const pendingOrders = useMemo(() => {
    let filtered = orders.filter(o => o.status === 'Pending Approval');
    return filterOrdersByDate(filtered, dateStart, dateEnd);
  }, [orders, dateStart, dateEnd]);

  const handleApprove = async (orderID: string) => {
    if (!window.confirm(`Approve order ${orderID}?`)) return;

    const note = window.prompt('Add approval note (optional):') || '';
    setLoading(true);

    try {
      await ApiService.approveOrder(orderID, currentUser!.id, note);
      await refreshData();
      alert(`✅ Order ${orderID} approved!`);
    } catch (error) {
      console.error('Error approving order:', error);
      alert('❌ Error approving order');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (orderID: string) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    setLoading(true);

    try {
      await ApiService.rejectOrder(orderID, currentUser!.id, reason);
      await refreshData();
      alert(`❌ Order ${orderID} rejected.`);
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('❌ Error rejecting order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">✅ Pending Approvals</h2>
        <button className="btn btn-secondary" onClick={refreshData} disabled={loading}>
          Refresh
        </button>
      </div>

      {pendingOrders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
          No pending approvals
        </p>
      ) : (
        <div>
          {pendingOrders.map((order) => (
            <div
              key={order.orderID}
              className="card"
              style={{ marginBottom: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    {order.orderID} - {order.clientName}
                  </h3>
                  <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
                    {order.quantity} {order.unit} of {order.productType} |
                    Delivery: {order.requestedDeliveryDate} |
                    <span className={getPriorityClass(order.priority)}> {order.priority}</span>
                  </p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(order.orderID)}
                      disabled={loading}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(order.orderID)}
                      disabled={loading}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
