// Tipos para el sistema de autenticación multi-usuario

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: any; // Timestamp de Firebase
  updatedAt: any; // Timestamp de Firebase
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    role?: 'user' | 'admin';
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  isAdmin: () => boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  role?: 'user' | 'admin'; // Por defecto es 'user', solo admin puede crear otros roles
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserFilter {
  userId?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}
