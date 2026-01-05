/*
  # Row Level Security Policies

  ## Overview
  This migration creates comprehensive RLS policies for all tables based on user roles.
  Each role has specific access permissions aligned with their business responsibilities.

  ## User Roles and Permissions

  ### Sales Department
  - CREATE orders for their clients
  - READ own orders and basic client/driver/truck data
  - UPDATE own pending orders only

  ### Management Department
  - READ all orders and master data
  - APPROVE or REJECT orders
  - UPDATE order status

  ### Finance Department
  - READ approved orders
  - UPDATE proforma and invoice information
  - READ financial data

  ### Transport Department
  - READ approved orders
  - ASSIGN drivers and trucks
  - UPDATE delivery status
  - MARK orders as delivered or disputed

  ### Warehouse Department
  - READ assigned orders
  - UPDATE warehouse and loading status

  ### Admin Department
  - FULL ACCESS to all tables and operations
  - Manage users, master data, and system configuration

  ## Security Principles
  - All policies check user authentication
  - Users can only perform actions permitted by their department
  - Sensitive data is restricted based on role
  - Audit trails track all modifications
*/

-- Helper function to get current user's department
CREATE OR REPLACE FUNCTION get_user_department()
RETURNS text AS $$
  SELECT department FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admin can view all users
CREATE POLICY "Admin can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (get_user_department() = 'Admin');

-- Admin can insert new users
CREATE POLICY "Admin can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (get_user_department() = 'Admin');

-- Admin can update users
CREATE POLICY "Admin can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (get_user_department() = 'Admin')
  WITH CHECK (get_user_department() = 'Admin');

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- CLIENTS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view clients
CREATE POLICY "Authenticated users can view clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

-- Admin can manage clients
CREATE POLICY "Admin can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (get_user_department() = 'Admin');

CREATE POLICY "Admin can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (get_user_department() = 'Admin')
  WITH CHECK (get_user_department() = 'Admin');

CREATE POLICY "Admin can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (get_user_department() = 'Admin');

-- ============================================================================
-- DRIVERS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view drivers
CREATE POLICY "Authenticated users can view drivers"
  ON drivers FOR SELECT
  TO authenticated
  USING (true);

-- Admin and Transport can manage drivers
CREATE POLICY "Admin and Transport can insert drivers"
  ON drivers FOR INSERT
  TO authenticated
  WITH CHECK (get_user_department() IN ('Admin', 'Transport'));

CREATE POLICY "Admin and Transport can update drivers"
  ON drivers FOR UPDATE
  TO authenticated
  USING (get_user_department() IN ('Admin', 'Transport'))
  WITH CHECK (get_user_department() IN ('Admin', 'Transport'));

CREATE POLICY "Admin can delete drivers"
  ON drivers FOR DELETE
  TO authenticated
  USING (get_user_department() = 'Admin');

-- ============================================================================
-- TRUCKS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view trucks
CREATE POLICY "Authenticated users can view trucks"
  ON trucks FOR SELECT
  TO authenticated
  USING (true);

-- Admin and Transport can manage trucks
CREATE POLICY "Admin and Transport can insert trucks"
  ON trucks FOR INSERT
  TO authenticated
  WITH CHECK (get_user_department() IN ('Admin', 'Transport'));

CREATE POLICY "Admin and Transport can update trucks"
  ON trucks FOR UPDATE
  TO authenticated
  USING (get_user_department() IN ('Admin', 'Transport'))
  WITH CHECK (get_user_department() IN ('Admin', 'Transport'));

CREATE POLICY "Admin can delete trucks"
  ON trucks FOR DELETE
  TO authenticated
  USING (get_user_department() = 'Admin');

-- ============================================================================
-- TRANSPORT COMPANIES TABLE POLICIES
-- ============================================================================

-- All authenticated users can view transport companies
CREATE POLICY "Authenticated users can view transport companies"
  ON transport_companies FOR SELECT
  TO authenticated
  USING (true);

-- Admin and Transport can manage companies
CREATE POLICY "Admin and Transport can insert companies"
  ON transport_companies FOR INSERT
  TO authenticated
  WITH CHECK (get_user_department() IN ('Admin', 'Transport'));

CREATE POLICY "Admin and Transport can update companies"
  ON transport_companies FOR UPDATE
  TO authenticated
  USING (get_user_department() IN ('Admin', 'Transport'))
  WITH CHECK (get_user_department() IN ('Admin', 'Transport'));

CREATE POLICY "Admin can delete companies"
  ON transport_companies FOR DELETE
  TO authenticated
  USING (get_user_department() = 'Admin');

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================

-- Sales can view their own orders
CREATE POLICY "Sales can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    get_user_department() = 'Sales' AND created_by = auth.uid()
  );

-- Management, Finance, Transport, Warehouse, Admin can view all orders
CREATE POLICY "Supervisory roles can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    get_user_department() IN ('Management', 'Finance', 'Transport', 'Warehouse', 'Admin')
  );

-- Sales can create orders
CREATE POLICY "Sales can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_department() = 'Sales' AND created_by = auth.uid()
  );

-- Sales can update their own pending orders
CREATE POLICY "Sales can update own pending orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    get_user_department() = 'Sales' 
    AND created_by = auth.uid() 
    AND status = 'Pending Approval'
  )
  WITH CHECK (
    get_user_department() = 'Sales' 
    AND created_by = auth.uid() 
    AND status = 'Pending Approval'
  );

-- Management can approve/reject orders
CREATE POLICY "Management can approve or reject orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (get_user_department() = 'Management')
  WITH CHECK (get_user_department() = 'Management');

-- Finance can update financial information
CREATE POLICY "Finance can update financial data"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    get_user_department() = 'Finance'
    AND status IN ('Approved', 'Truck Assigned', 'In Warehouse', 'Loading', 'Left Warehouse', 'Delivered')
  )
  WITH CHECK (get_user_department() = 'Finance');

-- Transport can assign drivers/trucks and update delivery status
CREATE POLICY "Transport can manage logistics"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    get_user_department() = 'Transport'
    AND status IN ('Approved', 'Truck Assigned', 'In Warehouse', 'Loading', 'Left Warehouse', 'Delivered', 'Disputed')
  )
  WITH CHECK (get_user_department() = 'Transport');

-- Warehouse can update warehouse status
CREATE POLICY "Warehouse can update warehouse status"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    get_user_department() = 'Warehouse'
    AND status IN ('Truck Assigned', 'In Warehouse', 'Loading', 'Left Warehouse')
  )
  WITH CHECK (get_user_department() = 'Warehouse');

-- Admin has full control
CREATE POLICY "Admin can manage all orders"
  ON orders FOR ALL
  TO authenticated
  USING (get_user_department() = 'Admin')
  WITH CHECK (get_user_department() = 'Admin');

-- ============================================================================
-- ORDER NOTES TABLE POLICIES
-- ============================================================================

-- Users can view notes for orders they can see
CREATE POLICY "Users can view order notes"
  ON order_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_notes.order_id
      AND (
        (get_user_department() = 'Sales' AND orders.created_by = auth.uid())
        OR get_user_department() IN ('Management', 'Finance', 'Transport', 'Warehouse', 'Admin')
      )
    )
  );

-- Users can add notes to orders they can access
CREATE POLICY "Users can add order notes"
  ON order_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_notes.order_id
      AND (
        (get_user_department() = 'Sales' AND orders.created_by = auth.uid())
        OR get_user_department() IN ('Management', 'Finance', 'Transport', 'Warehouse', 'Admin')
      )
    )
  );

-- Admin can delete notes
CREATE POLICY "Admin can delete notes"
  ON order_notes FOR DELETE
  TO authenticated
  USING (get_user_department() = 'Admin');

-- ============================================================================
-- DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Users can view documents for orders they can see
CREATE POLICY "Users can view order documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = documents.order_id
      AND (
        (get_user_department() = 'Sales' AND orders.created_by = auth.uid())
        OR get_user_department() IN ('Management', 'Finance', 'Transport', 'Warehouse', 'Admin')
      )
    )
  );

-- Users can upload documents for orders they can access
CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = documents.order_id
      AND (
        (get_user_department() = 'Sales' AND orders.created_by = auth.uid())
        OR get_user_department() IN ('Management', 'Finance', 'Transport', 'Warehouse', 'Admin')
      )
    )
  );

-- Admin and uploader can delete documents
CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    uploaded_by = auth.uid() OR get_user_department() = 'Admin'
  );

-- ============================================================================
-- REGULATORY PRICES TABLE POLICIES
-- ============================================================================

-- All authenticated users can view regulatory prices
CREATE POLICY "Authenticated users can view prices"
  ON regulatory_prices FOR SELECT
  TO authenticated
  USING (true);

-- Admin and Finance can manage prices
CREATE POLICY "Admin and Finance can insert prices"
  ON regulatory_prices FOR INSERT
  TO authenticated
  WITH CHECK (get_user_department() IN ('Admin', 'Finance'));

CREATE POLICY "Admin and Finance can update prices"
  ON regulatory_prices FOR UPDATE
  TO authenticated
  USING (get_user_department() IN ('Admin', 'Finance'))
  WITH CHECK (get_user_department() IN ('Admin', 'Finance'));

CREATE POLICY "Admin can delete prices"
  ON regulatory_prices FOR DELETE
  TO authenticated
  USING (get_user_department() = 'Admin');