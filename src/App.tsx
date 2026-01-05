import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import TestingRoleSelector from './components/TestingRoleSelector';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CreateOrder } from './components/CreateOrder';
import { ApprovalView } from './components/ApprovalView';
import { DisputesView } from './components/DisputesView';
import { ProformaView } from './components/ProformaView';
import { InvoiceView } from './components/InvoiceView';
import { RegulatoryPricesView } from './components/RegulatoryPricesView';
import { TransportView } from './components/TransportView';
import { AssignedTrucksView } from './components/AssignedTrucksView';
import { DeliveryView } from './components/DeliveryView';
import { WarehouseView } from './components/WarehouseView';
import { AnalyticsView } from './components/AnalyticsView';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import AdminPanel from './components/admin/AdminPanel';

function AppContent() {
  const { currentUser, login } = useApp();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedOrderID, setSelectedOrderID] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <TestingRoleSelector
        onRoleSelect={(role) => {
          login('test-user-' + role.department.toLowerCase(), {
            name: role.name,
            department: role.department as any,
            role: role.name
          });
        }}
      />
    );
  }

  const handleViewDetails = (orderID: string) => {
    setSelectedOrderID(orderID);
  };

  return (
    <>
      <Header />
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      <div className="container">
        {activeView === 'dashboard' && <Dashboard onViewDetails={handleViewDetails} />}
        {activeView === 'createOrder' && <CreateOrder />}
        {activeView === 'approval' && <ApprovalView />}
        {activeView === 'disputes' && <DisputesView />}
        {activeView === 'proforma' && <ProformaView />}
        {activeView === 'invoice' && <InvoiceView />}
        {activeView === 'regulatoryPrices' && <RegulatoryPricesView />}
        {activeView === 'transport' && <TransportView />}
        {activeView === 'assignedTrucks' && <AssignedTrucksView />}
        {activeView === 'delivery' && <DeliveryView />}
        {activeView === 'warehouse' && <WarehouseView />}
        {activeView === 'analytics' && <AnalyticsView />}
        {activeView === 'admin' && <AdminPanel />}
      </div>
      <OrderDetailsModal orderID={selectedOrderID} onClose={() => setSelectedOrderID(null)} />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
