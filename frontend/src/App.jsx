import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import POSLayout from './layouts/POSLayout';
import POS from './pages/POS';
import Kitchen from './pages/Kitchen';
import MenuManagementPage from './pages/MenuManagementPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import Dashboard from './pages/Dashboard';
import StaffManagementPage from './pages/StaffManagementPage';
import SubscriptionPage from './pages/SubscriptionPage';
import { useAxiosInterceptor } from './context/useAxiosInterceptor';

// Component to run hooks inside Router
const GlobalHooks = () => {
  useAxiosInterceptor();
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalHooks />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<POSLayout />}>
            <Route index element={<POS />} />
            {/* Kitchen Display System */}
            <Route path="/kitchen" element={<Kitchen />} />
            {/* Placeholders for upcoming pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu" element={<MenuManagementPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/staff" element={<StaffManagementPage />} />
            <Route path="/settings" element={<SubscriptionPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
