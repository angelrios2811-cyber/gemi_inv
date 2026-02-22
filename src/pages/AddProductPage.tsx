import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { useInventory } from '../store/useFirestoreStore';
import { AutomaticExpenseService } from '../services/automaticExpenseService';
import { handleCapitalization } from '../utils/textUtils';
import ExchangeRatesHeader from '../components/ExchangeRatesHeader';
import type { ProductItem } from '../types';

export default function AddProductPage() {
  const { addProduct, loadProducts } = useInventory();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Partial<ProductItem>>({
    nombre: '',
    categoria: '',
    alertaBajoStock: false,
    stockMinimo: 1,
    cantidad: 0,
    precioUnitario: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [rates, setRates] = useState({ bcv: 0, usdt: 0 });
  const [loadingRates, setLoadingRates] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch products and rates on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        loadProducts();
        const { BCVService } = await import('../services/bcvService');
        const { bcv, usdt } = await BCVService.getAllRates();
        setRates({ bcv, usdt });
      } catch (error) {
        console.error('Error fetching rates:', error);
      } finally {
        setLoadingRates(false);
      }
    };
    
    fetchData();
  }, [loadProducts]);

  const handleSave = async () => {
    if (!product.nombre || !product.categoria) return;

    setLoading(true);

    try {
      // Convert ProductItem to Firebase Product format
      const firebaseProduct = {
        nombre: product.nombre,
        categoria: product.categoria,
        cantidad: product.cantidad || 0,
        precioUnitario: product.precioUnitario || 0,
        precioUSD: rates.bcv > 0 ? (product.precioUnitario || 0) / rates.bcv : 0,
        precioUSDT: rates.usdt > 0 ? (product.precioUnitario || 0) / rates.usdt : 0,
        stockAlert: product.alertaBajoStock ? (product.stockMinimo || 1) : 0,
        minimumStock: product.stockMinimo || 1,
      };
      
      await addProduct(firebaseProduct);
      
      // Create automatic expense if product has initial stock and price
      if ((product.cantidad || 0) > 0 && (product.precioUnitario || 0) > 0) {
        try {
          const movementData = {
            productId: '', // Will be set after getting the actual ID
            productName: product.nombre!,
            category: product.categoria!,
            previousQuantity: 0,
            newQuantity: product.cantidad || 0,
            previousPrice: 0,
            newPrice: product.precioUnitario || 0,
            timestamp: Date.now()
          };
          
          await AutomaticExpenseService.createExpenseFromStockMovement(movementData);
        } catch (expenseError) {
          console.error('Error creating automatic expense:', expenseError);
          // Don't show error to user, just log it
        }
      }
      
      // Show success message
      setSuccessMessage(`¡${product.nombre} agregado exitosamente!`);
      setShowSuccess(true);
      
      // Reset form
      setProduct({
        nombre: '',
        categoria: '',
        alertaBajoStock: false,
        stockMinimo: 1,
        cantidad: 0,
        precioUnitario: 0,
      });
      
      // Hide success message after 5 seconds but stay on the same page
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setSuccessMessage('');
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg glass hover:bg-white/10 transition-colors duration-200">
            <ArrowLeft size={20} className="text-white/60" />
          </Link>
          <h1 className="text-lg font-semibold text-white">Agregar Producto</h1>
        </div>
      </div>

      {/* Exchange Rates Header */}
      <ExchangeRatesHeader compact={true} />
      
      {/* Product Form */}
      <div className="glass p-4 space-y-4">
        <div>
          <label className="text-xs text-white/40 block mb-1">Nombre del producto</label>
          <input
            type="text"
            value={product.nombre}
            onChange={(e) => setProduct({ ...product, nombre: handleCapitalization(e.target.value) })}
            placeholder="Ej: Leche, Pan, Huevos"
            className="glass-input w-full"
          />
        </div>

        <div className="relative">
          <label className="text-xs text-white/40 block mb-1">Categoría</label>
          <select
            value={product.categoria}
            onChange={(e) => setProduct({ ...product, categoria: e.target.value })}
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

        {/* Low Stock Alert */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40 flex items-center gap-2">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={product.alertaBajoStock}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setProduct({ 
                      ...product, 
                      alertaBajoStock: isChecked,
                      stockMinimo: isChecked ? (product.stockMinimo || 1) : 0
                    });
                  }}
                  className="w-4 h-4 rounded appearance-none bg-white/5 border border-white/10 cursor-pointer transition-colors checked:bg-violet-300 focus:outline-none focus:border-violet-400/50"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none'
                  }}
                />
                {product.alertaBajoStock && (
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

          {product.alertaBajoStock && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/40">Stock mínimo:</label>
              <input
                type="number"
                value={product.stockMinimo || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setProduct({ 
                    ...product, 
                    stockMinimo: value === '' ? 0 : (parseInt(value) || 0)
                  });
                }}
                min="0"
                placeholder="1"
                className="glass-input w-20"
              />
              <span className="text-xs text-amber-200 ml-2">unidades</span>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!product.nombre || !product.categoria || loadingRates}
          className="btn-primary w-full py-3.5 aura-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Agregar producto'}
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 animate-fade-in pt-8 modal-container"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSuccess(false);
            }
          }}
        >
          <div className="p-6 rounded-xl max-w-sm mx-4 animate-slide-up shadow-2xl modal-content success">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle size={24} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">¡Éxito!</h3>
                <p className="text-white/60 text-sm mt-1">Producto agregado correctamente</p>
              </div>
            </div>
            <div className="message-success">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span className="text-sm">{successMessage}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCloseSuccess}
                className="btn-secondary flex-1"
              >
                Cerrar
              </button>
              <button
                onClick={() => navigate('/manage-stock')}
                className="btn-primary flex-1 aura-glow"
              >
                Ir a Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
