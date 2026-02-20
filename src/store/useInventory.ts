import { create } from 'zustand';
import type { Ticket } from '../types';
import { dataService } from '../services/dataFacade';

interface InventoryState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  fetchTickets: () => Promise<void>;
  addTicket: (ticket: Ticket) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  updateTicket: (ticket: Ticket) => Promise<void>;
  clearError: () => void;
}

export const useInventory = create<InventoryState>((set, get) => ({
  tickets: [],
  loading: false,
  error: null,

  fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const tickets = await dataService.getTickets();
      set({ tickets, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addTicket: async (ticket: Ticket) => {
    set({ loading: true, error: null });
    try {
      await dataService.addTicket(ticket);
      set({ tickets: [ticket, ...get().tickets], loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deleteTicket: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await dataService.deleteTicket(id);
      set({ tickets: get().tickets.filter((t) => t.id !== id), loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateTicket: async (ticket: Ticket) => {
    set({ loading: true, error: null });
    try {
      await dataService.updateTicket(ticket);
      set({
        tickets: get().tickets.map((t) => (t.id === ticket.id ? ticket : t)),
        loading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
