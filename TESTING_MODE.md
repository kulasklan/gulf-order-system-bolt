# Testing Mode - Quick Start Guide

## 🎯 Current Status: TESTING MODE (No Login Required)

Authentication has been **disabled** for testing. Anyone can access the system and test all features without creating an account.

## 🚀 How to Access the Website

### Option 1: Local Development (Recommended for Testing)

The website is already running locally in your development environment:

**URL:** http://localhost:5173 (or the port shown in your terminal)

Just open this URL in your browser and you'll see the role selector.

### Option 2: Deploy to Your Server

If you want to deploy this to your own server so others can test it:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder to your web server**
   - The `dist` folder contains all the compiled files
   - Upload everything inside `dist/` to your web server's public directory
   - Examples:
     - cPanel: Upload to `public_html` or `www`
     - Apache: Upload to `/var/www/html`
     - Nginx: Upload to `/usr/share/nginx/html`

3. **Configure your server:**
   - Make sure your server supports Single Page Applications (SPA)
   - All routes should redirect to `index.html`

4. **It will still use Supabase:**
   - Your deployed app will connect to the same Supabase database
   - No additional database setup needed
   - Supabase URL and keys are already configured

## 📱 How to Test

1. **Open the website** (local or deployed)

2. **You'll see a role selector** with 6 cards:
   - Sales Manager
   - General Manager
   - Finance Manager
   - Transport Manager
   - Warehouse Manager
   - System Administrator

3. **Click any role** to enter the system as that role

4. **Test different features:**
   - Each role has different menus and permissions
   - Try the **Admin** role to access the Admin Panel with Excel import/export
   - Switch roles by clicking "Switch Role" button in the header

## 🔄 Switching Between Roles

- Click the **"Switch Role"** button in the top-right corner
- You'll go back to the role selector
- Choose a different role to test different features

## 📊 Admin Panel (Best Place to Start)

1. Select **"System Administrator"** role
2. Click **"Admin Panel"** in the navigation
3. You'll see 6 tabs:
   - **Orders** - View all orders, export to Excel
   - **Clients** - Add/edit clients, import/export Excel
   - **Drivers** - Manage drivers, import/export Excel
   - **Trucks** - Manage truck inventory, import/export Excel
   - **Transport Companies** - Manage companies, import/export Excel
   - **Users** - View system users

## 📁 Testing Excel Import/Export

### Export (Easy):
1. Go to Admin Panel → Any tab (e.g., Clients)
2. Click **"Export Excel"** button
3. Excel file downloads automatically

### Import:
1. Prepare an Excel file with correct columns (see templates in SETUP.md)
2. Go to Admin Panel → Corresponding tab
3. Click **"Import Excel"** button
4. Select your file
5. Data will be imported automatically

## 🎨 What You Can Test

### Sales Role
- Create new orders
- View order dashboard

### Management Role
- Approve or reject orders
- Resolve disputes
- View analytics

### Finance Role
- Manage regulatory prices
- Enter proforma invoices
- Enter final invoices

### Transport Role
- Assign drivers and trucks to orders
- Mark deliveries
- Track transport status

### Warehouse Role
- Update warehouse status
- Track loading progress

### Admin Role (Most Powerful)
- **Full access to everything**
- Admin Panel with bulk operations
- Excel import/export for all data
- View and manage all orders

## 🔐 When You're Ready for Real Login

When you finish testing and want to add authentication:

1. **Tell me "I want to enable login now"**
2. I'll restore the authentication system
3. You'll need to create user accounts as described in SETUP.md
4. All your test data will remain in the database

## ⚠️ Important Notes for Testing

- **Data is real:** Everything you create/edit is saved to Supabase database
- **No isolation:** All testers see the same data
- **Anyone can access:** No password required in testing mode
- **Admin access:** Everyone has full admin access in testing mode

## 🌐 Sharing with Others for Testing

### If testing locally:
- Only you can access it on your computer
- Others need their own copy of the code

### If deployed to your server:
- Anyone with the URL can access and test
- Share the URL: `http://yourdomain.com`
- No login needed - they just select a role

## 💾 Using Supabase

- Your app **is already connected** to Supabase
- Database is hosted on Supabase servers
- You don't need to install any database software
- Even on your own server, it connects to Supabase cloud
- All data is stored securely in Supabase PostgreSQL

## 🔧 Quick Deployment Commands

```bash
# Install dependencies (if not already done)
npm install

# Start local development
npm run dev
# Open http://localhost:5173

# Build for production deployment
npm run build
# Upload the 'dist' folder to your server
```

## 📞 Testing Checklist

- [ ] Can select different roles
- [ ] Each role shows different menu items
- [ ] Admin Panel loads correctly
- [ ] Can export data to Excel
- [ ] Can import data from Excel
- [ ] Can create new orders (Sales role)
- [ ] Can view orders in different views
- [ ] Can search and filter data
- [ ] Data persists after refresh
- [ ] Can switch between roles

---

**Current Mode:** Testing (No Authentication)
**When Ready:** Ask to enable login system
