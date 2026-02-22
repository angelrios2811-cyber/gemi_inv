import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { CheckCircle, Wifi, WifiOff } from 'lucide-react';

const mode = 'firebase'; // Forzar modo Firebase para este componente

export function FirebaseTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      // Solo probar lectura (sin escribir en la BD)
      await db.collection('products').limit(1).get();
      setStatus('connected');
      setMessage('Conexión establecida');
      
    } catch (error) {
      setStatus('error');
      setMessage('Sin conexión');
      console.error('❌ Firebase connection failed:', error);
    }
  };

  return (
    <div className="glass p-4 flex items-center gap-4 animate-slide-up" style={{ animationDelay: '250ms' }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        status === 'connected' 
          ? 'bg-emerald-500/10' 
          : status === 'error' 
          ? 'bg-red-500/10' 
          : 'bg-yellow-500/10'
      }`}>
        {status === 'connected' ? (
          <CheckCircle size={18} className="text-emerald-400" />
        ) : status === 'error' ? (
          <WifiOff size={18} className="text-red-400" />
        ) : (
          <Wifi size={18} className="text-yellow-400" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white/80">Estado de Firebase</p>
        <p className="text-xs text-white/30 mt-0.5">
          {mode === 'firebase' ? 'Base de datos en la nube' : 'Base de datos local'}
        </p>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
        status === 'connected' 
          ? 'bg-emerald-500/15 text-emerald-400' 
          : status === 'error' 
          ? 'bg-red-500/15 text-red-400' 
          : 'bg-yellow-500/15 text-yellow-400'
      }`}>
        {message}
      </span>
    </div>
  );
}
