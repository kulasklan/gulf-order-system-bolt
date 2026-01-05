import { useState } from 'react';
import { USERS } from '../config/constants';
import { useApp } from '../context/AppContext';

export function Login() {
  const [selectedUser, setSelectedUser] = useState('');
  const { login } = useApp();

  const handleLogin = () => {
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }

    const userData = USERS[selectedUser as keyof typeof USERS];
    login(selectedUser, userData);
  };

  return (
    <div className="login-screen">
      <h2>🔐 Login to System</h2>
      <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
        Select your role to continue
      </p>
      <div className="form-group">
        <label>Select User</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          style={{ marginBottom: '1rem' }}
        >
          <option value="">-- Select User --</option>
          <option value="GoranSM1">Goran (Sales Manager)</option>
          <option value="MarkoSM2">Marko (Sales Manager)</option>
          <option value="AnaManager1">Ana (Management)</option>
          <option value="PetarWarehouse1">Petar (Warehouse)</option>
          <option value="IvanTransport1">Ivan (Transport)</option>
          <option value="MilenaFinance1">Milena (Finance)</option>
          <option value="Admin">Admin</option>
        </select>
        <button className="btn btn-primary" onClick={handleLogin} style={{ width: '100%' }}>
          Login
        </button>
      </div>
    </div>
  );
}
