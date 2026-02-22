// 🧹 **LIMPIEZA DE TASAS DUPLICADAS - INVCAS v4.0.0**
// Script para limpiar tasas de cambio duplicadas en Firebase

import { FirestoreService } from '../firebase/firestoreService';

export async function cleanupDuplicateRates() {
  
  try {
    const allRates = await FirestoreService.getExchangeRates();
    
    // Agrupar por tipo y fecha
    const rateGroups = new Map<string, any[]>();
    
    allRates.forEach(rate => {
      const key = `${rate.type}_${rate.date}`;
      if (!rateGroups.has(key)) {
        rateGroups.set(key, []);
      }
      rateGroups.get(key)!.push(rate);
    });
    
    let duplicatesFound = 0;
    let duplicatesDeleted = 0;
    
    // Procesar cada grupo
    for (const [, rates] of rateGroups.entries()) {
      if (rates.length > 1) {
        duplicatesFound++;
        
        // Ordenar por timestamp (más reciente primero)
        rates.sort((a, b) => b.timestamp - a.timestamp);
        
        // Eliminar duplicados
        for (const duplicate of rates.slice(1)) {
          if (duplicate.id) {
            await FirestoreService.deleteExchangeRate(duplicate.id);
            duplicatesDeleted++;
          }
        }
      }
    }
    
    return {
      success: true,
      duplicatesFound,
      duplicatesDeleted,
      finalCount: allRates.length - duplicatesDeleted
    };
    
  } catch (error) {
    console.error('❌ Error en limpieza de tasas:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

export default cleanupDuplicateRates;
