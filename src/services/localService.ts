import Dexie, { type EntityTable } from 'dexie';
import type { DataService, Ticket } from '../types';

const db = new Dexie('invcas') as Dexie & {
  tickets: EntityTable<Ticket, 'id'>;
};

db.version(1).stores({
  tickets: 'id, tienda, fecha, creadoEn',
});

export class LocalStorageService implements DataService {
  async getTickets(): Promise<Ticket[]> {
    return db.tickets.orderBy('creadoEn').reverse().toArray();
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    return db.tickets.get(id);
  }

  async addTicket(ticket: Ticket): Promise<void> {
    await db.tickets.add(ticket);
  }

  async deleteTicket(id: string): Promise<void> {
    await db.tickets.delete(id);
  }

  async updateTicket(ticket: Ticket): Promise<void> {
    await db.tickets.put(ticket);
  }
}
