import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { Download, TrendingUp, Package, Truck, Clock, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export function AnalyticsView() {
  const { orders } = useApp();
  const [dateRange, setDateRange] = useState(30);

  const filteredOrders = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dateRange);
    return orders.filter(o => new Date(o.orderDate) >= cutoffDate);
  }, [orders, dateRange]);

  const analytics = useMemo(() => calculateAnalytics(filteredOrders), [filteredOrders]);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['Gulf Order Management System - Analytics Report'],
      ['Generated:', new Date().toLocaleString()],
      ['Date Range:', `Last ${dateRange} days`],
      [],
      ['Summary Statistics'],
      ['Total Orders', analytics.totalOrders],
      ['Delivered Orders', analytics.statusCounts.Delivered || 0],
      ['Disputed Orders', analytics.statusCounts.Disputed || 0],
      ['Rejected Orders', analytics.statusCounts.Rejected || 0],
      ['Active Orders', analytics.totalOrders - (analytics.statusCounts.Delivered || 0) - (analytics.statusCounts.Rejected || 0)],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    const ordersBySMData = [
      ['Sales Manager Performance'],
      ['Sales Manager', 'Total Orders', 'Delivered', 'Rejected', 'Disputed', 'Success Rate'],
      ...Object.entries(analytics.ordersBySM).map(([sm, stats]) => [
        sm,
        stats.count,
        stats.delivered,
        stats.rejected,
        stats.disputed,
        stats.count > 0 ? `${((stats.delivered / stats.count) * 100).toFixed(1)}%` : '0%'
      ])
    ];

    const smSheet = XLSX.utils.aoa_to_sheet(ordersBySMData);
    XLSX.utils.book_append_sheet(wb, smSheet, 'Sales Performance');

    const productData = [
      ['Product Analysis'],
      ['Product Type', 'Order Count'],
      ...Object.entries(analytics.productCounts).map(([product, count]) => [product, count])
    ];

    const productSheet = XLSX.utils.aoa_to_sheet(productData);
    XLSX.utils.book_append_sheet(wb, productSheet, 'Products');

    const transportData = [
      ['Transport Company Analysis'],
      ['Company', 'Order Count'],
      ...Object.entries(analytics.transportCounts).map(([company, count]) => [company, count])
    ];

    const transportSheet = XLSX.utils.aoa_to_sheet(transportData);
    XLSX.utils.book_append_sheet(wb, transportSheet, 'Transport');

    const statusData = [
      ['Order Status Breakdown'],
      ['Status', 'Count'],
      ...Object.entries(analytics.statusCounts).map(([status, count]) => [status, count])
    ];

    const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(wb, statusSheet, 'Status');

    const timeMetricsData = [
      ['Time Metrics (Average Days)'],
      ['Metric', 'Average Days'],
      ['Order to Approval', calculateAverage(analytics.timeMetrics.orderToApproval)],
      ['Approval to Transport', calculateAverage(analytics.timeMetrics.approvalToTransport)],
      ['Transport to Warehouse', calculateAverage(analytics.timeMetrics.transportToWarehouse)],
      ['Warehouse to Loading', calculateAverage(analytics.timeMetrics.warehouseToLoading)],
      ['Loading to Left', calculateAverage(analytics.timeMetrics.loadingToLeft)],
      ['Left to Delivered', calculateAverage(analytics.timeMetrics.leftToDelivered)],
      ['Total Cycle Time', calculateAverage(analytics.timeMetrics.totalCycleTime)],
    ];

    const timeSheet = XLSX.utils.aoa_to_sheet(timeMetricsData);
    XLSX.utils.book_append_sheet(wb, timeSheet, 'Time Metrics');

    const deliveryVarianceData = [
      ['Delivery Variance Analysis'],
      ['Order ID', 'Variance (Days)', 'Status'],
      ...analytics.timeMetrics.deliveryVariance.map(v => [
        v.orderID,
        v.variance,
        v.onTime ? 'On Time' : v.early ? 'Early' : 'Late'
      ])
    ];

    const varianceSheet = XLSX.utils.aoa_to_sheet(deliveryVarianceData);
    XLSX.utils.book_append_sheet(wb, varianceSheet, 'Delivery Variance');

    XLSX.writeFile(wb, `Gulf_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Analytics & Reports</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                background: 'white'
              }}
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={365}>Last Year</option>
              <option value={9999}>All Time</option>
            </select>
            <button onClick={exportToExcel} className="btn btn-primary">
              <Download size={16} />
              Export to Excel
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard
            icon={<Package size={24} />}
            label="Total Orders"
            value={analytics.totalOrders}
            color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            icon={<TrendingUp size={24} />}
            label="Delivered"
            value={analytics.statusCounts.Delivered || 0}
            color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
          <StatCard
            icon={<AlertCircle size={24} />}
            label="Disputed"
            value={analytics.statusCounts.Disputed || 0}
            color="linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)"
          />
          <StatCard
            icon={<Clock size={24} />}
            label="Avg Cycle Time"
            value={`${calculateAverage(analytics.timeMetrics.totalCycleTime)} days`}
            color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          <ReportCard title="📈 Sales Manager Performance">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sales Manager</th>
                  <th>Orders</th>
                  <th>Delivered</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.ordersBySM).map(([sm, stats]) => (
                  <tr key={sm}>
                    <td>{sm}</td>
                    <td>{stats.count}</td>
                    <td>{stats.delivered}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        background: stats.count > 0 && (stats.delivered / stats.count) > 0.8 ? '#D1FAE5' : '#FEE2E2',
                        color: stats.count > 0 && (stats.delivered / stats.count) > 0.8 ? '#065F46' : '#991B1B',
                        fontSize: '0.85rem',
                        fontWeight: 500
                      }}>
                        {stats.count > 0 ? `${((stats.delivered / stats.count) * 100).toFixed(1)}%` : '0%'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportCard>

          <ReportCard title="📦 Product Distribution">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Type</th>
                  <th>Orders</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.productCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([product, count]) => (
                    <tr key={product}>
                      <td>{product}</td>
                      <td>{count}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            flex: 1,
                            height: '8px',
                            background: '#E5E7EB',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${(count / analytics.totalOrders) * 100}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', color: '#6B7280', minWidth: '45px' }}>
                            {((count / analytics.totalOrders) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </ReportCard>

          <ReportCard title="🚛 Transport Companies">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Orders</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.transportCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([company, count]) => (
                    <tr key={company}>
                      <td>{company}</td>
                      <td>{count}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            flex: 1,
                            height: '8px',
                            background: '#E5E7EB',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${(count / Object.values(analytics.transportCounts).reduce((a, b) => a + b, 0)) * 100}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', color: '#6B7280', minWidth: '45px' }}>
                            {((count / Object.values(analytics.transportCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </ReportCard>

          <ReportCard title="📊 Order Status Breakdown">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.statusCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => (
                    <tr key={status}>
                      <td>{status}</td>
                      <td>{count}</td>
                      <td>
                        {((count / analytics.totalOrders) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </ReportCard>

          <ReportCard title="⏱️ Time Metrics (Avg Days)">
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <MetricRow label="Order → Approval" value={calculateAverage(analytics.timeMetrics.orderToApproval)} />
              <MetricRow label="Approval → Transport" value={calculateAverage(analytics.timeMetrics.approvalToTransport)} />
              <MetricRow label="Transport → Warehouse" value={calculateAverage(analytics.timeMetrics.transportToWarehouse)} />
              <MetricRow label="Warehouse → Loading" value={calculateAverage(analytics.timeMetrics.warehouseToLoading)} />
              <MetricRow label="Loading → Left" value={calculateAverage(analytics.timeMetrics.loadingToLeft)} />
              <MetricRow label="Left → Delivered" value={calculateAverage(analytics.timeMetrics.leftToDelivered)} />
              <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <MetricRow label="Total Cycle Time" value={calculateAverage(analytics.timeMetrics.totalCycleTime)} bold />
              </div>
            </div>
          </ReportCard>

          <ReportCard title="📅 Delivery Performance">
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>On Time</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                    {analytics.timeMetrics.deliveryVariance.filter(v => v.onTime).length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Early</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3B82F6' }}>
                    {analytics.timeMetrics.deliveryVariance.filter(v => v.early).length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Late</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DC2626' }}>
                    {analytics.timeMetrics.deliveryVariance.filter(v => !v.onTime && !v.early).length}
                  </div>
                </div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Variance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.timeMetrics.deliveryVariance.slice(0, 10).map((v) => (
                  <tr key={v.orderID}>
                    <td>{v.orderID}</td>
                    <td>{Math.abs(v.variance)} days</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: v.onTime ? '#D1FAE5' : v.early ? '#DBEAFE' : '#FEE2E2',
                        color: v.onTime ? '#065F46' : v.early ? '#1E40AF' : '#991B1B'
                      }}>
                        {v.onTime ? 'On Time' : v.early ? `${v.variance}d Early` : `${Math.abs(v.variance)}d Late`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: color,
      padding: '1.5rem',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{label}</div>
    </div>
  );
}

function ReportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #E5E7EB'
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>{title}</h3>
      {children}
    </div>
  );
}

function MetricRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, fontSize: bold ? '1.1rem' : '1rem' }}>{value}</span>
    </div>
  );
}

function calculateAnalytics(orders: Order[]) {
  const analytics = {
    ordersBySM: {} as Record<string, { count: number; delivered: number; rejected: number; disputed: number }>,
    totalOrders: orders.length,
    productCounts: {} as Record<string, number>,
    transportCounts: {} as Record<string, number>,
    statusCounts: {} as Record<string, number>,
    timeMetrics: {
      orderToApproval: [] as number[],
      approvalToTransport: [] as number[],
      transportToWarehouse: [] as number[],
      warehouseToLoading: [] as number[],
      loadingToLeft: [] as number[],
      leftToDelivered: [] as number[],
      totalCycleTime: [] as number[],
      deliveryVariance: [] as Array<{ orderID: string; variance: number; early: boolean; onTime: boolean }>
    }
  };

  orders.forEach(order => {
    if (!analytics.ordersBySM[order.createdBy]) {
      analytics.ordersBySM[order.createdBy] = { count: 0, delivered: 0, rejected: 0, disputed: 0 };
    }
    analytics.ordersBySM[order.createdBy].count++;

    if (order.status === 'Delivered') {
      analytics.ordersBySM[order.createdBy].delivered++;
    }
    if (order.status === 'Rejected') {
      analytics.ordersBySM[order.createdBy].rejected++;
    }
    if (order.status === 'Disputed') {
      analytics.ordersBySM[order.createdBy].disputed++;
    }

    analytics.productCounts[order.productType] = (analytics.productCounts[order.productType] || 0) + 1;

    if (order.transportCompany) {
      analytics.transportCounts[order.transportCompany] = (analytics.transportCounts[order.transportCompany] || 0) + 1;
    }

    analytics.statusCounts[order.status] = (analytics.statusCounts[order.status] || 0) + 1;

    if (order.status === 'Delivered' && order.requestedDeliveryDate && order.approvalDate) {
      const orderDate = new Date(order.orderDate);
      const approvalDate = new Date(order.approvalDate);
      const requestedDate = new Date(order.requestedDeliveryDate);
      const deliveredDate = new Date();

      const orderToApprovalDays = Math.floor((approvalDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      if (orderToApprovalDays >= 0) {
        analytics.timeMetrics.orderToApproval.push(orderToApprovalDays);
      }

      const totalCycleDays = Math.floor((deliveredDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      if (totalCycleDays >= 0) {
        analytics.timeMetrics.totalCycleTime.push(totalCycleDays);
      }

      const varianceDays = Math.floor((deliveredDate.getTime() - requestedDate.getTime()) / (1000 * 60 * 60 * 24));
      analytics.timeMetrics.deliveryVariance.push({
        orderID: order.orderID,
        variance: varianceDays,
        early: varianceDays < -1,
        onTime: Math.abs(varianceDays) <= 1
      });
    }
  });

  return analytics;
}

function calculateAverage(values: number[]): string {
  if (values.length === 0) return '0';
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg.toFixed(1);
}
