import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Receipt, Package, Settings, ShoppingCart, LogOut, User, Sparkles, Activity } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useState, useEffect } from 'react';
import { scrollToTop } from '../utils/scrollUtils';

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/manage-stock', icon: ShoppingCart, label: 'Stock' },
  { to: '/inventory', icon: Package, label: 'Inventario' },
  { to: '/expenses', icon: Receipt, label: 'Gastos' },
  { to: '/settings', icon: Settings, label: 'Config' },
];

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  // Función para navegar con scroll to top
  const handleNavigate = (path: string) => {
    scrollToTop();
    navigate(path);
  };

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1525] to-[#0f0a1a] relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-violet-400/40 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400/40 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-violet-400/40 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Enhanced User Header */}
      <div className={`relative z-10 px-4 pb-3 mt-4 max-w-lg mx-auto w-full transition-all duration-1000 transform ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="glass-strong p-4 rounded-2xl border border-white/10 relative overflow-hidden">
          {/* Glow Effect */}
          <div className="absolute -inset-px bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-2xl blur-lg"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-600/30 border border-violet-500/40 flex items-center justify-center relative overflow-hidden group">
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-transparent rounded-xl"></div>
                    {/* Animated Sparkle */}
                    <Sparkles className="absolute top-1 right-1 w-3 h-3 text-violet-300 animate-pulse" />
                    <User size={20} className="text-violet-300 relative z-10" />
                  </div>
                  {/* Ring Animation */}
                  <div className="absolute -inset-1 border border-violet-500/30 rounded-xl animate-pulse"></div>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{user?.username}</p>
                  <p className="text-white/50 text-xs">{user?.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user?.role === 'admin' 
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {user?.role === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Status Indicator */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">Online</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 text-white/40 hover:text-white/60 hover:scale-110 group"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </div>
            
            {/* Activity Bar */}
            <div className="mt-3 flex items-center gap-2">
              <Activity size={12} className="text-violet-400/60" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-violet-500/30 to-transparent rounded-full"></div>
              <span className="text-violet-400/60 text-xs">Sistema activo</span>
              <div className="flex-1 h-0.5 bg-gradient-to-l from-violet-500/30 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with proper scrolling */}
      <main className="flex-1 relative z-10 px-4 pb-20 max-w-lg mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>

      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 glass-strong border-t border-white/5 safe-area-pb relative overflow-hidden">
        {/* Navigation Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent"></div>
        
        <div className="relative z-10 max-w-lg mx-auto flex items-center justify-around py-3 px-2">
          {navItems.map(({ to, icon: Icon, label }, index) => {
            const isActive = location.pathname === to;
            return (
              <button
                key={to}
                onClick={() => handleNavigate(to)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 relative group ${
                  isActive
                    ? 'text-violet-300 bg-violet-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/20'
                    : 'text-white/30 hover:text-white/50 hover:bg-white/10'
                } animate-slide-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-violet-400 rounded-full animate-pulse"></div>
                )}
                
                {/* Icon Container */}
                <div className={`relative p-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-violet-500/20 shadow-inner shadow-violet-500/30' 
                    : 'group-hover:bg-white/10'
                }`}>
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2 : 1.5}
                    className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-violet-300 scale-110' 
                        : 'group-hover:scale-105'
                    }`}
                  />
                  
                  {/* Icon Glow Effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-violet-400/20 rounded-lg blur-md animate-pulse"></div>
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${
                  isActive 
                    ? 'text-violet-300 font-semibold' 
                    : 'group-hover:text-white/60'
                }`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Bottom Glow Line */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent rounded-full"></div>
      </nav>
    </div>
  );
}
