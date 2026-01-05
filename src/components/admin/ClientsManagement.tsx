import { useState, useEffect } from 'react';
import { Plus, Download, Upload, Trash2, Save, X, Search, Filter } from 'lucide-react';
import { SupabaseApiService, DBClient } from '../../services/supabaseApi';
import * as XLSX from 'xlsx';

export default function ClientsManagement() {
  const [clients, setClients] = useState<DBClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<DBClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DBClient>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState<Partial<DBClient>>({
    client_id: '',
    client_name: '',
    address: '',
    contact_person: '',
    phone: '',
    email: '',
    tax_id: '',
    assigned_sm: '',
    payment_terms: '',
    credit_limit: 0,
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(client =>
      client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await SupabaseApiService.loadClients();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      alert('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = clients.map(client => ({
      'Client ID': client.client_id,
      'Client Name': client.client_name,
      'Address': client.address || '',
      'Contact Person': client.contact_person || '',
      'Phone': client.phone || '',
      'Email': client.email || '',
      'Tax ID': client.tax_id || '',
      'Assigned SM': client.assigned_sm || '',
      'Payment Terms': client.payment_terms || '',
      'Credit Limit': client.credit_limit || 0,
      'Notes': client.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, `clients_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        for (const row: any of jsonData) {
          const clientData = {
            client_id: row['Client ID'] || '',
            client_name: row['Client Name'] || '',
            address: row['Address'] || '',
            contact_person: row['Contact Person'] || '',
            phone: row['Phone'] || '',
            email: row['Email'] || '',
            tax_id: row['Tax ID'] || '',
            assigned_sm: row['Assigned SM'] || '',
            payment_terms: row['Payment Terms'] || '',
            credit_limit: Number(row['Credit Limit']) || 0,
            notes: row['Notes'] || ''
          };

          await SupabaseApiService.createClient(clientData);
        }

        alert(`Successfully imported ${jsonData.length} clients`);
        await loadClients();
      } catch (error) {
        console.error('Error importing:', error);
        alert('Failed to import Excel file');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleAdd = async () => {
    try {
      if (!newClient.client_id || !newClient.client_name) {
        alert('Client ID and Name are required');
        return;
      }
      await SupabaseApiService.createClient(newClient as Omit<DBClient, 'id' | 'active'>);
      setShowAddForm(false);
      setNewClient({
        client_id: '',
        client_name: '',
        address: '',
        contact_person: '',
        phone: '',
        email: '',
        tax_id: '',
        assigned_sm: '',
        payment_terms: '',
        credit_limit: 0,
        notes: ''
      });
      await loadClients();
      alert('Client added successfully');
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Failed to add client');
    }
  };

  const handleEdit = (client: DBClient) => {
    setEditingId(client.id);
    setEditForm(client);
  };

  const handleSave = async () => {
    try {
      if (!editingId) return;
      await SupabaseApiService.updateClient(editingId, editForm);
      setEditingId(null);
      setEditForm({});
      await loadClients();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      await SupabaseApiService.deleteClient(id);
      await loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading clients...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Clients Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {showAddForm && (
        <div className="p-6 bg-blue-50 border-b border-blue-200">
          <h3 className="text-lg font-semibold mb-4">Add New Client</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Client ID*"
              value={newClient.client_id}
              onChange={(e) => setNewClient({ ...newClient, client_id: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Client Name*"
              value={newClient.client_name}
              onChange={(e) => setNewClient({ ...newClient, client_name: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Contact Person"
              value={newClient.contact_person}
              onChange={(e) => setNewClient({ ...newClient, contact_person: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Phone"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Tax ID"
              value={newClient.tax_id}
              onChange={(e) => setNewClient({ ...newClient, tax_id: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Address"
              value={newClient.address}
              onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
              className="px-3 py-2 border rounded-lg col-span-3"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Client
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Address</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                {editingId === client.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.client_id || ''}
                        onChange={(e) => setEditForm({ ...editForm, client_id: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.client_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.contact_person || ''}
                        onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleSave}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm">{client.client_id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{client.client_name}</td>
                    <td className="px-4 py-3 text-sm">{client.contact_person || '-'}</td>
                    <td className="px-4 py-3 text-sm">{client.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm">{client.email || '-'}</td>
                    <td className="px-4 py-3 text-sm">{client.address || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(client)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Total Clients: <span className="font-semibold">{filteredClients.length}</span>
        </p>
      </div>
    </div>
  );
}
