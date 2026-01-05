import { useState, useEffect } from 'react';
import { Download, Upload, Search } from 'lucide-react';
import { SupabaseApiService, DBTransportCompany } from '../../services/supabaseApi';
import * as XLSX from 'xlsx';

export default function CompaniesManagement() {
  const [companies, setCompanies] = useState<DBTransportCompany[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<DBTransportCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    const filtered = companies.filter(company =>
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await SupabaseApiService.loadTransportCompanies();
      setCompanies(data);
      setFilteredCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = companies.map(company => ({
      'Company ID': company.company_id,
      'Company Name': company.company_name,
      'Contact Person': company.contact_person || '',
      'Phone': company.phone || '',
      'Email': company.email || '',
      'Address': company.address || '',
      'Rate Per KM': company.rate_per_km || '',
      'Rate Per Load': company.rate_per_load || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transport Companies');
    XLSX.writeFile(wb, `transport_companies_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          const companyData = {
            company_id: row['Company ID'] || `TC${Date.now()}`,
            company_name: row['Company Name'] || '',
            contact_person: row['Contact Person'] || '',
            phone: row['Phone'] || '',
            email: row['Email'] || '',
            address: row['Address'] || '',
            rate_per_km: Number(row['Rate Per KM']) || null,
            rate_per_load: Number(row['Rate Per Load']) || null,
            payment_terms: '',
            notes: ''
          };

          await SupabaseApiService.createTransportCompany(companyData);
        }

        alert(`Successfully imported ${jsonData.length} transport companies`);
        await loadCompanies();
      } catch (error) {
        console.error('Error importing:', error);
        alert('Failed to import Excel file');
      }
    };
    reader.readAsBinaryString(file);
  };

  if (loading) {
    return <div className="text-center py-12">Loading transport companies...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Transport Companies Management</h2>
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
            placeholder="Search companies..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Company ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Company Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{company.company_id}</td>
                <td className="px-4 py-3 text-sm font-medium">{company.company_name}</td>
                <td className="px-4 py-3 text-sm">{company.contact_person || '-'}</td>
                <td className="px-4 py-3 text-sm">{company.phone || '-'}</td>
                <td className="px-4 py-3 text-sm">{company.email || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Total Companies: <span className="font-semibold">{filteredCompanies.length}</span>
        </p>
      </div>
    </div>
  );
}
