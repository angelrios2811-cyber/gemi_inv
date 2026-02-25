// 🧪 **SERVICIO MULTI-USUARIO - INVCAS v4.0.0**
// Servicio para gestión de datos multi-usuario usando Firebase

import { FirestoreService } from '../firebase/firestoreService';
import { AuthService } from './authService';
import type { ProductItem, ExpenseRecord } from '../types';

export class MultiUserService {
  // Función para adaptar Product de Firebase a ProductItem
  private static adaptProductToProductItem(product: any): ProductItem {
    return {
      id: product.id,
      nombre: product.nombre,
      categoria: product.categoria,
      precioUnitario: product.precioUnitario,
      cantidad: product.cantidad,
      stockMinimo: product.minimumStock,
      alertaBajoStock: product.stockAlert > 0,
      fechaCreacion: product.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      precioUSD: product.precioUSD,
      precioUSDT: product.precioUSDT,
      unidadMedicion: product.unidadMedicion,
      userId: product.userId,
      // Agregar propiedades faltantes para el historial
      precioHistorico: product.precioHistorico,
      ultimaActualizacion: product.ultimaActualizacion,
      tasaBCV: product.tasaBCV,
      tasaUSDT: product.tasaUSDT
    };
  }

  // Función para adaptar Expense de Firebase a ExpenseRecord
  private static adaptExpenseToExpenseRecord(expense: any): ExpenseRecord {
    return {
      id: expense.id,
      descripcion: expense.descripcion,
      categoria: expense.categoria,
      montoBs: expense.montoBs,
      montoUSD: expense.montoUSD,
      montoUSDT: expense.montoUSDT,
      fecha: expense.fecha,
      bcvRate: 0, // Agregar valor por defecto
      usdtRate: 0, // Agregar valor por defecto
      tipo: expense.tipo as any,
      userId: expense.userId
    };
  }

  // Obtener productos del usuario actual
  static async getUserProducts(userId: string): Promise<ProductItem[]> {
    try {
      const allProducts = await FirestoreService.getAllProducts();
      return allProducts
        .filter((product: any) => product.userId === userId)
        .map((product: any) => this.adaptProductToProductItem(product));
    } catch (error) {
      console.error('Error obteniendo productos del usuario:', error);
      return [];
    }
  }

  // Obtener gastos del usuario actual
  static async getUserExpenses(userId: string): Promise<ExpenseRecord[]> {
    try {
      const allExpenses = await FirestoreService.getAllExpenses();
      return allExpenses
        .filter((expense: any) => expense.userId === userId)
        .map((expense: any) => this.adaptExpenseToExpenseRecord(expense));
    } catch (error) {
      console.error('Error obteniendo gastos del usuario:', error);
      return [];
    }
  }

  // Obtener todos los productos (solo admin)
  static async getAllProducts(): Promise<ProductItem[]> {
    try {
      const products = await FirestoreService.getAllProducts();
      return products.map((product: any) => this.adaptProductToProductItem(product));
    } catch (error) {
      console.error('Error obteniendo todos los productos:', error);
      return [];
    }
  }

  // Obtener todos los gastos (solo admin)
  static async getAllExpenses(): Promise<ExpenseRecord[]> {
    try {
      const expenses = await FirestoreService.getAllExpenses();
      return expenses.map((expense: any) => this.adaptExpenseToExpenseRecord(expense));
    } catch (error) {
      console.error('Error obteniendo todos los gastos:', error);
      return [];
    }
  }

  // Guardar producto con userId
  static async saveProduct(product: ProductItem): Promise<string> {
    try {
      const productData = {
        nombre: product.nombre,
        categoria: product.categoria,
        precioUnitario: product.precioUnitario || 0,
        cantidad: product.cantidad || 0,
        precioUSD: product.precioUSD || 0,
        precioUSDT: product.precioUSDT || 0,
        stockAlert: product.alertaBajoStock ? 1 : 0,
        minimumStock: product.stockMinimo || 1,
        unidadMedicion: product.unidadMedicion || 'unid',
        userId: product.userId || '',
        precioHistory: []
      };
      
      await FirestoreService.createProduct(productData);
      return product.id;
    } catch (error) {
      console.error('Error guardando producto:', error);
      throw error;
    }
  }

  // Actualizar producto
  static async updateProduct(id: string, updates: Partial<ProductItem>): Promise<void> {
    try {
      const updateData: any = {
        nombre: updates.nombre,
        categoria: updates.categoria,
        precioUnitario: updates.precioUnitario,
        cantidad: updates.cantidad,
        precioUSD: updates.precioUSD,
        precioUSDT: updates.precioUSDT,
        stockAlert: updates.alertaBajoStock ? 1 : 0,
        minimumStock: updates.stockMinimo,
        unidadMedicion: updates.unidadMedicion,
        // Incluir propiedades faltantes para el historial
        precioHistorico: updates.precioHistorico,
        ultimaActualizacion: updates.ultimaActualizacion,
        tasaBCV: updates.tasaBCV,
        tasaUSDT: updates.tasaUSDT
      };
      
      // Eliminar propiedades undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      await FirestoreService.updateProduct(id, updateData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Eliminar producto
  static async deleteProduct(id: string): Promise<void> {
    try {
      await FirestoreService.deleteProduct(id);
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  }

  // Guardar gasto con userId
  static async saveExpense(expense: ExpenseRecord): Promise<string> {
    try {
      const expenseData = {
        descripcion: expense.descripcion,
        categoria: expense.categoria,
        montoBs: expense.montoBs,
        montoUSD: expense.montoUSD,
        montoUSDT: expense.montoUSDT,
        tipo: expense.tipo,
        fecha: expense.fecha,
        userId: expense.userId || ''
      };
      
      await FirestoreService.createExpense(expenseData);
      return expense.id;
    } catch (error) {
      console.error('Error guardando gasto:', error);
      throw error;
    }
  }

  // Eliminar gasto
  static async deleteExpense(id: string): Promise<void> {
    try {
      await FirestoreService.deleteExpense(id);
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      throw error;
    }
  }

  // Obtener estadísticas del usuario
  static async getUserStats(userId: string): Promise<{
    totalProducts: number;
    totalValue: number;
    totalExpenses: number;
    lowStockProducts: number;
  }> {
    try {
      const products = await this.getUserProducts(userId);
      const expenses = await this.getUserExpenses(userId);
      
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, p) => sum + ((p.precioUnitario || 0) * (p.cantidad || 0)), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.montoBs, 0);
      const lowStockProducts = products.filter(p => 
        p.alertaBajoStock && (p.cantidad || 0) <= (p.stockMinimo || 1)
      ).length;

      return {
        totalProducts,
        totalValue,
        totalExpenses,
        lowStockProducts
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del usuario:', error);
      return {
        totalProducts: 0,
        totalValue: 0,
        totalExpenses: 0,
        lowStockProducts: 0
      };
    }
  }

  // Obtener estadísticas globales (solo admin)
  static async getGlobalStats() {
    try {
      const [users, products, expenses] = await Promise.all([
        AuthService.getAllUsers(),
        FirestoreService.getAllProducts(),
        FirestoreService.getAllExpenses()
      ]);

      const totalUsers = users.length;
      const totalProducts = products.length;
      const totalValue = products.reduce((sum: number, p: any) => sum + ((p.precioUnitario || 0) * (p.cantidad || 0)), 0);
      const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.montoBs, 0);

      // Estadísticas por usuario
      const userStats = users.map((user: any) => {
        const userProducts = products.filter((p: any) => p.userId === user.id);
        const userExpenses = expenses.filter((e: any) => e.userId === user.id);
        
        return {
          userId: user.id,
          username: user.username,
          email: user.email,
          totalProducts: userProducts.length,
          totalValue: userProducts.reduce((sum: number, p: any) => sum + ((p.precioUnitario || 0) * (p.cantidad || 0)), 0),
          totalExpenses: userExpenses.reduce((sum: number, e: any) => sum + e.montoBs, 0)
        };
      });

      return {
        totalUsers,
        totalProducts,
        totalValue,
        totalExpenses,
        userStats
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas globales:', error);
      return {
        totalUsers: 0,
        totalProducts: 0,
        totalValue: 0,
        totalExpenses: 0,
        userStats: []
      };
    }
  }
}

export default MultiUserService;
