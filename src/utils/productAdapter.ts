// 🔄 **ADAPTER PARA COMPATIBILIDAD FIREBASE - INVCAS v4.0.0**
// Convierte entre interfaces Firebase y locales

export interface ProductAdapter {
  // Firebase properties
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  precioUnitario: number;
  precioUSD: number;
  precioUSDT: number;
  stockAlert: number;
  minimumStock: number;
  createdAt: any;
  updatedAt: any;
  precioHistory: any[];
  
  // Local compatibility properties (computed)
  alertaBajoStock: boolean;
  stockMinimo: number;
  fechaCreacion: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

export const adaptFirebaseToLocal = (product: any): ProductAdapter => {
  return {
    ...product,
    // Local compatibility
    alertaBajoStock: product.stockAlert > 0,
    stockMinimo: product.minimumStock,
    fechaCreacion: product.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    name: product.nombre,
    category: product.categoria,
    quantity: product.cantidad,
    price: product.precioUnitario
  };
};

export const adaptLocalToFirebase = (product: any) => {
  return {
    nombre: product.nombre || product.name,
    categoria: product.categoria || product.category,
    cantidad: product.cantidad || product.quantity,
    precioUnitario: product.precioUnitario || product.price,
    precioUSD: product.precioUSD || (product.precioUnitario / 36.5),
    precioUSDT: product.precioUSDT || (product.precioUnitario / 35.8),
    stockAlert: product.alertaBajoStock ? product.stockMinimo : 0,
    minimumStock: product.stockMinimo,
    updatedAt: firebase.firestore.Timestamp.now()
  };
};
