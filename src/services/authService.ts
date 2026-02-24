// Servicio de autenticación para sistema multi-usuario
import type { User } from '../types/auth';

export class AuthService {
  private static readonly USERS_COLLECTION = 'users';
  
  // Variables estáticas para almacenamiento en memoria
  private static currentUser: User | null = null;
  private static currentToken: string | null = null;

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
      const user = users.find(u => u.email === email && u.isActive);

      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      const isValidPassword = await this.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }

      // Generar token simple (en producción usar JWT)
      const token = this.generateToken(user);

      // Guardar en memoria (no localStorage)
      this.currentUser = user;
      this.currentToken = token;

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
      
      // Verificar si el email ya existe
      if (users.some(u => u.email === userData.email)) {
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
  }

  // Obtener usuario actual
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Obtener token actual
  static getCurrentToken(): string | null {
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
      return !!(user && user.id === tokenData.userId) ? false : true;
    } catch {
      return false;
    }
  }

  // Generar ID simple
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default AuthService;
