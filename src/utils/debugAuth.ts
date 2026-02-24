// Utilidad para depurar autenticación
import { AuthService } from '../services/authService';
import type { User } from '../types/auth';

// Función para depurar sistema de autenticación
async function debugAuthSystem() {
  console.log(' Depurando sistema de autenticación...');
  
  try {
    // 1. Verificar usuarios en localStorage
    const users = await AuthService.getAllUsers();
    console.log(' Usuarios encontrados:', users.length);
    
    users.forEach((user: User, index: number) => {
      console.log(` Usuario ${index + 1}:`, {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        hasPasswordHash: !!user.passwordHash,
        passwordHashLength: user.passwordHash?.length || 0
      });
    });
    
    // 2. Buscar usuario admin específico
    const adminUser = users.find(u => u.email === 'angelrios2811@gmail.com');
    console.log(' Búsqueda de admin:', adminUser ? 'Encontrado' : 'No encontrado');
    
    if (adminUser) {
      console.log(' Datos del admin:', {
        id: adminUser.id,
        email: adminUser.email,
        username: adminUser.username,
        role: adminUser.role,
        isActive: adminUser.isActive
      });
      
      // 3. Intentar login con las credenciales correctas
      try {
        console.log(' Intentando login con credenciales admin...');
        const { user, token } = await AuthService.login('angelrios2811@gmail.com', '5VG3Y3TTW5');
        console.log(' Login exitoso:', user.username);
        console.log(' Token generado:', token.substring(0, 50) + '...');
        
        // 4. Verificar estado actual
        const currentUser = AuthService.getCurrentUser();
        const currentToken = AuthService.getCurrentToken();
        const isAuthenticated = AuthService.isAuthenticated();
        const isAdmin = AuthService.isAdmin();
        
        console.log(' Estado actual:', {
          currentUser: currentUser?.username,
          hasToken: !!currentToken,
          isAuthenticated,
          isAdmin
        });
        
      } catch (loginError: any) {
        console.error(' Error en login:', loginError.message);
        
        // 5. Verificar contraseña manualmente
        console.log(' Verificando contraseña manualmente...');
        const isPasswordValid = await AuthService.verifyPassword('5VG3Y3TTW5', adminUser.passwordHash);
        console.log(' Contraseña válida:', isPasswordValid);
      }
    } else {
      console.log(' No se encontró el usuario admin');
      
      // 6. Crear usuario admin manualmente
      console.log(' Creando usuario admin manualmente...');
      const newAdmin = await AuthService.register({
        email: 'angelrios2811@gmail.com',
        username: 'angelrios2811',
        password: '5VG3Y3TTW5',
        role: 'admin'
      });
      
      console.log(' Usuario admin creado:', newAdmin.username);
    }
    
  } catch (error) {
    console.error(' Error en depuración:', error);
  }
}

// Función para limpiar datos de autenticación
function clearAuthData() {
  console.log(' Limpiando datos de autenticación...');
  // Ya no se usa localStorage - los datos están en memoria
  console.log(' Datos limpiados');
}

// Exportar funciones
export { debugAuthSystem, clearAuthData };
