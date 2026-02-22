// 🧹 **LIMPIEZA COMPLETA DE DATOS - INVCAS v4.0.0**
// Script para eliminar todos los registros de la base de datos (manteniendo estructura)

import { FirestoreService } from '../firebase/firestoreService';

export async function clearAllData() {
  console.log('🧹 Iniciando limpieza completa de datos...');
  
  try {
    // Obtener todos los registros de cada colección
    const products = await FirestoreService.getAllProducts();
    const expenses = await FirestoreService.getAllExpenses();
    const exchangeRates = await FirestoreService.getExchangeRates();
    
    console.log(`📊 Registros encontrados:`);
    console.log(`  📦 Productos: ${products.length}`);
    console.log(`  💳 Gastos: ${expenses.length}`);
    console.log(`  💱 Tasas de cambio: ${exchangeRates.length}`);
    
    let deletedProducts = 0;
    let deletedExpenses = 0;
    let deletedRates = 0;
    
    // Eliminar todos los productos
    if (products.length > 0) {
      console.log('🗑️ Eliminando productos...');
      for (const product of products) {
        if (product.id) {
          await FirestoreService.deleteProduct(product.id);
          deletedProducts++;
        }
      }
    }
    
    // Eliminar todos los gastos
    if (expenses.length > 0) {
      console.log('🗑️ Eliminando gastos...');
      for (const expense of expenses) {
        if (expense.id) {
          await FirestoreService.deleteExpense(expense.id);
          deletedExpenses++;
        }
      }
    }
    
    // Eliminar todas las tasas de cambio
    if (exchangeRates.length > 0) {
      console.log('🗑️ Eliminando tasas de cambio...');
      for (const rate of exchangeRates) {
        if (rate.id) {
          await FirestoreService.deleteExchangeRate(rate.id);
          deletedRates++;
        }
      }
    }
    
    console.log('\n✅ **LIMPIEZA COMPLETADA:**');
    console.log(`📦 Productos eliminados: ${deletedProducts}`);
    console.log(`💳 Gastos eliminados: ${deletedExpenses}`);
    console.log(`💱 Tasas eliminadas: ${deletedRates}`);
    console.log(`📊 Total eliminados: ${deletedProducts + deletedExpenses + deletedRates}`);
    
    return {
      success: true,
      deletedProducts,
      deletedExpenses,
      deletedRates,
      totalDeleted: deletedProducts + deletedExpenses + deletedRates
    };
    
  } catch (error) {
    console.error('❌ Error en limpieza de datos:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

export default clearAllData;
