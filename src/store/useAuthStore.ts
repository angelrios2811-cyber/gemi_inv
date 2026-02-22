import { create } from 'zustand';

interface User {
  email: string;
  name: string;
  role: 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Credenciales hardcodeadas para el sistema
const VALID_CREDENTIALS = {
  email: 'admin@invcas.com',
  password: 'INVCAS2024!',
  name: 'Administrador',
  role: 'admin' as const
};

// Estado global simple
let globalState: AuthState = {
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {}
};

// Recuperar estado del localStorage al inicio
const storedUser = localStorage.getItem('auth-user');
const storedAuth = localStorage.getItem('auth-isAuthenticated');

if (storedUser && storedAuth === 'true') {
  try {
    globalState.user = JSON.parse(storedUser);
    globalState.isAuthenticated = true;
  } catch {
    // Limpiar si hay error
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-isAuthenticated');
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: globalState.user,
  isAuthenticated: globalState.isAuthenticated,

  login: async (email: string, password: string) => {
    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validar credenciales
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      const user: User = {
        email: VALID_CREDENTIALS.email,
        name: VALID_CREDENTIALS.name,
        role: VALID_CREDENTIALS.role
      };

      // Guardar en localStorage
      localStorage.setItem('auth-user', JSON.stringify(user));
      localStorage.setItem('auth-isAuthenticated', 'true');

      // Actualizar estado global
      globalState.user = user;
      globalState.isAuthenticated = true;

      set({
        user,
        isAuthenticated: true
      });
    } else {
      throw new Error('Credenciales incorrectas');
    }
  },

  logout: () => {
    // Limpiar localStorage
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-isAuthenticated');

    // Actualizar estado global
    globalState.user = null;
    globalState.isAuthenticated = false;

    set({
      user: null,
      isAuthenticated: false
    });
  }
}));
