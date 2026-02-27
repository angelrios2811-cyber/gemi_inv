// 🔄 **SERVICIO DE TASAS DE CAMBIO - FIREBASE v4.0.0**
// Migrado de IndexedDB a Firebase Firestore

import { FirestoreService } from '../firebase/firestoreService';
import type { ExchangeRate } from '../types';

export class ExchangeRateService {
  /**
   * Guarda una tasa de cambio en Firebase
   */
  static async saveExchangeRate(rateRecord: Omit<ExchangeRate, 'id'>): Promise<void> {
    try {
      // Verificar si ya existe una tasa para este tipo y fecha
      const existingRate = await this.getExchangeRate(rateRecord.type, rateRecord.date);
      
      if (existingRate) {
        // Actualizar registro existente
        await FirestoreService.updateExchangeRate(existingRate.id, {
          rate: rateRecord.rate,
          timestamp: rateRecord.timestamp
        });
      } else {
        // Crear nuevo registro
        await FirestoreService.createExchangeRate(rateRecord);
      }
    } catch (error) {
      console.error('Error saving exchange rate:', error);
      throw error;
    }
  }

  /**
   * Obtiene una tasa específica para un tipo y fecha
   */
  static async getExchangeRate(type: 'BCV' | 'USDT', date: string): Promise<ExchangeRate | null> {
    try {
      const rates = await FirestoreService.getExchangeRates();
      const rate = rates.find(r => r.type === type && r.date === date);
      return rate || null;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return null;
    }
  }

  /**
   * Obtiene la tasa BCV para una fecha específica
   */
  static async getBCVRate(date: string): Promise<number> {
    try {
      const rate = await this.getExchangeRate('BCV', date);
      return rate?.rate || 0;
    } catch (error) {
      console.error('Error getting BCV rate:', error);
      return 0;
    }
  }

  /**
   * Obtiene la tasa USDT para una fecha específica
   */
  static async getUSDTRate(date: string): Promise<number> {
    try {
      const rate = await this.getExchangeRate('USDT', date);
      return rate?.rate || 0;
    } catch (error) {
      console.error('Error getting USDT rate:', error);
      return 0;
    }
  }

  /**
   * Obtiene la última tasa disponible de un tipo
   */
  static async getLastRate(type: 'BCV' | 'USDT'): Promise<number> {
    try {
      const rates = await FirestoreService.getExchangeRates();
      const typeRates = rates.filter(r => r.type === type);
      
      if (typeRates.length === 0) return 0;
      
      // Ordenar por fecha descendente y tomar la más reciente
      typeRates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return typeRates[0].rate;
    } catch (error) {
      console.error('Error getting last rate:', error);
      return 0;
    }
  }

  /**
   * Obtiene todas las tasas para una fecha
   */
  static async getAllRatesForDate(date: string): Promise<{ bcv: number; usdt: number }> {
    const [bcv, usdt] = await Promise.all([
      this.getBCVRate(date),
      this.getUSDTRate(date)
    ]);
    
    return { bcv, usdt };
  }

  /**
   * Obtiene tasas históricas para un rango de fechas
   */
  static async getHistoricalRates(type: 'BCV' | 'USDT', days: number = 7): Promise<ExchangeRate[]> {
    try {
      const rates = await FirestoreService.getExchangeRates();
      const typeRates = rates.filter(r => r.type === type);
      
      // Ordenar por fecha descendente
      typeRates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Tomar las últimas N tasas
      return typeRates.slice(0, days);
    } catch (error) {
      console.error('Error getting historical rates:', error);
      return [];
    }
  }

  /**
   * Obtiene la tasa más reciente para un tipo específico
   */
  static async getMostRecentRate(type: 'BCV' | 'USDT'): Promise<ExchangeRate | null> {
    try {
      const rates = await FirestoreService.getExchangeRates();
      const typeRates = rates.filter(r => r.type === type);
      
      if (typeRates.length === 0) return null;
      
      // Ordenar por fecha descendente y tomar la más reciente
      typeRates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return typeRates[0];
    } catch (error) {
      console.error('Error getting most recent rate:', error);
      return null;
    }
  }

  /**
   * Obtiene la tasa de una fecha específica o la más cercana anterior
   */
  static async getRateForDate(type: 'BCV' | 'USDT', targetDate: string): Promise<number> {
    try {
      // Primero intentar obtener la tasa exacta
      const exactRate = await this.getExchangeRate(type, targetDate);
      if (exactRate) {
        return exactRate.rate;
      }
      
      // Si no hay tasa exacta, buscar la más cercana anterior
      const rates = await FirestoreService.getExchangeRates();
      const typeRates = rates.filter(r => r.type === type && r.date <= targetDate);
      
      if (typeRates.length === 0) return 0;
      
      // Ordenar por fecha descendente y tomar la más reciente
      typeRates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return typeRates[0].rate;
    } catch (error) {
      console.error('Error getting rate for date:', error);
      return 0;
    }
  }
}
