import { useAuthStore } from '../store/useAuthStore';
import { useMultiUserStore } from '../store/useMultiUserStore';
import { Filter, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserFilterProps {
  selectedUserId: string | null;
  onUserChange: (userId: string | null) => void;
  className?: string;
}

export default function UserFilter({ selectedUserId, onUserChange, className = '' }: UserFilterProps) {
  const { user: currentUser } = useAuthStore();
  const { users, loadUsers } = useMultiUserStore();
  const [isLoading, setIsLoading] = useState(false);

  // Solo mostrar si el usuario actual es admin
  if (currentUser?.role !== 'admin') {
    return null;
  }

  // Cargar usuarios cuando el componente se monta
  useEffect(() => {
    const loadUsersData = async () => {
      setIsLoading(true);
      try {
        await loadUsers();
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (users.length === 0) {
      loadUsersData();
    }
  }, [loadUsers, users.length]);

  // Establecer el usuario actual como seleccionado por defecto solo al montar
  useEffect(() => {
    if (!selectedUserId && currentUser) {
      onUserChange(currentUser.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta al montar

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Filter size={14} className="text-white/60 flex-shrink-0" />
      <select
        value={selectedUserId || ''}
        onChange={(e) => onUserChange(e.target.value || null)}
        className="form-select px-3 py-2 text-sm w-full sm:w-auto appearance-none cursor-pointer"
        disabled={isLoading}
      >
        <option value="">
          {isLoading ? 'Cargando...' : 'Todos los usuarios'}
        </option>
        {/* Opción para el usuario actual (admin) */}
        <option value={currentUser.id}>
          {currentUser.username} - Yo
        </option>
        {/* Opciones para otros usuarios */}
        {users
          .filter(user => user.id !== currentUser.id)
          .map(user => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
      </select>
      {selectedUserId && selectedUserId !== currentUser.id && (
        <button
          onClick={() => onUserChange(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-button text-white/60 hover:text-white/80 text-xs font-medium transition-all duration-200"
          title="Limpiar filtro"
        >
          <X size={12} className="flex-shrink-0" />
        </button>
      )}
    </div>
  );
}
