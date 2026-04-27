'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Wrench, DollarSign,
  BarChart3, Settings, LogOut, Menu, X, Search, Bell, ChevronDown,
  Smartphone, TrendingUp, AlertTriangle, Plus, Moon, Sun
} from 'lucide-react';

// Pages
import DashboardPage from '@/components/pages/DashboardPage';
import InventoryPage from '@/components/pages/InventoryPage';
import SalesPage from '@/components/pages/SalesPage';
import CustomersPage from '@/components/pages/CustomersPage';
import FinancePage from '@/components/pages/FinancePage';
import ReportsPage from '@/components/pages/ReportsPage';
import SettingsPage from '@/components/pages/SettingsPage';
import LoginPage from '@/components/auth/LoginPage';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Estoque', icon: Package },
  { id: 'sales', label: 'Vendas', icon: ShoppingCart },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'finance', label: 'Financeiro', icon: DollarSign },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Check session
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .finally(() => setLoadingAuth(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  // Load notifications
  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data.notifications || []))
      .catch(() => {});
  }, [activePage]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNavigate={setActivePage} />;
      case 'inventory': return <InventoryPage />;
      case 'sales': return <SalesPage />;
      case 'customers': return <CustomersPage />;
      case 'finance': return <FinancePage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[260px] flex flex-col
        bg-[#0f0f11] border-r border-[var(--color-border-primary)]
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--color-border-primary)]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Ysaque Imports</h1>
            <p className="text-[11px] text-[var(--color-text-muted)]">Sistema de Gestão</p>
          </div>
          <button
            className="ml-auto lg:hidden text-[var(--color-text-muted)] hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setSidebarOpen(false);
                }}
                className={`sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all
                  ${activePage === item.id
                    ? 'active bg-indigo-500/10 text-indigo-400'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-white'
                  }
                `}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-[var(--color-border-primary)]">
          <div 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 group transition-colors cursor-pointer"
            title="Sair do sistema"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name ? user.name[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">{user.role}</p>
            </div>
            <LogOut className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-red-400 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-14 flex items-center gap-4 px-4 lg:px-6 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl shrink-0">
          <button
            className="lg:hidden text-[var(--color-text-secondary)] hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <h2 className="text-base font-semibold text-white hidden sm:block">
            {menuItems.find(i => i.id === activePage)?.label}
          </h2>

          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2 text-[var(--color-text-muted)] hover:text-white transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 glass-card p-4 z-50 shadow-2xl">
                <h3 className="text-sm font-semibold text-white mb-3">Notificações</h3>
                {notifications.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">Nenhuma notificação</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[var(--color-bg-hover)]">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-[var(--color-text-secondary)]">{n}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
