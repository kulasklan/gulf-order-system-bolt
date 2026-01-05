import { SPREADSHEET_ID, API_KEY, APPS_SCRIPT_URL } from '../config/constants';
import { Order, Client, Driver, TransportCompany, Document, OrderNote } from '../types';

export class ApiService {
  private static async fetchSheet(sheetName: string, range: string = 'A2:AZ1000') {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!${range}?key=${API_KEY}&t=${Date.now()}`;
    const response = await fetch(url);
    return response.json();
  }

  private static async postToAppsScript(data: any) {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  static async loadOrders(): Promise<Order[]> {
    try {
      const data = await this.fetchSheet('Orders');
      if (!data.values) return [];

      return data.values.map((row: any[]) => ({
        orderID: row[0] || '',
        orderDate: row[1] || '',
        createdBy: row[2] || '',
        clientID: row[3] || '',
        clientName: row[4] || '',
        productType: row[5] || '',
        unit: row[6] || '',
        quantity: row[7] || '',
        margin: row[8] || '',
        regulatoryPrice: row[9] || '',
        priceWithMargin: row[10] || '',
        totalAmount: row[11] || '',
        warehouse: row[12] || '',
        requestedDeliveryDate: row[13] || '',
        preferredDeliveryTime: row[14] || '',
        avoidAfterwork: row[15] || '',
        paymentTerms: row[16] || '',
        priority: row[17] || '',
        noGulfBrand: row[18] || '',
        status: row[19] || '',
        approvedBy: row[20] || '',
        approvalDate: row[21] || '',
        rejectionReason: row[22] || '',
        proformaNumber: row[34] || '',
        invoiceNumber: row[35] || '',
        driverName: row[39] || '',
        truckPlate: row[40] || '',
        transportCompany: row[41] || '',
        estimatedDelivery: row[42] || ''
      }));
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    }
  }

  static async loadClients(): Promise<Client[]> {
    try {
      const data = await this.fetchSheet('Clients', 'A2:I100');
      if (!data.values) return [];

      return data.values.map((row: any[]) => ({
        clientID: row[0] || '',
        clientName: row[1] || '',
        address: row[2] || '',
        assignedSM: row[3] || ''
      }));
    } catch (error) {
      console.error('Error loading clients:', error);
      return [];
    }
  }

  static async loadDrivers(): Promise<Driver[]> {
    try {
      const data = await this.fetchSheet('Drivers', 'A2:D100');
      if (!data.values) return [];

      return data.values.map((row: any[]) => ({
        driverID: row[0] || '',
        driverName: row[1] || '',
        licenseNumber: row[2] || '',
        phone: row[3] || ''
      }));
    } catch (error) {
      console.error('Error loading drivers:', error);
      return [];
    }
  }

  static async loadTransportCompanies(): Promise<TransportCompany[]> {
    try {
      const data = await this.fetchSheet('TransportCompanies', 'A2:C100');
      if (!data.values) return [];

      return data.values.map((row: any[]) => ({
        companyID: row[0] || '',
        companyName: row[1] || '',
        trucks: row[2] ? row[2].split(',').map((t: string) => t.trim()) : []
      }));
    } catch (error) {
      console.error('Error loading transport companies:', error);
      return [];
    }
  }

  static async loadDocuments(): Promise<Document[]> {
    try {
      const data = await this.fetchSheet('Documents', 'A2:H1000');
      if (!data.values) return [];

      return data.values.map((row: any[]) => ({
        orderID: row[0] || '',
        fileName: row[1] || '',
        documentType: row[2] || '',
        fileId: row[3] || '',
        fileUrl: row[4] || '',
        uploadedDate: row[5] || '',
        uploadedBy: row[6] || '',
        folderUrl: row[7] || ''
      }));
    } catch (error) {
      console.error('Error loading documents:', error);
      return [];
    }
  }

  static async loadOrderNotes(orderID: string): Promise<OrderNote[]> {
    try {
      const data = await this.fetchSheet('OrderNotes', 'A2:F1000');
      if (!data.values) return [];

      return data.values
        .filter((row: any[]) => row[0] === orderID)
        .map((row: any[]) => ({
          orderID: row[0] || '',
          timestamp: row[1] || '',
          userID: row[2] || '',
          userName: row[3] || '',
          userDepartment: row[4] || '',
          note: row[5] || ''
        }));
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  }

  static async createOrder(orderData: any) {
    await this.postToAppsScript({ action: 'createOrder', ...orderData });
  }

  static async approveOrder(orderID: string, approverID: string, note: string) {
    await this.postToAppsScript({ action: 'approveOrder', orderID, approverID, note });
  }

  static async rejectOrder(orderID: string, rejecterID: string, reason: string) {
    await this.postToAppsScript({ action: 'rejectOrder', orderID, rejecterID, reason });
  }

  static async resolveDispute(orderID: string, resolverID: string, resolution: string) {
    await this.postToAppsScript({ action: 'resolveDispute', orderID, resolverID, resolution });
  }

  static async enterProforma(orderID: string, proformaNumber: string, proformaTotalAmount: string, financeUserID: string, note: string) {
    await this.postToAppsScript({ action: 'enterProforma', orderID, proformaNumber, proformaTotalAmount, financeUserID, note });
  }

  static async enterInvoice(orderID: string, invoiceNumber: string, invoiceTotalAmount: string, financeUserID: string, note: string) {
    await this.postToAppsScript({ action: 'enterInvoice', orderID, invoiceNumber, invoiceTotalAmount, financeUserID, note });
  }

  static async assignTransport(orderID: string, transportUserID: string, driverName: string, truckPlate: string, transportCompany: string, estimatedDelivery: string, note: string) {
    await this.postToAppsScript({ action: 'assignTransport', orderID, transportUserID, driverName, truckPlate, transportCompany, estimatedDelivery, note });
  }

  static async updateWarehouseStatus(orderID: string, warehouseUserID: string, status: string, note: string) {
    await this.postToAppsScript({ action: 'updateWarehouseStatus', orderID, warehouseUserID, status, note });
  }

  static async markAsDelivered(orderID: string, transportUserID: string, note: string) {
    await this.postToAppsScript({ action: 'markAsDelivered', orderID, transportUserID, note });
  }

  static async markAsDisputed(orderID: string, transportUserID: string, reason: string) {
    await this.postToAppsScript({ action: 'markAsDisputed', orderID, transportUserID, reason });
  }

  static async addOrderNote(orderID: string, note: string, userID: string, userName: string, userDepartment: string) {
    await this.postToAppsScript({ action: 'addOrderNote', orderID, note, userID, userName, userDepartment });
  }

  static async uploadDocument(orderID: string, fileName: string, fileType: string, documentType: string, fileData: string, uploadedBy: string) {
    await this.postToAppsScript({ action: 'uploadDocument', orderID, fileName, fileType, documentType, fileData, uploadedBy });
  }

  static async deleteDocument(orderID: string, fileId: string, deletedBy: string) {
    await this.postToAppsScript({ action: 'deleteDocument', orderID, fileId, deletedBy });
  }

  static async updateRegulatoryPrices(prices: any, updatedBy: string) {
    await this.postToAppsScript({ action: 'updateRegulatoryPrices', prices, updatedBy });
  }
}
