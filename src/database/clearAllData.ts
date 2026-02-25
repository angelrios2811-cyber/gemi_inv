// 🧹 **LIMPIEZA COMPLETA DE DATOS - INVCAS v4.0.0**
// Script para eliminar todos los registros de la base de datos (manteniendo estructura)

import { FirestoreService } from '../firebase/firestoreService';

export async function clearAllData() {
  try {
    // Obtener todos los registros de cada colección
    const products = await FirestoreService.getAllProducts();
    const expenses = await FirestoreService.getAllExpenses();
    const exchangeRates = await FirestoreService.getExchangeRates();
    
    let deletedProducts = 0;
    let deletedExpenses = 0;
    let deletedRates = 0;
    
    // Eliminar todos los productos
    if (products.length > 0) {
      for (const product of products) {
        if (product.id) {
          await FirestoreService.deleteProduct(product.id);
          deletedProducts++;
        }
      }
    }
    
    // Eliminar todos los gastos
    if (expenses.length > 0) {
      for (const expense of expenses) {
        if (expense.id) {
          await FirestoreService.deleteExpense(expense.id);
          deletedExpenses++;
        }
      }
    }
    
    // Eliminar todas las tasas de cambio
    if (exchangeRates.length > 0) {
      for (const rate of exchangeRates) {
        if (rate.id) {
          await FirestoreService.deleteExchangeRate(rate.id);
          deletedRates++;
        }
      }
    }
    
    return {
      success: true,
      deleted: {
        products: deletedProducts,
        expenses: deletedExpenses,
        rates: deletedRates,
        total: deletedProducts + deletedExpenses + deletedRates
      }
    };
  } catch (error) {
    console.error('Error clearing data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default clearAllData;
