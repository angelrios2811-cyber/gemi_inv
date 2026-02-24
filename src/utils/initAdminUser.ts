// Utilidad para inicializar usuario admin al cargar la aplicación
import { AuthService } from '../services/authService';
import type { User } from '../types/auth';

export async function initializeAdminUser(): Promise<void> {
  try {
    // Primero verificar si ya existe un usuario admin
    const existingUsers = await AuthService.getAllUsers();
    const existingAdmin = existingUsers.find(u => u.email === 'angelrios2811@gmail.com');
    
    if (existingAdmin) {
      return; // No hacer nada más si ya existe
    }
    
    // Solo crear si no existe
    console.log('🔐 Creando usuario admin inicial...');
    
    // Crear usuario admin con las credenciales solicitadas
    const adminUser = await AuthService.register({
      email: 'angelrios2811@gmail.com',
      username: 'angelrios2811',
      password: '5VG3Y3TTW5',
      role: 'admin'
    });
    
    console.log('✅ Usuario admin creado exitosamente:');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Usuario:', adminUser.username);
    console.log('🔐 Rol:', adminUser.role);
    console.log('🆔 ID:', adminUser.id);
    console.log('🔒 Contraseña encriptada:', '✅');
    
  } catch (error) {
    console.error('❌ Error inicializando usuario admin:', error);
    // No lanzar el error para que no bloquee la aplicación
  }
}

// Función para verificar si el usuario admin existe (solo lectura)
export async function checkAdminUser(): Promise<User | null> {
  try {
    const users = await AuthService.getAllUsers();
    const adminUser = users.find(u => u.email === 'angelrios2811@gmail.com');
    
    if (adminUser) {
      console.log('✅ Usuario admin encontrado:', adminUser.username);
      return adminUser;
    } else {
      console.log('❌ No se encontró usuario admin');
      return null;
    }
  } catch (error) {
    console.error('❌ Error verificando usuario admin:', error);
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
