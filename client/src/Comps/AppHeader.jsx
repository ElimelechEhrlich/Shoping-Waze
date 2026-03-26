// Comps/AppHeader.jsx
// ─────────────────────────────────────────────────────────────────────────────
// פס הכותרת הגלובלי — מוצג בכל הדפים המאומתים דרך AppLayout.
//
// שינויים לעומת הגרסה הקודמת:
//   • הוסר כפתור ה-logout מהפס (עבר לתפריט הצד NavDrawer)
//   • נוסף כפתור המבורגר שפותח את NavDrawer
//   • האווטר עם אינישיאלים מוצג בצד שמאל (לפני המבורגר)
// ─────────────────────────────────────────────────────────────────────────────

import { useAuth } from "../hooks/useAuth.js";
import { Avatar } from "./NavDrawer.jsx";

// ── המבורגר ────────────────────────────────────────────
const HamburgerIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const AppHeader = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">

      {/* ── לוגו + שם אפליקציה ─────────────────────── */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
          קבלות חכמות
        </span>
      </div>

      {/* ── אווטר + המבורגר ────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* שם המשתמש — נסתר על מסכים קטנים */}
        <div className="text-right hidden sm:block mr-1">
          <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.name}</p>
          <p className="text-[10px] text-slate-400 leading-tight">{user?.email}</p>
        </div>

        {/* אווטר */}
        <Avatar name={user?.name} avatarColor={user?.avatarColor} size="sm" />

        {/* כפתור המבורגר */}
        <button
          onClick={onMenuClick}
          aria-label="פתח תפריט ניווט"
          className="w-9 h-9 flex items-center justify-center rounded-lg
            text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <HamburgerIcon />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
