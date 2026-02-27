import { create } from 'zustand';
import type { AuthState } from '../types/auth';
import AuthService from '../services/authService';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,

  // Login
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      const { user, token } = await AuthService.login(email, password);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        token
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Registro
  register: async (userData: {
    email: string;
    username: string;
    password: string;
    role?: 'user' | 'admin';
  }) => {
      set({ isLoading: true });
      
      try {
        // Convert role to match service expectations
        const serviceData = {
          email: userData.email,
          username: userData.username,
          password: userData.password,
          role: userData.role as 'user' | 'admin' | undefined
        };
        await AuthService.register(serviceData);
        
        // Auto-login después del registro
        const { user: loggedInUser, token } = await AuthService.login(userData.email, userData.password);
        
        set({
          user: loggedInUser,
          isAuthenticated: true,
          isLoading: false,
          token
        });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

  // Logout
  logout: () => {
    AuthService.logout();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null
    });
  },

  // Verificar autenticación al inicio
  checkAuth: () => {
    // Inicializar sesión con protección avanzada
    AuthService.initializeSession();
    
    let token = AuthService.getCurrentToken();
    let user = AuthService.getCurrentUser();
    
    // Si no hay sesión, intentar restauración forzada
    if (!token || !user) {
      const restored = AuthService.forceSessionRestore();
      if (restored) {
        token = AuthService.getCurrentToken();
        user = AuthService.getCurrentUser();
      }
    }
    
    // Verificar salud de la sesión
    const healthCheck = AuthService.checkSessionHealth();
    if (!healthCheck.healthy) {
      // No mostrar warning en producción, solo registrar errores críticos
      if (healthCheck.issues.includes('localStorage access error')) {
        console.error('Critical localStorage access error');
      }
    }
    
    if (token && user && AuthService.verifyToken(token)) {
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        token
      });
    } else {
      AuthService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      });
    }
  },

  // Cambiar contraseña
  changePassword: async (oldPassword: string, newPassword: string) => {
    const user = get().user;
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    set({ isLoading: true });
    
    try {
      await AuthService.changePassword(user.id, oldPassword, newPassword);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Verificar si es admin
  isAdmin: () => {
    const user = get().user;
    return user?.role === 'admin';
  }
}));

// Verificar autenticación al inicio
useAuthStore.getState().checkAuth();
