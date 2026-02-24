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

function App() {
  // Inicializar usuario admin al cargar la aplicación (solo una vez)
  useEffect(() => {
    const initAdmin = async () => {
      try {
        // Limpiar localStorage para forzar uso de Firebase
        clearAllLocalStorage();
        
        await initializeAdminUser();
      } catch (error) {
        console.error('Error inicializando usuario admin:', error);
      }
    };
    
    initAdmin();
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
