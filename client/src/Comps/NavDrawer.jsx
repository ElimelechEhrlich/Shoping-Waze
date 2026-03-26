// Comps/NavDrawer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// תפריט ניווט צדדי — נפתח מהמבורגר שב-AppHeader.
//
// מבנה:
//   • Overlay כהה (לחיצה סוגרת)
//   • Drawer לבן מימין (RTL) ב-z-[70]
//     ├── פס עליון: אווטר + שם + אימייל + כפתור X
//     ├── קישורי ניווט עם הדגשה על הדף הפעיל
//     └── כפתור התנתקות
//
// הדרוואר משתמש ב-translate-x לאנימציה חלקה ב-GPU
// (ולא ב-display:none) כדי שה-transition יעבוד.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

// ── אייקוני ניווט ──────────────────────────────────────
const HomeIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const CartIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const ScanIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const SharedIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const HistoryIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const ProfileIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const LogoutIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const CloseIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ── קישורי ניווט ──────────────────────────────────────
const NAV_LINKS = [
  { to: "/",             label: "דף הבית",          icon: <HomeIcon />,    end: true },
  { to: "/cart",         label: "הסל שלי",           icon: <CartIcon /> },
  { to: "/scan",         label: "סריקת קבלה",        icon: <ScanIcon /> },
  { to: "/shared-carts", label: "סלים משותפים",      icon: <SharedIcon /> },
  { to: "/history",      label: "היסטוריית קבלות",   icon: <HistoryIcon /> },
  { to: "/profile",      label: "הפרופיל שלי",       icon: <ProfileIcon /> },
];

// ── אווטר אינישיאלים ──────────────────────────────────
const Avatar = ({ name, avatarColor, size = "md" }) => {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const bg = avatarColor || "bg-emerald-500";
  const sz = size === "lg" ? "w-14 h-14 text-xl" : size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";

  return (
    <div className={`${sz} ${bg} rounded-full flex items-center justify-center
      font-bold text-white flex-shrink-0 select-none`}>
      {initials}
    </div>
  );
};

export { Avatar };

// ── NavDrawer ──────────────────────────────────────────
const NavDrawer = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // סגירה ב-Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // נעילת גלילה בגוף הדף כשהתפריט פתוח
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* ── Overlay ─────────────────────────────────── */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* ── Drawer ──────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="תפריט ניווט"
        dir="rtl"
        className={`fixed top-0 right-0 h-full w-72 bg-white z-[70] shadow-2xl
          flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >

        {/* ── פס עליון — פרופיל ────────────────────── */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 pt-6 pb-5">
          <div className="flex items-start justify-between mb-4">
            <Avatar name={user?.name} avatarColor={user?.avatarColor} size="lg" />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                text-emerald-200 hover:text-white hover:bg-white/10 transition"
              aria-label="סגור תפריט"
            >
              <CloseIcon />
            </button>
          </div>
          <p className="font-bold text-white text-base leading-tight">{user?.name}</p>
          <p className="text-emerald-200 text-xs mt-0.5 truncate">{user?.email}</p>
        </div>

        {/* ── קישורי ניווט ────────────────────────── */}
        <nav className="flex-1 py-2 overflow-y-auto" aria-label="ניווט ראשי">
          {NAV_LINKS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors
                 border-r-4 ${
                   isActive
                     ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                     : "text-slate-700 hover:bg-slate-50 border-transparent hover:border-slate-200"
                 }`
              }
            >
              <span className="text-current opacity-70">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── התנתקות ─────────────────────────────── */}
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
              text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogoutIcon />
            התנתק
          </button>
        </div>
      </div>
    </>
  );
};

export default NavDrawer;
