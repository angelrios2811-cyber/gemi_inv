import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Trash2, ChevronRight } from 'lucide-react';
import { useInventory } from '../store/useInventory';

export function InventoryPage() {
  const { tickets, loading, fetchTickets, deleteTicket } = useInventory();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteTicket(id);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Inventario</h1>
        <p className="text-white/40 text-xs mt-0.5">{tickets.length} tickets registrados</p>
      </div>

      {loading && tickets.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-400 aura-spinner" />
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center">
            <Package size={28} className="text-white/20" />
          </div>
          <div className="text-center">
            <p className="text-white/50 text-sm font-medium">Sin tickets</p>
            <p className="text-white/25 text-xs mt-1">Escanea tu primer ticket para comenzar</p>
          </div>
          <Link
            to="/scan"
            className="mt-2 px-6 py-2.5 rounded-xl glass-button text-violet-300 text-sm font-medium"
          >
            Escanear ticket
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {tickets.map((ticket, i) => (
          <Link
            key={ticket.id}
            to={`/inventory/${ticket.id}`}
            className="glass p-4 flex items-center gap-3 hover:bg-white/[0.04] transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <Package size={18} className="text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{ticket.tienda}</p>
              <p className="text-[11px] text-white/30 mt-0.5">
                {ticket.fecha} &middot; {ticket.items.length} productos
              </p>
            </div>
            <p className="text-sm font-semibold text-violet-300 shrink-0">
              ${ticket.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <button
              onClick={(e) => handleDelete(e, ticket.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all duration-300 shrink-0"
            >
              <Trash2 size={14} />
            </button>
            <ChevronRight size={14} className="text-white/15 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
