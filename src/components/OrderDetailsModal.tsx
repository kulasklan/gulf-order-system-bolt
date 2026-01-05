import { useState, useEffect } from 'react';
import { X, FileText, MessageSquare, Clock, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { Order, OrderNote } from '../types';
import { formatDate } from '../utils/helpers';

interface OrderDetailsModalProps {
  orderID: string | null;
  onClose: () => void;
}

export function OrderDetailsModal({ orderID, onClose }: OrderDetailsModalProps) {
  const { orders, documents, currentUser } = useApp();
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  const order = orders.find(o => o.orderID === orderID);
  const orderDocs = documents.filter(d => d.orderID === orderID);

  useEffect(() => {
    if (orderID) {
      loadNotes();
    }
  }, [orderID]);

  const loadNotes = async () => {
    if (!orderID) return;
    try {
      const data = await ApiService.loadOrderNotes(orderID);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !currentUser || !orderID) return;

    setLoading(true);
    try {
      await ApiService.addOrderNote(
        orderID,
        newNote,
        currentUser.id,
        currentUser.name,
        currentUser.department
      );
      setNewNote('');
      await loadNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  if (!orderID || !order) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'white',
          padding: '1.5rem',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            Order Details - {order.orderID}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <Section title="📋 Basic Information">
              <InfoRow label="Order ID" value={order.orderID} />
              <InfoRow label="Order Date" value={formatDate(order.orderDate)} />
              <InfoRow label="Client" value={order.clientName} />
              <InfoRow label="Status" value={<StatusBadge status={order.status} />} />
              <InfoRow label="Priority" value={order.priority} />
            </Section>

            <Section title="📦 Product Details">
              <InfoRow label="Product Type" value={order.productType} />
              <InfoRow label="Unit" value={order.unit} />
              <InfoRow label="Quantity" value={order.quantity} />
              <InfoRow label="Warehouse" value={order.warehouse} />
              <InfoRow label="No Gulf Brand" value={order.noGulfBrand || 'No'} />
            </Section>

            <Section title="💰 Pricing">
              <InfoRow label="Regulatory Price" value={`${order.regulatoryPrice} KWD`} />
              <InfoRow label="Margin" value={`${order.margin} Fils`} />
              <InfoRow label="Price with Margin" value={`${order.priceWithMargin} KWD`} />
              <InfoRow label="Total Amount" value={`${order.totalAmount} KWD`} />
              <InfoRow label="Payment Terms" value={order.paymentTerms} />
            </Section>

            <Section title="🚚 Delivery">
              <InfoRow label="Requested Date" value={formatDate(order.requestedDeliveryDate)} />
              <InfoRow label="Preferred Time" value={order.preferredDeliveryTime} />
              <InfoRow label="Avoid After-work" value={order.avoidAfterwork || 'No'} />
              {order.estimatedDelivery && <InfoRow label="Estimated Delivery" value={formatDate(order.estimatedDelivery)} />}
            </Section>

            {(order.approvedBy || order.rejectionReason) && (
              <Section title="✅ Approval">
                {order.approvedBy && <InfoRow label="Approved By" value={order.approvedBy} />}
                {order.approvalDate && <InfoRow label="Approval Date" value={formatDate(order.approvalDate)} />}
                {order.rejectionReason && <InfoRow label="Rejection Reason" value={order.rejectionReason} />}
              </Section>
            )}

            {(order.proformaNumber || order.invoiceNumber) && (
              <Section title="📄 Documents">
                {order.proformaNumber && <InfoRow label="Proforma Number" value={order.proformaNumber} />}
                {order.invoiceNumber && <InfoRow label="Invoice Number" value={order.invoiceNumber} />}
              </Section>
            )}

            {(order.driverName || order.truckPlate) && (
              <Section title="🚛 Transport">
                {order.driverName && <InfoRow label="Driver" value={order.driverName} />}
                {order.truckPlate && <InfoRow label="Truck Plate" value={order.truckPlate} />}
                {order.transportCompany && <InfoRow label="Company" value={order.transportCompany} />}
              </Section>
            )}
          </div>

          {orderDocs.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FileText size={20} />
                Attached Documents ({orderDocs.length})
              </h3>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {orderDocs.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.75rem',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: '#1F2937',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{doc.fileName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem' }}>
                        {doc.documentType} • Uploaded {formatDate(doc.uploadedDate)}
                      </div>
                    </div>
                    <FileText size={20} color="#6B7280" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <MessageSquare size={20} />
              Notes & Timeline ({notes.length})
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note or comment..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  minHeight: '80px',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || loading}
                className="btn btn-primary"
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? 'Adding...' : 'Add Note'}
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {notes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
                  No notes yet
                </p>
              ) : (
                notes.map((note, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} color="#6B7280" />
                        <span style={{ fontWeight: 500 }}>{note.userName}</span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          background: '#E5E7EB',
                          borderRadius: '12px'
                        }}>
                          {note.userDepartment}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#6B7280' }}>
                        <Clock size={14} />
                        {formatDate(note.timestamp)}
                      </div>
                    </div>
                    <div style={{ marginLeft: '1.5rem', color: '#374151' }}>
                      {note.note}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.125rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.95rem', color: '#1F2937', fontWeight: 500 }}>
        {value || '-'}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Pending Approval': '#f093fb',
    'Approved': '#43e97b',
    'Rejected': '#868f96',
    'Truck Assigned': '#4facfe',
    'In Warehouse': '#fa709a',
    'Loading': '#fee140',
    'Left Warehouse': '#30cfd0',
    'Delivered': '#a8edea',
    'Disputed': '#ff9a56',
    'Resolved': '#38f9d7'
  };

  return (
    <span style={{
      background: colors[status] || '#E5E7EB',
      color: '#1F2937',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.85rem',
      fontWeight: 500,
      display: 'inline-block'
    }}>
      {status}
    </span>
  );
}
