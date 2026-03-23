// App.jsx
// ─────────────────────────────────────────────────────────
// Root של האפליקציה.
// AuthProvider עוטף הכל כדי ש-useAuth יהיה זמין בכל מקום.
// AppContent מחליט מה לרנדר לפי מצב ה-auth:
//   loading → ספינר
//   user    → Dashboard (ה-app האמיתי)
//   null    → AuthPage
// ─────────────────────────────────────────────────────────

// import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { AuthProvider,useAuth } from "./Contexts/AuthContext.jsx";
import AuthPage from "./Pages/AuthPage.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
// import AuthPage from "./pages/AuthPage.jsx";
// import Dashboard from "./pages/Dashboard.jsx";

// ── Auth Guard ─────────────────────────────────────────────
const AppContent = () => {
  const { user, loading } = useAuth();

  // ממתין לבדיקת ה-token מול השרת
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ניתוב: מחובר → Dashboard, לא מחובר → AuthPage
  return user ? <Dashboard /> : <AuthPage />;
};

// ── Root ───────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
