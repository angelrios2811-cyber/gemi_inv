import { Outlet, NavLink } from 'react-router-dom';
import { Home, ScanLine, Package, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/scan', icon: ScanLine, label: 'Escanear' },
  { to: '/inventory', icon: Package, label: 'Inventario' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
];

export function Layout() {
  return (
    <div className="flex flex-col min-h-dvh bg-[#0f0a1a] relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-48 h-48 bg-indigo-600/6 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 left-1/4 w-56 h-56 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <main className="flex-1 relative z-10 px-4 pt-6 pb-24 max-w-lg mx-auto w-full">
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
