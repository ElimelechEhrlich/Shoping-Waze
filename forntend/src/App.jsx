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
import AuthPage from "./Pages/AuthPage.jsx";
import { useAuth,AuthProvider } from "./Contexts/AuthContext";

// ── Placeholder Dashboard ──────────────────────────────────
// החלף בקומפוננטה האמיתית של האפליקציה
const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">שלום, {user.name} 👋</h1>
        <p className="text-gray-500 mt-1">ברוך הבא לקבלות חכמות</p>
        <button
          onClick={logout}
          className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition"
        >
          התנתק
        </button>
      </div>
    </div>
  );
};

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
