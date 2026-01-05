/*
  # Initial Database Schema for Order Management System

  ## Overview
  This migration creates the complete database structure for a full-featured order management system
  with support for multiple user roles, comprehensive order tracking, master data management,
  and document handling.

  ## New Tables

  ### 1. `users` - User accounts and profiles
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text, unique, not null) - User email address
  - `full_name` (text, not null) - User's full name
  - `department` (text, not null) - Department: Sales, Management, Finance, Transport, Warehouse, Admin
  - `role` (text, not null) - User role within department
  - `active` (boolean, default true) - Whether user account is active
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `clients` - Client/Customer master data
  - `id` (uuid, primary key)
  - `client_id` (text, unique) - Custom client identifier
  - `client_name` (text, not null) - Client company name
  - `address` (text) - Physical address
  - `contact_person` (text) - Primary contact name
  - `phone` (text) - Contact phone number
  - `email` (text) - Contact email
  - `tax_id` (text) - Tax identification number
  - `assigned_sm` (text) - Assigned sales manager
  - `payment_terms` (text) - Default payment terms
  - `credit_limit` (numeric) - Credit limit amount
  - `notes` (text) - Additional notes
  - `active` (boolean, default true)
  - `created_at`, `updated_at`, `created_by`, `updated_by`

  ### 3. `drivers` - Driver master data
  - `id` (uuid, primary key)
  - `driver_id` (text, unique) - Custom driver identifier
  - `driver_name` (text, not null) - Driver full name
  - `license_number` (text, unique) - Driving license number
  - `phone` (text) - Contact phone
  - `email` (text) - Contact email
  - `license_expiry` (date) - License expiration date
  - `assigned_company` (text) - Transport company
  - `active` (boolean, default true)
  - `created_at`, `updated_at`, `created_by`, `updated_by`

  ### 4. `trucks` - Truck/Vehicle master data
  - `id` (uuid, primary key)
  - `truck_id` (text, unique) - Custom truck identifier
  - `plate_number` (text, unique, not null) - License plate
  - `truck_type` (text) - Type of truck (e.g., Tanker, Flatbed)
  - `capacity` (numeric) - Load capacity
  - `capacity_unit` (text) - Unit of capacity (L, KG, etc.)
  - `assigned_driver_id` (uuid) - Currently assigned driver
  - `transport_company_id` (uuid) - Owning transport company
  - `last_maintenance` (date) - Last maintenance date
  - `next_maintenance` (date) - Next scheduled maintenance
  - `active` (boolean, default true)
  - `created_at`, `updated_at`, `created_by`, `updated_by`

  ### 5. `transport_companies` - Transport company master data
  - `id` (uuid, primary key)
  - `company_id` (text, unique) - Custom company identifier
  - `company_name` (text, unique, not null) - Company name
  - `contact_person` (text) - Primary contact
  - `phone` (text) - Contact phone
  - `email` (text) - Contact email
  - `address` (text) - Company address
  - `rate_per_km` (numeric) - Default rate per kilometer
  - `rate_per_load` (numeric) - Default rate per load
  - `payment_terms` (text) - Payment terms
  - `notes` (text) - Additional notes
  - `active` (boolean, default true)
  - `created_at`, `updated_at`, `created_by`, `updated_by`

  ### 6. `orders` - Main orders table
  - `id` (uuid, primary key)
  - `order_id` (text, unique, not null) - Custom order number
  - `order_date` (date, not null) - Order creation date
  - `client_id` (uuid, not null) - Reference to clients table
  - `product_type` (text, not null) - Type of product ordered
  - `unit` (text, not null) - Unit of measure
  - `quantity` (numeric, not null) - Quantity ordered
  - `margin` (numeric) - Margin percentage or amount
  - `regulatory_price` (numeric) - Base regulatory price
  - `price_with_margin` (numeric) - Price including margin
  - `total_amount` (numeric) - Total order amount
  - `warehouse` (text) - Warehouse location
  - `requested_delivery_date` (date) - Customer requested delivery date
  - `preferred_delivery_time` (text) - Preferred time slot
  - `avoid_afterwork` (text) - Delivery restrictions
  - `payment_terms` (text) - Payment terms for this order
  - `priority` (text, default 'Normal') - Order priority
  - `no_gulf_brand` (boolean, default false) - Brand restriction flag
  - `status` (text, not null, default 'Pending Approval') - Current order status
  - `approved_by` (uuid) - User who approved
  - `approval_date` (timestamptz) - Approval timestamp
  - `rejected_by` (uuid) - User who rejected
  - `rejection_date` (timestamptz) - Rejection timestamp
  - `rejection_reason` (text) - Reason for rejection
  - `proforma_number` (text) - Proforma invoice number
  - `proforma_amount` (numeric) - Proforma invoice amount
  - `proforma_date` (timestamptz) - Proforma creation date
  - `invoice_number` (text) - Final invoice number
  - `invoice_amount` (numeric) - Final invoice amount
  - `invoice_date` (timestamptz) - Invoice creation date
  - `assigned_driver_id` (uuid) - Assigned driver
  - `assigned_truck_id` (uuid) - Assigned truck
  - `transport_company_id` (uuid) - Transport company
  - `estimated_delivery` (timestamptz) - Estimated delivery time
  - `actual_delivery` (timestamptz) - Actual delivery time
  - `created_by` (uuid, not null) - User who created order
  - `created_at` (timestamptz, default now())
  - `updated_by` (uuid) - Last user to update
  - `updated_at` (timestamptz, default now())

  ### 7. `order_notes` - Order activity log and notes
  - `id` (uuid, primary key)
  - `order_id` (uuid, not null) - Reference to orders
  - `user_id` (uuid, not null) - User who created note
  - `note` (text, not null) - Note content
  - `note_type` (text, default 'General') - Type: General, Status Change, System
  - `created_at` (timestamptz, default now())

  ### 8. `documents` - Document storage metadata
  - `id` (uuid, primary key)
  - `order_id` (uuid, not null) - Reference to orders
  - `file_name` (text, not null) - Original file name
  - `document_type` (text, not null) - Type: Invoice, Proforma, Delivery Note, etc.
  - `storage_path` (text, not null) - Path in Supabase Storage
  - `file_size` (bigint) - File size in bytes
  - `mime_type` (text) - File MIME type
  - `uploaded_by` (uuid, not null) - User who uploaded
  - `uploaded_at` (timestamptz, default now())

  ### 9. `regulatory_prices` - Product pricing rules
  - `id` (uuid, primary key)
  - `product_type` (text, unique, not null) - Product type identifier
  - `base_price` (numeric, not null) - Base regulatory price
  - `unit` (text, not null) - Unit of measure
  - `effective_from` (date, not null) - Price effective date
  - `effective_to` (date) - Price expiry date (null = current)
  - `updated_by` (uuid) - User who updated
  - `updated_at` (timestamptz, default now())

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Policies will be added in subsequent migrations for each role

  ## Indexes
  - Primary keys are automatically indexed
  - Additional indexes on foreign keys for performance
  - Indexes on commonly searched fields (order_id, client_name, status, dates)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  department text NOT NULL CHECK (department IN ('Sales', 'Management', 'Finance', 'Transport', 'Warehouse', 'Admin')),
  role text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text UNIQUE NOT NULL,
  client_name text NOT NULL,
  address text,
  contact_person text,
  phone text,
  email text,
  tax_id text,
  assigned_sm text,
  payment_terms text,
  credit_limit numeric(15, 2),
  notes text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id)
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id text UNIQUE NOT NULL,
  driver_name text NOT NULL,
  license_number text UNIQUE NOT NULL,
  phone text,
  email text,
  license_expiry date,
  assigned_company text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id)
);

-- Create transport_companies table
CREATE TABLE IF NOT EXISTS transport_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id text UNIQUE NOT NULL,
  company_name text UNIQUE NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  rate_per_km numeric(10, 2),
  rate_per_load numeric(10, 2),
  payment_terms text,
  notes text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id)
);

-- Create trucks table
CREATE TABLE IF NOT EXISTS trucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id text UNIQUE NOT NULL,
  plate_number text UNIQUE NOT NULL,
  truck_type text,
  capacity numeric(10, 2),
  capacity_unit text,
  assigned_driver_id uuid REFERENCES drivers(id),
  transport_company_id uuid REFERENCES transport_companies(id),
  last_maintenance date,
  next_maintenance date,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text UNIQUE NOT NULL,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  client_id uuid NOT NULL REFERENCES clients(id),
  product_type text NOT NULL,
  unit text NOT NULL,
  quantity numeric(15, 3) NOT NULL,
  margin numeric(10, 2),
  regulatory_price numeric(15, 2),
  price_with_margin numeric(15, 2),
  total_amount numeric(15, 2),
  warehouse text,
  requested_delivery_date date,
  preferred_delivery_time text,
  avoid_afterwork text,
  payment_terms text,
  priority text DEFAULT 'Normal',
  no_gulf_brand boolean DEFAULT false,
  status text NOT NULL DEFAULT 'Pending Approval' CHECK (status IN (
    'Pending Approval', 'Approved', 'Rejected', 'Truck Assigned',
    'In Warehouse', 'Loading', 'Left Warehouse', 'Delivered', 'Disputed', 'Resolved'
  )),
  approved_by uuid REFERENCES users(id),
  approval_date timestamptz,
  rejected_by uuid REFERENCES users(id),
  rejection_date timestamptz,
  rejection_reason text,
  proforma_number text,
  proforma_amount numeric(15, 2),
  proforma_date timestamptz,
  invoice_number text,
  invoice_amount numeric(15, 2),
  invoice_date timestamptz,
  assigned_driver_id uuid REFERENCES drivers(id),
  assigned_truck_id uuid REFERENCES trucks(id),
  transport_company_id uuid REFERENCES transport_companies(id),
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz DEFAULT now()
);

-- Create order_notes table
CREATE TABLE IF NOT EXISTS order_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  note text NOT NULL,
  note_type text DEFAULT 'General' CHECK (note_type IN ('General', 'Status Change', 'System')),
  created_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  document_type text NOT NULL,
  storage_path text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid NOT NULL REFERENCES users(id),
  uploaded_at timestamptz DEFAULT now()
);

-- Create regulatory_prices table
CREATE TABLE IF NOT EXISTS regulatory_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type text UNIQUE NOT NULL,
  base_price numeric(15, 2) NOT NULL,
  unit text NOT NULL,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_documents_order_id ON documents(order_id);
CREATE INDEX IF NOT EXISTS idx_clients_client_name ON clients(client_name);
CREATE INDEX IF NOT EXISTS idx_drivers_driver_name ON drivers(driver_name);
CREATE INDEX IF NOT EXISTS idx_trucks_plate_number ON trucks(plate_number);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_prices ENABLE ROW LEVEL SECURITY;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_companies_updated_at BEFORE UPDATE ON transport_companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regulatory_prices_updated_at BEFORE UPDATE ON regulatory_prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();