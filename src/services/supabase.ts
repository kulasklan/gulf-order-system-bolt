import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          department: 'Sales' | 'Management' | 'Finance' | 'Transport' | 'Warehouse' | 'Admin';
          role: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      clients: {
        Row: {
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
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      drivers: {
        Row: {
          id: string;
          driver_id: string;
          driver_name: string;
          license_number: string;
          phone: string | null;
          email: string | null;
          license_expiry: string | null;
          assigned_company: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['drivers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['drivers']['Insert']>;
      };
      trucks: {
        Row: {
          id: string;
          truck_id: string;
          plate_number: string;
          truck_type: string | null;
          capacity: number | null;
          capacity_unit: string | null;
          assigned_driver_id: string | null;
          transport_company_id: string | null;
          last_maintenance: string | null;
          next_maintenance: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['trucks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['trucks']['Insert']>;
      };
      transport_companies: {
        Row: {
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
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['transport_companies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['transport_companies']['Insert']>;
      };
      orders: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_notes: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          note: string;
          note_type: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_notes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_notes']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          order_id: string;
          file_name: string;
          document_type: string;
          storage_path: string;
          file_size: number | null;
          mime_type: string | null;
          uploaded_by: string;
          uploaded_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'uploaded_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      regulatory_prices: {
        Row: {
          id: string;
          product_type: string;
          base_price: number;
          unit: string;
          effective_from: string;
          effective_to: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['regulatory_prices']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['regulatory_prices']['Insert']>;
      };
    };
  };
};
