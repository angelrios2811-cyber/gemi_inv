import { useEffect, useState } from 'react';
import { Search, X, Edit, Trash2, TrendingUp, TrendingDown, Minus, DollarSign, Package, AlertTriangle, Calendar, ArrowLeft, CheckCircle } from 'lucide-react';
import { useMultiUserFirestoreStore } from '../store/useMultiUserFirestoreStore';
import { BCVService } from '../services/bcvService';
import { scrollToTop } from '../utils/scrollUtils';
import { formatStockWithUnit } from '../utils/stockUtils';
import { Link } from 'react-router-dom';
import ExchangeRatesHeader from '../components/ExchangeRatesHeader';
import UserFilter from '../components/UserFilter';
import { adaptFirebaseToLocal } from '../utils/productAdapter';
import { getUnitDisplay } from '../utils/stockUtils';
import { handleCapitalization } from '../utils/textUtils';
import { AutomaticExpenseService } from '../services/automaticExpenseService';
import type { ProductItem } from '../types';

export function InventoryPage() {
  const { 
    products, 
    deleteProduct,
    updateProduct
  } = useMultiUserFirestoreStore();

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editMessage, setEditMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [rates, setRates] = useState({ bcv: 0, usdt: 0 });
  const [loadingRates, setLoadingRates] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    categoria: '',
    alertaBajoStock: false,
    stockMinimo: 1,
    unidadMedicion: 'unid' // Nueva: unidad de medición por defecto
  });

  // Filter products based on search term and selected user
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      product.nombre.toLowerCase().includes(searchLower) ||
      product.categoria.toLowerCase().includes(searchLower)
    );
    
    // If admin and user is selected, filter by user
    const matchesUser = !selectedUserId || product.userId === selectedUserId;
    
    return matchesSearch && matchesUser;
  });

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Inline PriceHistoryChart component
  const PriceHistoryChart = ({ product }: { product: ProductItem }) => {
    const [showDetails, setShowDetails] = useState(false);

    if (!product.precioHistorico || product.precioHistorico.length === 0) {
      return (
        <div className="text-white/40 text-sm">
          Sin historial de precios
        </div>
      );
    }

    // Fix: Compare last two records for variation total
    const latest = product.precioHistorico?.[product.precioHistorico.length - 1];
    const previous = product.precioHistorico?.[product.precioHistorico.length - 2];
    const variacionTotal = (latest?.precioUSD || 0) - (previous?.precioUSD || 0);
    const variacionPorcentual = previous?.precioUSD ? ((variacionTotal / previous.precioUSD) * 100).toFixed(1) : '0';

    const getVariationIcon = () => {
      if (variacionTotal > 0) return <TrendingUp size={16} className="text-green-400" />;
      if (variacionTotal < 0) return <TrendingDown size={16} className="text-red-400" />;
      return <Minus size={16} className="text-white/40" />;
    };

    const getVariationColor = () => {
      if (variacionTotal > 0) return 'text-green-400';
      if (variacionTotal < 0) return 'text-red-400';
      return 'text-white/40';
    };

    const calculateAveragePrice = () => {
      if (!product.precioHistorico?.length) return 0;
      const total = product.precioHistorico.reduce((sum, p) => sum + (p.precioUSD || 0), 0);
      return total / product.precioHistorico.length;
    };

    const getHighestPrice = () => {
      if (!product.precioHistorico?.length) return null;
      return product.precioHistorico.reduce((max, p) => 
        (p.precioUSD || 0) > (max?.precioUSD || 0) ? p : max, product.precioHistorico[0]);
    };

    const getLowestPrice = () => {
      if (!product.precioHistorico?.length) return null;
      return product.precioHistorico.reduce((min, p) => 
        (p.precioUSD || 0) < (min?.precioUSD || 0) ? p : min, product.precioHistorico[0]);
    };

    return (
      <>
        <div className="space-y-3">
          {/* Resumen */}
          <div 
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setShowDetails(!showDetails)}
          >
            <div className="flex items-center gap-2">
              {getVariationIcon()}
              <div>
                <div className="text-white font-medium text-sm">
                  Variación Total
                </div>
                <div className={`text-xs ${getVariationColor()}`}>
                  {variacionTotal > 0 ? '+' : ''}{variacionTotal.toFixed(2)} USD ({variacionPorcentual}%)
                </div>
              </div>
            </div>
            <div className="text-violet-400">
              {showDetails ? '▲' : '▼'}
            </div>
          </div>

          {/* Historial de Precios */}
          <div className="space-y-2">
            <div className="text-white/60 text-xs font-medium">Historial reciente</div>
            {Array.from(product.precioHistorico || []).reverse().slice(0, 2).map((precio, index) => {
              const actualIndex = (product.precioHistorico || []).length - 1 - index;
              // Don't show variation for the most recent record
              const variacion = actualIndex > 0 ? (precio.precioUSD || 0) - (product.precioHistorico?.[actualIndex - 1]?.precioUSD || 0) : 0;
              
              return (
                <div key={actualIndex} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                  <div className="flex-1">
                    <div className="text-white text-sm">
                      {new Date(precio.fecha).toLocaleDateString('es-VE', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-white/60 text-xs">
                      {BCVService.formatBs(precio.precioUnitario)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium text-sm">
                      ${precio.precioUSD.toFixed(2)}
                    </div>
                    {variacion !== 0 && (
                      <div className={`text-xs ${variacion > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {variacion > 0 ? '+' : ''}{variacion.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón para ver más detalles */}
          {(product.precioHistorico?.length || 0) > 2 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors"
            >
              {showDetails ? 'Mostrar menos' : `Mostrar todos (${product.precioHistorico?.length || 0} registros)`}
            </button>
          )}

          {/* Análisis Completo (reemplaza el modal) */}
          {showDetails && (
            <div className="space-y-4">
              {/* Información del Producto */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Package size={16} className="text-violet-400" />
                  Información del Producto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-white/60 text-xs mb-1">Stock Actual</div>
                    <div className="text-white font-medium">{product.cantidad || 0} unidades</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-xs mb-1">Precio Actual</div>
                    <div className="text-white font-medium">
                      {BCVService.formatBs(product.precioUnitario || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/60 text-xs mb-1">Precio USD</div>
                    <div className="text-white font-medium">
                      ${product.precioUSD?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/60 text-xs mb-1">Última Actualización</div>
                    <div className="text-white font-medium text-xs">
                      {product.ultimaActualizacion 
                        ? new Date(product.ultimaActualizacion).toLocaleDateString('es-VE', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Variación */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <DollarSign size={16} className="text-green-400" />
                  Estadísticas de Precios
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-white/60 text-xs mb-1">Variación Total</div>
                    <div className={`font-medium ${getVariationColor()}`}>
                      {variacionTotal > 0 ? '+' : ''}{variacionTotal.toFixed(2)} USD
                    </div>
                    <div className={`text-xs ${getVariationColor()}`}>
                      ({variacionPorcentual}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-white/60 text-xs mb-1">Precio Promedio</div>
                    <div className="text-white font-medium">
                      ${calculateAveragePrice().toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/60 text-xs mb-1">Precio Más Alto</div>
                    <div className="text-green-400 font-medium">
                      ${getHighestPrice()?.precioUSD.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-green-400 text-xs">
                      {getHighestPrice() 
                        ? new Date(getHighestPrice()!.fecha).toLocaleDateString('es-VE', {
                            day: 'numeric',
                            month: 'short'
                          })
                        : ''
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-white/60 text-xs mb-1">Precio Más Bajo</div>
                    <div className="text-red-400 font-medium">
                      ${getLowestPrice()?.precioUSD.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-red-400 text-xs">
                      {getLowestPrice() 
                        ? new Date(getLowestPrice()!.fecha).toLocaleDateString('es-VE', {
                            day: 'numeric',
                            month: 'short'
                          })
                        : ''
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial Completo */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-400" />
                  Historial Completo de Precios
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Array.from(product.precioHistorico || []).reverse().map((precio, reverseIndex) => {
                    // Don't show variation for the most recent record (reverseIndex 0)
                    // Calculate variation vs the next record in the reversed array (which is chronologically previous)
                    const variacion = reverseIndex > 0 
                      ? (precio.precioUSD || 0) - (Array.from(product.precioHistorico || []).reverse()[reverseIndex - 1]?.precioUSD || 0)
                      : 0;
                    
                    return (
                      <div key={reverseIndex} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
                        <div className="flex-1">
                          <div className="text-white text-sm">
                            {new Date(precio.fecha).toLocaleDateString('es-VE', { 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="text-white/60 text-xs">
                            Tasa BCV: {precio.tasaBCV?.toFixed(2) || 'N/A'} | {BCVService.formatBs(precio.precioUnitario)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium text-sm">
                            ${precio.precioUSD.toFixed(2)}
                          </div>
                          {variacion !== 0 && (
                            <div className={`text-xs ${variacion > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {variacion > 0 ? '+' : ''}{variacion.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          </div>
      </>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { bcv, usdt } = await BCVService.getAllRates();
        setRates({ bcv, usdt });
      } catch (error) {
        console.error('Error fetching rates:', error);
      } finally {
        setLoadingRates(false);
      }
    };
    
    fetchData();
    
    // Load products based on selected user
    if (selectedUserId) {
      // Admin selected a specific user - load that user's products
      const { loadUserProducts } = useMultiUserFirestoreStore.getState();
      loadUserProducts(selectedUserId);
    } else {
      // Load all products (admin view)
      const { loadAllProducts } = useMultiUserFirestoreStore.getState();
      loadAllProducts();
    }
  }, [selectedUserId]);

  const handleDelete = (product: any) => {
    scrollToTop();
    setDeletingProduct(product);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    
    try {
      await deleteProduct(deletingProduct.id);
      
      setDeleteMessage({
        type: 'success',
        message: `Producto "${deletingProduct.nombre}" eliminado`
      });
      scrollToTop();
      
      // Cerrar modal después de mostrar éxito
      setTimeout(() => {
        setDeletingProduct(null);
        setDeleteMessage(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting product:', error);
      setDeleteMessage({
        type: 'error',
        message: 'Error al eliminar el producto. Inténtalo de nuevo.'
      });
      scrollToTop();
    }
  };

  const cancelDelete = () => {
    setDeletingProduct(null);
    setDeleteMessage(null);
  };

  const handleEdit = (product: any) => {
    scrollToTop();
    const adaptedProduct = adaptFirebaseToLocal(product);
    setEditingProduct(product);
    setEditForm({
      nombre: adaptedProduct.nombre,
      categoria: adaptedProduct.categoria,
      alertaBajoStock: adaptedProduct.alertaBajoStock,
      stockMinimo: adaptedProduct.stockMinimo,
      unidadMedicion: adaptedProduct.unidadMedicion || 'unid'
    });
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
    setEditMessage(null);
    setEditForm({
      nombre: '',
      categoria: '',
      alertaBajoStock: false,
      stockMinimo: 1,
      unidadMedicion: 'unid'
    });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editForm.nombre || !editForm.categoria) return;
    
    setEditLoading(true);
    setEditMessage(null);
    
    try {
      // Actualizar el producto
      await updateProduct(editingProduct.id, {
        nombre: editForm.nombre,
        categoria: editForm.categoria,
        alertaBajoStock: editForm.alertaBajoStock,
        stockMinimo: editForm.stockMinimo,
        unidadMedicion: editForm.unidadMedicion
      });
      
      // Obtener datos actualizados del producto
      const updatedProducts = products;
      const updatedProduct = updatedProducts.find(p => p.id === editingProduct.id);
      
      if (updatedProduct) {
        // Analizar cambios y crear gasto automático solo si hay aumento de stock
        const stockIncreased = (updatedProduct.cantidad || 0) > (editingProduct.cantidad || 0);
        
        if (stockIncreased) {
          await AutomaticExpenseService.analyzeProductChanges(
            editingProduct.id,
            editingProduct,
            {
              ...editingProduct,
              cantidad: updatedProduct.cantidad || 0,
              precioUnitario: updatedProduct.precioUnitario || 0,
              unidadMedicion: editForm.unidadMedicion
            }
          );
        }
      }
      
      setEditMessage({ type: 'success', message: `Producto "${editForm.nombre}" actualizado correctamente` });
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        handleCloseEdit();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating product:', error);
      setEditMessage({ type: 'error', message: 'Error al actualizar el producto. Inténtalo de nuevo.' });
    } finally {
      setEditLoading(false);
    }
  };

  const getStockStatus = (product: any) => {
    if (!product.alertaBajoStock || !product.stockMinimo) return 'normal';
    if ((product.cantidad || 0) === 0) return 'critical';
    if ((product.cantidad || 0) <= product.stockMinimo) return 'warning';
    return 'normal';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      default: return 'text-green-400';
    }
  };

  const getShoppingListItems = () => {
    return products.filter(product => 
      product.alertaBajoStock && 
      product.stockMinimo && 
      product.cantidad !== undefined && 
      product.cantidad <= product.stockMinimo
    ).sort((a, b) => {
      // Urgentes (stock = 0) primero
      const aIsUrgent = (a.cantidad || 0) === 0;
      const bIsUrgent = (b.cantidad || 0) === 0;
      
      if (aIsUrgent && !bIsUrgent) return -1;  // a viene primero
      if (!aIsUrgent && bIsUrgent) return 1;   // b viene primero
      
      // Si ambos son urgentes o ambos son mínimo, ordenar por nombre
      return a.nombre.localeCompare(b.nombre);
    });
  };

  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.precioUnitario || 0) * (p.cantidad || 0)), 0);

  // Calculate current inventory value using current rates
  const currentInventoryValueBs = totalInventoryValue;
  const currentInventoryValueUSD = !loadingRates && rates.bcv > 0 ? currentInventoryValueBs / rates.bcv : 0;
  const currentInventoryValueUSDT = !loadingRates && rates.usdt > 0 ? currentInventoryValueBs / rates.usdt : 0;

  const shoppingListItems = getShoppingListItems();

  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ zIndex: 1 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg glass hover:bg-white/10 transition-colors duration-200">
            <ArrowLeft size={20} className="text-white/60" />
          </Link>
          <h1 className="text-lg font-semibold text-white">Inventario</h1>
        </div>
      </div>

      {/* Exchange Rates Header */}
      <ExchangeRatesHeader compact={true} />

      {/* User Filter - Solo visible para admins */}
      <UserFilter 
        selectedUserId={selectedUserId}
        onUserChange={setSelectedUserId}
        className="glass p-4"
      />
      
      {/* Stats */}
      <div className="glass p-4">
        <div className="flex items-center gap-2 mb-2">
          <Package size={14} className="text-violet-400" />
          <span className="text-white/40 text-xs font-medium">Productos registrados</span>
        </div>
        <p className="text-xl font-bold text-white">
          {products.length}
        </p>
      </div>

        {/* Shopping List */}
      {shoppingListItems.length > 0 && (
        <div className="glass p-4 rounded-xl border border-white/10" style={{ zIndex: 1 }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Package size={20} className="text-amber-400" />
            Lista de Compras
          </h2>
          <div className="space-y-2">
            {shoppingListItems.map((item: any) => {
              const currentStock = item.cantidad || 0;
              const minStock = item.stockMinimo || 1;
              const targetStock = minStock + 1; // Mínimo + 1 para estar por encima del mínimo
              const neededQuantity = targetStock - currentStock;
              const isUrgent = currentStock === 0;
              
              // Mostrar siempre si está en el mínimo o por debajo
              // Pero con diferentes estilos según urgencia
              
              return (
                <div key={item.id} className={`flex items-center justify-between p-2 rounded-lg ${isUrgent ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isUrgent ? 'text-red-300' : 'text-amber-300'}`}>{item.nombre}</span>
                        {isUrgent ? (
                          <>
                            <span className="text-xs font-bold text-red-400">+{neededQuantity}</span>
                            <span className="text-xs text-red-400 font-bold">¡URGENTE!</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-amber-400">+{neededQuantity}</span>
                            <span className="text-xs text-amber-400">Mínimo</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-white/40">
                      Actual: {currentStock} | Mínimo: {minStock}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${isUrgent ? 'text-red-300' : 'text-amber-300'}`}>
                      {item.precioUnitario && item.precioUnitario > 0 
                        ? BCVService.formatBs(item.precioUnitario * neededQuantity)
                        : 'N/A'
                      }
                    </div>
                    <div className={`text-xs ${isUrgent ? 'text-red-400/60' : 'text-amber-400/60'}`}>
                      {isUrgent ? 'Urgente' : 'Mínimo stock'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="space-y-2">
              {/* Total Urgentes */}
              {shoppingListItems.some(item => (item.cantidad || 0) === 0) && (
                <div className="flex justify-between items-center">
                  <span className="text-red-400 font-medium">Total urgentes:</span>
                  <span className="text-red-300 font-bold">
                    {BCVService.formatBs(shoppingListItems.reduce((sum, item: any) => {
                      const currentStock = item.cantidad || 0;
                      const minStock = item.stockMinimo || 1;
                      const targetStock = minStock + 1;
                      const neededQuantity = targetStock - currentStock;
                      
                      // Solo sumar si es urgente (stock = 0)
                      if (currentStock !== 0) return sum;
                      
                      if (item.precioUnitario && item.precioUnitario > 0) {
                        return sum + (item.precioUnitario * neededQuantity);
                      }
                      return sum;
                    }, 0))}
                  </span>
                </div>
              )}
              
              {/* Total Mínimo Stock */}
              {shoppingListItems.some(item => (item.cantidad || 0) > 0 && (item.cantidad || 0) <= (item.stockMinimo || 1)) && (
                <div className="flex justify-between items-center">
                  <span className="text-amber-400 font-medium">Total mínimo stock:</span>
                  <span className="text-amber-300 font-bold">
                    {BCVService.formatBs(shoppingListItems.reduce((sum, item: any) => {
                      const currentStock = item.cantidad || 0;
                      const minStock = item.stockMinimo || 1;
                      const targetStock = minStock + 1;
                      const neededQuantity = targetStock - currentStock;
                      
                      // Solo sumar si está en mínimo stock pero no es urgente
                      if (currentStock === 0 || currentStock > (item.stockMinimo || 1)) return sum;
                      
                      if (item.precioUnitario && item.precioUnitario > 0) {
                        return sum + (item.precioUnitario * neededQuantity);
                      }
                      return sum;
                    }, 0))}
                  </span>
                </div>
              )}
              
              {/* Total General */}
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-white font-medium">Total general:</span>
                <span className="text-white font-bold text-lg">
                  {BCVService.formatBs(shoppingListItems.reduce((sum, item: any) => {
                    const currentStock = item.cantidad || 0;
                    const minStock = item.stockMinimo || 1;
                    const targetStock = minStock + 1;
                    const neededQuantity = targetStock - currentStock;
                    
                    // Sumar costo de compra necesaria para todos los items
                    // Tanto urgentes como mínimo stock (mínimo + 1)
                    if (item.precioUnitario && item.precioUnitario > 0) {
                      return sum + (item.precioUnitario * neededQuantity);
                    }
                    return sum;
                  }, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="glass p-4">
        <div className="relative">
          <Search 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" 
          />
          <input
            type="text"
            placeholder="Buscar productos por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-white/40" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-xs text-white/40">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </div>
        )}
      </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-4" style={{ zIndex: 1 }}>
          {filteredProducts.length === 0 && searchTerm ? (
            <div className="glass p-8 text-center">
              <Search size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-lg">No se encontraron productos</p>
              <p className="text-white/20 text-sm mt-2">
                "{searchTerm}" no coincide con ningún nombre o categoría
              </p>
            </div>
          ) : (
            filteredProducts.map((product: any) => {
              const status = getStockStatus(product);
              return (
              <div key={product.id} className="glass p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-bold text-xl">{product.nombre}</h3>
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-medium">
                        {product.categoria}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getStockStatusColor(status)}`}>
                      Stock: {formatStockWithUnit(product.cantidad || 0, product.unidadMedicion)}
                    </div>
                    {product.stockAlert > 0 && (
                      <div className="text-xs text-white/50 mt-1 bg-white/5 rounded px-2 py-1 inline-block">
                        Mínimo: {formatStockWithUnit(product.minimumStock, product.unidadMedicion)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Card */}
                <div className="bg-white/3 backdrop-blur-md rounded-xl p-4 border border-white/10 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.precioUnitario && product.precioUnitario > 0 ? 'bg-violet-400' : 'bg-red-400'}`}></div>
                      <span className="text-white/70 text-sm font-medium">
                        {product.precioUnitario && product.precioUnitario > 0 ? 'Precio Actual' : 'Carga el precio del producto'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">
                        {product.precioUnitario ? BCVService.formatBs(product.precioUnitario) : '0,00 Bs'}
                      </div>
                      {!loadingRates && rates.bcv > 0 && (
                        <div className="flex gap-4 text-sm mt-1">
                          <span className="text-violet-300 font-medium">
                            BCV {((product.precioUnitario || 0) / rates.bcv).toFixed(3)}
                          </span>
                          <span className="text-blue-300 font-medium">
                            {BCVService.formatUSDT(rates.usdt > 0 ? (product.precioUnitario || 0) / rates.usdt : 0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price History */}
                {product.precioHistorico && product.precioHistorico.length > 0 && (
                  <div className="mt-3">
                    <PriceHistoryChart product={product} />
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => window.location.href = '/manage-stock'}
                    className="btn-primary flex-1 aura-glow py-2.5"
                  >
                    Gestionar
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-4 py-2.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* Total Value */}
        <div className="glass p-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} className="text-violet-400" />
            <span className="text-white/40 text-xs font-medium">Valor total del inventario</span>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-violet-300 sm:text-2xl md:text-3xl">
              {BCVService.formatBs(currentInventoryValueBs)}
            </p>
            <div className="flex flex-col gap-1">
              {!loadingRates && rates.bcv > 0 && (
                <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <span className="text-xs text-violet-300 font-medium">BCV</span>
                  <span className="text-sm font-bold text-violet-200">
                    {(currentInventoryValueUSD.toFixed(2))}
                  </span>
                </div>
              )}
              {!loadingRates && rates.usdt > 0 && (
                <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <span className="text-xs text-blue-300 font-medium">USDT</span>
                  <span className="text-sm font-bold text-blue-200">
                    {BCVService.formatUSDT(currentInventoryValueUSDT).replace('USDT ', '')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      {!searchTerm && products.length === 0 && (
        <div className="glass p-8 text-center">
          <Package size={48} className="mx-auto text-white/20 mb-4" />
          <h3 className="text-white font-medium mb-2">No hay productos</h3>
          <p className="text-white/60 text-sm mb-4">Agrega productos para comenzar a gestionar tu inventario</p>
          <button
            onClick={() => window.location.href = '/manage-stock'}
            className="btn-primary aura-glow py-3 px-6"
          >
            Agregar Producto
          </button>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-50 animate-fade-in pt-8 modal-container"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseEdit();
            }
          }}
        >
          <div className="p-6 rounded-xl max-w-sm mx-4 animate-slide-up shadow-2xl modal-content">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Edit size={24} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Editar Producto</h3>
                <p className="text-white/60 text-sm mt-1">Modifica los datos del producto</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">Nombre del producto</label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: handleCapitalization(e.target.value) })}
                  placeholder="Ej: Leche, Pan, Huevos"
                  className="glass-input w-full"
                />
              </div>

              <div className="relative">
                <label className="text-xs text-white/40 block mb-1">Categoría</label>
                <select
                  value={editForm.categoria}
                  onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                  className="form-select w-full appearance-none cursor-pointer"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem'
                  }}
                >
                  <option value="">Selecciona una categoría</option>
                  
                  <option value="Carnicería">🥩 Carnicería</option>
                  <option value="Charcutería">🥓 Charcutería</option>
                  <option value="Pescadería">🐟 Pescadería</option>
                  <option value="Frutas y Verduras">🥬 Frutas y Verduras</option>
                  <option value="Panadería y Pastelería">🍞 Panadería y Pastelería</option>
                  <option value="Arroz, Pastas y Legumbres">🍚 Arroz, Pastas y Legumbres</option>
                  <option value="Enlatados y Conservas">🥫 Enlatados y Conservas</option>
                  <option value="Aceites, Vinagres y Condimentos">🧂 Aceites, Vinagres y Condimentos</option>
                  <option value="Desayuno y Merienda">🍪 Desayuno y Merienda</option>
                  <option value="Snacks y Frutos Secos">🍿 Snacks y Frutos Secos</option>
                  <option value="Leches y Bebidas Vegetales">🥛 Leches y Bebidas Veg.</option>
                  <option value="Quesos y Yogures">🧀 Quesos y Yogures</option>
                  <option value="Huevos">🥚 Huevos</option>
                  <option value="Mantequillas y Margarinas">🧈 Mantequillas y Margarinas</option>
                  <option value="Refrescos y Aguas">🥤 Refrescos y Aguas</option>
                  <option value="Jugos y Bebidas Naturales">🧃 Jugos y Bebidas Nat.</option>
                  <option value="Bebidas Alcohólicas">🍷 Bebidas Alcohólicas</option>
                  <option value="Verduras y Frutas Congeladas">❄️ Verduras y Frutas Cong.</option>
                  <option value="Carnes y Pescados Congelados">🧊 Carnes y Pescados Cong.</option>
                  <option value="Platos Preparados Congelados">🍕 Platos Prep. Congelados</option>
                  <option value="Cuidado del Cabello">💇 Cuidado del Cabello</option>
                  <option value="Cuidado Bucal">🦷 Cuidado Bucal</option>
                  <option value="Cuidado de la Piel y Cuerpo">🧴 Cuidado de la Piel y Cuerpo</option>
                  <option value="Higiene Femenina y Masculina">🚺 Higiene Femenina y Masc.</option>
                  <option value="Cuidado del Bebé">👶 Cuidado del Bebé</option>
                  <option value="Lavandería">🧹 Lavandería</option>
                  <option value="Limpieza de Cocina y Baño">🧽 Limpieza de Cocina y Baño</option>
                  <option value="Utensilios de Limpieza">🧹 Utensilios de Limpieza</option>
                  <option value="Hogar y Cocina">🏠 Hogar y Cocina</option>
                  <option value="Electrodomésticos">⚡ Electrodomésticos</option>
                  <option value="Ropa y Calzado">👕 Ropa y Calzado</option>
                  <option value="Electrónica y Entretenimiento">📱 Electrónica y Entreten.</option>
                  <option value="Mascotas">🐾 Mascotas</option>
                  <option value="Dietética/Saludable">🏥 Dietética/Saludable</option>
                  <option value="Farmacia/Parafarmacia">🏥 Farmacia/Parafarmacia</option>
                  <option value="Otros">📦 Otros</option>
                </select>
              </div>

              <div className="relative">
                <label className="text-xs text-white/40 block mb-1">Unidad de Medición</label>
                <select
                  value={editForm.unidadMedicion}
                  onChange={(e) => setEditForm({ ...editForm, unidadMedicion: e.target.value })}
                  className="form-select w-full appearance-none cursor-pointer"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem'
                  }}
                >
                  <option value="unid">Unidades (unid)</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="lt">Litros (lt)</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-white/40 flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={editForm.alertaBajoStock}
                        onChange={(e) => setEditForm({ ...editForm, alertaBajoStock: e.target.checked })}
                        className="w-4 h-4 rounded appearance-none bg-white/5 border border-white/10 cursor-pointer transition-colors checked:bg-violet-300 focus:outline-none focus:border-violet-400/50"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                        }}
                      />
                      <div className={`absolute inset-0 rounded pointer-events-none transition-colors ${
                        editForm.alertaBajoStock ? 'bg-violet-300' : 'bg-white/5'
                      } border border-white/10`}></div>
                    </div>
                    Activar alerta de stock bajo
                  </label>
                </div>

                {editForm.alertaBajoStock && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/40">Stock mínimo:</label>
                    <input
                      type="number"
                      value={editForm.stockMinimo}
                      onChange={(e) => setEditForm({ ...editForm, stockMinimo: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.1"
                      placeholder="0"
                      className="glass-input w-20"
                    />
                    <span className="text-xs text-amber-200 ml-2">{getUnitDisplay(editForm.unidadMedicion || 'unid')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Success/Error Message */}
            {editMessage && (
              <div className={`message-${editMessage.type}`}>
                <div className="flex items-center gap-2">
                  {editMessage.type === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                  <span className="text-sm">{editMessage.message}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseEdit}
                className="btn-secondary flex-1 py-2.5"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateProduct}
                disabled={!editForm.nombre || !editForm.categoria || editLoading}
                className="btn-primary flex-1 aura-glow disabled:opacity-50 disabled:cursor-not-allowed py-2.5"
              >
                {editLoading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-50 animate-fade-in pt-8 modal-container"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeletingProduct(null);
            }
          }}
        >
          <div className="p-6 rounded-xl max-w-sm mx-4 animate-slide-up shadow-2xl modal-content delete">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Eliminar Producto</h3>
                <p className="text-white/60 text-sm mt-1">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm mb-2">
                ¿Estás seguro de que quieres eliminar <span className="font-bold">{deletingProduct.nombre}</span>?
              </p>
              <p className="text-red-200/70 text-xs">
                Categoría: {deletingProduct.categoria} • Stock: {formatStockWithUnit(deletingProduct.cantidad || 0, deletingProduct.unidadMedicion)}
              </p>
            </div>

            {/* Success/Error Message */}
            {deleteMessage && (
              <div className={`message-${deleteMessage.type}`}>
                <div className="flex items-center gap-2">
                  {deleteMessage.type === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                  <span className="text-sm">{deleteMessage.message}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="btn-secondary flex-1 py-2.5"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors font-medium flex-1"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
