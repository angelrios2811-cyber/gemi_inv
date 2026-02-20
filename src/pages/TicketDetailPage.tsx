import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Store, Calendar, DollarSign } from 'lucide-react';
import { useInventory } from '../store/useInventory';
import type { Ticket } from '../types';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tickets, fetchTickets, deleteTicket } = useInventory();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (tickets.length === 0) {
      fetchTickets();
    }
  }, [tickets.length, fetchTickets]);

  useEffect(() => {
    const found = tickets.find((t) => t.id === id);
    setTicket(found ?? null);
  }, [tickets, id]);

  const handleDelete = async () => {
    if (!id) return;
    await deleteTicket(id);
    navigate('/inventory');
  };

  if (!ticket) {
    return (
      <div className="flex items-center justify-center py-20 animate-fade-in">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-400 aura-spinner" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl glass-button text-white/50"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold text-white truncate">{ticket.tienda}</h1>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 rounded-xl glass-button text-red-400/60 hover:text-red-400"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Ticket image */}
      {ticket.imagenBase64 && (
        <div className="animate-slide-up">
          <img
            src={ticket.imagenBase64}
            alt="Ticket"
            className="w-full rounded-xl border border-white/10 max-h-48 object-cover"
          />
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-2 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="glass p-3 text-center">
          <Store size={14} className="text-violet-400 mx-auto mb-1" />
          <p className="text-[10px] text-white/30">Tienda</p>
          <p className="text-xs text-white/70 font-medium mt-0.5 truncate">{ticket.tienda}</p>
        </div>
        <div className="glass p-3 text-center">
          <Calendar size={14} className="text-violet-400 mx-auto mb-1" />
          <p className="text-[10px] text-white/30">Fecha</p>
          <p className="text-xs text-white/70 font-medium mt-0.5">{ticket.fecha}</p>
        </div>
        <div className="glass p-3 text-center">
          <DollarSign size={14} className="text-violet-400 mx-auto mb-1" />
          <p className="text-[10px] text-white/30">Total</p>
          <p className="text-xs text-violet-300 font-bold mt-0.5">
            ${ticket.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Items list */}
      <div className="glass p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-sm font-semibold text-white/60 mb-3">
          Productos ({ticket.items.length})
        </h2>
        <div className="space-y-0">
          {ticket.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/80 truncate">{item.nombre}</p>
                <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/30">
                  {item.categoria}
                </span>
              </div>
              <p className="text-sm text-white/60 font-medium shrink-0 ml-3">
                ${item.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
