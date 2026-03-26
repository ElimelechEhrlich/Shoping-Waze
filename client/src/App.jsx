// App.jsx
// ─── Routing architecture ─────────────────────────────────────────────────────
//
//  BrowserRouter (in main.jsx) uses the HTML5 History API so every URL like
//  /cart or /scan is a real path. Refreshing works because:
//    • Vite dev server: appType "spa" (the default) returns index.html for every
//      404, letting React Router handle the path on the client side.
//    • Production (Netlify/Render): public/_redirects  → /* /index.html 200
//    • Production (Vercel):         vercel.json rewrites → /index.html
//    • Production (nginx):          nginx.conf try_files → /index.html
//
//  Layout route pattern (no `path` on the parent <Route>):
//    A path-less Route whose element is <ProtectedRoute><AppLayout /></ProtectedRoute>
//    wraps every authenticated page. AppLayout renders the global sticky header
//    and an <Outlet> where React Router places the matched child page.
//    ProtectedRoute redirects unauthenticated visitors to /login before
//    AppLayout is ever mounted.
//
//  path="*" inside the protected layout shows a proper NotFoundPage instead of
//  silently redirecting to "/", making broken links immediately visible.
// ─────────────────────────────────────────────────────────────────────────────
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }   from "./Contexts/AuthContext.jsx";
import { ToastProvider }  from "./Contexts/ToastContext.jsx";
import { useAuth }        from "./hooks/useAuth.js";
import AppLayout          from "./layouts/AppLayout.jsx";

import AuthPage           from "./Pages/AuthPage.jsx";
import Dashboard          from "./Pages/Dashboard.jsx";
import CartPage           from "./Pages/CartPage.jsx";
import CompareResultsPage from "./Pages/CompareResultsPage.jsx";
import ScanPage           from "./Pages/ScanPage.jsx";
import ReceiptDetailsPage from "./Pages/ReceiptDetailsPage.jsx";
import SharedCartListPage from "./Pages/SharedCartListPage.jsx";
import SharedCartPage     from "./Pages/SharedCartPage.jsx";
import ScanHistoryPage    from "./Pages/ScanHistoryPage.jsx";
import NotFoundPage       from "./Pages/NotFoundPage.jsx";

// ── Route guards ──────────────────────────────────────────────────────────────

// Renders children only when authenticated; redirects to /login otherwise.
// Shows a spinner while the auth state is being resolved on first load.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

// Renders children only for guests; redirects authenticated users to the dashboard.
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

// ── Root component ────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>

          {/* ── Public route (no global header) ────────────────────────── */}
          <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />

          {/* ── Protected routes — all share the AppLayout ─────────────────
              The path-less parent Route acts as a "layout route":
                • ProtectedRoute checks auth before AppLayout mounts.
                • AppLayout renders the global sticky AppHeader + <Outlet>.
                • <Outlet> is replaced by whichever child Route matches the URL.
              Adding new protected pages = add a child <Route> here. */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/"                element={<Dashboard />} />
            <Route path="/cart"            element={<CartPage />} />
            <Route path="/compare"         element={<CompareResultsPage />} />
            <Route path="/scan"            element={<ScanPage />} />
            <Route path="/details"         element={<ReceiptDetailsPage />} />
            <Route path="/shared-carts"    element={<SharedCartListPage />} />
            <Route path="/shared-cart/:id" element={<SharedCartPage />} />
            <Route path="/history"         element={<ScanHistoryPage />} />

            {/* Catch-all: authenticated users who hit an unknown URL see a 404
                page instead of being silently bounced to the dashboard. */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
