// Servicio de autenticación para sistema multi-usuario
import type { User } from '../types/auth';

export class AuthService {
  private static readonly USERS_COLLECTION = 'users';
  private static readonly SESSION_KEY = 'auth_session';
  private static readonly TOKEN_KEY = 'auth_token';
  
  // Variables estáticas para almacenamiento en memoria (copia de localStorage)
  private static currentUser: User | null = null;
  private static currentToken: string | null = null;

  // Métodos para persistencia en localStorage
  private static saveSession(): void {
    if (this.currentUser && this.currentToken) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentUser));
      localStorage.setItem(this.TOKEN_KEY, this.currentToken);
    }
  }

  private static loadSession(): void {
    try {
      const userStr = localStorage.getItem(this.SESSION_KEY);
      const token = localStorage.getItem(this.TOKEN_KEY);
      
      if (userStr && token) {
        this.currentUser = JSON.parse(userStr);
        this.currentToken = token;
      }
    } catch (error) {
      console.error('Error loading session:', error);
      this.clearSession();
    }
  }

  private static clearSession(): void {
    this.currentUser = null;
    this.currentToken = null;
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Convertir Timestamp de Firebase a Date
  private static convertTimestamp(timestamp: any): Date {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return new Date();
  }

  // Convertir Date a Timestamp de Firebase
  private static convertToTimestamp(date: Date): any {
    return date;
  }

  // Encriptación de contraseña (usando bcrypt-like approach)
  static async hashPassword(password: string): Promise<string> {
    // Implementación simple de hash (en producción usar bcrypt)
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt_secret_2024');
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Verificación de contraseña
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const inputHash = await this.hashPassword(password);
    return inputHash === hash;
  }

  // Login de usuario
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      // Validar longitud mínima de contraseña
      if (password.length < 6) {
        throw new Error('La contraseña debe tener mínimo 6 dígitos');
      }

      const users = await this.getAllUsers();
      
      // Convertir email a minúsculas para búsqueda case-insensitive
      const normalizedEmail = email.toLowerCase();
      
      // Para el admin, buscar específicamente el usuario con username "angelrios2811"
      let user: User | undefined;
      if (normalizedEmail === 'angelrios2811@gmail.com') {
        user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.username === 'angelrios2811' && u.isActive);
      } else {
        user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.isActive);
      }
      
      if (!user) {
        throw new Error(`Usuario no encontrado: ${email}`);
      }
      
      const isValidPassword = await this.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Contraseña incorrecta');
      }

      // Generar token simple (en producción usar JWT)
      const token = this.generateToken(user);

      // Guardar en memoria y localStorage
      this.currentUser = user;
      this.currentToken = token;
      this.saveSession(); // Guardar en localStorage

      return { user, token };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Registro de usuario (solo admin puede registrar)
  static async register(userData: {
    email: string;
    username: string;
    password: string;
    role?: 'user' | 'admin';
  }): Promise<User> {
    try {
      // Validar longitud mínima de contraseña
      if (userData.password.length < 6) {
        throw new Error('La contraseña debe tener mínimo 6 dígitos');
      }

      const users = await this.getAllUsers();
      
      // Convertir email a minúsculas para verificación case-insensitive
      const normalizedEmail = userData.email.toLowerCase();
      
      // Verificar si el email ya existe (case-insensitive)
      if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        throw new Error('El email ya está registrado');
      }

      // Verificar si el username ya existe
      if (users.some(u => u.username === userData.username)) {
        throw new Error('El nombre de usuario ya está en uso');
      }

      // Crear nuevo usuario
      const newUser: User = {
        id: this.generateId(),
        email: userData.email,
        username: userData.username,
        passwordHash: await this.hashPassword(userData.password),
        role: userData.role || 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Guardar en Firestore (simulado, en producción usar Firebase real)
      await this.saveUser(newUser);

      return newUser;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // Obtener todos los usuarios (solo admin)
  static async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = firebase.firestore().collection(this.USERS_COLLECTION);
      const snapshot = await usersRef.get();
      
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          username: data.username,
          passwordHash: data.passwordHash,
          role: data.role,
          isActive: data.isActive,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as User;
      });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }
  }

  // Guardar usuario
  static async saveUser(user: User): Promise<void> {
    try {
      const usersRef = firebase.firestore().collection(this.USERS_COLLECTION);
      const userDoc = {
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
        createdAt: this.convertToTimestamp(user.createdAt),
        updatedAt: this.convertToTimestamp(new Date())
      };
      
      await usersRef.doc(user.id).set(userDoc);
    } catch (error) {
      console.error('Error guardando usuario:', error);
      throw error;
    }
  }

  // Actualizar usuario
  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const usersRef = firebase.firestore().collection(this.USERS_COLLECTION);
      const userRef = usersRef.doc(userId);
      
      const updateData = {
        ...updates,
        updatedAt: this.convertToTimestamp(new Date())
      };
      
      await userRef.update(updateData);
      
      // Obtener usuario actualizado
      const updatedDoc = await userRef.get();
      const updatedData = updatedDoc.data();
      
      return {
        id: updatedDoc.id,
        email: updatedData.email,
        username: updatedData.username,
        passwordHash: updatedData.passwordHash,
        role: updatedData.role,
        isActive: updatedData.isActive,
        createdAt: this.convertTimestamp(updatedData.createdAt),
        updatedAt: this.convertTimestamp(updatedData.updatedAt)
      } as User;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  // Eliminar usuario
  static async deleteUser(userId: string): Promise<void> {
    try {
      const usersRef = firebase.firestore().collection(this.USERS_COLLECTION);
      await usersRef.doc(userId).delete();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  // Cambiar contraseña
  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const users = await this.getAllUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const isValidOldPassword = await this.verifyPassword(oldPassword, user.passwordHash);
      if (!isValidOldPassword) {
        throw new Error('Contraseña actual incorrecta');
      }

      const newPasswordHash = await this.hashPassword(newPassword);
      await this.updateUser(userId, { passwordHash: newPasswordHash });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  }

  // Logout
  static logout(): void {
    this.currentUser = null;
    this.currentToken = null;
    this.clearSession(); // Limpiar localStorage
  }

  // Obtener usuario actual
  static getCurrentUser(): User | null {
    // Si no está en memoria, intentar cargar desde localStorage
    if (!this.currentUser) {
      this.loadSession();
    }
    return this.currentUser;
  }

  // Obtener token actual
  static getCurrentToken(): string | null {
    // Si no está en memoria, intentar cargar desde localStorage
    if (!this.currentToken) {
      this.loadSession();
    }
    return this.currentToken;
  }

  // Verificar si está autenticado
  static isAuthenticated(): boolean {
    return !!this.getCurrentToken() && !!this.getCurrentUser();
  }

  // Verificar si es admin
  static isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // Generar token simple
  private static generateToken(user: User): string {
    const tokenData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(tokenData));
  }

  // Verificar token
  static verifyToken(token: string): boolean {
    try {
      const tokenData = JSON.parse(atob(token));
      const user = this.getCurrentUser();
      return !!(user && user.id === tokenData.userId);
    } catch {
      return false;
    }
  }

  // Función para limpiar usuarios duplicados
  static async cleanupDuplicateUsers(): Promise<void> {
    try {
      const users = await this.getAllUsers();
      
      // Agrupar usuarios por email
      const userGroups: Record<string, User[]> = {};
      users.forEach(user => {
        if (!userGroups[user.email]) {
          userGroups[user.email] = [];
        }
        userGroups[user.email].push(user);
      });
      
      const duplicates = Object.entries(userGroups).filter(([_, userList]) => userList.length > 1);
      
      if (duplicates.length === 0) {
        return;
      }
      
      for (const [email, duplicateUsers] of duplicates) {
        // Mantener el más reciente (basado en createdAt o el que tenga username correcto)
        let userToKeep = duplicateUsers[0];
        
        // Para el admin, mantener el que tenga el username correcto
        if (email === 'angelrios2811@gmail.com') {
          const correctAdmin = duplicateUsers.find(u => u.username === 'angelrios2811');
          if (correctAdmin) {
            userToKeep = correctAdmin;
          }
        }
        
        const usersToDelete = duplicateUsers.filter(u => u.id !== userToKeep.id);
        
        for (const userToDelete of usersToDelete) {
          await this.deleteUser(userToDelete.id);
        }
      }
      
    } catch (error) {
      console.error('❌ Error limpiando usuarios duplicados:', error);
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Inicializar la sesión al cargar la aplicación
  static initializeSession(): void {
    this.loadSession();
  }
}

export default AuthService;
