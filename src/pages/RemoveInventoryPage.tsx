import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, AlertTriangle, Package } from 'lucide-react';
import { useInventory } from '../store/useFirestoreStore';

interface ProductStock {
  name: string;
  quantity: number;
  category: string;
}

export function RemoveInventoryPage() {
  const navigate = useNavigate();
  const { products, loadProducts, updateProduct } = useInventory();
  const [productStock, setProductStock] = useState<ProductStock[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantityToRemove, setQuantityToRemove] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    // Calculate stock from products
    const stock: Record<string, ProductStock> = {};
    
    products.forEach(product => {
      if (!stock[product.nombre]) {
        stock[product.nombre] = {
          name: product.nombre,
          quantity: product.cantidad || 0,
          category: product.categoria
        };
      } else {
        stock[product.nombre].quantity += product.cantidad || 0;
      }
    });
    
    const stockArray = Object.values(stock).sort((a, b) => a.name.localeCompare(b.name));
    setProductStock(stockArray);
  }, [products]);

  const handleRemove = async () => {
    if (!selectedProduct || quantityToRemove <= 0) return;
    
    const product = productStock.find(p => p.name === selectedProduct);
    if (!product || product.quantity < quantityToRemove) return;
    
    // Update product quantity
    const targetProduct = products.find(p => p.nombre === selectedProduct);
    if (targetProduct) {
      // Update the product in the store
      await updateProduct(targetProduct.id, {
        cantidad: (targetProduct.cantidad || 0) - quantityToRemove,
        updatedAt: firebase.firestore.Timestamp.now()
      });
      
      // Reset form
      setSelectedProduct('');
      setQuantityToRemove(1);
      
      // Navigate back to manage stock
      navigate('/manage-stock');
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl glass-button text-white/50"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold text-white">Remover inventario</h1>
      </div>

      {/* Low Stock Alert */}
      {productStock.filter(p => p.quantity <= 2).length > 0 && (
        <div className="glass p-4 border-red-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-red-300 text-sm font-medium">Stock bajo (≤2 unidades)</span>
          </div>
          <div className="space-y-1">
            {productStock
              .filter(p => p.quantity <= 2)
              .map(product => (
                <div key={product.name} className="flex items-center justify-between text-sm">
                  <span className="text-red-200">{product.name}</span>
                  <span className="text-red-400 font-bold">{product.quantity}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Current Stock */}
      <div className="glass p-4">
        <h2 className="text-sm font-semibold text-white/60 mb-3">Stock actual</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {productStock.map(product => (
            <div
              key={product.name}
              className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                product.quantity <= 2 ? 'bg-red-500/10' : 'bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package size={14} className={product.quantity <= 2 ? 'text-red-400' : 'text-white/40'} />
                <div>
                  <p className={`text-sm ${product.quantity <= 2 ? 'text-red-200' : 'text-white/80'}`}>
                    {product.name}
                  </p>
                  <p className="text-xs text-white/30">{product.category}</p>
                </div>
              </div>
              <span className={`font-bold ${
                product.quantity <= 2 ? 'text-red-400' : 'text-white/60'
              }`}>
                {product.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Remove Form */}
      <div className="glass p-4">
        <h2 className="text-sm font-semibold text-white/60 mb-3">Remover productos</h2>
        
        <div className="space-y-4">
          {/* Product Select */}
          <div>
            <label className="text-xs text-white/40 block mb-2">Producto</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-400/50"
            >
              <option value="">Selecciona un producto</option>
              {productStock.map(product => (
                <option key={product.name} value={product.name}>
                  {product.name} (Stock: {product.quantity})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs text-white/40 block mb-2">Cantidad a remover</label>
            <input
              type="number"
              min="1"
              value={quantityToRemove}
              onChange={(e) => setQuantityToRemove(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-400/50"
            />
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={!selectedProduct}
            className="w-full py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500/30 transition-colors duration-300"
          >
            <Minus size={16} />
            Remover del inventario
          </button>
        </div>
      </div>
    </div>
  );
}
