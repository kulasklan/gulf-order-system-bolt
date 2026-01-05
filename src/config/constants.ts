export const SPREADSHEET_ID = '1z_SLqYvVJ2f0k6i3dK8DMC-CkI5jFOXH2Rfnx2jkNEk';
export const API_KEY = 'AIzaSyBNuosQWLH2aOxGIuXtZd-jl-Pu5ReVgFw';
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLh-Z6trPUdNIqkE-gYqhb74voXIuQkHbv9hhWV0fTUYLUkeFWrQdWHZfTckpv4L-k/exec';

export const USERS = {
  'GoranSM1': { name: 'Goran', department: 'Sales' as const, role: 'SM' },
  'MarkoSM2': { name: 'Marko', department: 'Sales' as const, role: 'SM' },
  'AnaManager1': { name: 'Ana', department: 'Management' as const, role: 'Manager' },
  'PetarWarehouse1': { name: 'Petar', department: 'Warehouse' as const, role: 'Warehouse Staff' },
  'IvanTransport1': { name: 'Ivan', department: 'Transport' as const, role: 'Coordinator' },
  'MilenaFinance1': { name: 'Milena', department: 'Finance' as const, role: 'Finance Staff' },
  'Admin': { name: 'Admin', department: 'Management' as const, role: 'Admin' }
};

export const PRODUCT_TYPES = [
  'Eurodiesel',
  'Eurosuper 95 BS',
  'GeForce 95 Plus',
  'Extreme Diesel',
  'Ekstra Lesno',
  'Mazut'
];

export const WAREHOUSES = [
  'Skopje Ohis',
  'Tetovo'
];

export const PAYMENT_TERMS = [
  'Advanced payment',
  'Credit payment',
  'Paid Advance'
];

export const PRIORITIES = [
  'Normal',
  'Low',
  'High',
  'Urgent',
  'Critical'
];

export const DOCUMENT_TYPES = [
  'Ispratnica',
  'Kantarna beleshka',
  'CMR',
  'POD',
  'Photo',
  'Other'
];

export const UNITS = ['L', 'Kg'];

export const ORDER_STATUSES = [
  'Pending Approval',
  'Approved',
  'Rejected',
  'Truck Assigned',
  'In Warehouse',
  'Loading',
  'Left Warehouse',
  'Delivered',
  'Disputed',
  'Resolved'
] as const;
