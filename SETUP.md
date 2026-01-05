# Order Management System - Setup Guide

## Overview

This is a full-featured Order Management System built with React, TypeScript, Supabase, and Tailwind CSS. The system supports multiple user roles, comprehensive order tracking, master data management, Excel import/export, and real-time collaboration.

## Features

✅ **Supabase Backend**
- PostgreSQL database with comprehensive schema
- Row Level Security (RLS) for all tables
- Real-time subscriptions for live updates
- Secure file storage for documents

✅ **Authentication & Authorization**
- Email/password authentication via Supabase Auth
- Role-based access control (Sales, Management, Finance, Transport, Warehouse, Admin)
- Secure session management

✅ **Admin Panel**
- Complete CRUD operations for all master data
- Inline editing for quick updates
- Advanced search and filtering
- Excel import/export for bulk operations
- Copy-paste functionality from spreadsheets

✅ **Order Management**
- Full order lifecycle tracking
- Status-based workflows
- Document attachments
- Order notes and activity history

## Initial Setup

### 1. Database is Already Configured

The database schema has been created with the following tables:
- `users` - User accounts and profiles
- `clients` - Client/Customer master data
- `drivers` - Driver master data
- `trucks` - Truck/Vehicle master data
- `transport_companies` - Transport company master data
- `orders` - Main orders table
- `order_notes` - Order activity log
- `documents` - Document storage metadata
- `regulatory_prices` - Product pricing rules

### 2. Create Your First Admin User

To create the initial admin user, follow these steps:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter:
   - Email: `admin@yourcompany.com`
   - Password: Choose a strong password
   - Email Confirm: ✅ Auto Confirm User (check this box)
5. Click **Create User**
6. Copy the User ID (UUID) from the newly created user
7. Navigate to **Table Editor** → **users** table
8. Click **Insert** → **Insert row**
9. Fill in:
   - `id`: Paste the User ID you copied
   - `email`: `admin@yourcompany.com`
   - `full_name`: `System Administrator`
   - `department`: `Admin`
   - `role`: `System Administrator`
   - `active`: `true`
10. Click **Save**

#### Option B: Using SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this query (replace with your desired email and name):

```sql
-- First, create the auth user (this will return a UUID)
-- Note: You'll need to do this through the Supabase Dashboard Auth section first
-- Then use that UUID in the query below

-- Insert user profile (replace 'USER_UUID_HERE' with actual UUID from Auth)
INSERT INTO users (id, email, full_name, department, role, active)
VALUES (
  'USER_UUID_HERE',  -- Replace with UUID from Auth user
  'admin@yourcompany.com',
  'System Administrator',
  'Admin',
  'System Administrator',
  true
);
```

### 3. Sign In to the Application

1. Open the application in your browser
2. Sign in with your admin credentials:
   - Email: `admin@yourcompany.com`
   - Password: [the password you set]
3. You'll be logged in with full admin access

## User Roles and Permissions

### Admin
- **Full access** to all system features
- Manage users, master data, and system configuration
- Access to Admin Panel for bulk operations
- Excel import/export for all tables

### Sales
- Create new orders
- View own orders
- Access to client, driver, and truck data
- Update pending orders

### Management
- View all orders
- Approve or reject orders
- Resolve disputes
- Access to analytics

### Finance
- View approved orders
- Enter proforma and invoice information
- Manage regulatory prices
- View financial reports

### Transport
- Assign drivers and trucks to orders
- Update delivery status
- Mark orders as delivered or disputed
- View transport schedule

### Warehouse
- Update warehouse status
- Track inventory and loading
- View assigned orders

## Using the Admin Panel

The Admin Panel provides comprehensive data management capabilities:

### Access Admin Panel
1. Sign in as an Admin user
2. Click the **Admin Panel** tab in the navigation

### Manage Master Data

#### Clients Management
- Add new clients one by one or import from Excel
- Edit client information inline
- Export client list to Excel
- Search and filter clients

#### Drivers Management
- Import driver list from Excel
- View all drivers with license information
- Export driver data

#### Trucks Management
- Import truck inventory from Excel
- Track truck capacity and type
- Export truck list

#### Transport Companies Management
- Manage transport company information
- Import from Excel
- Track rates and payment terms

#### Orders Management
- View all orders in one place
- Export orders to Excel for reporting
- Search and filter by any field

## Excel Import/Export Workflow

### Export Data
1. Navigate to the relevant management section (e.g., Clients Management)
2. Click **Export Excel**
3. Open the downloaded Excel file
4. You'll see all data with proper column headers

### Import Data
1. Prepare your Excel file with the correct column headers
2. Navigate to the relevant management section
3. Click **Import Excel**
4. Select your Excel file
5. The system will import and validate all rows
6. You'll see a confirmation message with the number of records imported

### Excel Templates

#### Clients Template
```
| Client ID | Client Name | Address | Contact Person | Phone | Email | Tax ID | Assigned SM | Payment Terms | Credit Limit | Notes |
```

#### Drivers Template
```
| Driver ID | Driver Name | License Number | Phone | Email | License Expiry | Assigned Company |
```

#### Trucks Template
```
| Truck ID | Plate Number | Truck Type | Capacity | Capacity Unit |
```

#### Transport Companies Template
```
| Company ID | Company Name | Contact Person | Phone | Email | Address | Rate Per KM | Rate Per Load |
```

## Copy-Paste Functionality

You can copy data directly from Excel or Google Sheets and paste it into the data grids:

1. Copy rows from your spreadsheet (Ctrl+C / Cmd+C)
2. Go to the admin panel section
3. Click in the data grid
4. Paste (Ctrl+V / Cmd+V)
5. Review the preview
6. Confirm to add the data

## Adding More Users

To add more users to the system:

1. Sign in as an Admin user
2. Go to **Admin Panel** → **Users** tab
3. Follow the instructions to create user accounts via Supabase Auth
4. New users will appear in the Users Management section

## File Storage

Order documents are stored in Supabase Storage:
- Bucket: `order-documents`
- Maximum file size: 50MB
- Allowed types: PDF, Images, Excel, Word documents
- Files are organized by order ID

## Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Authentication required for all operations
- ✅ Role-based access control
- ✅ Secure file storage with signed URLs
- ✅ Audit trails (created_by, updated_by timestamps)
- ✅ Password hashing via Supabase Auth

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

## Environment Variables

The following environment variables are configured in `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Can't Sign In
- Verify user exists in Auth users
- Verify user profile exists in `users` table
- Check that user's `active` field is `true`
- Verify email and password are correct

### Data Not Loading
- Check browser console for errors
- Verify Supabase connection in `.env`
- Verify RLS policies are enabled
- Check user's department and permissions

### Excel Import Failed
- Verify column headers match exactly
- Check for required fields (marked with * in forms)
- Ensure data types are correct (numbers, dates, etc.)
- Check browser console for specific error message

## Support

For issues or questions:
1. Check browser console for error messages
2. Review Supabase logs in dashboard
3. Verify user permissions and RLS policies
4. Check that all environment variables are set correctly

## Next Steps

1. Create your first admin user following the steps above
2. Sign in to the application
3. Import your existing data using Excel import
4. Create additional users for your team
5. Start managing orders!

---

**System Version:** 1.0.0
**Last Updated:** 2026-01-04
