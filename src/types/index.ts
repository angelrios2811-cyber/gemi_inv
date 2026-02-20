export interface TicketItem {
  nombre: string;
  precio: number;
  categoria: string;
}

export interface Ticket {
  id: string;
  tienda: string;
  fecha: string;
  total: number;
  items: TicketItem[];
  imagenBase64?: string;
  creadoEn: number;
}

export interface ParsedTicket {
  tienda: string;
  fecha: string;
  total: number;
  items: TicketItem[];
}

export interface DataService {
  getTickets(): Promise<Ticket[]>;
  getTicketById(id: string): Promise<Ticket | undefined>;
  addTicket(ticket: Ticket): Promise<void>;
  deleteTicket(id: string): Promise<void>;
  updateTicket(ticket: Ticket): Promise<void>;
}
