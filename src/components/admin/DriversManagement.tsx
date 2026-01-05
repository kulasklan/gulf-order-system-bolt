import { useState, useEffect } from 'react';
import { Plus, Download, Upload, Trash2, Search } from 'lucide-react';
import { SupabaseApiService, DBDriver } from '../../services/supabaseApi';
import * as XLSX from 'xlsx';

export default function DriversManagement() {
  const [drivers, setDrivers] = useState<DBDriver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<DBDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    const filtered = drivers.filter(driver =>
      driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.license_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDrivers(filtered);
  }, [searchTerm, drivers]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await SupabaseApiService.loadDrivers();
      setDrivers(data);
      setFilteredDrivers(data);
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = drivers.map(driver => ({
      'Driver ID': driver.driver_id,
      'Driver Name': driver.driver_name,
      'License Number': driver.license_number,
      'Phone': driver.phone || '',
      'Email': driver.email || '',
      'License Expiry': driver.license_expiry || '',
      'Assigned Company': driver.assigned_company || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Drivers');
    XLSX.writeFile(wb, `drivers_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          const driverData = {
            driver_id: row['Driver ID'] || `D${Date.now()}`,
            driver_name: row['Driver Name'] || '',
            license_number: row['License Number'] || '',
            phone: row['Phone'] || '',
            email: row['Email'] || '',
            license_expiry: row['License Expiry'] || null,
            assigned_company: row['Assigned Company'] || ''
          };

          await SupabaseApiService.createDriver(driverData);
        }

        alert(`Successfully imported ${jsonData.length} drivers`);
        await loadDrivers();
      } catch (error) {
        console.error('Error importing:', error);
        alert('Failed to import Excel file');
      }
    };
    reader.readAsBinaryString(file);
  };

  if (loading) {
    return <div className="text-center py-12">Loading drivers...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Drivers Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer">
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
            placeholder="Search drivers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Driver ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Driver Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">License Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDrivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{driver.driver_id}</td>
                <td className="px-4 py-3 text-sm font-medium">{driver.driver_name}</td>
                <td className="px-4 py-3 text-sm">{driver.license_number}</td>
                <td className="px-4 py-3 text-sm">{driver.phone || '-'}</td>
                <td className="px-4 py-3 text-sm">{driver.email || '-'}</td>
                <td className="px-4 py-3 text-sm">{driver.assigned_company || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Total Drivers: <span className="font-semibold">{filteredDrivers.length}</span>
        </p>
      </div>
    </div>
  );
}
