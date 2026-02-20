import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, Calendar, DollarSign } from 'lucide-react';
import { useInventory } from '../store/useInventory';

export function HistoryPage() {
  const navigate = useNavigate();
  const { tickets, fetchTickets, loading } = useInventory();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const totalGastado = tickets.reduce((sum, t) => sum + t.total, 0);

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
        <h1 className="text-lg font-semibold text-white">Historial de facturas</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={14} className="text-amber-400" />
            <span className="text-white/40 text-xs font-medium">Total facturas</span>
          </div>
          <p className="text-2xl font-bold text-white">{tickets.length}</p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-amber-400" />
            <span className="text-white/40 text-xs font-medium">Total gastado</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${totalGastado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="glass p-8 text-center">
            <p className="text-white/40">Cargando...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="glass p-8 text-center">
            <Receipt size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No hay facturas registradas</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/inventory/${ticket.id}`)}
              className="glass p-4 cursor-pointer hover:bg-white/[0.04] transition-colors duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{ticket.tienda}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-white/30 text-xs">
                      <Calendar size={12} />
                      {ticket.fecha}
                    </div>
                    <span className="text-white/30 text-xs">
                      {ticket.items.length} productos
                    </span>
                  </div>
                </div>
                <p className="text-amber-300 font-bold">
                  ${ticket.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
