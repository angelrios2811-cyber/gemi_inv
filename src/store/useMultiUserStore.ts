import { create } from 'zustand';
import { AuthService } from '../services/authService';
import MultiUserService from '../services/multiUserService';
import type { ProductItem, ExpenseRecord } from '../types';
import type { User } from '../types/auth';
import { useMultiUserFirestoreStore } from './useMultiUserFirestoreStore';

interface MultiUserState {
  // User Management
  users: User[];
  selectedUserId: string | null;
  isLoadingUsers: boolean;
  
  // Products
  products: ProductItem[];
  isLoadingProducts: boolean;
  
  // Expenses
  expenses: ExpenseRecord[];
  isLoadingExpenses: boolean;
  
  // Stats
  userStats: any;
  globalStats: any;
  
  // Actions
  loadUsers: () => Promise<void>;
  setSelectedUser: (userId: string | null) => void;
  loadUserProducts: (userId: string) => Promise<void>;
  loadUserExpenses: (userId: string) => Promise<void>;
  loadAllProducts: () => Promise<void>;
  loadAllExpenses: () => Promise<void>;
  loadUserStats: (userId: string) => Promise<void>;
  loadGlobalStats: () => Promise<void>;
  createUser: (userData: {
    email: string;
    username: string;
    password: string;
    role?: 'user';
  }) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  changeUserPassword: (userId: string, oldPassword: string, newPassword: string) => Promise<void>;
}

export const useMultiUserStore = create<MultiUserState>((set, get) => ({
  // Initial state
  users: [],
  selectedUserId: null,
  isLoadingUsers: false,
  products: [],
  isLoadingProducts: false,
  expenses: [],
  isLoadingExpenses: false,
  userStats: null,
  globalStats: null,

  // Load users (admin only)
  loadUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const users = await AuthService.getAllUsers();
      set({ users, isLoadingUsers: false });
    } catch (error) {
      console.error('Error loading users:', error);
      set({ isLoadingUsers: false });
    }
  },

  // Set selected user for filtering
  setSelectedUser: (userId: string | null) => {
    set({ selectedUserId: userId });
  },

  // Load products for specific user
  loadUserProducts: async (userId: string) => {
    set({ isLoadingProducts: true });
    try {
      const products = await MultiUserService.getUserProducts(userId);
      set({ products, isLoadingProducts: false });
    } catch (error) {
      console.error('Error loading user products:', error);
      set({ isLoadingProducts: false });
    }
  },

  // Load expenses for specific user
  loadUserExpenses: async (userId: string) => {
    set({ isLoadingExpenses: true });
    try {
      const expenses = await MultiUserService.getUserExpenses(userId);
      set({ expenses, isLoadingExpenses: false });
    } catch (error) {
      console.error('Error loading user expenses:', error);
      set({ isLoadingExpenses: false });
    }
  },

  // Load all products (admin only)
  loadAllProducts: async () => {
    set({ isLoadingProducts: true });
    try {
      const products = await MultiUserService.getAllProducts();
      set({ products, isLoadingProducts: false });
    } catch (error) {
      console.error('Error loading all products:', error);
      set({ isLoadingProducts: false });
    }
  },

  // Load all expenses (admin only)
  loadAllExpenses: async () => {
    set({ isLoadingExpenses: true });
    try {
      const expenses = await MultiUserService.getAllExpenses();
      set({ expenses, isLoadingExpenses: false });
    } catch (error) {
      console.error('Error loading all expenses:', error);
      set({ isLoadingExpenses: false });
    }
  },

  // Load user statistics
  loadUserStats: async (userId: string) => {
    try {
      const stats = await MultiUserService.getUserStats(userId);
      set({ userStats: stats });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  },

  // Load global statistics (admin only)
  loadGlobalStats: async () => {
    try {
      const stats = await MultiUserService.getGlobalStats();
      set({ globalStats: stats });
    } catch (error) {
      console.error('Error loading global stats:', error);
    }
  },

  // Create new user (admin only)
  createUser: async (userData: {
    email: string;
    username: string;
    password: string;
    role?: 'user' | 'admin';
  }) => {
    try {
      await AuthService.register(userData);
      await get().loadUsers(); // Refresh users list
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user (admin only)
  updateUser: async (userId: string, updates: Partial<User>) => {
    try {
      await AuthService.updateUser(userId, updates);
      await get().loadUsers(); // Refresh users list
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user (admin only) - elimina usuario y todos sus registros
  deleteUser: async (userId: string) => {
    try {
      console.log('Deleting user and all records for userId:', userId);
      
      // Obtener funciones del store de firestore
      const firestoreStore = useMultiUserFirestoreStore.getState();
      
      // 1. Eliminar todos los productos del usuario
      const userProducts = firestoreStore.products.filter(product => product.userId === userId);
      console.log('Found products to delete:', userProducts.length);
      
      for (const product of userProducts) {
        try {
          await firestoreStore.deleteProduct(product.id);
          console.log('Deleted product:', product.id);
        } catch (error) {
          console.error('Error deleting product:', product.id, error);
        }
      }
      
      // 2. Eliminar todos los gastos del usuario
      const userExpenses = firestoreStore.expenses.filter(expense => expense.userId === userId);
      console.log('Found expenses to delete:', userExpenses.length);
      
      for (const expense of userExpenses) {
        try {
          await firestoreStore.deleteExpense(expense.id);
          console.log('Deleted expense:', expense.id);
        } catch (error) {
          console.error('Error deleting expense:', expense.id, error);
        }
      }
      
      // 3. Eliminar al usuario
      await AuthService.deleteUser(userId);
      console.log('Deleted user:', userId);
      
      // 4. Recargar listas
      await get().loadUsers();
      await firestoreStore.loadAllProducts();
      await firestoreStore.loadAllExpenses();
      
      console.log('Successfully deleted user and all records');
    } catch (error) {
      console.error('Error deleting user and records:', error);
      throw error;
    }
  },

  // Change user password
  changeUserPassword: async (userId: string, oldPassword: string, newPassword: string) => {
    try {
      await AuthService.changePassword(userId, oldPassword, newPassword);
    } catch (error) {
      console.error('Error changing user password:', error);
      throw error;
    }
  }
}));

// Note: AuthService is already imported at the top
