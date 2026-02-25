// 🧹 **LIMPIEZA DE LOCALSTORAGE - INVCAS v4.0.0**
// Función para limpiar todos los datos locales y forzar uso de Firebase

export function clearAllLocalStorage() {
  // Eliminar productos locales
  localStorage.removeItem('products');
  
  // Eliminar gastos locales
  localStorage.removeItem('expenses');
  
  // Eliminar datos de autenticación locales
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('users');
  
  // Eliminar tasas de cambio locales
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('rates_')) {
      localStorage.removeItem(key);
    }
  });
}

export default clearAllLocalStorage;
