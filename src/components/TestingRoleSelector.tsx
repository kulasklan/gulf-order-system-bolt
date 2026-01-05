import { useState } from 'react';
import { Users, Building2, DollarSign, Truck, Package, Settings } from 'lucide-react';

interface TestingRoleSelectorProps {
  onRoleSelect: (role: { department: string; name: string }) => void;
}

export default function TestingRoleSelector({ onRoleSelect }: TestingRoleSelectorProps) {
  const roles = [
    {
      department: 'Sales',
      name: 'Sales Manager',
      icon: Users,
      color: 'bg-blue-600',
      description: 'Create orders and manage clients'
    },
    {
      department: 'Management',
      name: 'General Manager',
      icon: Building2,
      color: 'bg-purple-600',
      description: 'Approve orders and view analytics'
    },
    {
      department: 'Finance',
      name: 'Finance Manager',
      icon: DollarSign,
      color: 'bg-green-600',
      description: 'Manage invoices and pricing'
    },
    {
      department: 'Transport',
      name: 'Transport Manager',
      icon: Truck,
      color: 'bg-orange-600',
      description: 'Assign drivers and trucks'
    },
    {
      department: 'Warehouse',
      name: 'Warehouse Manager',
      icon: Package,
      color: 'bg-yellow-600',
      description: 'Manage inventory and loading'
    },
    {
      department: 'Admin',
      name: 'System Administrator',
      icon: Settings,
      color: 'bg-red-600',
      description: 'Full system access and data management'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
            <span className="text-4xl">⛽</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            GULF Order Management System
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Testing Mode - Select Your Role
          </p>
          <p className="text-sm text-orange-600 font-medium bg-orange-50 inline-block px-4 py-2 rounded-lg border border-orange-200">
            Authentication disabled for testing purposes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.department}
                onClick={() => onRoleSelect(role)}
                className="group bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-200 text-left"
              >
                <div className={`${role.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {role.department}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {role.description}
                </p>
                <div className="text-blue-600 font-medium text-sm group-hover:text-blue-700">
                  Login as {role.name} →
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>You can switch roles anytime by refreshing the page</p>
        </div>
      </div>
    </div>
  );
}
