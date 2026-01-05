import { useState, useEffect } from 'react';
import { Download, Upload, Search } from 'lucide-react';
import { SupabaseApiService, DBTruck } from '../../services/supabaseApi';
import * as XLSX from 'xlsx';

export default function TrucksManagement() {
  const [trucks, setTrucks] = useState<DBTruck[]>([]);
  const [filteredTrucks, setFilteredTrucks] = useState<DBTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTrucks();
  }, []);

  useEffect(() => {
    const filtered = trucks.filter(truck =>
      truck.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (truck.truck_type?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
    setFilteredTrucks(filtered);
  }, [searchTerm, trucks]);

  const loadTrucks = async () => {
    try {
      setLoading(true);
      const data = await SupabaseApiService.loadTrucks();
      setTrucks(data);
      setFilteredTrucks(data);
    } catch (error) {
      console.error('Error loading trucks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = trucks.map(truck => ({
      'Truck ID': truck.truck_id,
      'Plate Number': truck.plate_number,
      'Truck Type': truck.truck_type || '',
      'Capacity': truck.capacity || '',
      'Capacity Unit': truck.capacity_unit || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trucks');
    XLSX.writeFile(wb, `trucks_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          const truckData = {
            truck_id: row['Truck ID'] || `T${Date.now()}`,
            plate_number: row['Plate Number'] || '',
            truck_type: row['Truck Type'] || '',
            capacity: Number(row['Capacity']) || null,
            capacity_unit: row['Capacity Unit'] || '',
            assigned_driver_id: null,
            transport_company_id: null
          };

          await SupabaseApiService.createTruck(truckData);
        }

        alert(`Successfully imported ${jsonData.length} trucks`);
        await loadTrucks();
      } catch (error) {
        console.error('Error importing:', error);
        alert('Failed to import Excel file');
      }
    };
    reader.readAsBinaryString(file);
  };

  if (loading) {
    return <div className="text-center py-12">Loading trucks...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Trucks Management</h2>
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
            placeholder="Search trucks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Truck ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plate Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTrucks.map((truck) => (
              <tr key={truck.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{truck.truck_id}</td>
                <td className="px-4 py-3 text-sm font-medium">{truck.plate_number}</td>
                <td className="px-4 py-3 text-sm">{truck.truck_type || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  {truck.capacity ? `${truck.capacity} ${truck.capacity_unit || ''}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Total Trucks: <span className="font-semibold">{filteredTrucks.length}</span>
        </p>
      </div>
    </div>
  );
}
