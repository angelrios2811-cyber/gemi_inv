// Utilidad para depurar autenticación
import { AuthService } from '../services/authService';
import type { User } from '../types/auth';

// Función para mostrar todos los usuarios y sus contraseñas conocidas
async function showAllUsersAndPasswords() {
  try {
    // Obtener todos los usuarios de Firebase
    const users = await AuthService.getAllUsers();
    
    // Mostrar solo contraseñas para copiar/pegar fácilmente
    users.forEach((user: User) => {
      let password = '[No disponible]';
      
      if (user.email === 'angelrios2811@gmail.com') {
        password = '5VG3Y3TTW5';
      } else if (user.email === 'test@gmail.com') {
        password = 'test123';
      }
      
      // Solo mostrar si está disponible la contraseña
      if (password !== '[No disponible]') {
        console.log(`${user.email} : ${password}`);
      }
    });
    
  } catch (error) {
    console.error('Error mostrando usuarios:', error);
  }
}

// Exportar funciones
export { showAllUsersAndPasswords };

// Hacer la función disponible globalmente para consola
if (typeof window !== 'undefined') {
  (window as any).showUsers = showAllUsersAndPasswords;
}
