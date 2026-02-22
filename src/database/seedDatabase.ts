// 🗄️ **SEED DATABASE - INVCAS v4.0.0**
// Script para poblar la base de datos con ejemplos realistas

import { FirestoreService } from '../firebase/firestoreService';
import { ExchangeRateService } from '../services/exchangeRateService';

// Tasas de cambio realistas (Venezuela 2024)
const EXCHANGE_RATES = {
  bcv: 36.5,      // 1 USD = 36.5 Bs
  usdt: 35.8      // 1 USDT = 35.8 Bs
};

// 📦 **PRODUCTOS DE EJEMPLO**
const SAMPLE_PRODUCTS = [
  // 🥩 **Carnicería**
  {
    nombre: "Carne de Res Lomito",
    categoria: "Carnicería",
    cantidad: 2.5,
    precioUnitario: 280,
    stockAlert: 1,
    minimumStock: 1,
    precioHistory: []
  },
  {
    nombre: "Pollo Entero",
    categoria: "Carnicería",
    cantidad: 3,
    precioUnitario: 95,
    stockAlert: 1,
    minimumStock: 1,
    precioHistory: []
  },
  {
    nombre: "Chuletas de Cerdo",
    categoria: "Carnicería",
    cantidad: 1.8,
    precioUnitario: 120,
    stockAlert: 0.5,
    minimumStock: 1,
    precioHistory: []
  },

  // 🥬 **Frutas y Verduras**
  {
    nombre: "Tomates",
    categoria: "Frutas y Verduras",
    cantidad: 2,
    precioUnitario: 45,
    stockAlert: 0.5,
    minimumStock: 1,
    precioHistory: []
  },
  {
    nombre: "Cebollas",
    categoria: "Frutas y Verduras",
    cantidad: 1.5,
    precioUnitario: 38,
    stockAlert: 0.3,
    minimumStock: 0.5,
    precioHistory: []
  },
  {
    nombre: "Pimentones",
    categoria: "Frutas y Verduras",
    cantidad: 1,
    precioUnitario: 55,
    stockAlert: 0.2,
    minimumStock: 0.5,
    precioHistory: []
  },
  {
    nombre: "Aguacates",
    categoria: "Frutas y Verduras",
    cantidad: 4,
    precioUnitario: 85,
    stockAlert: 1,
    minimumStock: 2,
    precioHistory: []
  },

  // 🍞 **Panadería y Pastelería**
  {
    nombre: "Pan Frances",
    categoria: "Panadería y Pastelería",
    cantidad: 12,
    precioUnitario: 25,
    stockAlert: 3,
    minimumStock: 6,
    precioHistory: []
  },
  {
    nombre: "Arepa Harina Pan",
    categoria: "Panadería y Pastelería",
    cantidad: 2,
    precioUnitario: 180,
    stockAlert: 0.5,
    minimumStock: 1,
    precioHistory: []
  },

  // 🥛 **Lácteos**
  {
    nombre: "Leche Entera 1L",
    categoria: "Leches y Bebidas Vegetales",
    cantidad: 4,
    precioUnitario: 65,
    stockAlert: 1,
    minimumStock: 2,
    precioHistory: []
  },
  {
    nombre: "Queso Blanco",
    categoria: "Quesos y Yogures",
    cantidad: 0.8,
    precioUnitario: 220,
    stockAlert: 0.2,
    minimumStock: 0.5,
    precioHistory: []
  },
  {
    nombre: "Yogur Natural",
    categoria: "Quesos y Yogures",
    cantidad: 6,
    precioUnitario: 45,
    stockAlert: 1,
    minimumStock: 2,
    precioHistory: []
  },

  // 🥚 **Huevos**
  {
    nombre: "Huevos L",
    categoria: "Huevos",
    cantidad: 24,
    precioUnitario: 12,
    stockAlert: 6,
    minimumStock: 12,
    precioHistory: []
  },

  // 🍚 **Arroz, Pastas y Legumbres**
  {
    nombre: "Arroz Blanco",
    categoria: "Arroz, Pastas y Legumbres",
    cantidad: 5,
    precioUnitario: 85,
    stockAlert: 1,
    minimumStock: 2,
    precioHistory: []
  },
  {
    nombre: "Pasta Spaghetti",
    categoria: "Arroz, Pastas y Legumbres",
    cantidad: 3,
    precioUnitario: 120,
    stockAlert: 0.5,
    minimumStock: 1,
    precioHistory: []
  },
  {
    nombre: "Lentejas",
    categoria: "Arroz, Pastas y Legumbres",
    cantidad: 2,
    precioUnitario: 95,
    stockAlert: 0.5,
    minimumStock: 1,
    precioHistory: []
  },

  // 🧂 **Aceites, Vinagres y Condimentos**
  {
    nombre: "Aceite Comestible 900ml",
    categoria: "Aceites, Vinagres y Condimentos",
    cantidad: 1,
    precioUnitario: 380,
    stockAlert: 0.2,
    minimumStock: 0.5,
    precioHistory: []
  },
  {
    nombre: "Sal Refinada",
    categoria: "Aceites, Vinagres y Condimentos",
    cantidad: 2,
    precioUnitario: 28,
    stockAlert: 0.5,
    minimumStock: 1,
    precioHistory: []
  },

  // 🥤 **Bebidas**
  {
    nombre: "Refresco Cola 2L",
    categoria: "Refrescos y Aguas",
    cantidad: 3,
    precioUnitario: 150,
    stockAlert: 1,
    minimumStock: 2,
    precioHistory: []
  },
  {
    nombre: "Agua Mineral 1.5L",
    categoria: "Refrescos y Aguas",
    cantidad: 8,
    precioUnitario: 35,
    stockAlert: 2,
    minimumStock: 4,
    precioHistory: []
  },
  {
    nombre: "Jugo de Naranja 1L",
    categoria: "Jugos y Bebidas Naturales",
    cantidad: 4,
    precioUnitario: 85,
    stockAlert: 1,
    minimumStock: 2,
    precioHistory: []
  },

  // 🧹 **Limpieza**
  {
    nombre: "Detergente en Polvo",
    categoria: "Lavandería",
    cantidad: 1,
    precioUnitario: 450,
    stockAlert: 0.2,
    minimumStock: 0.5,
    precioHistory: []
  },
  {
    nombre: "Jabón Líquido para Manos",
    categoria: "Limpieza de Cocina y Baño",
    cantidad: 2,
    precioUnitario: 125,
    stockAlert: 0.5,
    minimumStock: 1,
    precioHistory: []
  },
  {
    nombre: "Cloro 1L",
    categoria: "Limpieza de Cocina y Baño",
    cantidad: 3,
    precioUnitario: 95,
    stockAlert: 0.5,
    minimumStock: 1,
    precioHistory: []
  },

  // 🧴 **Higiene Personal**
  {
    nombre: "Pasta Dental",
    categoria: "Cuidado Bucal",
    cantidad: 2,
    precioUnitario: 180,
    stockAlert: 0.5,
    minimumStock: 1,
    precioHistory: []
  },
  {
    nombre: "Shampoo",
    categoria: "Cuidado del Cabello",
    cantidad: 1,
    precioUnitario: 280,
    stockAlert: 0.2,
    minimumStock: 0.5,
    precioHistory: []
  },
  {
    nombre: "Papel Higiénico 4 rollos",
    categoria: "Higiene Femenina y Masculina",
    cantidad: 3,
    precioUnitario: 220,
    stockAlert: 1,
    minimumStock: 2,
    precioHistory: []
  },

  // 🏠 **Hogar**
  {
    nombre: "Pilas AA",
    categoria: "Hogar y Cocina",
    cantidad: 8,
    precioUnitario: 65,
    stockAlert: 2,
    minimumStock: 4,
    precioHistory: []
  },
  {
    nombre: "Bolsas de Basura",
    categoria: "Utensilios de Limpieza",
    cantidad: 2,
    precioUnitario: 85,
    stockAlert: 0.5,
    minimumStock: 1,
    precioHistory: []
  }
];

// 💳 **GASTOS DE EJEMPLO**
const SAMPLE_EXPENSES = [
  // 🛒 **Compras de Supermercado**
  {
    descripcion: "Compra semanal Makro",
    categoria: "Supermercado",
    montoBs: 3500,
    tipo: "compra",
    fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Mercal Local",
    categoria: "Supermercado",
    montoBs: 1250,
    tipo: "compra",
    fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Bodega del Barrio",
    categoria: "Supermercado",
    montoBs: 450,
    tipo: "compra",
    fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },

  // 🍽️ **Salidas a Comer**
  {
    descripcion: "Almuerzo McDonald's",
    categoria: "Comida Rápida",
    montoBs: 380,
    tipo: "salida",
    fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Cena en Pizza Hut",
    categoria: "Restaurante",
    montoBs: 850,
    tipo: "salida",
    fecha: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Areperas del Barrio",
    categoria: "Comida Rápida",
    montoBs: 180,
    tipo: "salida",
    fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },

  // 🚗 **Transporte**
  {
    descripcion: "Gasolina - Semana",
    categoria: "Combustible",
    montoBs: 1200,
    tipo: "transporte",
    fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Uber - Centro",
    categoria: "Transporte App",
    montoBs: 220,
    tipo: "transporte",
    fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Metro - Mensual",
    categoria: "Transporte Público",
    montoBs: 150,
    tipo: "transporte",
    fecha: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },

  // 🏥 **Salud**
  {
    descripcion: "Consulta Médica",
    categoria: "Salud",
    montoBs: 2500,
    tipo: "salud",
    fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Medicamentos Farmacia",
    categoria: "Farmacia",
    montoBs: 680,
    tipo: "salud",
    fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },

  // 🏠 **Hogar**
  {
    descripcion: "Electricidad - Mensual",
    categoria: "Servicios Básicos",
    montoBs: 850,
    tipo: "hogar",
    fecha: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Agua - Mensual",
    categoria: "Servicios Básicos",
    montoBs: 320,
    tipo: "hogar",
    fecha: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Internet - Mensual",
    categoria: "Servicios",
    montoBs: 450,
    tipo: "servicio",
    fecha: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },

  // 🎬 **Entretenimiento**
  {
    descripcion: "Netflix - Mensual",
    categoria: "Streaming",
    montoBs: 280,
    tipo: "entretenimiento",
    fecha: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Cine - 2 Entradas",
    categoria: "Cine",
    montoBs: 650,
    tipo: "entretenimiento",
    fecha: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },

  // 📚 **Educación**
  {
    descripcion: "Curso Online",
    categoria: "Educación",
    montoBs: 1200,
    tipo: "educacion",
    fecha: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Libros",
    categoria: "Educación",
    montoBs: 450,
    tipo: "educacion",
    fecha: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },

  // 🛒 **Otros Gastos**
  {
    descripcion: "Regalo Cumpleaños",
    categoria: "Regalos",
    montoBs: 800,
    tipo: "otros",
    fecha: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    descripcion: "Mecánico Auto",
    categoria: "Mantenimiento",
    montoBs: 1800,
    tipo: "otros",
    fecha: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

// **FUNCIÓN PRINCIPAL DE SEED**
export async function seedDatabase() {
  
  try {
    // Limpiar datos existentes (opcional)
    
    // Usar FirestoreService en lugar de db directo
    const existingProducts = await FirestoreService.getAllProducts();
    const existingExpenses = await FirestoreService.getAllExpenses();
    
    if (existingProducts.length > 0 || existingExpenses.length > 0) {
      await Promise.all([
        ...existingProducts.map(p => p.id ? FirestoreService.deleteProduct(p.id) : Promise.resolve()),
        ...existingExpenses.map(e => e.id ? FirestoreService.deleteExpense(e.id) : Promise.resolve())
      ]);
    }

    // **Insertar tasas de cambio iniciales**
    const today = new Date().toISOString().split('T')[0];
    
    await ExchangeRateService.saveExchangeRate({
      type: 'BCV',
      rate: EXCHANGE_RATES.bcv,
      date: today,
      timestamp: Date.now()
    });
    
    await ExchangeRateService.saveExchangeRate({
      type: 'USDT',
      rate: EXCHANGE_RATES.usdt,
      date: today,
      timestamp: Date.now()
    });

    // **Insertar productos**
    const productsWithCalculations = SAMPLE_PRODUCTS.map(product => ({
      ...product,
      precioUSD: EXCHANGE_RATES.bcv > 0 ? product.precioUnitario / EXCHANGE_RATES.bcv : 0,
      precioUSDT: EXCHANGE_RATES.usdt > 0 ? product.precioUnitario / EXCHANGE_RATES.usdt : 0,
      tasaBCV: EXCHANGE_RATES.bcv,
      tasaUSDT: EXCHANGE_RATES.usdt,
      variacionUSD: 0,
      precioHistorico: []
    }));
    
    for (const product of productsWithCalculations) {
      await FirestoreService.createProduct(product);
    }

    // **Insertar gastos**
    const expensesWithCalculations = SAMPLE_EXPENSES.map(expense => ({
      ...expense,
      montoUSD: EXCHANGE_RATES.bcv > 0 ? expense.montoBs / EXCHANGE_RATES.bcv : 0,
      montoUSDT: EXCHANGE_RATES.usdt > 0 ? expense.montoBs / EXCHANGE_RATES.usdt : 0,
      createdAt: new Date().toISOString()
    }));
    
    for (const expense of expensesWithCalculations) {
      await FirestoreService.createExpense(expense);
    }

    // **Estadísticas**
    const totalProducts = productsWithCalculations.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);
    const totalExpenses = expensesWithCalculations.reduce((sum, e) => sum + e.montoBs, 0);
    
    return {
      success: true,
      message: `Base de datos creada con ${productsWithCalculations.length} productos y ${expensesWithCalculations.length} gastos`,
      stats: {
        products: productsWithCalculations.length,
        expenses: expensesWithCalculations.length,
        totalInventoryValue: totalProducts,
        totalExpensesValue: totalExpenses
      }
    };

  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// **FUNCIÓN PARA VERIFICAR DATOS**
export async function verifySeedData() {
  
  try {
    const products = await FirestoreService.getAllProducts();
    const expenses = await FirestoreService.getAllExpenses();
    
    return {
      success: true,
      products: products.length,
      expenses: expenses.length,
      sampleProducts: products.slice(0, 3).map((p: any) => ({
        name: p.nombre,
        quantity: p.cantidad,
        price: p.precioUnitario,
        total: (p.cantidad * p.precioUnitario).toFixed(2)
      })),
      sampleExpenses: expenses.slice(0, 3).map((e: any) => ({
        description: e.descripcion,
        amount: e.montoBs,
        category: e.categoria
      }))
    };
    
  } catch (error) {
    console.error('Error verificando datos:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// **EXPORTAR FUNCIONES**
export default {
  seedDatabase,
  verifySeedData,
  SAMPLE_PRODUCTS,
  SAMPLE_EXPENSES,
  EXCHANGE_RATES
};
