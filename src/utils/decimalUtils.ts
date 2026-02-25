// 🔄 **UTILIDADES PARA MANEJO DE DECIMALES**
// Evita problemas de precisión de punto flotante de JavaScript

/**
 * Redondea un número a una cantidad específica de decimales
 * @param number - Número a redondear
 * @param decimals - Cantidad de decimales (default: 3)
 * @returns Número redondeado
 */
export function roundToDecimals(number: number, decimals: number = 3): number {
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
}

/**
 * Formatea un número a una cantidad específica de decimales como string
 * @param number - Número a formatear
 * @param decimals - Cantidad de decimales (default: 3)
 * @returns String formateado con decimales exactos
 */
export function formatNumber(number: number, decimals: number = 3): string {
  return roundToDecimals(number, decimals).toFixed(decimals);
}

/**
 * Suma dos números con redondeo a decimales específicos
 * @param a - Primer número
 * @param b - Segundo número
 * @param decimals - Cantidad de decimales (default: 3)
 * @returns Suma redondeada
 */
export function addNumbers(a: number, b: number, decimals: number = 3): number {
  return roundToDecimals(a + b, decimals);
}

/**
 * Resta dos números con redondeo a decimales específicos
 * @param a - Primer número
 * @param b - Segundo número
 * @param decimals - Cantidad de decimales (default: 3)
 * @returns Resta redondeada
 */
export function subtractNumbers(a: number, b: number, decimals: number = 3): number {
  return roundToDecimals(a - b, decimals);
}

/**
 * Multiplica dos números con redondeo a decimales específicos
 * @param a - Primer número
 * @param b - Segundo número
 * @param decimals - Cantidad de decimales (default: 2 para precios)
 * @returns Multiplicación redondeada
 */
export function multiplyNumbers(a: number, b: number, decimals: number = 2): number {
  return roundToDecimals(a * b, decimals);
}
