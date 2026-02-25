// Utilidad para inicializar usuario admin al cargar la aplicación
import { AuthService } from '../services/authService';
import type { User } from '../types/auth';

export async function initializeAdminUser(): Promise<void> {
  try {
    // Primero limpiar usuarios duplicados
    await AuthService.cleanupDuplicateUsers();
    
    // Luego verificar si ya existe un usuario admin
    const existingUsers = await AuthService.getAllUsers();
    
    const existingAdmin = existingUsers.find(u => u.email === 'angelrios2811@gmail.com' && u.username === 'angelrios2811');
    
    if (existingAdmin) {
      return; // No hacer nada más si ya existe
    }
    
    // Solo crear si no existe
    // Crear usuario admin con las credenciales solicitadas
    await AuthService.register({
      email: 'angelrios2811@gmail.com',
      username: 'angelrios2811',
      password: '5VG3Y3TTW5',
      role: 'admin'
    });
    
    // Verificar que se puede hacer login
    try {
      await AuthService.login('angelrios2811@gmail.com', '5VG3Y3TTW5');
    } catch (error) {
      console.error('❌ Error verificando login del admin:', error);
    }
    
  } catch (error) {
    console.error('❌ Error inicializando usuario admin:', error);
  }
}

// Función para obtener el usuario admin (si existe)
export async function getAdminUser(): Promise<User | null> {
  try {
    const users = await AuthService.getAllUsers();
    const adminUser = users.find(u => u.email === 'angelrios2811@gmail.com');
    
    if (adminUser) {
      return adminUser;
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo usuario admin:', error);
    return null;
  }
}

// Función para verificar credenciales del admin (solo para depuración)
export async function verifyAdminCredentials(): Promise<boolean> {
  try {
    const { user } = await AuthService.login('angelrios2811@gmail.com', '5VG3Y3TTW5');
    return user.role === 'admin' && user.email === 'angelrios2811@gmail.com';
  } catch (error) {
    console.error('❌ Error verificando credenciales admin:', error);
    return false;
  }
}
