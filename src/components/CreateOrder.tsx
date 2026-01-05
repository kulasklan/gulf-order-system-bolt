import { useState, FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { PRODUCT_TYPES, WAREHOUSES, PAYMENT_TERMS, PRIORITIES, UNITS } from '../config/constants';

export function CreateOrder() {
  const { currentUser, clients, refreshData } = useApp();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    clientID: '',
    productType: '',
    unit: 'L',
    quantity: '',
    margin: '',
    warehouse: '',
    requestedDeliveryDate: '',
    preferredTime: '',
    paymentTerms: '',
    priority: 'Normal',
    avoidAfterwork: false,
    noGulfBrand: false,
    notes: ''
  });

  if (!currentUser) return null;

  const myClients = currentUser.department === 'Sales'
    ? clients.filter(c => c.assignedSM === currentUser.id)
    : clients;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const client = clients.find(c => c.clientID === formData.clientID);

      await ApiService.createOrder({
        createdBy: currentUser.id,
        clientID: formData.clientID,
        clientName: client?.clientName || '',
        productType: formData.productType,
        unit: formData.unit,
        quantity: formData.quantity,
        margin: formData.margin,
        warehouse: formData.warehouse,
        requestedDeliveryDate: formData.requestedDeliveryDate,
        preferredTime: formData.preferredTime,
        paymentTerms: formData.paymentTerms,
        priority: formData.priority,
        avoidAfterwork: formData.avoidAfterwork ? 'Yes' : 'No',
        noGulfBrand: formData.noGulfBrand,
        notes: formData.notes
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      await refreshData();

      alert('✅ Order created successfully!');
      setFormData({
        clientID: '',
        productType: '',
        unit: 'L',
        quantity: '',
        margin: '',
        warehouse: '',
        requestedDeliveryDate: '',
        preferredTime: '',
        paymentTerms: '',
        priority: 'Normal',
        avoidAfterwork: false,
        noGulfBrand: false,
        notes: ''
      });
    } catch (error) {
      console.error('Error creating order:', error);
      alert('❌ Error creating order');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">➕ Create New Order</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Client *</label>
            <select
              value={formData.clientID}
              onChange={(e) => setFormData({ ...formData, clientID: e.target.value })}
              required
            >
              <option value="">-- Select Client --</option>
              {myClients.map(client => (
                <option key={client.clientID} value={client.clientID}>
                  {client.clientName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Product Type *</label>
            <select
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
              required
            >
              <option value="">-- Select Product --</option>
              {PRODUCT_TYPES.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Unit *</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            >
              {UNITS.map(unit => (
                <option key={unit} value={unit}>Liters (L)</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Margin (MKD) *</label>
            <input
              type="number"
              value={formData.margin}
              onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
              required
              min="0"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label>Warehouse *</label>
            <select
              value={formData.warehouse}
              onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
              required
            >
              <option value="">-- Select Warehouse --</option>
              {WAREHOUSES.map(warehouse => (
                <option key={warehouse} value={warehouse}>{warehouse}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Requested Delivery Date *</label>
            <input
              type="date"
              value={formData.requestedDeliveryDate}
              onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
              required
              min={today}
            />
          </div>

          <div className="form-group">
            <label>Preferred Delivery Time *</label>
            <input
              type="text"
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              placeholder="e.g., 09:00 or Whole day"
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Terms *</label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              required
            >
              <option value="">-- Select Payment Terms --</option>
              {PAYMENT_TERMS.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
            >
              {PRIORITIES.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="avoidAfterworkCheck"
              checked={formData.avoidAfterwork}
              onChange={(e) => setFormData({ ...formData, avoidAfterwork: e.target.checked })}
            />
            <label htmlFor="avoidAfterworkCheck" style={{ margin: 0 }}>
              Avoid Afterwork Delivery
            </label>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="noGulfBrandCheck"
              checked={formData.noGulfBrand}
              onChange={(e) => setFormData({ ...formData, noGulfBrand: e.target.checked })}
            />
            <label htmlFor="noGulfBrandCheck" style={{ margin: 0 }}>
              Client Requested No Gulf Brand
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special instructions or notes..."
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
}
