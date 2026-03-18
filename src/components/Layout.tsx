import React from 'react';
import { LayoutDashboard, FileText, Users, Receipt, Settings, LogOut } from 'lucide-react';
import { signOut } from '../lib/auth';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'invoices' | 'clients' | 'create' | 'settings';
  onNavigate: (page: 'dashboard' | 'invoices' | 'clients' | 'create' | 'settings') => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices' as const, label: 'Invoices', icon: FileText },
    { id: 'create' as const, label: 'Create Invoice', icon: Receipt },
    { id: 'clients' as const, label: 'Clients', icon: Users },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  async function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
      window.location.reload();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">InvoiceTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
