import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ManualEntryPage } from './pages/ManualEntryPage';
import { InventoryPage } from './pages/InventoryPage';
import { HistoryPage } from './pages/HistoryPage';
import { RemoveInventoryPage } from './pages/RemoveInventoryPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
                    <Route path="/manual" element={<ManualEntryPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/remove" element={<RemoveInventoryPage />} />
          <Route path="/inventory/:id" element={<TicketDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
