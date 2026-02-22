import { Globe, Info, DollarSign, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FirebaseTest } from '../components/FirebaseTest';
import { ClearDataComponent } from '../components/ClearDataComponent';

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg glass hover:bg-white/10 transition-colors duration-200">
            <ArrowLeft size={20} className="text-white/60" />
          </Link>
          <h1 className="text-xl font-bold text-white">Ajustes</h1>
        </div>
      </div>
      <p className="text-white/40 text-xs mt-0.5">Configuración del sistema</p>

      <div className="flex flex-col gap-3">
        {/* Firebase Connection Status */}
        <FirebaseTest />

        {/* BCV Rate */}
        <div className="glass p-4 flex items-center gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <DollarSign size={18} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80">Tasa BCV</p>
            <p className="text-xs text-white/30 mt-0.5">
              Conversión automática Bs/USD y Bs/USDT
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
            Activo
          </span>
        </div>

        {/* PWA Status */}
        <div className="glass p-4 flex items-center gap-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Globe size={18} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80">Aplicación Web</p>
            <p className="text-xs text-white/30 mt-0.5">Sistema de inventario manual</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
            Listo
          </span>
        </div>

        {/* Info */}
        <div className="glass p-4 flex items-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Info size={18} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80">INVCAS</p>
            <p className="text-xs text-white/30 mt-0.5">v4.0.0 &middot; Inventario y gastos familiares</p>
          </div>
        </div>

        {/* Clear Data Section */}
        <ClearDataComponent />
      </div>
    </div>
  );
}
