// 🔄 **SERVICIO DE GASTOS AUTOMÁTICOS - FIREBASE v4.0.0**
// Crea gastos automáticamente cuando hay movimientos de stock positivos

import { FirestoreService } from '../firebase/firestoreService';
import { BCVService } from './bcvService';
import { subtractNumbers, multiplyNumbers, formatNumber } from '../utils/decimalUtils';

export interface StockMovementData {
  productId: string;
  productName: string;
  category: string;
  previousQuantity: number;
  newQuantity: number;
  previousPrice: number;
  newPrice: number;
  unidadMedicion: string;
  timestamp: number;
  userId: string; // Agregar userId para saber quién hizo la operación
}

export class AutomaticExpenseService {
  /**
   * Crea un gasto automático basado en el movimiento de stock
   */
  static async createExpenseFromStockMovement(movementData: StockMovementData): Promise<void> {
    try {
      const { bcv: bcvRate, usdt: usdtRate } = await BCVService.getAllRates();
      
      let expenseDescription = '';
      let expenseAmount = 0;
      let expenseCategory = movementData.category;
      
      // Calcular el monto total: costo de compra
      const quantityAdded = subtractNumbers(movementData.newQuantity, movementData.previousQuantity, 3);
      
      // Solo crear gastos si hay aumento de stock
      if (quantityAdded <= 0) {
        return;
      }
      
      // Costo de la compra nueva (solo lo que realmente compraste)
      const purchaseCost = multiplyNumbers(quantityAdded, movementData.newPrice, 2);
      
      // NO incluir ajustes de precio - solo cargar por la compra real
      // El ajuste de precio no es un gasto real, solo una revalorización del inventario
      expenseAmount = purchaseCost;
      
      // Si hay aumento de stock (con o sin cambio de precio)
      expenseDescription = `Compra: ${movementData.productName} (+${formatNumber(quantityAdded, 3)} ${movementData.unidadMedicion}.)`;
      expenseCategory = 'Compras';
      
      // Solo crear gasto si el monto es mayor a 0
      if (expenseAmount <= 0) {
        return;
      }
      
      // Crear el registro de gasto
      const expenseRecord = {
        descripcion: expenseDescription,
        categoria: expenseCategory,
        montoBs: expenseAmount,
        montoUSD: bcvRate > 0 ? expenseAmount / bcvRate : 0,
        montoUSDT: usdtRate > 0 ? expenseAmount / usdtRate : 0,
        tipo: 'stock',
        fecha: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      
      await FirestoreService.createExpense({
        ...expenseRecord,
        userId: movementData.userId // Usar el userId del usuario que hizo la operación
      });
      
    } catch (error) {
      console.error('❌ Error creando gasto automático:', error);
      throw error;
    }
  }
  
  /**
   * Analiza los cambios en un producto y determina si se debe crear un gasto
   */
  static async analyzeProductChanges(
    productId: string,
    previousData: any,
    newData: any,
    userId: string // Agregar userId
  ): Promise<void> {
    try {
      const quantityIncreased = (newData.cantidad || 0) > (previousData.cantidad || 0);
      
      // Solo crear gastos para aumentos de stock (sin importar cambios de precio)
      if (!quantityIncreased) {
        return;
      }
      
      const movementData: StockMovementData = {
        productId,
        productName: newData.nombre || previousData.nombre,
        category: newData.categoria || previousData.categoria,
        previousQuantity: previousData.cantidad || 0,
        newQuantity: newData.cantidad || 0,
        previousPrice: previousData.precioUnitario || 0,
        newPrice: newData.precioUnitario || 0,
        unidadMedicion: newData.unidadMedicion || previousData.unidadMedicion || 'unid',
        timestamp: Date.now(),
        userId: userId // Agregar el userId
      };
      
      await this.createExpenseFromStockMovement(movementData);
      
    } catch (error) {
      console.error('❌ Error analizando cambios del producto:', error);
    }
  }
  
  /**
   * Obtiene gastos automáticos recientes
   */
  static async getRecentAutomaticExpenses(days: number = 7): Promise<any[]> {
    try {
      const allExpenses = await FirestoreService.getAllExpenses();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return allExpenses.filter(expense => {
        const expenseDate = new Date(expense.fecha);
        return expenseDate >= cutoffDate && (
          expense.descripcion.includes('Compra:') ||
          expense.descripcion.includes('Ajuste precio:')
        );
      });
    } catch (error) {
      console.error('Error obteniendo gastos automáticos:', error);
      return [];
    }
  }
}
