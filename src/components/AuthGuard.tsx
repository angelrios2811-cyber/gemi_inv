import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificar autenticación al montar el componente
    const verifyAuth = () => {
      checkAuth();
      
      // Pequeña espera para asegurar que la verificación se complete
      const timer = setTimeout(() => {
        const currentState = useAuthStore.getState();
        
        if (!currentState.isAuthenticated) {
          window.location.href = '/login';
        } else {
          setIsChecking(false);
        }
      }, 100);

      return () => clearTimeout(timer);
    };

    verifyAuth();
  }, [checkAuth]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
