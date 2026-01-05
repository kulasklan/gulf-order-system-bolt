import { Order } from '../types';
import { getStatusClass, getPriorityClass, canSeeFinancialInfo } from '../utils/helpers';
import { useApp } from '../context/AppContext';

interface OrderTableProps {
  orders: Order[];
  onViewDetails: (orderID: string) => void;
}

export function OrderTable({ orders, onViewDetails }: OrderTableProps) {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
        No orders found
      </div>
    );
  }

  const showFinancial = canSeeFinancialInfo(currentUser.department);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Client</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const statusClass = getStatusClass(order.status);
            const priorityClass = getPriorityClass(order.priority);

            let financialBadges = '';
            if (order.proformaNumber) {
              financialBadges += `<span class="status-badge" style="background: #DBEAFE; color: #1E40AF; margin-right: 0.25rem;">🧾 ${order.proformaNumber}</span>`;
            }
            if (order.invoiceNumber) {
              financialBadges += `<span class="status-badge" style="background: #D1FAE5; color: #065F46;">📄 ${order.invoiceNumber}</span>`;
            }

            return (
              <tr key={order.orderID}>
                <td><strong>{order.orderID}</strong></td>
                <td>{order.orderDate}</td>
                <td>{order.clientName}</td>
                <td>{order.productType}</td>
                <td>{order.quantity} {order.unit}</td>
                <td>
                  <span className={`status-badge ${statusClass}`}>{order.status}</span>
                  {financialBadges && (
                    <>
                      <br />
                      <span dangerouslySetInnerHTML={{ __html: financialBadges }} />
                    </>
                  )}
                </td>
                <td>
                  <span className={priorityClass}>{order.priority}</span>
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => onViewDetails(order.orderID)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
