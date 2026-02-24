import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Minus, ArrowLeft, CheckCircle, Search, X } from 'lucide-react';
import { useInventory } from '../store/useFirestoreStore';
import { BCVService } from '../services/bcvService';
import { AutomaticExpenseService } from '../services/automaticExpenseService';
import { Link, useNavigate } from 'react-router-dom';
import ExchangeRatesHeader from '../components/ExchangeRatesHeader';
import { handleCapitalization } from '../utils/textUtils';
import { scrollToTop } from '../utils/scrollUtils';
import { formatStockWithUnit, getUnitDisplay } from '../utils/stockUtils';
import type { ProductItem } from '../types';

export default function ManageStockPage() {
  const { products, updateProduct, addProduct, loadProducts } = useInventory();
  const navigate = useNavigate();
  const [rates, setRates] = useState({ bcv: 0, usdt: 0 });
  const [loadingRates, setLoadingRates] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockChange, setStockChange] = useState(0);
  const [newPrice, setNewPrice] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<ProductItem>>({
    nombre: '',
    categoria: '',
    alertaBajoStock: false,
    stockMinimo: 1,
    cantidad: 0,
    precioUnitario: 0,
    unidadMedicion: 'unid', // Valor por defecto
  });
  const [loading, setLoading] = useState(false);

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.nombre.toLowerCase().includes(searchLower) ||
      product.categoria.toLowerCase().includes(searchLower)
    );
  });

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Fetch exchange rates and products
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
    loadProducts();
  }, [loadProducts]);

  const calculateUSD = (priceBs: number) => {
    if (!priceBs || !rates.bcv) return 0;
    return priceBs / rates.bcv;
  };

  const handleCombinedUpdate = async () => {
    if (!selectedProduct || selectedProduct.id === '') return;
    
    try {
      const updatedProduct = {
        ...selectedProduct,
        cantidad: Math.max(0, (selectedProduct.cantidad || 0) + stockChange),
        ultimaActualizacion: new Date().toISOString(),
      };

      // Update price if provided
      if (newPrice && parseFloat(newPrice) > 0) {
        updatedProduct.precioUnitario = parseFloat(newPrice);
        updatedProduct.ultimaActualizacion = new Date().toISOString();
        
        // Add to price history
        const precioHistorico = selectedProduct.precioHistorico || [];
        precioHistorico.push({
          fecha: new Date().toISOString(),
          precioUnitario: parseFloat(newPrice),
          precioUSD: calculateUSD(parseFloat(newPrice)),
          tasaBCV: rates.bcv,
          tasaUSDT: rates.usdt,
          variacionUSD: 0 // Will be calculated when displaying
        });
        updatedProduct.precioHistorico = precioHistorico;
        
        // Update current rates and calculated values
        updatedProduct.tasaBCV = rates.bcv;
        updatedProduct.tasaUSDT = rates.usdt;
        updatedProduct.precioUSD = calculateUSD(parseFloat(newPrice));
        updatedProduct.precioUSDT = rates.usdt > 0 ? parseFloat(newPrice) / rates.usdt : 0;
      }

      await updateProduct(selectedProduct.id, updatedProduct);
      
      // Create automatic expense if stock increased
      if (stockChange > 0) {
        try {
          // Get the updated product data
          const updatedProducts = products;
          const finalProduct = updatedProducts.find(p => p.id === selectedProduct.id);
          
          if (finalProduct) {
            // Prepare previous data for comparison
            const previousData = {
              ...selectedProduct,
              cantidad: selectedProduct.cantidad || 0,
              precioUnitario: selectedProduct.precioUnitario || 0
            };
            
            // Prepare new data
            const newData = {
              ...finalProduct,
              cantidad: (selectedProduct.cantidad || 0) + stockChange,
              precioUnitario: newPrice ? parseFloat(newPrice) : (selectedProduct.precioUnitario || 0)
            };
            
            // Analyze changes and create automatic expense
            await AutomaticExpenseService.analyzeProductChanges(
              selectedProduct.id,
              previousData,
              newData
            );
          }
        } catch (expenseError) {
          console.error('Error creating automatic expense:', expenseError);
          // Don't show error to user, just log it
        }
      }
      
      // Create stock movement if stock changed
      if (stockChange !== 0) {
        // Stock movement logic would go here
      }
      
      // Show success message
      const updates = [];
      if (stockChange !== 0) updates.push('stock');
      if (newPrice && parseFloat(newPrice) > 0) updates.push('precio');
      
      setSuccessMessage(`${selectedProduct.nombre}: ${updates.join(' y ')} actualizado${updates.length > 1 ? 's' : ''} exitosamente!`);
      scrollToTop();
      setShowSuccess(true);
      
      // Reset form
      setSelectedProduct(null);
      setStockChange(0);
      setNewPrice('');
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error updating product:', error);
      setErrorMessage('Error al actualizar el producto. Inténtalo de nuevo.');
      scrollToTop();
      setShowSuccess(true);
      
      // Hide error message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setErrorMessage('');
      }, 5000);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleAddProduct = async () => {
    if (!newProduct.nombre || !newProduct.categoria) return;

    setLoading(true);

    try {
      // Convert ProductItem to Firebase Product format
      const firebaseProduct = {
        nombre: newProduct.nombre,
        categoria: newProduct.categoria,
        cantidad: newProduct.cantidad || 0,
        precioUnitario: newProduct.precioUnitario || 0,
        precioUSD: rates.bcv > 0 ? (newProduct.precioUnitario || 0) / rates.bcv : 0,
        precioUSDT: rates.usdt > 0 ? (newProduct.precioUnitario || 0) / rates.usdt : 0,
        stockAlert: newProduct.alertaBajoStock ? (newProduct.stockMinimo || 1) : 0,
        minimumStock: newProduct.stockMinimo || 1,
        unidadMedicion: newProduct.unidadMedicion || 'unid',
      };
      
      await addProduct(firebaseProduct);
      
      // Create automatic expense if product has initial stock and price
      if ((newProduct.cantidad || 0) > 0 && (newProduct.precioUnitario || 0) > 0) {
        try {
          const movementData = {
            productId: '', // Will be set after getting the actual ID
            productName: newProduct.nombre!,
            category: newProduct.categoria!,
            previousQuantity: 0,
            newQuantity: newProduct.cantidad || 0,
            previousPrice: 0,
            newPrice: newProduct.precioUnitario || 0,
            timestamp: Date.now()
          };
          
          await AutomaticExpenseService.createExpenseFromStockMovement(movementData);
        } catch (expenseError) {
          console.error('Error creating automatic expense:', expenseError);
          // Don't show error to user, just log it
        }
      }
      
      // Show success message
      setSuccessMessage(`¡${newProduct.nombre} agregado exitosamente!`);
      scrollToTop();
      setShowSuccess(true);
      
      // Reset form and close modal
      setNewProduct({
        nombre: '',
        categoria: '',
        alertaBajoStock: false,
        stockMinimo: 1,
        cantidad: 0,
        precioUnitario: 0,
        unidadMedicion: 'unid',
      });
      setShowAddModal(false);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error adding product:', error);
      setErrorMessage('Error al agregar el producto. Inténtalo de nuevo.');
      scrollToTop();
      setShowSuccess(true);
      
      // Hide error message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setErrorMessage('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product: any) => {
    if (!product.stockAlert || !product.minimumStock) return 'normal';
    if ((product.cantidad || 0) === 0) return 'critical';
    if ((product.cantidad || 0) <= product.minimumStock) return 'warning';
    return 'normal';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg glass hover:bg-white/10 transition-colors duration-200">
            <ArrowLeft size={20} className="text-white/60" />
          </Link>
          <h1 className="text-lg font-semibold text-white">Gestionar Stock</h1>
        </div>
        <button
          onClick={() => {
            scrollToTop();
            setShowAddModal(true);
          }}
          className="p-2 rounded-lg glass-button text-violet-400 hover:text-violet-300 aura-glow"
          title="Agregar nuevo producto"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Exchange Rates Header */}
      <ExchangeRatesHeader compact={true} />

      {/* Search Bar */}
      <div className="glass p-4">
        <div className="relative">
          <Search 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" 
          />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
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

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.length === 0 && searchTerm ? (
          <div className="glass p-8 text-center">
            <Search size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg">No se encontraron productos</p>
            <p className="text-white/20 text-sm mt-2">
              "{searchTerm}" no coincide con ningún nombre o categoría
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
          const status = getStockStatus(product);
          return (
            <div key={product.id} className="bg-white/3 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300">
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
                      Mínimo: {product.minimumStock}
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

              {/* Stock Controls */}
              <div className="bg-white/3 backdrop-blur-md rounded-xl p-4 border border-white/10 mb-3">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      const currentValue = selectedProduct?.id === product.id ? stockChange : 0;
                      setStockChange(currentValue - 1);
                    }}
                    className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all duration-200 flex items-center justify-center shadow-lg"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="relative">
                    <input
                      type="number"
                      value={selectedProduct?.id === product.id ? stockChange : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = parseFloat(value) || 0;
                        setStockChange(numValue);
                      }}
                      onMouseDown={() => setSelectedProduct(product)}
                      step="0.01"
                      placeholder="0"
                      className="w-20 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-center font-bold text-lg focus:outline-none focus:border-violet-400/50 focus:bg-white/15 transition-all duration-200 shadow-inner"
                    />
                    {stockChange !== 0 && selectedProduct?.id === product.id && (
                      <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-violet-600 text-white text-xs flex items-center justify-center font-bold shadow-lg">
                        {stockChange > 0 ? '+' : ''}{stockChange}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      const currentValue = selectedProduct?.id === product.id ? stockChange : 0;
                      setStockChange(currentValue + 1);
                    }}
                    className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all duration-200 flex items-center justify-center shadow-lg"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Quick Quantity Buttons */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <div className="flex gap-1">
                    <span className="text-white/50 text-xs self-center mr-2 font-medium">Add:</span>
                    {[1, 2, 4].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => {
                          setSelectedProduct(product);
                          const currentValue = selectedProduct?.id === product.id ? stockChange : 0;
                          setStockChange(currentValue + qty);
                        }}
                        className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs hover:bg-green-500/20 transition-all duration-200 flex items-center justify-center font-bold shadow-md"
                      >
                        +{qty}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        const currentValue = selectedProduct?.id === product.id ? stockChange : 0;
                        setStockChange(currentValue + (product.cantidad || 0));
                      }}
                      className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs hover:bg-green-500/20 transition-all duration-200 font-bold shadow-md"
                    >
                      +Max
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-white/50 text-xs self-center mr-2 font-medium">Remove:</span>
                    {[1, 2, 4].map((qty) => (
                      <button
                        key={`-${qty}`}
                        onClick={() => {
                          setSelectedProduct(product);
                          const currentValue = selectedProduct?.id === product.id ? stockChange : 0;
                          setStockChange(currentValue - qty);
                        }}
                        className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all duration-200 flex items-center justify-center font-bold shadow-md"
                      >
                        -{qty}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        const currentValue = selectedProduct?.id === product.id ? stockChange : 0;
                        setStockChange(currentValue - (product.cantidad || 0));
                      }}
                      className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all duration-200 font-bold shadow-md"
                    >
                      -Max
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Controls */}
              <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    {product.precioUnitario && product.precioUnitario > 0 ? (
                      <>
                        <input
                          type="number"
                          value={selectedProduct?.id === product.id ? newPrice : ''}
                          onChange={(e) => {
                            setSelectedProduct(product);
                            setNewPrice(e.target.value);
                          }}
                          placeholder={product.precioUnitario && product.precioUnitario > 0 ? BCVService.formatBs(product.precioUnitario) : "Establecer precio"}
                          step="0.01"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-400/50 focus:bg-white/15 transition-all duration-200 shadow-inner"
                        />
                        {newPrice && parseFloat(newPrice) > 0 && selectedProduct?.id === product.id && (
                          <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-violet-600 text-white text-xs flex items-center justify-center font-bold shadow-lg">
                            ${rates.bcv > 0 ? (parseFloat(newPrice) / rates.bcv).toFixed(3) : '0.000'}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="relative">
                        {selectedProduct?.id === product.id ? (
                          <>
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => {
                                setNewPrice(e.target.value);
                              }}
                              placeholder="Establecer precio"
                              step="0.01"
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-400/50 focus:bg-white/15 transition-all duration-200 shadow-inner"
                              autoFocus
                            />
                            {newPrice && parseFloat(newPrice) > 0 && (
                              <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs flex items-center justify-center font-bold shadow-lg animate-pulse">
                                ${rates.bcv > 0 ? (parseFloat(newPrice) / rates.bcv).toFixed(3) : '0.000'}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/30 text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-white/15 transition-colors"
                               onClick={() => {
                                 setSelectedProduct(product);
                                 setNewPrice('');
                               }}
                          >
                            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                            <span>Carga el precio del producto</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleCombinedUpdate}
                    disabled={!selectedProduct || selectedProduct.id !== product.id || (stockChange === 0 && (!newPrice || parseFloat(newPrice) <= 0))}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-violet-600/20 border border-violet-500/30 text-violet-300 hover:from-violet-500/30 hover:to-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-bold whitespace-nowrap shadow-lg aura-glow"
                  >
                    Actualizar
                  </button>
                </div>
                
                {/* Price Info Display */}
                {(newPrice && parseFloat(newPrice) > 0 && selectedProduct?.id === product.id) && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs">
                      <div className="text-white/60">
                        <span className="text-violet-300 font-bold">{BCVService.formatBs(parseFloat(newPrice))}</span>
                        <span className="mx-2">→</span>
                        <span className="text-green-300 font-bold">BCV {rates.bcv > 0 ? (parseFloat(newPrice) / rates.bcv).toFixed(3) : '0.000'}</span>
                        <span className="mx-2">→</span>
                        <span className="text-blue-300 font-bold">{rates.usdt > 0 ? BCVService.formatUSDT(parseFloat(newPrice) / rates.usdt) : 'USDT 0.00'}</span>
                      </div>
                      <div className="text-white/40 bg-white/5 rounded px-2 py-1">
                        Tasa: {rates.bcv.toFixed(0)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock Alert */}
              {status === 'critical' && product.stockAlert > 0 && product.minimumStock && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20 backdrop-blur-sm">
                  <AlertTriangle size={18} className="text-red-400" />
                  <span className="text-sm text-red-200 font-medium">
                    ¡Stock crítico! Quedan {formatStockWithUnit(product.cantidad || 0, product.unidadMedicion)} (mínimo: {formatStockWithUnit(product.minimumStock, product.unidadMedicion)})
                  </span>
                </div>
              )}
              {status === 'warning' && product.stockAlert > 0 && product.minimumStock && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 backdrop-blur-sm">
                  <AlertTriangle size={18} className="text-amber-400" />
                  <span className="text-sm text-amber-200 font-medium">
                    {(product.cantidad || 0) === 0 
                      ? `¡Stock crítico! Quedan ${formatStockWithUnit(product.cantidad || 0, product.unidadMedicion)} (mínimo: ${formatStockWithUnit(product.minimumStock, product.unidadMedicion)})`
                      : `¡Stock en mínimo! Quedan ${formatStockWithUnit(product.cantidad || 0, product.unidadMedicion)} (mínimo: ${formatStockWithUnit(product.minimumStock, product.unidadMedicion)})`
                    }
                  </span>
                </div>
              )}
            </div>
          );
        })
        )}
      </div>
      
      {!searchTerm && products.length === 0 && (
        <div className="glass p-4 text-center">
          <Package size={48} className="mx-auto text-white/20 mb-4" />
          <h3 className="text-white font-medium mb-2">No hay productos</h3>
          <p className="text-white/60 text-sm">Primero agrega productos desde la página de agregar productos</p>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-50 animate-fade-in pt-8 modal-container"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSuccess(false);
            }
          }}
        >
          <div className={`p-6 rounded-xl max-w-sm mx-4 animate-slide-up shadow-2xl ${
            errorMessage ? 'modal-content error' : 'modal-content success'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                errorMessage ? 'bg-red-500/20' : 'bg-green-500/20'
              }`}>
                {errorMessage ? (
                  <AlertTriangle size={24} className="text-red-400" />
                ) : (
                  <CheckCircle size={24} className="text-green-400" />
                )}
              </div>
              <div>
                <h3 className={`text-white font-medium ${errorMessage ? 'text-red-300' : ''}`}>
                  {errorMessage ? 'Error' : '¡Éxito!'}
                </h3>
                <p className={`text-sm mt-1 ${errorMessage ? 'text-red-200' : 'text-white/60'}`}>
                  {errorMessage ? 'Ocurrió un error' : 'Operación completada correctamente'}
                </p>
              </div>
            </div>
            {errorMessage ? (
              <div className="message-error">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span className="text-sm">{errorMessage}</span>
                </div>
              </div>
            ) : (
              <div className="message-success">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span className="text-sm">{successMessage}</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleCloseSuccess}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  errorMessage 
                    ? 'bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30' 
                    : 'bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30'
                }`}
              >
                Cerrar
              </button>
              <button
                onClick={() => navigate('/inventory')}
                className="btn-primary flex-1"
              >
                Ver Inventario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-50 animate-fade-in pt-8 modal-container"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div className="p-6 rounded-xl max-w-sm mx-4 animate-slide-up shadow-2xl modal-content">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Plus size={24} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Agregar Nuevo Producto</h3>
                <p className="text-white/60 text-sm mt-1">Registra un nuevo producto en tu inventario</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">Nombre del producto</label>
                <input
                  type="text"
                  value={newProduct.nombre}
                  onChange={(e) => setNewProduct({ ...newProduct, nombre: handleCapitalization(e.target.value) })}
                  placeholder="Ej: Leche, Pan, Huevos"
                  className="glass-input w-full"
                  autoFocus
                />
              </div>

              <div className="relative">
                <label className="text-xs text-white/40 block mb-1">Categoría</label>
                <select
                  value={newProduct.categoria}
                  onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value })}
                  className="form-select w-full appearance-none cursor-pointer text-sm sm:text-base"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem',
                    lineHeight: '1.5'
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
                  value={newProduct.unidadMedicion}
                  onChange={(e) => setNewProduct({ ...newProduct, unidadMedicion: e.target.value })}
                  className="form-select w-full appearance-none cursor-pointer text-sm sm:text-base"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem',
                    lineHeight: '1.5'
                  }}
                >
                  <option value="unid">Unidades (unid)</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="lt">Litros (lt)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-white/40 block mb-1">Cantidad inicial</label>
                <input
                      type="number"
                      value={newProduct.cantidad === 0 ? '0' : newProduct.cantidad || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Permitir valores decimales para kg, lt, etc.
                        const numValue = parseFloat(value);
                        setNewProduct({ 
                          ...newProduct, 
                          cantidad: isNaN(numValue) ? 0 : numValue
                        });
                      }}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      className="glass-input w-full"
                    />
              </div>

              {/* Low Stock Alert */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-white/40 flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={newProduct.alertaBajoStock}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setNewProduct({ 
                            ...newProduct, 
                            alertaBajoStock: isChecked,
                            stockMinimo: isChecked ? (newProduct.stockMinimo || 1) : 0
                          });
                        }}
                        className="w-4 h-4 rounded appearance-none bg-white/5 border border-white/10 cursor-pointer transition-colors checked:bg-violet-300 focus:outline-none focus:border-violet-400/50"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none'
                        }}
                      />
                      {newProduct.alertaBajoStock && (
                        <svg className="w-4 h-4 absolute top-0 left-0 pointer-events-none" viewBox="0 0 16 16">
                          <path
                            fill="white"
                            d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
                          />
                        </svg>
                      )}
                    </div>
                    Alerta de bajo stock
                  </label>
                  <AlertTriangle size={14} className="text-amber-400" />
                </div>

                {newProduct.alertaBajoStock && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/40">Stock mínimo:</label>
                    <input
                      type="number"
                      value={newProduct.stockMinimo === 0 ? '0' : newProduct.stockMinimo || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Permitir valores decimales, incluyendo 0.6, 0.5, etc.
                        const numValue = parseFloat(value);
                        setNewProduct({ 
                          ...newProduct, 
                          stockMinimo: isNaN(numValue) ? 0 : numValue
                        });
                      }}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      className="glass-input w-20"
                    />
                    <span className="text-xs text-amber-200 ml-2">{getUnitDisplay(newProduct.unidadMedicion || 'unid')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1 py-2.5"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProduct}
                disabled={!newProduct.nombre || !newProduct.categoria || loadingRates || loading}
                className="btn-primary flex-1 aura-glow disabled:opacity-50 disabled:cursor-not-allowed py-2.5"
              >
                {loading ? 'Guardando...' : 'Agregar'}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
