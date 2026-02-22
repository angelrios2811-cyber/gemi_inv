// 🧪 **COMPONENTE DE PRUEBA SEED DATABASE - ELIMINADO**
// Este componente ha sido eliminado para limpiar el proyecto

// Si necesitas volver a habilitarlo, puedes restaurarlo desde el historial de git

import { Package } from 'lucide-react';

export function SeedDatabaseComponent() {
  return (
    <div className="p-6 glass rounded-xl border border-white/10 text-center">
      <div className="flex items-center gap-3 mb-4">
        <Package size={20} className="text-violet-400" />
        <h3 className="text-white font-medium">Base de Datos de Prueba</h3>
      </div>
      
      <div className="text-sm text-white/60">
        <p className="mb-2">📦 **Productos de ejemplo:** 30+ items realistas</p>
        <p className="mb-2">💳 **Gastos de ejemplo:** 20+ transacciones variadas</p>
        <p>🎯 **Categorías:** Todas las categorías de la app</p>
        <p className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-300">
          ⚠️ **Nota:** Este componente ha sido eliminado para limpiar el proyecto
        </p>
      </div>
    </div>
  );
}
