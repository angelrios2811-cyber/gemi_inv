// 🧹 **COMPONENTE DE LIMPIEZA DE DATOS**
// Componente para eliminar todos los registros de la base de datos (MANTIENIENDO USUARIOS)
// 
// IMPORTANTE: Esta función NO elimina usuarios, solo elimina:
// - 📦 Productos
// - 💳 Gastos  
// - 💱 Tasas de cambio
// 
// Los usuarios y sus credenciales de autenticación se mantienen intactos

import { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { clearAllData } from '../database/clearAllData';

export function ClearDataComponent() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleClearData = async () => {
    if (!confirmed) {
      setConfirmed(true);
      setMessage('⚠️ ¿Estás seguro? Esta acción no se puede deshacer');
      return;
    }

    setStatus('loading');
    setMessage('🧹 Eliminando todos los datos...');
    setResult(null);

    try {
      const result = await clearAllData();
      
      if (result.success) {
        setStatus('success');
        setMessage(`✅ Todos los datos eliminados correctamente`);
        setResult(result);
        setConfirmed(false);
      } else {
        setStatus('error');
        setMessage(`❌ Error: ${result.error}`);
        setConfirmed(false);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Error inesperado: ${error.message}`);
      setConfirmed(false);
      console.error('Clear data error:', error);
    }
  };

  const resetState = () => {
    setStatus('idle');
    setMessage('');
    setResult(null);
    setConfirmed(false);
  };

  return (
    <div className="p-6 glass rounded-xl border border-red-500/20">
      <div className="flex items-center gap-3 mb-4">
        <Trash2 size={20} className="text-red-400" />
        <h3 className="text-white font-medium">Limpiar Base de Datos</h3>
      </div>

      <div className="space-y-4">
        <div className="text-sm text-white/60">
          <p className="mb-2">⚠️ **ADVERTENCIA:** Esta acción eliminará permanentemente:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>📦 Todos los productos</li>
            <li>💳 Todos los gastos</li>
            <li>💱 Todas las tasas de cambio</li>
          </ul>
          <p className="mt-3 text-green-400 font-medium">✅ **NO se eliminarán:**</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>👤 Usuarios registrados</li>
            <li>🔐 Credenciales de autenticación</li>
            <li>📊 Configuraciones del sistema</li>
          </ul>
          <p className="mt-2 text-red-400 font-medium">Esta acción no se puede deshacer</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClearData}
            disabled={status === 'loading'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              confirmed 
                ? 'bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30' 
                : 'bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30'
            }`}
          >
            {status === 'loading' ? (
              <>
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : confirmed ? (
              <>
                <AlertTriangle size={16} />
                <span>Confirmar Eliminación</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Limpiar Datos</span>
              </>
            )}
          </button>
          
          {(status !== 'idle' || confirmed) && (
            <button
              onClick={resetState}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-300 hover:bg-gray-500/30 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Reiniciar</span>
            </button>
          )}
        </div>

        {/* Status Message */}
        {status !== 'idle' && (
          <div className={`p-4 rounded-lg border ${
            status === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
            status === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
            'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {status === 'success' ? (
                <CheckCircle size={20} />
              ) : status === 'error' ? (
                <AlertTriangle size={20} />
              ) : (
                <RefreshCw size={20} />
              )}
              <span className="font-medium">
                {status === 'success' ? '¡Éxito!' : 
                 status === 'error' ? 'Error' : 'Procesando...'}
              </span>
            </div>
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* Result Display */}
        {result && result.success && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-white font-medium mb-3">📊 Resumen de Eliminación:</h4>
            <div className="space-y-2 text-sm text-white/80">
              <div>📦 Productos eliminados: <span className="text-red-400">{result.deletedProducts}</span></div>
              <div>💳 Gastos eliminados: <span className="text-red-400">{result.deletedExpenses}</span></div>
              <div>💱 Tasas eliminadas: <span className="text-red-400">{result.deletedRates}</span></div>
              <div className="pt-2 border-t border-white/10">
                📊 Total eliminados: <span className="text-red-400 font-bold">{result.totalDeleted}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
