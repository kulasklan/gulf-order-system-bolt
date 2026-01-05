import { useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import { SupabaseApiService, DBOrder } from '../../services/supabaseApi';
import * as XLSX from 'xlsx';

export default function OrdersManagement() {
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order =>
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await SupabaseApiService.loadOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = orders.map(order => ({
      'Order ID': order.order_id,
      'Order Date': order.order_date,
      'Client': order.clients?.client_name || '',
      'Product Type': order.product_type,
      'Quantity': order.quantity,
      'Unit': order.unit,
      'Total Amount': order.total_amount || '',
      'Status': order.status,
      'Warehouse': order.warehouse || '',
      'Requested Delivery': order.requested_delivery_date || '',
      'Driver': order.drivers?.driver_name || '',
      'Truck': order.trucks?.plate_number || '',
      'Proforma Number': order.proforma_number || '',
      'Invoice Number': order.invoice_number || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending Approval': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Truck Assigned': 'bg-blue-100 text-blue-800',
      'In Warehouse': 'bg-indigo-100 text-indigo-800',
      'Loading': 'bg-orange-100 text-orange-800',
      'Left Warehouse': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Disputed': 'bg-red-100 text-red-800',
      'Resolved': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Orders Management</h2>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{order.order_id}</td>
                <td className="px-4 py-3 text-sm">{order.order_date}</td>
                <td className="px-4 py-3 text-sm">{order.clients?.client_name || '-'}</td>
                <td className="px-4 py-3 text-sm">{order.product_type}</td>
                <td className="px-4 py-3 text-sm">{order.quantity} {order.unit}</td>
                <td className="px-4 py-3 text-sm">{order.total_amount || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Total Orders: <span className="font-semibold">{filteredOrders.length}</span>
        </p>
      </div>
    </div>
  );
}
