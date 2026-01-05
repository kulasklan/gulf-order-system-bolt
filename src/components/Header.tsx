import { useApp } from '../context/AppContext';

export function Header() {
  const { currentUser, logout } = useApp();

  return (
    <div className="header">
      <div className="header-content">
        <div className="logo">⛽ GULF Order Management</div>
        <div className="user-info">
          <div className="user-badge">
            {currentUser ? `${currentUser.name} (${currentUser.department})` : 'Not Logged In'}
          </div>
          {currentUser && (
            <button className="btn btn-danger" onClick={logout}>
              Switch Role
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
