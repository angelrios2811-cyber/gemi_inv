import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { useInventory } from '../store/useInventory';
import type { TicketItem } from '../types';

export function ManualEntryPage() {
  const navigate = useNavigate();
  const { addTicket } = useInventory();
  const [tienda, setTienda] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<TicketItem[]>([{ nombre: '', precio: 0, categoria: '' }]);
  const [saved, setSaved] = useState(false);

  const addItem = () => {
    setItems([...items, { nombre: '', precio: 0, categoria: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof TicketItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + (item.precio || 0), 0);
  };

  const handleSave = async () => {
    if (!tienda || items.every(item => !item.nombre)) return;

    const ticket = {
      id: crypto.randomUUID(),
      tienda,
      fecha,
      total: getTotal(),
      items: items.filter(item => item.nombre && item.precio > 0),
      creadoEn: Date.now(),
    };

    await addTicket(ticket);
    setSaved(true);
    setTimeout(() => navigate('/inventory'), 800);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center aura-glow">
          <Check size={28} className="text-emerald-400" />
        </div>
        <p className="text-white/70 text-sm font-medium">Ticket guardado</p>
      </div>
    );
  }

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
        <h1 className="text-lg font-semibold text-white">Ingreso manual</h1>
      </div>

      {/* Basic info */}
      <div className="glass p-4 space-y-4">
        <div>
          <label className="text-xs text-white/40 block mb-1">Tienda</label>
          <input
            type="text"
            value={tienda}
            onChange={(e) => setTienda(e.target.value)}
            placeholder="Ej: Walmart, Oxxo, Superama"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-400/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-400/50 transition-colors"
          />
        </div>
      </div>

      {/* Items */}
      <div className="glass p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/70">Productos</h3>
          <button
            onClick={addItem}
            className="p-1.5 rounded-lg glass-button text-violet-400 hover:text-violet-300"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={item.nombre}
                  onChange={(e) => updateItem(index, 'nombre', e.target.value)}
                  placeholder="Nombre del producto"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-violet-400/50 transition-colors"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={item.precio || ''}
                    onChange={(e) => updateItem(index, 'precio', parseFloat(e.target.value) || 0)}
                    placeholder="Precio"
                    step="0.01"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-violet-400/50 transition-colors"
                  />
                  <input
                    type="text"
                    value={item.categoria}
                    onChange={(e) => updateItem(index, 'categoria', e.target.value)}
                    placeholder="Categoría"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-violet-400/50 transition-colors"
                  />
                </div>
              </div>
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors mt-1"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="glass p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/60">Total</span>
          <span className="text-lg font-bold text-violet-300">
            ${getTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!tienda || items.every(item => !item.nombre)}
        className="w-full py-3.5 rounded-xl glass-button text-violet-300 font-medium text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed aura-glow"
      >
        Guardar ticket
      </button>
    </div>
  );
}
