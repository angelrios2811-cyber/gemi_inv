import type { DataService } from '../types';
import { LocalStorageService } from './localService';
import { FirebaseService } from './firebaseService';

const mode = import.meta.env.VITE_DB_MODE ?? 'local';

let instance: DataService;

if (mode === 'firebase') {
  instance = new FirebaseService();
} else {
  instance = new LocalStorageService();
}

export const dataService: DataService = instance;
