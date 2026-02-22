import type { ExchangeRate } from '../types';
import { ExchangeRateService } from './exchangeRateService';

// Cache para tasas BCV y USDT
const bcvCache = new Map<string, { rate: number; timestamp: number }>();
const usdtCache = new Map<string, { rate: number; timestamp: number }>();

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Debounce para evitar múltiples llamadas simultáneas
const pendingRequests = new Map<string, Promise<number>>();

export class BCVService {
  /**
   * Obtiene la tasa del dólar BCV para una fecha específica
   * Si no se especifica fecha, usa la tasa actual
   */
  static async getBCVRate(date?: string): Promise<number> {
    const cacheKey = date || 'current';
    
    // Verificar si ya hay una petición en curso
    if (pendingRequests.has(`bcv_${cacheKey}`)) {
      return pendingRequests.get(`bcv_${cacheKey}`)!;
    }
    
    // Verificar cache primero (válido por 5 minutos)
    const cached = bcvCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.rate;
    }

    // Crear la petición y guardarla en pending
    const requestPromise = this.fetchBCVRate(date);
    pendingRequests.set(`bcv_${cacheKey}`, requestPromise);

    try {
      const rate = await requestPromise;
      return rate;
    } finally {
      // Limpiar la petición pendiente
      pendingRequests.delete(`bcv_${cacheKey}`);
    }
  }

  private static async fetchBCVRate(date?: string): Promise<number> {
    const cacheKey = date || 'current';

    try {
      // Intentar con múltiples APIs que permiten CORS
      let rate = 0;
      
      // Única API para BCV - DolarAPI Venezuela
      try {
        const response = await fetch('https://ve.dolarapi.com/v1/dolares', {
          method: 'GET',
          mode: 'cors',
        });
        
        if (response.ok) {
          const data = await response.json();
          // Buscar la tasa oficial (BCV)
          const oficialRate = data.find((item: any) => item.fuente === 'oficial');
          if (oficialRate) {
            rate = oficialRate.promedio || 0;
          }
        }
      } catch (error) {
        // API failed, using database fallback
      }

      if (rate === 0) {
        // Intentar obtener última tasa de la base de datos
        const fallbackRate = await this.getLastRateFromDatabase('BCV', date);
        if (fallbackRate > 0) {
          return fallbackRate;
        }
        throw new Error('Could not fetch BCV rate and no database fallback available');
      }

      // Guardar en cache y en BD
      bcvCache.set(cacheKey, { rate, timestamp: Date.now() });
      await this.saveRateToDatabase('BCV', rate, date);
      
      // Limpiar cache después de 5 minutos
      setTimeout(() => {
        bcvCache.delete(cacheKey);
      }, CACHE_DURATION);

      return rate;
    } catch (error) {
      console.error('Error fetching BCV rate:', error);
      // Intentar obtener última tasa de la base de datos
      const fallbackRate = await this.getLastRateFromDatabase('BCV', date);
      if (fallbackRate > 0) {
        return fallbackRate;
      }
      throw new Error('Could not fetch BCV rate and no database fallback available');
    }
  }

  /**
   * Obtiene la última tasa guardada en la base de datos
   */
  private static async getLastRateFromDatabase(type: 'BCV' | 'USDT', date?: string): Promise<number> {
    try {
      const dateToUse = date || new Date().toISOString().split('T')[0];
      
      if (type === 'BCV') {
        const rate = await ExchangeRateService.getBCVRate(dateToUse);
        return rate;
      } else {
        const rate = await ExchangeRateService.getUSDTRate(dateToUse);
        return rate;
      }
    } catch (error) {
      console.error('Error getting last rate from database:', error);
      return 0;
    }
  }

  /**
   * Obtiene la tasa del USDT de la API DolarAPI Venezuela (tasa paralelo)
   */
  static async getUSDTRate(date?: string): Promise<number> {
    const cacheKey = `usdt_${date || 'current'}`;
    
    // Verificar si ya hay una petición en curso
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }
    
    // Verificar cache primero (válido por 5 minutos)
    const cached = usdtCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.rate;
    }

    // Crear la petición y guardarla en pending
    const requestPromise = this.fetchUSDTRate(date);
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const rate = await requestPromise;
      return rate;
    } finally {
      // Limpiar la petición pendiente
      pendingRequests.delete(cacheKey);
    }
  }

  private static async fetchUSDTRate(date?: string): Promise<number> {
    const cacheKey = `usdt_${date || 'current'}`;

    try {
      let rate = 0;
      
      // Única API para USDT - DolarAPI Venezuela (tasa paralelo)
      try {
        const response = await fetch('https://ve.dolarapi.com/v1/dolares', {
          method: 'GET',
          mode: 'cors',
        });
        
        if (response.ok) {
          const data = await response.json();
          // Buscar la tasa paralelo (USDT P2P)
          const paraleloRate = data.find((item: any) => item.fuente === 'paralelo');
          if (paraleloRate) {
            rate = paraleloRate.promedio || 0;
          }
        }
      } catch (error) {
        // API failed, using database fallback
      }

      if (rate === 0) {
        // Intentar obtener última tasa de la base de datos
        const fallbackRate = await this.getLastRateFromDatabase('USDT', date);
        if (fallbackRate > 0) {
          return fallbackRate;
        }
        throw new Error('Could not fetch USDT rate and no database fallback available');
      }

      // Guardar en cache y en BD
      usdtCache.set(cacheKey, { rate, timestamp: Date.now() });
      await this.saveRateToDatabase('USDT', rate, date);
      
      // Limpiar cache después de 5 minutos
      setTimeout(() => {
        usdtCache.delete(cacheKey);
      }, CACHE_DURATION);

      return rate;
    } catch (error) {
      console.error('Error fetching USDT rate:', error);
      // Intentar obtener última tasa de la base de datos
      const fallbackRate = await this.getLastRateFromDatabase('USDT', date);
      if (fallbackRate > 0) {
        return fallbackRate;
      }
      throw new Error('Could not fetch USDT rate and no database fallback available');
    }
  }

  /**
   * Guarda una tasa en la base de datos
   */
  private static async saveRateToDatabase(type: 'BCV' | 'USDT', rate: number, date?: string): Promise<void> {
    try {
      const rateRecord: Omit<ExchangeRate, 'id'> = {
        type,
        rate,
        date: date || new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
      };
      
      await ExchangeRateService.saveExchangeRate(rateRecord);
    } catch (error) {
      console.error(`Error saving ${type} rate to database:`, error);
    }
  }

  
  /**
   * Obtiene ambas tasas (BCV y USDT)
   */
  static async getAllRates(date?: string): Promise<{ bcv: number; usdt: number }> {
    const [bcv, usdt] = await Promise.all([
      this.getBCVRate(date),
      this.getUSDTRate(date),
    ]);
    
    return { bcv, usdt };
  }

  /**
   * Convierte Bs a USD usando la tasa BCV
   */
  static convertBsToUSD(amountBs: number, rate: number): number {
    return amountBs / rate;
  }

  /**
   * Convierte USD a Bs usando la tasa BCV
   */
  static convertUSDToBs(amountUSD: number, rate: number): number {
    return amountUSD * rate;
  }

  /**
   * Convierte Bs a USDT usando la tasa USDT
   */
  static convertBsToUSDT(amountBs: number, usdtRate: number): number {
    return amountBs / usdtRate;
  }

  /**
   * Convierte USDT a Bs usando la tasa USDT
   */
  static convertUSDTToBs(amountUSDT: number, usdtRate: number): number {
    return amountUSDT * usdtRate;
  }

  /**
   * Formatea monto en Bs
   */
  static formatBs(amount: number): string {
    return `${amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs`;
  }

  /**
   * Formatea monto en USD
   */
  static formatUSD(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  /**
   * Formatea monto en USDT
   */
  static formatUSDT(amount: number): string {
    return `USDT ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  /**
   * Limpia el cache de tasas
   */
  static clearCache(): void {
    bcvCache.clear();
    usdtCache.clear();
  }

  /**
   * Limpia las peticiones pendientes (útil para errores)
   */
  static clearPendingRequests(): void {
    pendingRequests.clear();
  }

  /**
   * Verifica si una tasa está en cache y es válida
   */
  static isCached(type: 'BCV' | 'USDT', date?: string): boolean {
    const cacheKey = type === 'BCV' ? (date || 'current') : `usdt_${date || 'current'}`;
    const cache = type === 'BCV' ? bcvCache.get(cacheKey) : usdtCache.get(cacheKey);
    return cache !== undefined && Date.now() - cache.timestamp < CACHE_DURATION;
  }
}
