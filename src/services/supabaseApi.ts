import { supabase } from './supabase';

export interface DBClient {
  id: string;
  client_id: string;
  client_name: string;
  address: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  tax_id: string | null;
  assigned_sm: string | null;
  payment_terms: string | null;
  credit_limit: number | null;
  notes: string | null;
  active: boolean;
}

export interface DBDriver {
  id: string;
  driver_id: string;
  driver_name: string;
  license_number: string;
  phone: string | null;
  email: string | null;
  license_expiry: string | null;
  assigned_company: string | null;
  active: boolean;
}

export interface DBTruck {
  id: string;
  truck_id: string;
  plate_number: string;
  truck_type: string | null;
  capacity: number | null;
  capacity_unit: string | null;
  assigned_driver_id: string | null;
  transport_company_id: string | null;
  active: boolean;
}

export interface DBTransportCompany {
  id: string;
  company_id: string;
  company_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  rate_per_km: number | null;
  rate_per_load: number | null;
  payment_terms: string | null;
  notes: string | null;
  active: boolean;
}

export interface DBOrder {
  id: string;
  order_id: string;
  order_date: string;
  client_id: string;
  product_type: string;
  unit: string;
  quantity: number;
  margin: number | null;
  regulatory_price: number | null;
  price_with_margin: number | null;
  total_amount: number | null;
  warehouse: string | null;
  requested_delivery_date: string | null;
  preferred_delivery_time: string | null;
  avoid_afterwork: string | null;
  payment_terms: string | null;
  priority: string;
  no_gulf_brand: boolean;
  status: string;
  approved_by: string | null;
  approval_date: string | null;
  rejected_by: string | null;
  rejection_date: string | null;
  rejection_reason: string | null;
  proforma_number: string | null;
  proforma_amount: number | null;
  proforma_date: string | null;
  invoice_number: string | null;
  invoice_amount: number | null;
  invoice_date: string | null;
  assigned_driver_id: string | null;
  assigned_truck_id: string | null;
  transport_company_id: string | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  clients?: DBClient;
  drivers?: DBDriver;
  trucks?: DBTruck;
  transport_companies?: DBTransportCompany;
}

export interface DBOrderNote {
  id: string;
  order_id: string;
  user_id: string;
  note: string;
  note_type: string;
  created_at: string;
  users?: {
    full_name: string;
    department: string;
  };
}

export interface DBDocument {
  id: string;
  order_id: string;
  file_name: string;
  document_type: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  uploaded_at: string;
}

export interface DBRegulatoryPrice {
  id: string;
  product_type: string;
  base_price: number;
  unit: string;
  effective_from: string;
  effective_to: string | null;
}

export class SupabaseApiService {
  static async loadClients(): Promise<DBClient[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('active', true)
      .order('client_name');

    if (error) throw error;
    return data || [];
  }

  static async loadDrivers(): Promise<DBDriver[]> {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('active', true)
      .order('driver_name');

    if (error) throw error;
    return data || [];
  }

  static async loadTrucks(): Promise<DBTruck[]> {
    const { data, error } = await supabase
      .from('trucks')
      .select('*')
      .eq('active', true)
      .order('plate_number');

    if (error) throw error;
    return data || [];
  }

  static async loadTransportCompanies(): Promise<DBTransportCompany[]> {
    const { data, error } = await supabase
      .from('transport_companies')
      .select('*')
      .eq('active', true)
      .order('company_name');

    if (error) throw error;
    return data || [];
  }

  static async loadOrders(): Promise<DBOrder[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        clients:client_id(id, client_id, client_name, address),
        drivers:assigned_driver_id(id, driver_id, driver_name, phone),
        trucks:assigned_truck_id(id, truck_id, plate_number),
        transport_companies:transport_company_id(id, company_id, company_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async loadOrdersByStatus(status: string): Promise<DBOrder[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        clients:client_id(*),
        drivers:assigned_driver_id(*),
        trucks:assigned_truck_id(*),
        transport_companies:transport_company_id(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async loadOrderNotes(orderId: string): Promise<DBOrderNote[]> {
    const { data, error } = await supabase
      .from('order_notes')
      .select(`
        *,
        users:user_id(full_name, department)
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async loadDocuments(orderId?: string): Promise<DBDocument[]> {
    let query = supabase.from('documents').select('*');

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data, error } = await query.order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async loadRegulatoryPrices(): Promise<DBRegulatoryPrice[]> {
    const { data, error } = await supabase
      .from('regulatory_prices')
      .select('*')
      .is('effective_to', null)
      .order('product_type');

    if (error) throw error;
    return data || [];
  }

  static async createClient(client: Omit<DBClient, 'id' | 'active'>): Promise<DBClient> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...client,
        created_by: userData?.user?.id,
        updated_by: userData?.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateClient(id: string, updates: Partial<DBClient>): Promise<DBClient> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('clients')
      .update({
        ...updates,
        updated_by: userData?.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
  }

  static async createDriver(driver: Omit<DBDriver, 'id' | 'active'>): Promise<DBDriver> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('drivers')
      .insert({
        ...driver,
        created_by: userData?.user?.id,
        updated_by: userData?.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateDriver(id: string, updates: Partial<DBDriver>): Promise<DBDriver> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('drivers')
      .update({
        ...updates,
        updated_by: userData?.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteDriver(id: string): Promise<void> {
    const { error } = await supabase
      .from('drivers')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
  }

  static async createTruck(truck: Omit<DBTruck, 'id' | 'active'>): Promise<DBTruck> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('trucks')
      .insert({
        ...truck,
        created_by: userData?.user?.id,
        updated_by: userData?.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTruck(id: string, updates: Partial<DBTruck>): Promise<DBTruck> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('trucks')
      .update({
        ...updates,
        updated_by: userData?.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTruck(id: string): Promise<void> {
    const { error } = await supabase
      .from('trucks')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
  }

  static async createTransportCompany(company: Omit<DBTransportCompany, 'id' | 'active'>): Promise<DBTransportCompany> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('transport_companies')
      .insert({
        ...company,
        created_by: userData?.user?.id,
        updated_by: userData?.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTransportCompany(id: string, updates: Partial<DBTransportCompany>): Promise<DBTransportCompany> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('transport_companies')
      .update({
        ...updates,
        updated_by: userData?.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTransportCompany(id: string): Promise<void> {
    const { error } = await supabase
      .from('transport_companies')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
  }

  static async createOrder(orderData: Partial<DBOrder>): Promise<DBOrder> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        created_by: userData?.user?.id,
        updated_by: userData?.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateOrder(id: string, updates: Partial<DBOrder>): Promise<DBOrder> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_by: userData?.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async approveOrder(orderId: string, note?: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();

    await supabase
      .from('orders')
      .update({
        status: 'Approved',
        approved_by: userData?.user?.id,
        approval_date: new Date().toISOString(),
        updated_by: userData?.user?.id
      })
      .eq('id', orderId);

    if (note) {
      await this.addOrderNote(orderId, note, 'Status Change');
    }
  }

  static async rejectOrder(orderId: string, reason: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();

    await supabase
      .from('orders')
      .update({
        status: 'Rejected',
        rejected_by: userData?.user?.id,
        rejection_date: new Date().toISOString(),
        rejection_reason: reason,
        updated_by: userData?.user?.id
      })
      .eq('id', orderId);

    await this.addOrderNote(orderId, `Order rejected: ${reason}`, 'Status Change');
  }

  static async addOrderNote(orderId: string, note: string, noteType: string = 'General'): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('order_notes')
      .insert({
        order_id: orderId,
        user_id: userData?.user?.id,
        note,
        note_type: noteType
      });

    if (error) throw error;
  }

  static async uploadDocument(orderId: string, file: File, documentType: string): Promise<DBDocument> {
    const { data: userData } = await supabase.auth.getUser();

    const filePath = `${orderId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('order-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('documents')
      .insert({
        order_id: orderId,
        file_name: file.name,
        document_type: documentType,
        storage_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: userData?.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getDocumentUrl(storagePath: string): Promise<string> {
    const { data } = await supabase.storage
      .from('order-documents')
      .createSignedUrl(storagePath, 3600);

    return data?.signedUrl || '';
  }

  static async deleteDocument(id: string, storagePath: string): Promise<void> {
    await supabase.storage
      .from('order-documents')
      .remove([storagePath]);

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async updateRegulatoryPrice(productType: string, basePrice: number, unit: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('regulatory_prices')
      .upsert({
        product_type: productType,
        base_price: basePrice,
        unit,
        updated_by: userData?.user?.id
      });

    if (error) throw error;
  }

  static subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .channel('orders-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        callback
      )
      .subscribe();
  }

  static subscribeToOrderNotes(orderId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`order-notes-${orderId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_notes',
          filter: `order_id=eq.${orderId}`
        },
        callback
      )
      .subscribe();
  }
}
