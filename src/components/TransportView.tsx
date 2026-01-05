import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { filterOrdersByDate } from '../utils/helpers';

export function TransportView() {
  const { orders, drivers, transportCompanies, currentUser, refreshData } = useApp();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    driverName: '',
    transportCompany: '',
    truckPlate: '',
    estimatedDelivery: '',
    note: ''
  });

  const transportOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Approved' && (!o.driverName || o.driverName === ''));
  }, [orders]);

  const handleShowModal = (orderID: string) => {
    const order = orders.find(o => o.orderID === orderID);
    if (!order) return;

    const defaultDate = order.requestedDeliveryDate ?
      `${order.requestedDeliveryDate}T${order.preferredDeliveryTime || '10:00'}` : '';

    setSelectedOrder(orderID);
    setFormData({
      driverName: '',
      transportCompany: '',
      truckPlate: '',
      estimatedDelivery: defaultDate,
      note: ''
    });
    setShowModal(true);
  };

  const handleAssign = async () => {
    if (!selectedOrder) return;
    if (!formData.driverName || !formData.transportCompany || !formData.truckPlate || !formData.estimatedDelivery) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await ApiService.assignTransport(
        selectedOrder,
        currentUser!.id,
        formData.driverName,
        formData.truckPlate,
        formData.transportCompany,
        formData.estimatedDelivery,
        formData.note
      );
      await refreshData();
      setShowModal(false);
      alert(`✅ Transport assigned to order ${selectedOrder}!`);
    } catch (error) {
      console.error('Error assigning transport:', error);
      alert('❌ Error assigning transport');
    } finally {
      setLoading(false);
    }
  };

  const selectedCompany = transportCompanies.find(c => c.companyName === formData.transportCompany);

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🚛 Assign Transport</h2>
          <button className="btn btn-secondary" onClick={refreshData}>
            Refresh
          </button>
        </div>

        {transportOrders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
            No orders waiting for transport assignment
          </p>
        ) : (
          <div>
            {transportOrders.map((order) => (
              <div
                key={order.orderID}
                className="card"
                style={{ marginBottom: '1rem' }}
              >
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem' }}>
                        {order.orderID} - {order.clientName}
                      </h3>
                      <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>
                        {order.quantity} {order.unit} of {order.productType} |
                        Warehouse: {order.warehouse}
                      </p>
                      <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>
                        <strong>Requested Delivery:</strong> {order.requestedDeliveryDate} {order.preferredDeliveryTime || ''}
                      </p>
                      {order.avoidAfterwork === 'Yes' && (
                        <p style={{ color: '#D97706' }}>⚠️ Avoid Afterwork Delivery</p>
                      )}
                    </div>
                    <span className="status-badge status-approved">{order.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleShowModal(order.orderID)}
                    >
                      🚛 Assign Driver & Truck
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem' }}>🚛 Assign Transport to {selectedOrder}</h3>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Select Driver *</label>
              <select
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                required
              >
                <option value="">-- Select Driver --</option>
                {drivers.map(d => (
                  <option key={d.driverID} value={d.driverName}>
                    {d.driverName} ({d.licenseNumber || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Select Transport Company *</label>
              <select
                value={formData.transportCompany}
                onChange={(e) => setFormData({ ...formData, transportCompany: e.target.value })}
                required
              >
                <option value="">-- Select Company --</option>
                {transportCompanies.map(c => (
                  <option key={c.companyID} value={c.companyName}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Truck License Plate *</label>
              <input
                type="text"
                value={formData.truckPlate}
                onChange={(e) => setFormData({ ...formData, truckPlate: e.target.value })}
                placeholder="e.g., SK-1234-AB"
                required
              />
              {selectedCompany && selectedCompany.trucks.length > 0 && (
                <small style={{ color: '#6B7280', marginTop: '0.25rem', display: 'block' }}>
                  Available trucks: {selectedCompany.trucks.join(', ')}
                </small>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Estimated Delivery Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.estimatedDelivery}
                onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Additional Note (optional)</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAssign} disabled={loading}>
                {loading ? 'Assigning...' : '✓ Assign Transport'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
