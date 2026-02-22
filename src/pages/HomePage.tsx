import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, Receipt, Plus, AlertTriangle, Filter, ChevronDown, ShoppingBasket } from 'lucide-react';
import { useInventory } from '../store/useFirestoreStore';
import { BCVService } from '../services/bcvService';
import ExchangeRatesHeader from '../components/ExchangeRatesHeader';

type FilterPeriod = 'todos' | 'hoy' | 'semanal' | 'quincenal' | 'mensual' | 'fecha';

interface FilterOptions {
  period: FilterPeriod;
  startDate?: string;
  endDate?: string;
}

export function HomePage() {
  const { 
    products, 
    expenses, 
    loadProducts, 
    loadExpenses
  } = useInventory();

  const [rates, setRates] = useState({ bcv: 0, usdt: 0 });
  const [loadingRates, setLoadingRates] = useState(true);
  const [filter, setFilter] = useState<FilterOptions>({ period: 'todos' });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    loadProducts();
    loadExpenses();
    
    // Fetch exchange rates
    const fetchRates = async () => {
      try {
        const { bcv, usdt } = await BCVService.getAllRates();
        setRates({ bcv, usdt });
      } catch (error) {
        console.error('Error fetching rates:', error);
      } finally {
        setLoadingRates(false);
      }
    };
    
    fetchRates();
  }, [loadProducts, loadExpenses]);

  const getStockStatus = (product: any) => {
    if (!product.stockAlert || !product.minimumStock) return 'normal';
    if ((product.cantidad || 0) === 0) return 'critical';
    if ((product.cantidad || 0) <= product.minimumStock) return 'warning';
    return 'normal';
  };

  const getCriticalStockProducts = () => {
    return products.filter(product => {
      const status = getStockStatus(product);
      return status === 'critical' && product.stockAlert && product.minimumStock;
    });
  };

  const getWarningStockProducts = () => {
    return products.filter(product => {
      const status = getStockStatus(product);
      return status === 'warning' && product.stockAlert && product.minimumStock;
    });
  };

  const criticalProducts = getCriticalStockProducts();
  const warningProducts = getWarningStockProducts();

  // Filter expenses based on selected period
  const getFilteredExpenses = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Helper function to parse date string properly
    const parseDate = (dateString: string) => {
      try {
        // Handle different date formats
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) return null;
        
        // For date strings like "2026-02-21", create a local date at midnight
        if (dateString.includes('-') && dateString.length === 10) {
          // This is a YYYY-MM-DD format, treat it as local date
          const [year, month, day] = dateString.split('-').map(Number);
          return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
        }
        
        // For other formats, normalize to local date (remove timezone issues)
        const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return normalizedDate;
      } catch {
        return null;
      }
    };
    
    switch (filter.period) {
      case 'hoy':
        return expenses.filter(expense => {
          const expenseDate = parseDate(expense.fecha);
          if (!expenseDate) return false;
          return expenseDate.getTime() >= today.getTime() && expenseDate.getTime() < today.getTime() + (24 * 60 * 60 * 1000);
        });
        
      case 'semanal':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return expenses.filter(expense => {
          const expenseDate = parseDate(expense.fecha);
          if (!expenseDate) return false;
          return expenseDate >= weekAgo;
        });
      case 'quincenal':
        const fifteenDaysAgo = new Date(today);
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        return expenses.filter(expense => {
          const expenseDate = parseDate(expense.fecha);
          if (!expenseDate) return false;
          return expenseDate >= fifteenDaysAgo;
        });
      case 'mensual':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return expenses.filter(expense => {
          const expenseDate = parseDate(expense.fecha);
          if (!expenseDate) return false;
          return expenseDate >= monthAgo;
        });
        
      case 'fecha':
        if (!filter.startDate || !filter.endDate) return expenses;
        const start = new Date(filter.startDate);
        const end = new Date(filter.endDate);
        end.setHours(23, 59, 59, 999); // Include end date
        return expenses.filter(expense => {
          const expenseDate = parseDate(expense.fecha);
          if (!expenseDate) return false;
          return expenseDate >= start && expenseDate <= end;
        });
        
      case 'todos':
      default:
        return expenses;
    }
  };

  const filteredExpenses = getFilteredExpenses();

  const totalGastado = filteredExpenses.reduce((sum, e) => sum + e.montoBs, 0);
  const totalItems = products.reduce((sum, p) => sum + (p.cantidad || 0), 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.precioUnitario || 0) * (p.cantidad || 0)), 0);
  const totalProducts = products.length;

  // Calculate current expenses value using current rates
  const currentTotalGastadoBs = totalGastado;
  const currentTotalGastadoUSD = !loadingRates && rates.bcv > 0 ? currentTotalGastadoBs / rates.bcv : 0;
  const currentTotalGastadoUSDT = !loadingRates && rates.usdt > 0 ? currentTotalGastadoBs / rates.usdt : 0;

  // Calculate current inventory value using current rates
  const currentInventoryValueBs = totalInventoryValue;
  const currentInventoryValueUSD = !loadingRates && rates.bcv > 0 ? currentInventoryValueBs / rates.bcv : 0;
  const currentInventoryValueUSDT = !loadingRates && rates.usdt > 0 ? currentInventoryValueBs / rates.usdt : 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">INVCAS</h1>
          <p className="text-white/40 text-sm mt-0.5">Inventario y gastos familiares</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/settings"
            className="p-2 rounded-lg glass hover:bg-white/10 transition-colors duration-200"
          >
            ⚙️
          </Link>
          <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <span className="text-violet-400 text-sm font-bold">IC</span>
          </div>
        </div>
      </div>

      {/* Exchange Rates Header */}
      <ExchangeRatesHeader compact={true} />
      
      {/* Critical Stock Alerts */}
      {criticalProducts.length > 0 && (
        <div className="glass p-4 border border-red-500/20 bg-red-500/5 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-300">Alertas de stock crítico</h3>
                <p className="text-sm text-red-200/70">Sin existencias - Compra urgente</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-red-500/20 rounded-full px-3 py-1.5 border border-red-500/30">
                <span className="text-sm font-bold text-red-300">{criticalProducts.length}</span>
              </div>
              <Link
                to="/inventory#shopping-list"
                className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all duration-200 hover:scale-105"
                title="Ver lista de compras"
              >
                <ShoppingBasket size={16} className="text-red-300" />
              </Link>
            </div>
          </div>
          
          <div className="grid gap-3">
            {criticalProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-xl p-4 border border-red-500/20 hover:border-red-500/30 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-semibold text-red-200">{product.nombre}</span>
                        <div className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                          <span className="text-xs font-medium text-red-300">{product.categoria}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Package size={12} className="text-red-400/60" />
                          <span className="text-red-300/80">Stock: 0</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle size={12} className="text-red-400" />
                          <span className="text-red-300 font-medium">AGOTADO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-black text-red-300">0</div>
                    <div className="text-xs text-red-400/70">unidades</div>
                  </div>
                </div>
              </div>
            ))}
            {criticalProducts.length > 3 && (
              <div className="text-center py-3 bg-red-500/5 rounded-lg border border-red-500/10">
                <span className="text-sm text-red-200/70 font-medium">
                  Y {criticalProducts.length - 3} productos más en estado crítico
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning Stock Alerts */}
      {warningProducts.length > 0 && (
        <div className="glass p-4 border border-amber-500/20 bg-amber-500/5 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-300">Alertas de stock en mínimo</h3>
                <p className="text-sm text-amber-200/70">Necesitan reposición - Compra recomendada</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-amber-500/20 rounded-full px-3 py-1.5 border border-amber-500/30">
                <span className="text-sm font-bold text-amber-300">{warningProducts.length}</span>
              </div>
              <Link
                to="/inventory#shopping-list"
                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-200 hover:scale-105"
                title="Ver lista de compras"
              >
                <ShoppingBasket size={16} className="text-amber-300" />
              </Link>
            </div>
          </div>
          
          <div className="grid gap-3">
            {warningProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl p-4 border border-amber-500/20 hover:border-amber-500/30 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-semibold text-amber-200">{product.nombre}</span>
                        <div className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                          <span className="text-xs font-medium text-amber-300">{product.categoria}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Package size={12} className="text-amber-400/60" />
                          <span className="text-amber-300/80">Stock: {product.cantidad}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle size={12} className="text-amber-400" />
                          <span className="text-amber-300 font-medium">MÍNIMO: {product.minimumStock}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-black text-amber-300">{product.cantidad}</div>
                    <div className="text-xs text-amber-400/70">unidades</div>
                  </div>
                </div>
              </div>
            ))}
            {warningProducts.length > 3 && (
              <div className="text-center py-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                <span className="text-sm text-amber-200/70 font-medium">
                  Y {warningProducts.length - 3} productos más en mínimo stock
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="glass p-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} className="text-violet-400" />
            <span className="text-white/40 text-xs font-medium">Productos</span>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-violet-300 sm:text-2xl md:text-3xl">
              {totalProducts}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-xs text-white/40 font-medium block sm:hidden">Unidades totales</span>
                <span className="text-xs text-white/40 font-medium hidden sm:block">Unidades totales</span>
                <span className="text-sm font-bold text-white block sm:hidden ml-2">{totalItems} unids</span>
                <span className="text-sm font-bold text-white hidden sm:block ml-2">{totalItems} unids</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-xs text-white/40 font-medium block sm:hidden">Categorías</span>
                <span className="text-xs text-white/40 font-medium hidden sm:block">Categorías</span>
                <span className="text-sm font-bold text-white block sm:hidden ml-2">{[...new Set(products.map(p => p.categoria))].length}</span>
                <span className="text-sm font-bold text-white hidden sm:block ml-2">{[...new Set(products.map(p => p.categoria))].length}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <Receipt size={14} className="text-emerald-400" />
            <span className="text-white/40 text-xs font-medium">Valor inventario</span>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-emerald-300 sm:text-2xl md:text-3xl">
              {BCVService.formatBs(currentInventoryValueBs)}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              {!loadingRates && rates.bcv > 0 && (
                <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <span className="text-xs text-violet-300 font-medium block sm:hidden">BCV</span>
                  <span className="text-xs text-violet-300 font-medium hidden sm:block">BCV</span>
                  <span className="text-sm font-bold text-violet-200 block sm:hidden ml-2">{(currentInventoryValueUSD.toFixed(2))}</span>
                  <span className="text-sm font-bold text-violet-200 hidden sm:block ml-2">{(currentInventoryValueUSD.toFixed(2))}</span>
                </div>
              )}
              {!loadingRates && rates.usdt > 0 && (
                <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <span className="text-xs text-blue-300 font-medium block sm:hidden">USDT</span>
                  <span className="text-xs text-blue-300 font-medium hidden sm:block">USDT</span>
                  <span className="text-sm font-bold text-blue-200 block sm:hidden ml-2">{BCVService.formatUSDT(currentInventoryValueUSDT).replace('USDT ', '')}</span>
                  <span className="text-sm font-bold text-blue-200 hidden sm:block ml-2">{BCVService.formatUSDT(currentInventoryValueUSDT).replace('USDT ', '')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="glass p-6 col-span-1 sm:col-span-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <TrendingUp size={18} className="text-violet-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Total gastado</h3>
                <p className="text-white/40 text-xs">
                  {filter.period === 'todos' ? 'Período actual' : 
                   filter.period === 'hoy' ? 'Hoy' :
                   filter.period === 'semanal' ? 'Última semana' :
                   filter.period === 'quincenal' ? 'Últimos 15 días' :
                   filter.period === 'mensual' ? 'Último mes' :
                   filter.period === 'fecha' ? 'Rango personalizado' : 'Período actual'}
                </p>
              </div>
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Filter size={14} className="text-white/60" />
                <span className="text-xs text-white/60">
                  {filter.period === 'todos' ? 'Todos' :
                   filter.period === 'hoy' ? 'Hoy' :
                   filter.period === 'semanal' ? 'Semanal' :
                   filter.period === 'quincenal' ? 'Quincenal' :
                   filter.period === 'mensual' ? 'Mensual' :
                   filter.period === 'fecha' ? 'Personalizado' : 'Todos'}
                </span>
                <ChevronDown size={12} className="text-white/40" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-violet-950/95 rounded-lg border border-violet-500/30 z-50 shadow-2xl">
                  <div className="p-2">
                    <button
                      onClick={() => { setFilter({ period: 'todos' }); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                        filter.period === 'todos' ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-violet-500/20'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => { setFilter({ period: 'hoy' }); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                        filter.period === 'hoy' ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-violet-500/20'
                      }`}
                    >
                      Hoy
                    </button>
                    <button
                      onClick={() => { setFilter({ period: 'semanal' }); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                        filter.period === 'semanal' ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-violet-500/20'
                      }`}
                    >
                      Semanal
                    </button>
                    <button
                      onClick={() => { setFilter({ period: 'quincenal' }); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                        filter.period === 'quincenal' ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-violet-500/20'
                      }`}
                    >
                      Quincenal
                    </button>
                    <button
                      onClick={() => { setFilter({ period: 'mensual' }); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                        filter.period === 'mensual' ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-violet-500/20'
                      }`}
                    >
                      Mensual
                    </button>
                    <div className="border-t border-white/10 my-1"></div>
                    <button
                      onClick={() => { setFilter({ period: 'fecha' }); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                        filter.period === 'fecha' ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-violet-500/20'
                      }`}
                    >
                      Rango de fechas
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Date Range Picker for Custom Range */}
          {filter.period === 'fecha' && (
            <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 block mb-1">Desde</label>
                  <input
                    type="date"
                    value={filter.startDate || ''}
                    onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1">Hasta</label>
                  <input
                    type="date"
                    value={filter.endDate || ''}
                    onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent rounded-2xl p-6 border border-violet-500/20">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-white/60 text-sm mb-1">Monto total</p>
                <p className="text-3xl font-bold text-white">
                  {BCVService.formatBs(currentTotalGastadoBs)}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                <span className="text-xs text-violet-300 font-medium">Actividad</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {!loadingRates && rates.bcv > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-violet-300 text-xs font-medium">BCV</span>
                    <div className="w-8 h-4 rounded bg-violet-500/20"></div>
                  </div>
                  <p className="text-xl font-bold text-violet-200">
                    {currentTotalGastadoUSD.toFixed(2)}
                  </p>
                  <p className="text-violet-400/60 text-xs mt-1">Tasa oficial</p>
                </div>
              )}
              {!loadingRates && rates.usdt > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-300 text-xs font-medium">USDT</span>
                    <div className="w-8 h-4 rounded bg-blue-500/20"></div>
                  </div>
                  <p className="text-xl font-bold text-blue-200">
                    {BCVService.formatUSDT(currentTotalGastadoUSDT).replace('USDT ', '')}
                  </p>
                  <p className="text-blue-400/60 text-xs mt-1">Cripto</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/add-product"
          className="glass-button rounded-xl p-4 flex flex-col items-center gap-3 animate-slide-up aura-glow-subtle"
          style={{ animationDelay: '200ms' }}
        >
          <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Plus size={20} className="text-violet-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">Agregar</p>
            <p className="text-white/40 text-xs">Producto</p>
          </div>
        </Link>
        
        <Link
          to="/manage-stock"
          className="glass-button rounded-xl p-4 flex flex-col items-center gap-3 animate-slide-up aura-glow-subtle"
          style={{ animationDelay: '250ms' }}
        >
          <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Package size={20} className="text-violet-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">Stock</p>
            <p className="text-white/40 text-xs">Gestionar</p>
          </div>
        </Link>
        
        <Link
          to="/inventory"
          className="glass-button rounded-xl p-4 flex flex-col items-center gap-3 animate-slide-up aura-glow-subtle"
          style={{ animationDelay: '300ms' }}
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Package size={20} className="text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">Inventario</p>
            <p className="text-white/40 text-xs">Stock</p>
          </div>
        </Link>
        
        <Link
          to="/expenses"
          className="glass-button rounded-xl p-4 flex flex-col items-center gap-3 animate-slide-up aura-glow-subtle"
          style={{ animationDelay: '350ms' }}
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Receipt size={20} className="text-amber-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">Gastos</p>
            <p className="text-white/40 text-xs">Facturas</p>
          </div>
        </Link>
      </div>

      {/* Recent Products */}
      {products.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/60">Productos recientes</h2>
            <Link 
              to="/inventory" 
              className="btn-secondary px-3 py-1 rounded-full text-xs flex items-center gap-1 aura-glow-subtle"
            >
              Ver todo
              <span className="text-xs">→</span>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {products
              .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
              .slice(0, 4)
              .map((product) => (
              <Link
                key={product.id}
                to="/manage-stock"
                className="glass p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-colors duration-300"
              >
                <div>
                  <p className="text-sm font-medium text-white/80">{product.nombre}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {product.cantidad || 0} unidades &middot; {product.categoria}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-violet-300">
                    {BCVService.formatBs(product.precioUnitario || 0)}
                  </p>
                  {!loadingRates && rates.bcv > 0 && (
                    <p className="text-xs text-white/40">
                      ${((product.precioUnitario || 0) / rates.bcv).toFixed(3)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      {filteredExpenses.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '450ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/60">
              Gastos recientes 
              {filter.period !== 'todos' && (
                <span className="text-white/40 ml-2">
                  ({filter.period === 'hoy' ? 'Hoy' :
                    filter.period === 'semanal' ? 'Semana' :
                    filter.period === 'quincenal' ? '15 días' :
                    filter.period === 'mensual' ? 'Mes' :
                    filter.period === 'fecha' ? 'Personalizado' : ''})
                </span>
              )}
            </h2>
            <Link 
              to="/expenses" 
              className="btn-secondary px-3 py-1 rounded-full text-xs flex items-center gap-1 aura-glow-subtle"
            >
              Ver todo
              <span className="text-xs">→</span>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {filteredExpenses
              .sort((a, b) => new Date(b.fecha || '').getTime() - new Date(a.fecha || '').getTime())
              .slice(0, 2)
              .map((expense) => (
              <div
                key={expense.id}
                className="glass p-3.5 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-white/80">{expense.descripcion}</p>
                  <p className="text-xs text-white/30 mt-0.5">{expense.fecha}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-violet-300">
                    {BCVService.formatBs(expense.montoBs)}
                  </p>
                  {!loadingRates && rates.bcv > 0 && (
                    <p className="text-xs text-white/40">
                      ${((expense.montoBs || 0) / rates.bcv).toFixed(3)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Expenses Message */}
      {filteredExpenses.length === 0 && expenses.length > 0 && (
        <div className="glass p-8 text-center animate-slide-up" style={{ animationDelay: '450ms' }}>
          <p className="text-white/40 text-sm">
            No hay gastos en el período seleccionado
          </p>
        </div>
      )}
    </div>
  );
}
