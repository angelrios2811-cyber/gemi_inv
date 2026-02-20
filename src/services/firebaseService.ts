import type { DataService, Ticket } from '../types';

/**
 * Firebase implementation stub.
 * Replace with real Firestore calls when deploying to production.
 *
 * Required setup:
 * 1. npm install firebase
 * 2. Create src/lib/firebase.ts with your config
 * 3. Initialize Firestore and wire up the methods below
 */
export class FirebaseService implements DataService {
  async getTickets(): Promise<Ticket[]> {
    // TODO: const snap = await getDocs(query(collection(db, 'tickets'), orderBy('creadoEn', 'desc')));
    // return snap.docs.map(d => ({ id: d.id, ...d.data() } as Ticket));
    throw new Error('FirebaseService no configurado. Configura Firebase para producción.');
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    // TODO: const snap = await getDoc(doc(db, 'tickets', id));
    // return snap.exists() ? { id: snap.id, ...snap.data() } as Ticket : undefined;
    void id;
    throw new Error('FirebaseService no configurado.');
  }

  async addTicket(ticket: Ticket): Promise<void> {
    // TODO: await setDoc(doc(db, 'tickets', ticket.id), ticket);
    void ticket;
    throw new Error('FirebaseService no configurado.');
  }

  async deleteTicket(id: string): Promise<void> {
    // TODO: await deleteDoc(doc(db, 'tickets', id));
    void id;
    throw new Error('FirebaseService no configurado.');
  }

  async updateTicket(ticket: Ticket): Promise<void> {
    // TODO: await setDoc(doc(db, 'tickets', ticket.id), ticket, { merge: true });
    void ticket;
    throw new Error('FirebaseService no configurado.');
  }
}
