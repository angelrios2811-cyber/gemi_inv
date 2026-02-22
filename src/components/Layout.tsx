import { Outlet, NavLink } from 'react-router-dom';
import { Home, Receipt, Package, Settings, Plus, ShoppingCart, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/add-product', icon: Plus, label: 'Agregar' },
  { to: '/manage-stock', icon: ShoppingCart, label: 'Stock' },
  { to: '/inventory', icon: Package, label: 'Inventario' },
  { to: '/expenses', icon: Receipt, label: 'Gastos' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
];

export function Layout() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#0f0a1a] relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-48 h-48 bg-indigo-600/6 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 left-1/4 w-56 h-56 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      {/* User Header */}
      <div className="relative z-10 px-4 pb-2 mt-3 max-w-lg mx-auto w-full">
        <div className="glass p-3 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <User size={16} className="text-violet-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{user?.name}</p>
                <p className="text-white/40 text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/60"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 relative z-10 px-4 pb-24 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 glass-strong border-t border-white/5 safe-area-pb">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-violet-400'
                    : 'text-white/30 hover:text-white/50'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
