import { useState } from 'react';
import { Database, Users, Truck, Building2, Package, FileText, Settings } from 'lucide-react';
import OrdersManagement from './OrdersManagement';
import ClientsManagement from './ClientsManagement';
import DriversManagement from './DriversManagement';
import TrucksManagement from './TrucksManagement';
import CompaniesManagement from './CompaniesManagement';
import UsersManagement from './UsersManagement';

type AdminTab = 'orders' | 'clients' | 'drivers' | 'trucks' | 'companies' | 'users';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  const tabs = [
    { id: 'orders' as AdminTab, label: 'Orders', icon: FileText },
    { id: 'clients' as AdminTab, label: 'Clients', icon: Users },
    { id: 'drivers' as AdminTab, label: 'Drivers', icon: Users },
    { id: 'trucks' as AdminTab, label: 'Trucks', icon: Truck },
    { id: 'companies' as AdminTab, label: 'Transport Companies', icon: Building2 },
    { id: 'users' as AdminTab, label: 'Users', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 text-sm">Comprehensive data management and system administration</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {activeTab === 'orders' && <OrdersManagement />}
        {activeTab === 'clients' && <ClientsManagement />}
        {activeTab === 'drivers' && <DriversManagement />}
        {activeTab === 'trucks' && <TrucksManagement />}
        {activeTab === 'companies' && <CompaniesManagement />}
        {activeTab === 'users' && <UsersManagement />}
      </div>
    </div>
  );
}
