export interface User {
  id: string;
  name: string;
  department: 'Sales' | 'Management' | 'Finance' | 'Transport' | 'Warehouse';
  role: string;
}

export interface Order {
  orderID: string;
  orderDate: string;
  createdBy: string;
  clientID: string;
  clientName: string;
  productType: string;
  unit: string;
  quantity: string;
  margin: string;
  regulatoryPrice: string;
  priceWithMargin: string;
  totalAmount: string;
  warehouse: string;
  requestedDeliveryDate: string;
  preferredDeliveryTime: string;
  avoidAfterwork: string;
  paymentTerms: string;
  priority: string;
  noGulfBrand: string;
  status: OrderStatus;
  approvedBy: string;
  approvalDate: string;
  rejectionReason: string;
  proformaNumber: string;
  invoiceNumber: string;
  driverName: string;
  truckPlate: string;
  transportCompany: string;
  estimatedDelivery: string;
}

export type OrderStatus =
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Truck Assigned'
  | 'In Warehouse'
  | 'Loading'
  | 'Left Warehouse'
  | 'Delivered'
  | 'Disputed'
  | 'Resolved';

export interface Client {
  clientID: string;
  clientName: string;
  address: string;
  assignedSM: string;
}

export interface Driver {
  driverID: string;
  driverName: string;
  licenseNumber: string;
  phone: string;
}

export interface TransportCompany {
  companyID: string;
  companyName: string;
  trucks: string[];
}

export interface Document {
  orderID: string;
  fileName: string;
  documentType: string;
  fileId: string;
  fileUrl: string;
  uploadedDate: string;
  uploadedBy: string;
  folderUrl: string;
}

export interface OrderNote {
  orderID: string;
  timestamp: string;
  userID: string;
  userName: string;
  userDepartment: string;
  note: string;
}

export interface Analytics {
  ordersBySM: Record<string, {
    count: number;
    delivered: number;
    rejected: number;
    disputed: number;
  }>;
  totalOrders: number;
  productCounts: Record<string, number>;
  transportCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  timeMetrics: {
    orderToApproval: number[];
    approvalToTransport: number[];
    transportToWarehouse: number[];
    warehouseToLoading: number[];
    loadingToLeft: number[];
    leftToDelivered: number[];
    totalCycleTime: number[];
    deliveryVariance: Array<{
      orderID: string;
      variance: number;
      early: boolean;
      onTime: boolean;
    }>;
  };
}
