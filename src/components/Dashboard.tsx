import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { OrderTable } from './OrderTable';
import { filterOrdersByDate, setDateRange } from '../utils/helpers';
import { Order } from '../types';

interface DashboardProps {
  onViewDetails: (orderID: string) => void;
}

export function Dashboard({ onViewDetails }: DashboardProps) {
  const { currentUser, orders, refreshData } = useApp();
  const [dateStart, setDateStart] = useState(() => {
    const { start } = setDateRange(7);
    return start;
  });
  const [dateEnd, setDateEnd] = useState(new Date());
  const [filterType, setFilterType] = useState<string | null>(null);

  if (!currentUser) return null;

  const filteredOrders = useMemo(() => {
    let result = currentUser.department === 'Sales'
      ? orders.filter(o => o.createdBy === currentUser.id)
      : orders;

    result = filterOrdersByDate(result, dateStart, dateEnd);

    if (filterType) {
      result = applyFilter(result, filterType, currentUser.department, currentUser.id);
    }

    return result;
  }, [orders, currentUser, dateStart, dateEnd, filterType]);

  const stats = useMemo(() => calculateStats(orders, currentUser.department, currentUser.id), [orders, currentUser]);

  const handleDateRangeChange = (days: number) => {
    const { start, end } = setDateRange(days);
    setDateStart(start);
    setDateEnd(end);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        {renderStats(stats, currentUser.department, setFilterType)}
      </div>

      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.25rem' }}>
              📅 From Date
            </label>
            <input
              type="date"
              value={dateStart.toISOString().split('T')[0]}
              onChange={(e) => setDateStart(new Date(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.25rem' }}>
              📅 To Date
            </label>
            <input
              type="date"
              value={dateEnd.toISOString().split('T')[0]}
              onChange={(e) => setDateEnd(new Date(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => handleDateRangeChange(0)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
              Today
            </button>
            <button className="btn btn-secondary" onClick={() => handleDateRangeChange(7)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
              Last 7 Days
            </button>
            <button className="btn btn-secondary" onClick={() => handleDateRangeChange(30)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
              Last 30 Days
            </button>
            <button className="btn btn-secondary" onClick={() => handleDateRangeChange(365)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
              All Time
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 {filterType ? 'Filtered Orders' : 'My Orders'}</h2>
          <button className="btn btn-primary" onClick={refreshData}>
            Refresh
          </button>
        </div>
        <OrderTable orders={filteredOrders} onViewDetails={onViewDetails} />
      </div>
    </div>
  );
}

function calculateStats(orders: Order[], department: string, userId: string) {
  const filterCounts: Record<string, number> = {
    pending: orders.filter(o => o.status === 'Pending Approval').length,
    active: orders.filter(o =>
      o.status !== 'Pending Approval' &&
      o.status !== 'Delivered' &&
      o.status !== 'Disputed' &&
      o.status !== 'Resolved' &&
      o.status !== 'Rejected'
    ).length,
    disputed: orders.filter(o => o.status === 'Disputed').length,
    resolved: orders.filter(o => o.status === 'Resolved').length,
    rejected: orders.filter(o => o.status === 'Rejected').length,
    finished: orders.filter(o => o.status === 'Delivered' || o.status === 'Resolved').length,
  };

  if (department === 'Sales') {
    filterCounts.myOrders = orders.filter(o =>
      o.createdBy === userId &&
      o.status !== 'Delivered' &&
      o.status !== 'Disputed' &&
      o.status !== 'Resolved' &&
      o.status !== 'Rejected'
    ).length;
  }

  if (department === 'Finance') {
    filterCounts.needsDocs = orders.filter(o => !o.proformaNumber || !o.invoiceNumber).length;
    filterCounts.completed = orders.filter(o => o.proformaNumber && o.invoiceNumber).length;
  }

  if (department === 'Transport') {
    filterCounts.forAssigning = orders.filter(o => o.status === 'Approved' && !o.driverName).length;
    filterCounts.assigned = orders.filter(o =>
      o.driverName && ['Truck Assigned', 'In Warehouse', 'Loading', 'Left Warehouse'].includes(o.status)
    ).length;
  }

  if (department === 'Warehouse') {
    filterCounts.needsProcessing = orders.filter(o => o.status === 'Truck Assigned').length;
    filterCounts.inProgress = orders.filter(o => ['In Warehouse', 'Loading', 'Left Warehouse'].includes(o.status)).length;
  }

  return filterCounts;
}

function applyFilter(orders: Order[], filterType: string, department: string, userId: string): Order[] {
  const filters: Record<string, (o: Order) => boolean> = {
    pending: o => o.status === 'Pending Approval',
    active: o => !['Pending Approval', 'Delivered', 'Disputed', 'Resolved', 'Rejected'].includes(o.status),
    disputed: o => o.status === 'Disputed',
    resolved: o => o.status === 'Resolved',
    rejected: o => o.status === 'Rejected',
    finished: o => o.status === 'Delivered' || o.status === 'Resolved',
    myOrders: o => o.createdBy === userId && !['Delivered', 'Disputed', 'Resolved', 'Rejected'].includes(o.status),
    needsDocs: o => !o.proformaNumber || !o.invoiceNumber,
    completed: o => !!o.proformaNumber && !!o.invoiceNumber,
    forAssigning: o => o.status === 'Approved' && !o.driverName,
    assigned: o => !!o.driverName && ['Truck Assigned', 'In Warehouse', 'Loading', 'Left Warehouse'].includes(o.status),
    needsProcessing: o => o.status === 'Truck Assigned',
    inProgress: o => ['In Warehouse', 'Loading', 'Left Warehouse'].includes(o.status),
  };

  return orders.filter(filters[filterType] || (() => true));
}

function renderStats(stats: Record<string, number>, department: string, onFilter: (type: string) => void) {
  const cardStyle = (gradient: string) => ({
    background: gradient,
    padding: '1rem',
    borderRadius: '12px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s'
  });

  const valueStyle = { fontSize: '2rem', fontWeight: 'bold', color: 'white', lineHeight: 1 };
  const labelStyle = { fontSize: '0.75rem', color: 'rgba(255,255,255,0.95)', marginTop: '0.5rem', fontWeight: 500, textTransform: 'uppercase' as const };

  if (department === 'Management') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        <div onClick={() => onFilter('pending')} style={cardStyle('linear-gradient(135deg, #f093fb 0%, #f5576c 100%)')}>
          <div style={valueStyle}>{stats.pending}</div>
          <div style={labelStyle}>⏳ Pending</div>
        </div>
        <div onClick={() => onFilter('active')} style={cardStyle('linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)')}>
          <div style={valueStyle}>{stats.active}</div>
          <div style={labelStyle}>📋 Active</div>
        </div>
        <div onClick={() => onFilter('disputed')} style={cardStyle('linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)')}>
          <div style={valueStyle}>{stats.disputed}</div>
          <div style={labelStyle}>⚠️ Disputed</div>
        </div>
        <div onClick={() => onFilter('resolved')} style={cardStyle('linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)')}>
          <div style={valueStyle}>{stats.resolved}</div>
          <div style={labelStyle}>✅ Resolved</div>
        </div>
        <div onClick={() => onFilter('rejected')} style={cardStyle('linear-gradient(135deg, #868f96 0%, #596164 100%)')}>
          <div style={valueStyle}>{stats.rejected}</div>
          <div style={labelStyle}>❌ Rejected</div>
        </div>
        <div onClick={() => onFilter('finished')} style={cardStyle('linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)')}>
          <div style={valueStyle}>{stats.finished}</div>
          <div style={labelStyle}>🏁 Finished</div>
        </div>
      </div>
    );
  }

  return null;
}
