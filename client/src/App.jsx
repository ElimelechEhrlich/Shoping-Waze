// App.jsx
// ─────────────────────────────────────────────────────────
// Root של האפליקציה.
// AuthProvider עוטף הכל כדי ש-useAuth יהיה זמין בכל מקום.
//
// ניתוב:
//   /          → Dashboard (דורש התחברות)
//   /cart      → CartPage  (דורש התחברות)
//   /login     → AuthPage  (ציבורי)
//
// ProtectedRoute — מגן על routes פרטיים:
//   לא מחובר → redirect ל-/login
// ─────────────────────────────────────────────────────────

import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./Pages/AuthPage.jsx";
import CartPage from "./Pages/CartPage.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import ScanPage from "./Pages/ScanPage.jsx";
import ReceiptDetailsPage from "./Pages/ReceiptDetailsPage.jsx";
import { AuthProvider } from "./Contexts/AuthContext.jsx";
import { useAuth } from "./hooks/useAuth.js";

// ── Route מוגן — רק למשתמשים מחוברים ────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // ממתין לבדיקת token מול השרת לפני ניתוב
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // לא מחובר — שולח לדף login
  return user ? children : <Navigate to="/login" replace />;
};

// ── Route ציבורי — מפנה מחוברים לדף הבית ────────────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

// ── Root ───────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
        <Routes>
          {/* ציבורי */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          {/* מוגנים */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <ScanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/details"
            element={
              <ProtectedRoute>
                <ReceiptDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* כל נתיב אחר → דף הבית */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </AuthProvider>
  );
}
