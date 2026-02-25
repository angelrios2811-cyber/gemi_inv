import { create } from 'zustand';
import type { ProductItem, ExpenseRecord } from '../types';
import { useAuthStore } from './useAuthStore';
import MultiUserService from '../services/multiUserService';
import { useMultiUserStore } from './useMultiUserStore';

interface MultiUserInventoryState {
  products: ProductItem[];
  expenses: ExpenseRecord[];
  loading: boolean;
  error: string | null;
  
  // Product actions
  addProduct: (product: Omit<ProductItem, 'id' | 'fechaCreacion' | 'ultimaActualizacion' | 'precioHistorico'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<ProductItem>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (searchTerm: string) => Promise<ProductItem[]>;
  fetchProducts: () => Promise<void>;
  
  // Expense actions
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  searchExpenses: (searchTerm: string) => Promise<ExpenseRecord[]>;
  
  // Load actions
  loadProducts: () => Promise<void>;
  loadExpenses: () => Promise<void>;
  loadCurrentUserProducts: () => Promise<void>;
  loadCurrentUserExpenses: () => Promise<void>;
  
  // Admin actions
  loadAllProducts: () => Promise<void>;
  loadAllExpenses: () => Promise<void>;
  loadUserProducts: (userId: string) => Promise<void>;
  loadUserExpenses: (userId: string) => Promise<void>;
}

export const useMultiUserFirestoreStore = create<MultiUserInventoryState>((set, get) => {
  return {
    products: [],
    expenses: [],
    loading: false,
    error: null,

    // Product actions
    addProduct: async (product) => {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        set({ error: 'Usuario no autenticado' });
        return;
      }

      set({ loading: true, error: null });
      try {
        // Add userId to product
        const productWithUserId = {
          ...product,
          userId: user.id
        };

        // Save to multi-user service
        await MultiUserService.saveProduct(productWithUserId as any);
        await get().loadProducts();
        
        // Update global stats if user is admin
        if (user.role === 'admin') {
          const { loadGlobalStats } = useMultiUserStore.getState();
          await loadGlobalStats();
        }
      } catch (error) {
        set({ error: 'Error al agregar producto' });
        console.error('Error adding product:', error);
      } finally {
        set({ loading: false });
      }
    },

    updateProduct: async (id, updates) => {
      set({ loading: true, error: null });
      try {
        await MultiUserService.updateProduct(id, updates);
        
        await get().loadProducts();
        
        // Update global stats if user is admin
        const { user } = useAuthStore.getState();
        if (user?.role === 'admin') {
          const { loadGlobalStats } = useMultiUserStore.getState();
          await loadGlobalStats();
        }
      } catch (error) {
        set({ error: 'Error al actualizar producto' });
        console.error('Error updating product:', error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    deleteProduct: async (id) => {
      set({ loading: true, error: null });
      try {
        await MultiUserService.deleteProduct(id);
        await get().loadProducts();
        
        // Update global stats if user is admin
        const { user } = useAuthStore.getState();
        if (user?.role === 'admin') {
          const { loadGlobalStats } = useMultiUserStore.getState();
          await loadGlobalStats();
        }
      } catch (error) {
        set({ error: 'Error al eliminar producto' });
        console.error('Error deleting product:', error);
      } finally {
        set({ loading: false });
      }
    },

    searchProducts: async (searchTerm: string) => {
      try {
        const products = await MultiUserService.getAllProducts();
        return products.filter(product => 
          product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } catch (error) {
        console.error('Error searching products:', error);
        return [];
      }
    },

    fetchProducts: async () => {
      await get().loadProducts();
    },

    // Expense actions
    addExpense: async (expense) => {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        set({ error: 'Usuario no autenticado' });
        return;
      }

      set({ loading: true, error: null });
      try {
        // Add userId to expense
        const expenseWithUserId = {
          ...expense,
          userId: user.id
        };

        // Save to multi-user service
        await MultiUserService.saveExpense(expenseWithUserId as any);
        await get().loadExpenses();
        
        // Update global stats if user is admin
        if (user.role === 'admin') {
          const { loadGlobalStats } = useMultiUserStore.getState();
          await loadGlobalStats();
        }
      } catch (error) {
        set({ error: 'Error al agregar gasto' });
        console.error('Error adding expense:', error);
      } finally {
        set({ loading: false });
      }
    },

    deleteExpense: async (id) => {
      set({ loading: true, error: null });
      try {
        await MultiUserService.deleteExpense(id);
        await get().loadExpenses();
        
        // Update global stats if user is admin
        const { user } = useAuthStore.getState();
        if (user?.role === 'admin') {
          const { loadGlobalStats } = useMultiUserStore.getState();
          await loadGlobalStats();
        }
      } catch (error) {
        set({ error: 'Error al eliminar gasto' });
        console.error('Error deleting expense:', error);
      } finally {
        set({ loading: false });
      }
    },

    searchExpenses: async (searchTerm: string) => {
      try {
        const expenses = await MultiUserService.getAllExpenses();
        return expenses.filter(expense => 
          expense.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.categoria.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } catch (error) {
        console.error('Error searching expenses:', error);
        return [];
      }
    },

    // Load actions
    loadProducts: async () => {
      const { user } = useAuthStore.getState();
      const { isAdmin } = useAuthStore.getState();
      
      if (!user) {
        set({ products: [], loading: false });
        return;
      }

      set({ loading: true, error: null });
      try {
        if (isAdmin()) {
          // Admin loads all products
          const products = await MultiUserService.getAllProducts();
          set({ products, loading: false });
        } else {
          // User loads only their products
          const products = await MultiUserService.getUserProducts(user.id);
          set({ products, loading: false });
        }
      } catch (error) {
        set({ error: 'Error al cargar productos', loading: false });
        console.error('Error loading products:', error);
      }
    },

    // Always load current user's products (even if admin)
    loadCurrentUserProducts: async () => {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        set({ products: [], loading: false });
        return;
      }

      set({ loading: true, error: null });
      try {
        // Always load only the current user's products, regardless of role
        const products = await MultiUserService.getUserProducts(user.id);
        set({ products, loading: false });
      } catch (error) {
        set({ error: 'Error al cargar productos del usuario', loading: false });
        console.error('Error loading current user products:', error);
      }
    },

    loadExpenses: async () => {
      const { user } = useAuthStore.getState();
      const { isAdmin } = useAuthStore.getState();
      
      if (!user) {
        set({ expenses: [], loading: false });
        return;
      }

      set({ loading: true, error: null });
      try {
        if (isAdmin()) {
          // Admin loads all expenses
          const expenses = await MultiUserService.getAllExpenses();
          set({ expenses, loading: false });
        } else {
          // User loads only their expenses
          const expenses = await MultiUserService.getUserExpenses(user.id);
          set({ expenses, loading: false });
        }
      } catch (error) {
        set({ error: 'Error al cargar gastos', loading: false });
        console.error('Error loading expenses:', error);
      }
    },

    // Always load current user's expenses (even if admin)
    loadCurrentUserExpenses: async () => {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        set({ expenses: [], loading: false });
        return;
      }

      set({ loading: true, error: null });
      try {
        // Always load only the current user's expenses, regardless of role
        const expenses = await MultiUserService.getUserExpenses(user.id);
        set({ expenses, loading: false });
      } catch (error) {
        set({ error: 'Error al cargar gastos del usuario', loading: false });
        console.error('Error loading current user expenses:', error);
      }
    },

    // Admin actions
    loadAllProducts: async () => {
      const { isAdmin } = useAuthStore.getState();
      if (!isAdmin) return;
      
      set({ loading: true, error: null });
      try {
        const products = await MultiUserService.getAllProducts();
        set({ products, loading: false });
      } catch (error) {
        set({ error: 'Error al cargar todos los productos', loading: false });
        console.error('Error loading all products:', error);
      }
    },

    loadAllExpenses: async () => {
      const { isAdmin } = useAuthStore.getState();
      if (!isAdmin) return;
      
      set({ loading: true, error: null });
      try {
        const expenses = await MultiUserService.getAllExpenses();
        set({ expenses, loading: false });
      } catch (error) {
        set({ error: 'Error al cargar todos los gastos', loading: false });
        console.error('Error loading all expenses:', error);
      }
    },

    loadUserProducts: async (userId: string) => {
      set({ loading: true, error: null });
      try {
        const products = await MultiUserService.getUserProducts(userId);
        set({ products, loading: false });
      } catch (error) {
        set({ error: 'Error al cargar productos del usuario', loading: false });
        console.error('Error loading user products:', error);
      }
    },

    loadUserExpenses: async (userId: string) => {
      set({ loading: true, error: null });
      try {
        const expenses = await MultiUserService.getUserExpenses(userId);
        set({ expenses, loading: false });
      } catch (error) {
        set({ error: 'Error al cargar gastos del usuario', loading: false });
        console.error('Error loading user expenses:', error);
      }
    }
  };
});
