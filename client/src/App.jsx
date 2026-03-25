// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CartPage from "./Pages/CartPage.jsx";
import CompareResultsPage from "./Pages/CompareResultsPage.jsx";
import ScanPage from "./Pages/ScanPage.jsx";
import ReceiptDetailsPage from "./Pages/ReceiptDetailsPage.jsx";
import { AuthProvider } from "./Contexts/AuthContext.jsx";
import { useAuth } from "./hooks/useAuth.js";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cart"   element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute><CompareResultsPage /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
          <Route path="/details" element={<ProtectedRoute><ReceiptDetailsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </AuthProvider>
  );
}
