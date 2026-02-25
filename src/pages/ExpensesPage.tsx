import { useState, useEffect } from 'react';
import { Filter, TrendingUp, DollarSign, Plus, X, ArrowLeft, CheckCircle, AlertTriangle, Trash2, ChevronDown, Calendar, Receipt, Search } from 'lucide-react';
import { useMultiUserFirestoreStore } from '../store/useMultiUserFirestoreStore';
import { BCVService } from '../services/bcvService';
import { Link } from 'react-router-dom';
import ExchangeRatesHeader from '../components/ExchangeRatesHeader';
import UserFilter from '../components/UserFilter';
import { scrollToTop } from '../utils/scrollUtils';
import type { FilterOptions, ExpenseRecord } from '../types';

export function ExpensesPage() {
  const { expenses, loadExpenses, addExpense, deleteExpense } = useMultiUserFirestoreStore();
  const [filter, setFilter] = useState<FilterOptions>({ period: 'todos' });
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseRecord | null>(null);
  const [expenseMessage, setExpenseMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<number | null>(null);
  const [rates, setRates] = useState({ bcv: 0, usdt: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Auto-hide timer for messages
  const startAutoHideTimer = () => {
    // Clear any existing timer
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
    }
    
    // Set new timer for 5 seconds
    const timer = setTimeout(() => {
      setExpenseMessage(null);
      setAutoHideTimer(null);
    }, 5000);
    
    setAutoHideTimer(timer);
  };

  const clearAutoHideTimer = () => {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      setAutoHideTimer(null);
    }
  };

  // Start auto-hide timer when message is set
  useEffect(() => {
    if (expenseMessage) {
      startAutoHideTimer();
    } else {
      clearAutoHideTimer();
    }
    
    // Cleanup on unmount
    return () => clearAutoHideTimer();
  }, [expenseMessage]);

  const handleModalInteraction = () => {
    // Clear timer when user interacts with modal
    clearAutoHideTimer();
  };

  const handleModalMouseLeave = () => {
    // Restart timer when mouse leaves modal
    if (expenseMessage) {
      startAutoHideTimer();
    }
  };

  // Color system for expense types
  const tipoColors = {
    stock: { 
      color: 'teal', 
      emoji: '📈',
      label: 'Stock/Inventario',
      bg: 'bg-teal-500/20',
      text: 'text-teal-300',
      border: 'border-teal-500/30',
      gradient: 'bg-gradient-to-b from-teal-400 to-teal-600'
    },
    compra: { 
      color: 'emerald', 
      emoji: '🛒',
      label: 'Compras',
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
      gradient: 'bg-gradient-to-b from-emerald-400 to-emerald-600'
    },
    gasto: { 
      color: 'violet', 
      emoji: '💳',
      label: 'Gastos Personales',
      bg: 'bg-violet-500/20',
      text: 'text-violet-300',
      border: 'border-violet-500/30',
      gradient: 'bg-gradient-to-b from-violet-400 to-violet-600'
    },
    salida: { 
      color: 'rose', 
      emoji: '🍽️',
      label: 'Restaurantes',
      bg: 'bg-rose-500/20',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      gradient: 'bg-gradient-to-b from-rose-400 to-rose-600'
    },
    entretenimiento: { 
      color: 'purple', 
      emoji: '🎬',
      label: 'Entretenimiento',
      bg: 'bg-purple-500/20',
      text: 'text-purple-300',
      border: 'border-purple-500/30',
      gradient: 'bg-gradient-to-b from-purple-400 to-purple-600'
    },
    transporte: { 
      color: 'blue', 
      emoji: '🚗',
      label: 'Transporte',
      bg: 'bg-blue-500/20',
      text: 'text-blue-300',
      border: 'border-blue-500/30',
      gradient: 'bg-gradient-to-b from-blue-400 to-blue-600'
    },
    servicio: { 
      color: 'cyan', 
      emoji: '📱',
      label: 'Servicios',
      bg: 'bg-cyan-500/20',
      text: 'text-cyan-300',
      border: 'border-cyan-500/30',
      gradient: 'bg-gradient-to-b from-cyan-400 to-cyan-600'
    },
    salud: { 
      color: 'red', 
      emoji: '🏥',
      label: 'Salud',
      bg: 'bg-red-500/20',
      text: 'text-red-300',
      border: 'border-red-500/30',
      gradient: 'bg-gradient-to-b from-red-400 to-red-600'
    },
    educacion: { 
      color: 'indigo', 
      emoji: '📚',
      label: 'Educación',
      bg: 'bg-indigo-500/20',
      text: 'text-indigo-300',
      border: 'border-indigo-500/30',
      gradient: 'bg-gradient-to-b from-indigo-400 to-indigo-600'
    },
    hogar: { 
      color: 'orange', 
      emoji: '🏠',
      label: 'Hogar',
      bg: 'bg-orange-500/20',
      text: 'text-orange-300',
      border: 'border-orange-500/30',
      gradient: 'bg-gradient-to-b from-orange-400 to-orange-600'
    },
    otros: { 
      color: 'gray', 
      emoji: '📦',
      label: 'Otros',
      bg: 'bg-gray-500/20',
      text: 'text-gray-300',
      border: 'border-gray-500/30',
      gradient: 'bg-gradient-to-b from-gray-400 to-gray-600'
    }
  } as const;

  const [newExpense, setNewExpense] = useState<Partial<ExpenseRecord>>({
      descripcion: '',
      montoBs: undefined,
      categoria: '',
      tipo: 'gasto' as 'stock' | 'compra' | 'gasto' | 'salida' | 'entretenimiento' | 'transporte' | 'servicio' | 'salud' | 'educacion' | 'hogar' | 'otros',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { BCVService } = await import('../services/bcvService');
        const { bcv, usdt } = await BCVService.getAllRates();
        setRates({ bcv, usdt });
      } catch (error) {
        console.error('Error fetching BCV rate:', error);
        setRates({ bcv: 36.50, usdt: 38.20 }); // Fallback rates
      }
      
      // Load expenses based on selected user
      if (selectedUserId) {
        // Admin selected a specific user - load that user's expenses
        const { loadUserExpenses } = useMultiUserFirestoreStore.getState();
        loadUserExpenses(selectedUserId);
      } else {
        // Load current user's expenses (not all expenses)
        const { loadExpenses } = useMultiUserFirestoreStore.getState();
        loadExpenses();
      }
    };
    
    fetchData();
  }, [selectedUserId, filter]);

  const handleAddExpense = async () => {
    if (!newExpense.descripcion || (newExpense.montoBs || 0) <= 0) return;
    
    setLoading(true);
    
    try {
      const expense: Omit<ExpenseRecord, 'id'> = {
        descripcion: newExpense.descripcion,
        montoBs: newExpense.montoBs || 0,
        categoria: newExpense.categoria || '',
        tipo: newExpense.tipo || 'gasto',
        montoUSD: BCVService.convertBsToUSD(newExpense.montoBs || 0, rates.bcv),
        montoUSDT: rates.bcv ? (newExpense.montoBs || 0) / rates.bcv : 0,
        fecha: new Date().toISOString().split('T')[0],
        bcvRate: rates.bcv,
        usdtRate: rates.bcv, // Using BCV rate as fallback for USDT
      };

      await addExpense(expense);
      
      setExpenseMessage({
        type: 'success',
        message: `Gasto "${newExpense.descripcion}" agregado correctamente`
      });
      scrollToTop();
      
      // Reset form
      setNewExpense({
        descripcion: '',
        montoBs: undefined,
        categoria: '',
        tipo: 'gasto' as 'stock' | 'compra' | 'gasto' | 'salida' | 'entretenimiento' | 'transporte' | 'servicio' | 'salud' | 'educacion' | 'hogar' | 'otros',
      });
      setShowAddExpense(false);
      loadExpenses();
      
    } catch (error) {
      console.error('Error adding expense:', error);
      setExpenseMessage({
        type: 'error',
        message: 'Error al agregar el gasto. Inténtalo de nuevo.'
      });
      scrollToTop();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = (expense: any) => {
    scrollToTop();
    setDeletingExpense(expense);
  };

  const confirmDeleteExpense = async () => {
    if (!deletingExpense) return;
    
    setLoading(true);
    
    try {
      await deleteExpense(deletingExpense.id);
      
      setExpenseMessage({
        type: 'success',
        message: `Gasto "${deletingExpense.descripcion}" eliminado correctamente`
      });
      scrollToTop();
      
      loadExpenses();
      
      // Cerrar modal después de mostrar éxito
      setDeletingExpense(null);
      
    } catch (error) {
      console.error('Error deleting expense:', error);
      setExpenseMessage({
        type: 'error',
        message: 'Error al eliminar el gasto. Inténtalo de nuevo.'
      });
      scrollToTop();
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteExpense = () => {
    setDeletingExpense(null);
    setExpenseMessage(null);
  };

  const getFilteredExpenses = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Helper function to parse date string properly
    const parseDate = (dateString: string) => {
      try {
        // Handle ISO format YYYY-MM-DD (most common)
        if (dateString.includes('-') && dateString.length === 10) {
          const [year, month, day] = dateString.split('-').map(Number);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month - 1, day);
          }
        }
        // Handle DD/MM/YYYY format
        if (dateString.includes('/')) {
          const [day, month, year] = dateString.split('/').map(Number);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month - 1, day);
          }
        }
        // Handle other formats
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date;
        }
        return null;
      } catch {
        return null;
      }
    };
    
    let filtered = [...expenses];

    // Apply user filter first (if admin and user is selected)
    if (selectedUserId) {
      filtered = filtered.filter(expense => expense.userId === selectedUserId);
    }

    // Apply search filter first
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.descripcion.toLowerCase().includes(searchLower) ||
        expense.categoria.toLowerCase().includes(searchLower)
      );
    }

    // Apply period filter
    switch (filter.period) {
      case 'hoy':
        filtered = filtered.filter(expense => {
          const expenseDate = parseDate(expense.fecha);
          if (!expenseDate) return false;
          return expenseDate.getTime() >= today.getTime() && expenseDate.getTime() < today.getTime() + (24 * 60 * 60 * 1000);
        });
        break;
        
      case 'semanal':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(expense => {
          const expenseDate = parseDate(expense.fecha);
          if (!expenseDate) return false;
          return expenseDate >= weekAgo;
        });
        break;
        
      case 'quincenal':
        const fifteenDaysAgo = new Date(today);
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        filtered = filtered.filter(expense => {
          const expenseDate = parseDate(expense.fecha);
          if (!expenseDate) return false;
          return expenseDate >= fifteenDaysAgo;
        });
        break;
        
      case 'mensual':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(expense => {
          const expenseDate = parseDate(expense.fecha);
          if (!expenseDate) return false;
          return expenseDate >= monthAgo;
        });
        break;
        
      case 'fecha':
        if (filter.startDate && filter.endDate) {
          const start = parseDate(filter.startDate);
          const end = parseDate(filter.endDate);
          if (start && end) {
            filtered = filtered.filter(expense => {
              const expenseDate = parseDate(expense.fecha);
              if (!expenseDate) return false;
              return expenseDate >= start && expenseDate <= end;
            });
          }
        }
        break;
    }
    
    // Filter by tipo
    if (filter.tipo) {
      filtered = filtered.filter(e => e.tipo === filter.tipo);
    }

    return filtered.sort((a, b) => {
      const dateA = parseDate(a.fecha);
      const dateB = parseDate(b.fecha);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    });
  };

  const getTotalExpenses = () => {
    return getFilteredExpenses().reduce((sum, e) => sum + e.montoBs, 0);
  };

  const getTotalExpensesUSD = () => {
    const totalBs = getTotalExpenses();
    return rates.bcv > 0 ? totalBs / rates.bcv : 0;
  };

  const getTotalExpensesUSDT = () => {
    const totalBs = getTotalExpenses();
    return rates.usdt > 0 ? totalBs / rates.usdt : 0;
  };

  const filteredExpenses = getFilteredExpenses();

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg glass hover:bg-white/10 transition-colors duration-200">
            <ArrowLeft size={20} className="text-white/60" />
          </Link>
          <h1 className="text-lg font-semibold text-white">Gastos y Facturas</h1>
        </div>
        <button
          onClick={() => {
            scrollToTop();
            setShowAddExpense(true);
          }}
          className="p-2 rounded-lg glass-button text-violet-400 hover:text-violet-300 aura-glow"
        >
          <Plus size={18} />
        </button>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-violet-400" />
            <span className="text-white/40 text-xs font-medium">Total Bs</span>
          </div>
          <p className="text-xl font-bold text-white">
            {BCVService.formatBs(getTotalExpenses())}
          </p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-white/40 text-xs font-medium">Total USD</span>
          </div>
          <p className="text-xl font-bold text-emerald-300">
            {getTotalExpensesUSD().toFixed(2)}
          </p>
        </div>
        <div className="glass p-4 col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-white/40 text-xs font-medium">Total USDT</span>
          </div>
          <p className="text-xl font-bold text-blue-300">
            {BCVService.formatUSDT(getTotalExpensesUSDT()).replace('USDT ', '')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass p-4 relative z-[9998]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Filter size={18} className="text-violet-300" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Filtrar Gastos</h3>
              <p className="text-white/40 text-xs">
                {filter.period === 'todos' ? 'Todos los períodos' : 
                 filter.period === 'hoy' ? 'Hoy' :
                 filter.period === 'semanal' ? 'Última semana' :
                 filter.period === 'quincenal' ? 'Últimos 15 días' :
                 filter.period === 'mensual' ? 'Último mes' :
                 filter.period === 'fecha' ? 'Rango personalizado' : 'Todos los períodos'}
              </p>
            </div>
          </div>
          
          {/* Period Filter Dropdown */}
          <div className="relative z-[9999]">
            <button
              onClick={() => setShowFilters(!showFilters)}
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
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-violet-950/95 rounded-lg border border-violet-500/30 z-[9999] shadow-2xl">
                <div className="p-2">
                  <button
                    onClick={() => { setFilter({ ...filter, period: 'todos' }); setShowFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                      filter.period === 'todos' ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-violet-500/20'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => { setFilter({ ...filter, period: 'hoy' }); setShowFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                      filter.period === 'hoy' ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-violet-500/20'
                    }`}
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => { setFilter({ ...filter, period: 'semanal' }); setShowFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                      filter.period === 'semanal' ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-violet-500/20'
                    }`}
                  >
                    Semanal
                  </button>
                  <button
                    onClick={() => { setFilter({ ...filter, period: 'quincenal' }); setShowFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                      filter.period === 'quincenal' ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-violet-500/20'
                    }`}
                  >
                    Quincenal
                  </button>
                  <button
                    onClick={() => { setFilter({ ...filter, period: 'mensual' }); setShowFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                      filter.period === 'mensual' ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-violet-500/20'
                    }`}
                  >
                    Mensual
                  </button>
                  <div className="border-t border-white/10 my-1"></div>
                  <button
                    onClick={() => { setFilter({ ...filter, period: 'fecha' }); setShowFilters(false); }}
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

        {/* Additional Filters */}
        <div>
          <label className="text-xs text-white/40 block mb-1">Tipo</label>
          <select
            value={filter.tipo || ''}
            onChange={(e) => setFilter({ ...filter, tipo: e.target.value || undefined })}
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
            <option value="">Todos los tipos</option>
            <option value="stock">📈 Stock/Inventario</option>
            <option value="compra">🛒 Compras</option>
            <option value="gasto">💳 Gastos Personales</option>
            <option value="salida">🍽️ Restaurantes</option>
            <option value="entretenimiento">🎬 Entretenimiento</option>
            <option value="transporte">🚗 Transporte</option>
            <option value="servicio">📱 Servicios</option>
            <option value="salud">🏥 Salud</option>
            <option value="educacion">📚 Educación</option>
            <option value="hogar">🏠 Hogar</option>
            <option value="otros">📦 Otros</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" 
          />
          <input
            type="text"
            placeholder="Buscar gastos por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50 transition-colors mt-3"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-white/40" />
            </button>
          )}
        </div>
        
        {searchTerm && (
          <div className="mt-2 text-xs text-white/40">
            {getFilteredExpenses().length} {getFilteredExpenses().length === 1 ? 'gasto encontrado' : 'gastos encontrados'}
          </div>
        )}
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.map((expense) => {
          const tipoConfig = tipoColors[expense.tipo as keyof typeof tipoColors] || tipoColors.otros;
          
          return (
            <div key={expense.id} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.1] backdrop-blur-sm hover:border-white/[0.2] transition-all duration-300">
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${tipoConfig.gradient}`} />
              
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${tipoConfig.bg} ${tipoConfig.text} ${tipoConfig.border}`}>
                        {tipoConfig.emoji} {tipoConfig.label}
                      </span>
                      {expense.categoria && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/[0.05] text-white/60 border border-white/[0.1]">
                          {expense.categoria}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-base font-medium text-white mb-1 truncate">
                      {expense.descripcion}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Calendar size={12} />
                      <span>{expense.fecha}</span>
                    </div>
                  </div>

                  {/* Right content - amounts and delete */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className={`text-lg font-bold mb-2 ${tipoConfig.text}`}>
                        {BCVService.formatBs(expense.montoBs)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs text-white/60">
                          <span className="text-violet-400 font-medium">BCV</span>
                          <span className="text-violet-300 font-medium">{BCVService.formatUSD(expense.montoUSD).replace('$', '')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-blue-300">
                          <span className="text-blue-400/60">USDT</span>
                          <span>{BCVService.formatUSDT(expense.montoBs / rates.usdt).replace('USDT ', '')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteExpense(expense)}
                      disabled={loading}
                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      title="Eliminar gasto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredExpenses.length === 0 && (
          <div className="glass p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mx-auto mb-4">
              <Receipt size={24} className="text-white/40" />
            </div>
            <p className="text-white/40 text-sm font-medium">No hay gastos registrados</p>
            <p className="text-white/20 text-xs mt-1">Agrega tu primer gasto para comenzar</p>
          </div>
        )}
      </div>

      {/* Success/Error Message - Modal Style like Add-Product */}
      {expenseMessage && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-50 animate-fade-in pt-8 modal-container"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setExpenseMessage(null);
            }
          }}
          onMouseEnter={handleModalInteraction}
          onMouseLeave={handleModalMouseLeave}
        >
          <div 
            className={`p-6 rounded-xl max-w-sm mx-4 animate-slide-up shadow-2xl modal-content ${
              expenseMessage.type === 'success' ? 'success' : 'error'
            }`}
            onMouseEnter={handleModalInteraction}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full ${
                expenseMessage.type === 'success' 
                  ? 'bg-green-500/20' 
                  : 'bg-red-500/20'
              } flex items-center justify-center`}>
                {expenseMessage.type === 'success' ? (
                  <CheckCircle size={24} className="text-green-400" />
                ) : (
                  <AlertTriangle size={24} className="text-red-400" />
                )}
              </div>
              <div>
                <h3 className="text-white font-medium">
                  {expenseMessage.type === 'success' ? '¡Éxito!' : '¡Error!'}
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  {expenseMessage.type === 'success' 
                    ? 'Gasto agregado correctamente' 
                    : 'Error al agregar el gasto'
                  }
                </p>
              </div>
            </div>
            <div className={`message-${expenseMessage.type}`}>
              <div className="flex items-center gap-2">
                {expenseMessage.type === 'success' ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
                <span className="text-sm">{expenseMessage.message}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setExpenseMessage(null);
                  handleModalInteraction();
                }}
                className="btn-secondary flex-1"
              >
                Cerrar
              </button>
              {expenseMessage.type === 'success' && (
                <button
                  onClick={() => {
                    setExpenseMessage(null);
                    handleModalInteraction();
                    // Optional: Navigate to expenses list or do something else
                  }}
                  className="btn-primary flex-1 aura-glow"
                >
                  Ver Gastos
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-[10000] animate-fade-in pt-8 modal-container"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddExpense(false);
            }
          }}
        >
          <div className="p-6 rounded-xl max-w-sm mx-4 animate-slide-up shadow-2xl modal-content">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <DollarSign size={24} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Agregar Gasto</h3>
                <p className="text-white/60 text-sm mt-1">Registra un nuevo gasto en tu presupuesto</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">Descripción</label>
                <input
                  type="text"
                  value={newExpense.descripcion}
                  onChange={(e) => setNewExpense({ ...newExpense, descripcion: e.target.value })}
                  placeholder="Ej: Pago de servicios, almuerzo en restaurante"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 block mb-1">Monto (Bs)</label>
                  <input
                    type="number"
                    value={newExpense.montoBs || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, montoBs: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="48000"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-400/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1">Tipo</label>
                  <select
                    value={newExpense.tipo}
                    onChange={(e) => setNewExpense({ ...newExpense, tipo: e.target.value as 'compra' | 'gasto' | 'salida' | 'entretenimiento' | 'transporte' | 'servicio' | 'salud' | 'educacion' | 'hogar' | 'otros' })}
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
                    <option value="gasto">💳 Gastos Personales</option>
                    <option value="stock">📈 Stock/Inventario</option>
                    <option value="compra">🛒 Compras</option>
                    <option value="salida">🍽️ Restaurantes</option>
                    <option value="entretenimiento">🎬 Entretenimiento</option>
                    <option value="transporte">🚗 Transporte</option>
                    <option value="servicio">📱 Servicios</option>
                    <option value="salud">🏥 Salud</option>
                    <option value="educacion">📚 Educación</option>
                    <option value="hogar">🏠 Hogar</option>
                    <option value="otros">📦 Otros</option>
                  </select>
                </div>
              </div>

              {newExpense.montoBs && newExpense.montoBs > 0 && (
                <div className="glass p-3 border border-violet-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40">Equivalente en USD</span>
                    <span className="text-sm font-semibold text-violet-300">
                      {BCVService.formatUSD(BCVService.convertBsToUSD(newExpense.montoBs, rates.bcv))}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddExpense(false)}
                  className="btn-secondary flex-1 py-2.5"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddExpense}
                  disabled={!newExpense.descripcion || (newExpense.montoBs || 0) <= 0 || loading}
                  className="btn-primary flex-1 aura-glow disabled:opacity-50 disabled:cursor-not-allowed py-2.5"
                >
                  {loading ? 'Guardando...' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
        <div 
          className="fixed inset-0 flex items-start justify-center z-[10000] animate-fade-in pt-8 modal-container"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeletingExpense(null);
            }
          }}
        >
          <div className="p-6 rounded-xl max-w-sm mx-4 animate-slide-up shadow-2xl modal-content delete">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Eliminar Gasto</h3>
                <p className="text-white/60 text-sm mt-1">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm mb-2">
                ¿Estás seguro de que quieres eliminar <span className="font-bold">{deletingExpense.descripcion}</span>?
              </p>
              <p className="text-red-200/70 text-xs">
                {(() => {
                  const tipoConfig = tipoColors[deletingExpense.tipo as keyof typeof tipoColors] || tipoColors.otros;
                  return (
                    <>
                      {tipoConfig.emoji} {tipoConfig.label} • 
                      Monto: {BCVService.formatBs(deletingExpense.montoBs)} • 
                      Fecha: {deletingExpense.fecha}
                    </>
                  );
                })()}
              </p>
            </div>

            {/* Success/Error Message */}
            {expenseMessage && (
              <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-fade-in ${
                expenseMessage.type === 'success' 
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' 
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  {expenseMessage.type === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                  <span className="text-sm">{expenseMessage.message}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cancelDeleteExpense}
                className="btn-secondary flex-1 py-2.5"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteExpense}
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
