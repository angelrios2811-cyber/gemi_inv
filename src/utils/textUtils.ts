// 📝 **UTILIDADES DE TEXTO - INVCAS v4.0.0**
// Funciones para formatear texto

/**
 * Manejador de input para capitalizar automáticamente
 */
export function handleCapitalization(
  value: string, 
  type: 'first-word' | 'all-words' = 'first-word'
): string {
  if (!value) return '';
  
  // Si el usuario está escribiendo rápidamente, no capitalizar aún
  if (value.length < 2) {
    return value.toUpperCase();
  }
  
  // Para la primera letra, siempre capitalizar
  if (type === 'first-word') {
    const firstChar = value.charAt(0).toUpperCase();
    const rest = value.slice(1).toLowerCase();
    return firstChar + rest;
  }
  
  // Para todas las palabras
  return value
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
