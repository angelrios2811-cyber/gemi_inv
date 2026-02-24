// Script para crear usuario admin inicial
import { AuthService } from '../services/authService';
import type { User } from '../types/auth';

// Función para crear usuario admin inicial
async function createAdminUser(): Promise<User> {
  try {
    console.log('🔐 Creando usuario admin inicial...');
    
    // Verificar si ya existe un usuario admin
    const existingUsers = await AuthService.getAllUsers();
    const existingAdmin = existingUsers.find((u: User) => u.email === 'angelrios2811@gmail.com' || u.role === 'admin');
    
    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe:', existingAdmin.username);
      return existingAdmin;
    }
    
    // Crear usuario admin
    const adminUser = await AuthService.register({
      email: 'angelrios2811@gmail.com',
      username: 'angelrios2811',
      password: '5VG3Y3TTW5',
      role: 'admin'
    });
    
    console.log('✅ Usuario admin creado exitosamente:', adminUser);
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Usuario:', adminUser.username);
    console.log('🔐 Rol:', adminUser.role);
    console.log('🆔 Estado:', adminUser.isActive ? 'Activo' : 'Inactivo');
    
    return adminUser;
    
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
    throw error;
  }
}

// Función para verificar si el usuario admin existe
async function checkAdminUser(): Promise<User | null> {
  try {
    const users = await AuthService.getAllUsers();
    const adminUser = users.find((u: User) => u.email === 'angelrios2811@gmail.com' || u.role === 'admin');
    
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

// Función para login automático del admin
async function loginAdmin(): Promise<{ user: User; token: string }> {
  try {
    console.log('🔐 Iniciando sesión como admin...');
    
    const { user, token } = await AuthService.login('angelrios2811@gmail.com', '5VG3Y3TTW5');
    
    console.log('✅ Login admin exitoso:', user.username);
    console.log('🎫 Token generado');
    
    return { user, token };
    
  } catch (error) {
    console.error('❌ Error en login admin:', error);
    throw error;
  }
}

// Exportar funciones para uso
export { createAdminUser, checkAdminUser, loginAdmin };
