import { create } from 'zustand';
import type { Product, Expense } from '../firebase/firestoreService';
import { FirestoreService } from '../firebase/firestoreService';

interface InventoryState {
  products: Product[];
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'precioHistory'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (searchTerm: string) => Promise<Product[]>;
  fetchProducts: () => Promise<void>;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  searchExpenses: (searchTerm: string) => Promise<Expense[]>;
  
  // Load actions
  loadProducts: () => Promise<void>;
  loadExpenses: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  expenses: [],
  loading: false,
  error: null,

  // Product actions
  addProduct: async (product) => {
    set({ loading: true, error: null });
    try {
      await FirestoreService.createProduct(product);
      await get().loadProducts();
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
      await FirestoreService.updateProduct(id, updates);
      await get().loadProducts();
    } catch (error) {
      set({ error: 'Error al actualizar producto' });
      console.error('Error updating product:', error);
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await FirestoreService.deleteProduct(id);
      await get().loadProducts();
    } catch (error) {
      set({ error: 'Error al eliminar producto' });
      console.error('Error deleting product:', error);
    } finally {
      set({ loading: false });
    }
  },

  searchProducts: async (searchTerm) => {
    try {
      return await FirestoreService.searchProducts(searchTerm);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  // Expense actions
  addExpense: async (expense) => {
    set({ loading: true, error: null });
    try {
      await FirestoreService.createExpense(expense);
      await get().loadExpenses();
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
      await FirestoreService.deleteExpense(id);
      await get().loadExpenses();
    } catch (error) {
      set({ error: 'Error al eliminar gasto' });
      console.error('Error deleting expense:', error);
    } finally {
      set({ loading: false });
    }
  },

  searchExpenses: async (searchTerm) => {
    try {
      return await FirestoreService.searchExpenses(searchTerm);
    } catch (error) {
      console.error('Error searching expenses:', error);
      return [];
    }
  },

  // Load actions
  loadProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await FirestoreService.getAllProducts();
      set({ products });
    } catch (error) {
      set({ error: 'Error al cargar productos' });
      console.error('Error loading products:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchProducts: async () => {
    await get().loadProducts();
  },

  loadExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const expenses = await FirestoreService.getAllExpenses();
      set({ expenses });
    } catch (error) {
      set({ error: 'Error al cargar gastos' });
      console.error('Error loading expenses:', error);
    } finally {
      set({ loading: false });
    }
  }
}));

// Export alias for easier import
export { useInventoryStore as useInventory };
export { useInventoryStore as useFirestoreStore };
