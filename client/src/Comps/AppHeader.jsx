// AppHeader.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Global application header — rendered on every authenticated page via AppLayout.
// Extracted from Dashboard.jsx so the brand bar (logo + user info + logout)
// is shared across ALL protected routes from a single source of truth.
//
// Positioning: sticky top-0 z-50 ensures this bar stays above any
// page-specific sub-headers (which should use sticky top-[60px] z-30).
// The bar's height is fixed at 60 px (py-3.5 = 14 px × 2 + h-8 = 32 px content).
// ─────────────────────────────────────────────────────────────────────────────
import { useAuth } from "../hooks/useAuth.js";

const AppHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">

      {/* ── App brand ───────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="font-bold text-slate-900 tracking-tight">קבלות חכמות</span>
      </div>

      {/* ── User info + logout ──────────────────────────────── */}
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
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          התנתק
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
