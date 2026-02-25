import React, { useState, useEffect } from 'react';
import { Users, Package, DollarSign, TrendingUp, UserPlus, Settings, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useMultiUserStore } from '../store/useMultiUserStore';
import type { User } from '../types/auth';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const { user: currentUser } = useAuthStore();
  const {
    users,
    globalStats,
    isLoadingUsers,
    loadUsers,
    loadGlobalStats,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword
  } = useMultiUserStore();

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    username: '',
    password: '',
    role: 'user' as const
  });
  const [editUserForm, setEditUserForm] = useState({
    email: '',
    username: '',
    role: 'user' as 'user' | 'admin',
    isActive: true
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    if (isOpen && currentUser?.role === 'admin') {
      loadUsers();
      loadGlobalStats();
    }
  }, [isOpen, currentUser?.role, loadUsers, loadGlobalStats]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      await createUser(newUserForm);
      setSuccessMessage('Usuario creado exitosamente');
      setNewUserForm({ email: '', username: '', password: '', role: 'user' });
      
      // Cerrar modal automáticamente después de 3 segundos
      setTimeout(() => {
        setShowCreateUser(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Mostrar el mensaje de error específico
      const errorMessage = error.message || 'Error al crear usuario. Inténtalo de nuevo.';
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      await updateUser(selectedUserForEdit.id, editUserForm);
      setSuccessMessage('Usuario actualizado exitosamente');
      setSelectedUserForEdit(null);
      setEditUserForm({ email: '', username: '', role: 'user', isActive: true });
      
      // Cerrar modal automáticamente después de 3 segundos
      setTimeout(() => {
        setShowEditUser(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      // Mostrar el mensaje de error específico
      const errorMessage = error.message || 'Error al actualizar usuario. Inténtalo de nuevo.';
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;
    
    setSuccessMessage('');
    setErrorMessage('');
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    try {
      await changeUserPassword(selectedUserForPassword.id, passwordForm.oldPassword, passwordForm.newPassword);
      setSuccessMessage('Contraseña actualizada exitosamente');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSelectedUserForPassword(null);
      
      // Cerrar modal automáticamente después de 3 segundos
      setTimeout(() => {
        setShowUserPassword(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      // Mostrar el mensaje de error específico
      const errorMessage = error.message || 'Error al cambiar contraseña. Verifica los datos e inténtalo de nuevo.';
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const openEditUser = (user: User) => {
    setSelectedUserForEdit(user);
    setEditUserForm({
      email: user.email,
      username: user.username,
      role: user.role as 'user' | 'admin',
      isActive: user.isActive
    });
    setShowEditUser(true);
  };

  const openPasswordChange = (user: User) => {
    setSelectedUserForPassword(user);
    setShowUserPassword(true);
  };

  const openDeleteConfirm = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete.id);
      setSuccessMessage(`Usuario ${userToDelete.username} y todos sus registros eliminados exitosamente`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setErrorMessage('Error al eliminar usuario. Inténtalo de nuevo.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-container ${isOpen ? 'animate-fade-in' : ''}`}>
      <div 
        className="modal-content admin-modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Users size={20} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Panel de Administración</h2>
              <p className="text-white/60 text-sm">Gestiona usuarios y monitorea el sistema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Global Stats */}
        {globalStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 min-h-[120px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                  <Users size={16} className="text-violet-400" />
                </div>
                <span className="text-xl font-bold text-white">{globalStats.totalUsers}</span>
              </div>
              <p className="text-white/60 text-xs">Usuarios</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 min-h-[120px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                  <Package size={16} className="text-green-400" />
                </div>
                <span className="text-xl font-bold text-white">{globalStats.totalProducts}</span>
              </div>
              <p className="text-white/60 text-xs">Productos</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 min-h-[120px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={16} className="text-amber-400" />
                </div>
                <span className="text-xl font-bold text-white">
                  ${globalStats.totalValue.toFixed(0)}
                </span>
              </div>
              <p className="text-white/60 text-xs">Valor</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 min-h-[120px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                  <DollarSign size={16} className="text-red-400" />
                </div>
                <span className="text-xl font-bold text-white">
                  ${globalStats.totalExpenses.toFixed(0)}
                </span>
              </div>
              <p className="text-white/60 text-xs">Gastos</p>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users size={16} className="text-violet-400" />
              Gestión de Usuarios
            </h3>
            <button
              onClick={() => setShowCreateUser(true)}
              className="flex items-center gap-2 px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm whitespace-nowrap"
            >
              <UserPlus size={14} />
              Nuevo Usuario
            </button>
          </div>

          {/* Users List */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {isLoadingUsers ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-violet-400/30 rounded-full animate-spin border-t-violet-400 mx-auto"></div>
                <p className="text-white/60 mt-2 text-sm">Cargando...</p>
              </div>
            ) : (
              users.map(user => (
                <div key={user.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
                  {/* User Info Section */}
                  <div className="flex flex-col gap-3">
                    {/* User Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'} flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{user.username}</p>
                          <p className="text-white/60 text-xs truncate">{user.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          user.role === 'admin' 
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 sm:gap-2">
                      <button
                        onClick={() => openPasswordChange(user)}
                        className="flex items-center gap-2 px-2 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200 text-white/80 hover:text-white text-xs sm:text-xs font-medium"
                        title="Cambiar contraseña"
                      >
                        <Settings size={14} className="flex-shrink-0" />
                        <span className="hidden sm:inline">Contraseña</span>
                      </button>
                      <button
                        onClick={() => openEditUser(user)}
                        className="flex items-center gap-2 px-2 py-2 bg-violet-500/20 rounded-lg hover:bg-violet-500/30 transition-all duration-200 text-violet-300 hover:text-violet-200 text-xs sm:text-xs font-medium border border-violet-500/30"
                        title="Editar usuario"
                      >
                        <Edit size={14} className="flex-shrink-0" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(user)}
                        className="flex items-center gap-2 px-2 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-all duration-200 text-red-300 hover:text-red-200 text-xs sm:text-xs font-medium border border-red-500/30"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={14} className="flex-shrink-0" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateUser && (
          <div className={`modal-container ${showCreateUser ? 'animate-fade-in' : ''}`} style={{ zIndex: 10001 }}>
            <div 
              className="modal-content"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowCreateUser(false);
                }
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                    <UserPlus size={20} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Crear Nuevo Usuario</h3>
                    <p className="text-white/60 text-sm">Agrega un nuevo usuario al sistema</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateUser(false)}
                  className="p-2 rounded-lg glass-button text-white/60"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                    <input
                      type="email"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      className="glass-input w-full px-4 py-3 text-white placeholder-white/40 text-sm"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Nombre de Usuario</label>
                    <input
                      type="text"
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      className="glass-input w-full px-4 py-3 text-white placeholder-white/40 text-sm"
                      placeholder="nombredeusuario"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Contraseña <span className="text-white/50 text-xs">(mínimo 6 dígitos)</span>
                    </label>
                    <input
                      type="password"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className={`glass-input w-full px-4 py-3 text-white placeholder-white/40 text-sm ${
                        newUserForm.password.length > 0 && newUserForm.password.length < 6
                          ? 'border-red-400/50 focus:border-red-400/50'
                          : 'border-white/20 focus:border-violet-400/50'
                      }`}
                      placeholder="•••••••••••"
                      required
                    />
                    {newUserForm.password.length > 0 && newUserForm.password.length < 6 && (
                      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        La contraseña debe tener mínimo 6 dígitos
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Rol</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as 'user' })}
                      className="form-select w-full px-4 py-3 text-white appearance-none cursor-pointer text-sm"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                
                {/* Success/Error Messages */}
                {successMessage && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 text-sm font-medium text-center">
                      ✅ {successMessage}
                    </p>
                  </div>
                )}
                
                {errorMessage && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm font-medium text-center">
                      ❌ {errorMessage}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateUser(false)}
                    className="btn-secondary flex-1 py-2.5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all duration-200 text-sm font-medium"
                  >
                    Crear Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUser && selectedUserForEdit && (
          <div className={`modal-container ${showEditUser ? 'animate-fade-in' : ''}`} style={{ zIndex: 10002 }}>
            <div 
              className="modal-content"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowEditUser(false);
                }
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                    <Settings size={20} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Editar Usuario</h3>
                    <p className="text-white/60 text-sm">Modifica los datos del usuario</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditUser(false)}
                  className="p-2 rounded-lg glass-button text-white/60"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleEditUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                    <input
                      type="email"
                      value={editUserForm.email}
                      onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                      className="glass-input w-full px-4 py-3 text-white placeholder-white/40 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Nombre de Usuario</label>
                    <input
                      type="text"
                      value={editUserForm.username}
                      onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                      className="glass-input w-full px-4 py-3 text-white placeholder-white/40 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Rol</label>
                    <select
                      value={editUserForm.role}
                      onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value as 'user' | 'admin' })}
                      className="form-select w-full px-4 py-3 text-white appearance-none cursor-pointer text-sm"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editUserForm.isActive}
                      onChange={(e) => setEditUserForm({ ...editUserForm, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border border-white/20 bg-white/10 text-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
                    />
                    <label htmlFor="isActive" className="text-white/70 text-sm">Usuario Activo</label>
                  </div>
                </div>
                
                {/* Success/Error Messages */}
                {successMessage && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 text-sm font-medium text-center">
                      ✅ {successMessage}
                    </p>
                  </div>
                )}
                
                {errorMessage && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm font-medium text-center">
                      ❌ {errorMessage}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditUser(false)}
                    className="btn-secondary flex-1 py-2.5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all duration-200 text-sm font-medium"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showUserPassword && selectedUserForPassword && (
          <div className={`modal-container ${showUserPassword ? 'animate-fade-in' : ''}`} style={{ zIndex: 10003 }}>
            <div 
              className="modal-content"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowUserPassword(false);
                }
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                    <Settings size={20} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Cambiar Contraseña</h3>
                    <p className="text-white/60 text-sm">Actualiza la contraseña del usuario</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserPassword(false)}
                  className="p-2 rounded-lg glass-button text-white/60"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Contraseña Actual</label>
                    <input
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      className="glass-input w-full px-4 py-3 text-white placeholder-white/40 text-sm"
                      placeholder="•••••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Nueva Contraseña <span className="text-white/50 text-xs">(mínimo 6 dígitos)</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className={`glass-input w-full px-4 py-3 text-white placeholder-white/40 text-sm ${
                        passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 6
                          ? 'border-red-400/50 focus:border-red-400/50'
                          : 'border-white/20 focus:border-violet-400/50'
                      }`}
                      placeholder="••••••••••"
                      required
                    />
                    {passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 6 && (
                      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        La contraseña debe tener mínimo 6 dígitos
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="glass-input w-full px-4 py-3 text-white placeholder-white/40 text-sm"
                      placeholder="••••••••••"
                      required
                    />
                  </div>
                </div>
                
                {/* Success/Error Messages */}
                {successMessage && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 text-sm font-medium text-center">
                      ✅ {successMessage}
                    </p>
                  </div>
                )}
                
                {errorMessage && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm font-medium text-center">
                      ❌ {errorMessage}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(false)}
                    className="btn-secondary flex-1 py-2.5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all duration-200 text-sm font-medium"
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className={`modal-container ${showDeleteConfirm ? 'animate-fade-in' : ''}`} style={{ zIndex: 10004 }}>
            <div 
              className="modal-content"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowDeleteConfirm(false);
                }
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <Trash2 size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Eliminar Usuario</h3>
                    <p className="text-white/60 text-sm">Confirmar eliminación completa</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-2 rounded-lg glass-button text-white/60"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Warning Message */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-sm font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-300 text-sm font-medium mb-2">
                      Estás tratando de eliminar al usuario <span className="text-white font-bold">{userToDelete.username}</span>
                    </p>
                    <p className="text-red-200/80 text-xs">
                      Esta acción eliminará permanentemente todos los registros asociados al usuario, incluyendo:
                    </p>
                    <ul className="text-red-200/60 text-xs mt-2 space-y-1 list-disc list-inside">
                      <li>• Productos registrados</li>
                      <li>• Gastos y transacciones</li>
                      <li>• Historial de actividades</li>
                      <li>• Todos los datos relacionados</li>
                    </ul>
                    <p className="text-red-300 text-sm font-medium mt-3">
                      ¿Estás absolutamente seguro de que deseas continuar?
                    </p>
                  </div>
                </div>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-sm font-medium text-center">
                    ✅ {successMessage}
                  </p>
                </div>
              )}
              
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm font-medium text-center">
                    ❌ {errorMessage}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary flex-1 py-2.5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium"
                >
                  Eliminar Todo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
