export interface ProductItem {
  id: string;
  nombre: string;
  categoria: string;
  precioUnitario?: number; // Opcional - se agrega en manage-stock
  cantidad?: number; // Stock actual
  stockMinimo?: number; // Alerta de bajo stock
  alertaBajoStock?: boolean;
  fechaCreacion: string;
  ultimaActualizacion?: string;
  precioUSD?: number; // Precio en USD (calculado)
  precioUSDT?: number; // Precio en USDT (calculado)
  tasaBCV?: number; // Tasa BCV usada
  tasaUSDT?: number; // Tasa USDT usada
  precioHistorico?: {
    fecha: string;
    precioUnitario: number; // Precio en Bs
    precioUSD: number; // Precio equivalente en USD
    tasaBCV: number; // Tasa BCV usada
    tasaUSDT: number; // Tasa USDT usada
    variacionUSD?: number; // Variación respecto al precio anterior en USD
  }[]; // Historial completo de precios con seguimiento en USD
}

export interface ExpenseRecord {
  id: string;
  descripcion: string;
  montoBs: number;
  montoUSD: number;
  montoUSDT: number;
  fecha: string;
  categoria: string;
  bcvRate: number;
  usdtRate: number;
  tipo: 'compra' | 'gasto' | 'salida' | 'entretenimiento' | 'transporte' | 'servicio' | 'salud' | 'educacion' | 'hogar' | 'otros'; // compra de inventario u otro gasto
  productos?: ProductItem[]; // si es compra, detalle de productos
}

export interface StockMovement {
  id: string;
  productoId: string;
  tipo: 'entrada' | 'salida'; // entrada por compra, salida por consumo
  cantidad: number;
  fecha: string;
  motivo: string;
  costoUnitarioBs?: number; // Costo unitario en bolívares para entradas
  precioActualizado?: number; // Nuevo precio si se actualizó junto con el stock
}

export interface ExchangeRate {
  id: string;
  type: 'BCV' | 'USDT';
  rate: number;
  date: string;
  timestamp: number;
}

export interface BCVRate {
  fecha: string;
  tasa: number; // 1 USD = X Bs
}

export interface USDTRate {
  fecha: string;
  tasa: number; // 1 USDT = X Bs
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface FilterOptions {
  period: 'todos' | 'hoy' | 'semanal' | 'quincenal' | 'mensual' | 'fecha';
  startDate?: string;
  endDate?: string;
  tipo?: string;
}

export interface DataService {
  // New methods
  getProducts(): Promise<ProductItem[]>;
  addProduct(product: Omit<ProductItem, 'id'>): Promise<ProductItem>;
  updateProduct(product: ProductItem): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  
  getExpenses(filter?: FilterOptions): Promise<ExpenseRecord[]>;
  addExpense(expense: Omit<ExpenseRecord, 'id'>): Promise<ExpenseRecord>;
  deleteExpense(id: string): Promise<void>;
  
  getStockMovements(): Promise<StockMovement[]>;
  addStockMovement(movement: Omit<StockMovement, 'id'>): Promise<StockMovement>;
  
  // Exchange rates
  getExchangeRates(): Promise<ExchangeRate[]>;
  addExchangeRate(rate: Omit<ExchangeRate, 'id'>): Promise<ExchangeRate>;
  getLatestExchangeRate(type: string): Promise<ExchangeRate | undefined>;
}
