import { Database, Globe, Info } from 'lucide-react';

const mode = import.meta.env.VITE_DB_MODE ?? 'local';

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Ajustes</h1>
        <p className="text-white/40 text-xs mt-0.5">Configuración del sistema</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* DB Mode */}
        <div className="glass p-4 flex items-center gap-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Database size={18} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80">Base de datos</p>
            <p className="text-xs text-white/30 mt-0.5">
              {mode === 'firebase' ? 'Firebase Firestore' : 'IndexedDB (Dexie.js)'}
            </p>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              mode === 'firebase'
                ? 'bg-orange-500/15 text-orange-400'
                : 'bg-emerald-500/15 text-emerald-400'
            }`}
          >
            {mode === 'firebase' ? 'Producción' : 'Local'}
          </span>
        </div>

        {/* OCR Status */}
        <div className="glass p-4 flex items-center gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Database size={18} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80">Tesseract OCR</p>
            <p className="text-xs text-white/30 mt-0.5">
              Reconocimiento de texto offline
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
            <p className="text-sm font-medium text-white/80">PWA</p>
            <p className="text-xs text-white/30 mt-0.5">Soporte offline habilitado</p>
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
            <p className="text-xs text-white/30 mt-0.5">v1.0.0 &middot; Inventario familiar con OCR</p>
          </div>
        </div>
      </div>
    </div>
  );
}
