import React, { useEffect, useState } from 'react';
import { Users, Package, DollarSign, TrendingUp, Filter, Edit, Trash2, Settings, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useMultiUserStore } from '../store/useMultiUserStore';
import { BCVService } from '../services/bcvService';
import type { User } from '../types/auth';

export default function AdminDashboard() {
  const { user: currentUser } = useAuthStore();
  const {
    users,
    selectedUserId,
    globalStats,
    isLoadingUsers,
    loadUsers,
    setSelectedUser,
    loadUserProducts,
    loadUserExpenses,
    loadAllProducts,
    loadAllExpenses,
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

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadUsers();
      loadGlobalStats();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedUserId) {
      loadUserProducts(selectedUserId);
      loadUserExpenses(selectedUserId);
    } else {
      loadAllProducts();
      loadAllExpenses();
    }
  }, [selectedUserId]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(newUserForm);
      setShowCreateUser(false);
      setNewUserForm({ email: '', username: '', password: '', role: 'user' });
    } catch (error: any) {
      console.error('Error creating user:', error);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    
    try {
      await updateUser(selectedUserForEdit.id, editUserForm);
      setShowEditUser(false);
      setSelectedUserForEdit(null);
      setEditUserForm({ email: '', username: '', role: 'user', isActive: true });
    } catch (error: any) {
      console.error('Error updating user:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    try {
      await changeUserPassword(selectedUserForEdit.id, passwordForm.oldPassword, passwordForm.newPassword);
      setShowUserPassword(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
    }
  };

  const openEditUser = (user: User) => {
    setSelectedUserForEdit(user);
    setEditUserForm({
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive
    });
    setShowEditUser(true);
  };

  const openPasswordChange = (user: User) => {
    setSelectedUserForEdit(user);
    setShowUserPassword(true);
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acceso Denegado</h1>
          <p className="text-white/60">No tienes permisos de administrador para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass p-6 border border-white/20 rounded-2xl mb-8 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Users size={24} className="text-violet-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent">Panel de Administración</h1>
                <p className="text-white/60 mt-1">Gestiona usuarios y monitorea el sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">Admin</span>
              </div>
            </div>
          </div>
          
          {/* Header Glow Line */}
          <div className="mt-4 h-0.5 bg-gradient-to-r from-violet-500/30 via-violet-400/50 to-violet-500/30 rounded-full"></div>
        </div>

        {/* Global Stats */}
        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass p-6 border border-white/20 rounded-xl animate-slide-up" style={{ animationDelay: '25ms' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                  <Users size={20} className="text-violet-400" />
                </div>
                <span className="text-2xl font-bold text-white">{globalStats.totalUsers}</span>
              </div>
              <p className="text-white/60 text-sm">Usuarios Totales</p>
            </div>
            <div className="glass p-6 border border-white/20 rounded-xl animate-slide-up" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center">
                  <Package size={20} className="text-green-400" />
                </div>
                <span className="text-2xl font-bold text-white">{globalStats.totalProducts}</span>
              </div>
              <p className="text-white/60 text-sm">Productos Totales</p>
            </div>
            <div className="glass p-6 border border-white/20 rounded-xl animate-slide-up" style={{ animationDelay: '75ms' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                  <TrendingUp size={20} className="text-amber-400" />
                </div>
                <span className="text-2xl font-bold text-white">
                  {BCVService.formatBs(globalStats.totalValue)}
                </span>
              </div>
              <p className="text-white/60 text-sm">Valor Total</p>
            </div>
            <div className="glass p-6 border border-white/20 rounded-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                  <DollarSign size={20} className="text-red-400" />
                </div>
                <span className="text-2xl font-bold text-white">
                  {BCVService.formatBs(globalStats.totalExpenses)}
                </span>
              </div>
              <p className="text-white/60 text-sm">Gastos Totales</p>
            </div>
          </div>
        )}

        {/* User Filter and Management */}
        <div className="glass p-6 border border-white/20 rounded-xl animate-slide-up" style={{ animationDelay: '125ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Users size={20} className="text-violet-400" />
              Gestión de Usuarios
            </h2>
            <button
              onClick={() => setShowCreateUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              <UserPlus size={16} />
              Nuevo Usuario
            </button>
          </div>

          {/* User Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-white/60" />
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUser(e.target.value || null)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-400/50"
              >
                <option value="">Todos los usuarios</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            {selectedUserId && (
              <button
                onClick={() => setSelectedUser(null)}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white/60 hover:bg-white/20 transition-colors text-sm"
              >
                Limpiar filtro
              </button>
            )}
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {isLoadingUsers ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-violet-400/30 rounded-full animate-spin border-t-violet-400 mx-auto"></div>
                <p className="text-white/60 mt-2">Cargando usuarios...</p>
              </div>
            ) : (
              users.map(user => (
                <div key={user.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-white/60 text-sm">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPasswordChange(user)}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        title="Cambiar contraseña"
                      >
                        <Settings size={16} className="text-white/60" />
                      </button>
                      <button
                        onClick={() => openEditUser(user)}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        title="Editar usuario"
                      >
                        <Edit size={16} className="text-white/60" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Stats Table */}
        {globalStats?.userStats && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6">Estadísticas por Usuario</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4">Usuario</th>
                    <th className="text-right py-3 px-4">Email</th>
                    <th className="text-right py-3 px-4">Productos</th>
                    <th className="text-right py-3 px-4">Valor Inventario</th>
                    <th className="text-right py-3 px-4">Gastos</th>
                  </tr>
                </thead>
                <tbody>
                  {globalStats.userStats.map((stat: any) => (
                    <tr key={stat.userId} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 font-medium">{stat.username}</td>
                      <td className="py-3 px-4 text-right text-white/60">{stat.email}</td>
                      <td className="py-3 px-4 text-right">{stat.totalProducts}</td>
                      <td className="py-3 px-4 text-right">${stat.totalValue.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">${stat.totalExpenses.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Crear Nuevo Usuario</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Rol</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as 'user' })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400/50"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Editar Usuario</h3>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  value={editUserForm.username}
                  onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Rol</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value as 'user' | 'admin' })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400/50"
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
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="isActive" className="text-white/70 text-sm">Usuario Activo</label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditUser(false)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showUserPassword && selectedUserForEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Cambiar Contraseña</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUserPassword(false)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
