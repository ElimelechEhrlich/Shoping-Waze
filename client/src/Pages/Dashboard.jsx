// pages/Dashboard.jsx
// ─────────────────────────────────────────────────────────
// עמוד הבית לאחר התחברות — סגנון מקצועי/עסקי.
// ─────────────────────────────────────────────────────────

import NavCard from "../Comps/Dashboard/NavCard.jsx";
import { useAuth } from "../hooks/useAuth.js";
import PopularProducts from "../Comps/Dashboard/PopularProducts.jsx";

const Dashboard = () => {
  const { user, logout } = useAuth();

  // פורמט תאריך עברי
  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <span className="font-bold text-slate-900 tracking-tight">
            קבלות חכמות
          </span>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-700">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500
              transition border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            התנתק
          </button>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* כותרת עמוד */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
              {today}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              שלום, {user?.name?.split(" ")[0]}
            </h1>
          </div>
        </div>

        {/* כפתורי ניווט */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NavCard
            to="/scan"
            color="emerald"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
            title="סריקת קבלה"
            subtitle="צלם קבלה וייבא אוטומטית"
          />
          <NavCard
            to="/cart"
            color="blue"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            title="סל הקניות"
            subtitle="צפה ונהל את הסל שלך"
          />
        </div>

        {/* טבלת מוצרים פופולריים */}
        <PopularProducts />
      </main>
    </div>
  );
};

export default Dashboard;
