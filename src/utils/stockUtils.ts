// Utility functions for stock display with units

export const formatStockWithUnit = (cantidad: number, unidadMedicion: string = 'unid'): string => {
  const unit = getUnitDisplay(unidadMedicion);
  
  if (cantidad === 0 || cantidad === undefined) return `0 ${unit}`;
  
  // Handle decimal display
  if (cantidad % 1 !== 0) {
    return `${cantidad} ${unit}`;
  }
  
  return `${cantidad} ${unit}`;
};

export const getUnitDisplay = (unidadMedicion: string): string => {
  switch (unidadMedicion) {
    case 'kg':
      return 'kg';
    case 'lt':
      return 'lt';
    case 'unid':
    default:
      return 'unid';
  }
};
