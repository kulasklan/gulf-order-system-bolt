# Gulf Order Management System - Refactored Structure

This document explains the refactored code structure and how to work with it.

## Project Structure

```
src/
├── components/                  # React components (20 files)
│   ├── Login.tsx               # Login screen
│   ├── Header.tsx              # Top navigation bar
│   ├── Navigation.tsx          # Tab navigation
│   ├── Dashboard.tsx           # Main dashboard with stats and filters
│   ├── OrderTable.tsx          # Reusable order table component
│   ├── CreateOrder.tsx         # Order creation form (Sales)
│   ├── ApprovalView.tsx        # Approve/reject orders (Management)
│   ├── DisputesView.tsx        # Resolve disputes (Management)
│   ├── ProformaView.tsx        # Enter proforma numbers (Finance)
│   ├── InvoiceView.tsx         # Enter invoice numbers (Finance)
│   ├── RegulatoryPricesView.tsx # Daily fuel prices (Finance)
│   ├── TransportView.tsx       # Assign drivers & trucks (Transport)
│   ├── AssignedTrucksView.tsx  # View assigned trucks (Transport)
│   ├── DeliveryView.tsx        # Mark delivered/disputed (Transport)
│   └── WarehouseView.tsx       # Checklist workflow (Warehouse)
│
├── context/            # React context for state management
│   └── AppContext.tsx  # Global app state (user, orders, clients, etc.)
│
├── services/           # API and external service calls
│   └── api.ts         # Google Sheets API integration
│
├── types/              # TypeScript type definitions
│   └── index.ts       # All interfaces and types
│
├── utils/              # Helper functions
│   └── helpers.ts     # Date formatting, status helpers, filters
│
├── config/             # Configuration and constants
│   └── constants.ts   # API keys, dropdown options, users
│
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## Key Improvements

### 1. **Modular Architecture**
- Split from 3,500+ lines into manageable files (50-250 lines each)
- Each file has a single, clear responsibility
- Easy to locate and modify specific functionality

### 2. **Type Safety**
- Full TypeScript coverage
- Interfaces for all data structures (Order, Client, Driver, etc.)
- Catch errors at compile time, not runtime

### 3. **Reusable Components**
- `OrderTable`: Used across all views
- Consistent UI patterns
- Easier to maintain and update

### 4. **Centralized State Management**
- `AppContext` manages all global state
- Single source of truth for orders, clients, users
- Automatic data refresh when user logs in

### 5. **Service Layer**
- All API calls in `api.ts`
- Easy to modify backend integration
- Could swap Google Sheets for Supabase or REST API easily

### 6. **Utility Functions**
- Date filtering, formatting
- Status badge logic
- Permission checks
- Reusable across components

## How to Add New Features

### Adding a New View (e.g., "Approval View")

1. **Create component file:**
```typescript
// src/components/ApprovalView.tsx
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';

export function ApprovalView() {
  const { orders, currentUser, refreshData } = useApp();

  const pendingOrders = orders.filter(o => o.status === 'Pending Approval');

  const handleApprove = async (orderID: string) => {
    await ApiService.approveOrder(orderID, currentUser!.id, '');
    await refreshData();
  };

  return (
    <div className="card">
      <h2>Pending Approvals</h2>
      {/* Your UI here */}
    </div>
  );
}
```

2. **Import in App.tsx:**
```typescript
import { ApprovalView } from './components/ApprovalView';
```

3. **Add to routing:**
```typescript
{activeView === 'approval' && <ApprovalView />}
```

### Adding a New API Method

1. **Add to `services/api.ts`:**
```typescript
static async customAction(param: string) {
  await this.postToAppsScript({
    action: 'customAction',
    param
  });
}
```

2. **Use in component:**
```typescript
import { ApiService } from '../services/api';

await ApiService.customAction('value');
```

### Adding New Types

1. **Add to `types/index.ts`:**
```typescript
export interface NewType {
  id: string;
  name: string;
}
```

2. **Use throughout app:**
```typescript
import { NewType } from '../types';

const item: NewType = { id: '1', name: 'Test' };
```

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Build for Production
```bash
npm run build
```

### 3. Type Check
```bash
npm run typecheck
```

### 4. Lint Code
```bash
npm run lint
```

## ✅ Refactoring Complete!

All views have been successfully converted from HTML to React:

- [x] **Login & Authentication** - Role-based login system
- [x] **Dashboard** - Stats, filters, and order table
- [x] **Create Order** - Full order creation form (Sales)
- [x] **Approval View** - Management approves/rejects orders
- [x] **Disputes View** - Resolve disputed orders
- [x] **Proforma View** - Finance enters proforma numbers
- [x] **Invoice View** - Finance enters invoice numbers
- [x] **Regulatory Prices View** - Finance updates daily prices
- [x] **Transport View** - Assign drivers and trucks
- [x] **Assigned Trucks View** - View assigned transport
- [x] **Delivery View** - Mark orders as delivered/disputed
- [x] **Warehouse View** - Warehouse checklist workflow

### Optional Future Enhancements

- [ ] **Analytics View** - Reports and Excel export (can reuse HTML SheetJS code)
- [ ] **Order Details Modal** - Full order details with documents and notes
- [ ] **Document Upload** - File upload to Google Drive
- [ ] **Order Notes** - Add notes/comments to orders

## Migration from Original HTML

### What Changed:
- **Single HTML file** → **Modular React components**
- **Inline JavaScript** → **TypeScript with types**
- **Global variables** → **React Context**
- **Manual DOM manipulation** → **Declarative React**
- **Inline styles** → **CSS classes + styled components**

### What Stayed the Same:
- Google Sheets backend integration
- All business logic and workflows
- UI design and styling
- User roles and permissions

## Benefits of New Structure

1. **Easier to Understand**: Find what you need quickly
2. **Easier to Modify**: Change one thing without breaking others
3. **Easier to Test**: Small, focused functions
4. **Easier to Scale**: Add new features without complexity explosion
5. **Better Performance**: React's efficient re-rendering
6. **Type Safety**: Catch bugs before they happen
7. **Modern Stack**: Industry-standard tools and patterns

## File Size Comparison

| Before | After |
|--------|-------|
| 1 file, 3,500+ lines | 20+ files, 50-250 lines each |
| Hard to navigate | Easy to find things |
| High cognitive load | Low cognitive load |
| Difficult to modify | Easy to modify |
| No type safety | Full TypeScript coverage |
| Global state mess | Clean React Context |

## Common Tasks

### Filtering Orders
```typescript
const filtered = orders.filter(o => o.status === 'Approved');
```

### Updating State
```typescript
const { refreshData } = useApp();
await refreshData(); // Reloads all data
```

### Getting Current User
```typescript
const { currentUser } = useApp();
if (currentUser?.department === 'Sales') {
  // Do something
}
```

### Making API Calls
```typescript
import { ApiService } from '../services/api';

await ApiService.createOrder(orderData);
await refreshData();
```

## Questions?

If you need help implementing any of the remaining views or have questions about the architecture, refer to the existing components as examples. The patterns are consistent throughout.
