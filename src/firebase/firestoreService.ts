// ✅ FIREBASE CDN - INVCAS v4.0.0
// Usando Firebase global desde CDN

import { db } from './config';

// Interfaces para los datos
export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  precioUnitario: number;
  precioUSD: number;
  precioUSDT: number;
  stockAlert: number;
  minimumStock: number;
  unidadMedicion?: string; // Nueva: unidad de medición (opcional para compatibilidad)
  createdAt: any; // Timestamp de Firebase
  updatedAt: any; // Timestamp de Firebase
  precioHistory: PriceHistory[];
}

export interface PriceHistory {
  fecha: any; // Timestamp de Firebase
  precioUnitario: number;
  precioUSD: number;
  precioUSDT: number;
  tasaBCV: number;
  tasaUSDT: number;
  variacionUSD: number;
}

export interface Expense {
  id: string;
  descripcion: string;
  categoria: string;
  montoBs: number;
  montoUSD: number;
  montoUSDT: number;
  tipo: string;
  fecha: string;
  createdAt: any; // Timestamp de Firebase
}

export interface ExchangeRate {
  id: string;
  type: 'BCV' | 'USDT';
  rate: number;
  date: string; // YYYY-MM-DD format
  timestamp: number;
}

// Colecciones
const PRODUCTS_COLLECTION = 'products';
const EXPENSES_COLLECTION = 'expenses';
const EXCHANGE_RATES_COLLECTION = 'exchange_rates';

// Servicios de Firestore con sintaxis CDN
export class FirestoreService {
  // Productos
  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'precioHistory'>): Promise<string> {
    const docRef = db.collection(PRODUCTS_COLLECTION).doc();
    const newProduct: Product = {
      ...product,
      id: docRef.id,
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now(),
      precioHistory: []
    };
    
    await docRef.set(newProduct);
    return docRef.id;
  }

  static async getAllProducts(): Promise<Product[]> {
    const querySnapshot = await db.collection(PRODUCTS_COLLECTION).orderBy('createdAt', 'desc').get();
    
    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  }

  static async getProduct(id: string): Promise<Product | null> {
    const docRef = db.collection(PRODUCTS_COLLECTION).doc(id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;
    }
    
    return null;
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const docRef = db.collection(PRODUCTS_COLLECTION).doc(id);
    await docRef.update({
      ...updates,
      updatedAt: firebase.firestore.Timestamp.now()
    });
  }

  static async deleteProduct(id: string): Promise<void> {
    const docRef = db.collection(PRODUCTS_COLLECTION).doc(id);
    await docRef.delete();
  }

  static async searchProducts(searchTerm: string): Promise<Product[]> {
    const querySnapshot = await db.collection(PRODUCTS_COLLECTION)
      .where('nombre', '>=', searchTerm)
      .where('nombre', '<=', searchTerm + '\uf8ff')
      .orderBy('nombre')
      .limit(20)
      .get();
    
    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  }

  // Gastos
  static async createExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<string> {
    const docRef = db.collection(EXPENSES_COLLECTION).doc();
    const newExpense: Expense = {
      ...expense,
      id: docRef.id,
      createdAt: firebase.firestore.Timestamp.now()
    };
    
    await docRef.set(newExpense);
    return docRef.id;
  }

  static async getAllExpenses(): Promise<Expense[]> {
    const querySnapshot = await db.collection(EXPENSES_COLLECTION).orderBy('createdAt', 'desc').get();
    
    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    } as Expense));
  }

  static async deleteExpense(id: string): Promise<void> {
    const docRef = db.collection(EXPENSES_COLLECTION).doc(id);
    await docRef.delete();
  }

  static async searchExpenses(searchTerm: string): Promise<Expense[]> {
    const querySnapshot = await db.collection(EXPENSES_COLLECTION)
      .where('descripcion', '>=', searchTerm)
      .where('descripcion', '<=', searchTerm + '\uf8ff')
      .orderBy('descripcion')
      .limit(20)
      .get();
    
    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    } as Expense));
  }

  // Tasas de Cambio
  static async createExchangeRate(rate: Omit<ExchangeRate, 'id'>): Promise<string> {
    const docRef = db.collection(EXCHANGE_RATES_COLLECTION).doc();
    const newRate: ExchangeRate = {
      ...rate,
      id: docRef.id
    };
    
    await docRef.set(newRate);
    return docRef.id;
  }

  static async getExchangeRates(): Promise<ExchangeRate[]> {
    const querySnapshot = await db.collection(EXCHANGE_RATES_COLLECTION)
      .orderBy('timestamp', 'desc')
      .get();
    
    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    } as ExchangeRate));
  }

  static async updateExchangeRate(id: string, updates: Partial<ExchangeRate>): Promise<void> {
    await db.collection(EXCHANGE_RATES_COLLECTION).doc(id).update(updates);
  }

  static async deleteExchangeRate(id: string): Promise<void> {
    await db.collection(EXCHANGE_RATES_COLLECTION).doc(id).delete();
  }
}

export default FirestoreService;
