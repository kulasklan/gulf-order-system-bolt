import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Order, Client, Driver, TransportCompany, Document } from '../types';
import { SupabaseApiService, DBClient, DBDriver, DBTransportCompany, DBOrder } from '../services/supabaseApi';

interface AppContextType {
  currentUser: User | null;
  orders: Order[];
  clients: Client[];
  drivers: Driver[];
  transportCompanies: TransportCompany[];
  documents: Document[];
  loading: boolean;
  login: (userId: string, userData: Omit<User, 'id'>) => void;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function mapDBClientToClient(dbClient: DBClient): Client {
  return {
    clientID: dbClient.client_id,
    clientName: dbClient.client_name,
    address: dbClient.address || '',
    assignedSM: dbClient.assigned_sm || ''
  };
}

function mapDBDriverToDriver(dbDriver: DBDriver): Driver {
  return {
    driverID: dbDriver.driver_id,
    driverName: dbDriver.driver_name,
    licenseNumber: dbDriver.license_number,
    phone: dbDriver.phone || ''
  };
}

function mapDBCompanyToCompany(dbCompany: DBTransportCompany): TransportCompany {
  return {
    companyID: dbCompany.company_id,
    companyName: dbCompany.company_name,
    trucks: []
  };
}

function mapDBOrderToOrder(dbOrder: DBOrder): Order {
  return {
    orderID: dbOrder.order_id,
    orderDate: dbOrder.order_date,
    createdBy: '',
    clientID: dbOrder.clients?.client_id || '',
    clientName: dbOrder.clients?.client_name || '',
    productType: dbOrder.product_type,
    unit: dbOrder.unit,
    quantity: String(dbOrder.quantity),
    margin: String(dbOrder.margin || ''),
    regulatoryPrice: String(dbOrder.regulatory_price || ''),
    priceWithMargin: String(dbOrder.price_with_margin || ''),
    totalAmount: String(dbOrder.total_amount || ''),
    warehouse: dbOrder.warehouse || '',
    requestedDeliveryDate: dbOrder.requested_delivery_date || '',
    preferredDeliveryTime: dbOrder.preferred_delivery_time || '',
    avoidAfterwork: dbOrder.avoid_afterwork || '',
    paymentTerms: dbOrder.payment_terms || '',
    priority: dbOrder.priority,
    noGulfBrand: String(dbOrder.no_gulf_brand),
    status: dbOrder.status as any,
    approvedBy: '',
    approvalDate: dbOrder.approval_date || '',
    rejectionReason: dbOrder.rejection_reason || '',
    proformaNumber: dbOrder.proforma_number || '',
    invoiceNumber: dbOrder.invoice_number || '',
    driverName: dbOrder.drivers?.driver_name || '',
    truckPlate: dbOrder.trucks?.plate_number || '',
    transportCompany: dbOrder.transport_companies?.company_name || '',
    estimatedDelivery: dbOrder.estimated_delivery || ''
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [ordersData, clientsData, driversData, companiesData] = await Promise.all([
        SupabaseApiService.loadOrders(),
        SupabaseApiService.loadClients(),
        SupabaseApiService.loadDrivers(),
        SupabaseApiService.loadTransportCompanies()
      ]);

      setOrders(ordersData.map(mapDBOrderToOrder));
      setClients(clientsData.map(mapDBClientToClient));
      setDrivers(driversData.map(mapDBDriverToDriver));
      setTransportCompanies(companiesData.map(mapDBCompanyToCompany));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userId: string, userData: Omit<User, 'id'>) => {
    setCurrentUser({ id: userId, ...userData });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        orders,
        clients,
        drivers,
        transportCompanies,
        documents,
        loading,
        login,
        logout,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
