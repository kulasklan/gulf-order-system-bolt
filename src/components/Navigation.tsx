import { useApp } from '../context/AppContext';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  const tabs = getTabsForDepartment(currentUser.department);

  return (
    <div className="nav-tabs">
      <div className="nav-tabs-inner">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`nav-tab ${activeView === tab.id ? 'active' : ''}`}
            onClick={() => onViewChange(tab.id)}
          >
            {tab.icon} {tab.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function getTabsForDepartment(department: string) {
  const commonTabs = [{ id: 'dashboard', label: 'Dashboard', icon: '📊' }];

  switch (department) {
    case 'Sales':
      return [
        ...commonTabs,
        { id: 'createOrder', label: 'Create Order', icon: '➕' }
      ];
    case 'Management':
      return [
        ...commonTabs,
        { id: 'approval', label: 'For Approval', icon: '✅' },
        { id: 'disputes', label: 'Resolve Disputes', icon: '⚠️' },
        { id: 'analytics', label: 'Analytics', icon: '📊' }
      ];
    case 'Finance':
      return [
        ...commonTabs,
        { id: 'regulatoryPrices', label: 'Regulatory Prices', icon: '📊' },
        { id: 'proforma', label: 'Enter Proforma', icon: '🧾' },
        { id: 'invoice', label: 'Enter Invoice', icon: '📄' }
      ];
    case 'Transport':
      return [
        ...commonTabs,
        { id: 'transport', label: 'Assign Transport', icon: '🚛' },
        { id: 'assignedTrucks', label: 'Assigned Trucks', icon: '📋' },
        { id: 'delivery', label: 'Delivery', icon: '📦' }
      ];
    case 'Warehouse':
      return [
        ...commonTabs,
        { id: 'warehouse', label: 'Warehouse', icon: '📦' }
      ];
    case 'Admin':
      return [
        ...commonTabs,
        { id: 'admin', label: 'Admin Panel', icon: '⚙️' },
        { id: 'analytics', label: 'Analytics', icon: '📊' }
      ];
    default:
      return commonTabs;
  }
}
