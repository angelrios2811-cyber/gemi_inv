import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import ManageStockPage from './pages/ManageStockPage';
import { InventoryPage } from './pages/InventoryPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { RemoveInventoryPage } from './pages/RemoveInventoryPage';
import { SettingsPage } from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import { initializeAdminUser } from './utils/initAdminUser';
import { clearAllLocalStorage } from './utils/clearLocalStorage';
import './utils/debugAuth'; // Importar para que esté disponible globalmente
import AuthService from './services/authService'; // Importar AuthService

function App() {
  // Inicializar usuario admin y protección de sesión al cargar la aplicación
  useEffect(() => {
    const initApp = async () => {
      try {
        // Inicializar sesión con protección avanzada
        AuthService.initializeSession();
        
        // Verificar salud de la sesión actual
        const healthCheck = AuthService.checkSessionHealth();
        if (!healthCheck.healthy) {
          // Intentar restauración forzada si hay problemas críticos
          if (!AuthService.getCurrentUser() || !AuthService.getCurrentToken()) {
            AuthService.forceSessionRestore();
          }
        }
        
        // Limpiar localStorage para forzar uso de Firebase
        clearAllLocalStorage();
        
        await initializeAdminUser();
        
      } catch (error) {
        console.error('Error inicializando aplicación:', error);
      }
    };
    
    initApp();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/manage-stock" element={<ProtectedRoute><ManageStockPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
          <Route path="/remove" element={<ProtectedRoute><RemoveInventoryPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Route>
        
        {/* Redirect to login if not authenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
