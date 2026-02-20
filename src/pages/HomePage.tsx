import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, Receipt, Plus, Minus, History } from 'lucide-react';
import { useInventory } from '../store/useInventory';

export function HomePage() {
  const { tickets, fetchTickets } = useInventory();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const totalGastado = tickets.reduce((sum, t) => sum + t.total, 0);
  const totalItems = tickets.reduce((sum, t) => sum + t.items.length, 0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">INVCAS</h1>
          <p className="text-white/40 text-sm mt-0.5">Inventario familiar inteligente</p>
        </div>
        <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <span className="text-violet-400 text-sm font-bold">IC</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={14} className="text-violet-400" />
            <span className="text-white/40 text-xs font-medium">Tickets</span>
          </div>
          <p className="text-2xl font-bold text-white">{tickets.length}</p>
        </div>
        <div className="glass p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-violet-400" />
            <span className="text-white/40 text-xs font-medium">Productos</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalItems}</p>
        </div>
        <div className="glass p-4 col-span-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-violet-400" />
            <span className="text-white/40 text-xs font-medium">Total gastado</span>
          </div>
          <p className="text-3xl font-bold text-white">
            ${totalGastado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/manual"
          className="glass-button rounded-xl p-4 flex flex-col items-center gap-3 animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Plus size={20} className="text-violet-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">Agregar</p>
            <p className="text-white/40 text-xs">Manual</p>
          </div>
        </Link>
        
        <Link
          to="/inventory"
          className="glass-button rounded-xl p-4 flex flex-col items-center gap-3 animate-slide-up"
          style={{ animationDelay: '250ms' }}
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
          to="/history"
          className="glass-button rounded-xl p-4 flex flex-col items-center gap-3 animate-slide-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <History size={20} className="text-amber-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">Historial</p>
            <p className="text-white/40 text-xs">Facturas</p>
          </div>
        </Link>
        
        <Link
          to="/remove"
          className="glass-button rounded-xl p-4 flex flex-col items-center gap-3 animate-slide-up"
          style={{ animationDelay: '350ms' }}
        >
          <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
            <Minus size={20} className="text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">Remover</p>
            <p className="text-white/40 text-xs">Stock</p>
          </div>
        </Link>
      </div>

      {/* Recent Tickets */}
      {tickets.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/60">Recientes</h2>
            <Link to="/inventory" className="text-xs text-violet-400/70 hover:text-violet-400 transition-colors duration-300">
              Ver todo
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {tickets.slice(0, 3).map((ticket) => (
              <Link
                key={ticket.id}
                to={`/inventory/${ticket.id}`}
                className="glass p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-colors duration-300"
              >
                <div>
                  <p className="text-sm font-medium text-white/80">{ticket.tienda}</p>
                  <p className="text-xs text-white/30 mt-0.5">{ticket.fecha} &middot; {ticket.items.length} items</p>
                </div>
                <p className="text-sm font-semibold text-violet-300">
                  ${ticket.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
