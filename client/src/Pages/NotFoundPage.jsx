// NotFoundPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendered by the catch-all Route path="*" inside the authenticated layout.
//
// Previously, unknown URLs were silently redirected to "/" which hid routing
// errors and confused users who typed a wrong address. This page makes broken
// or non-existent routes immediately visible and gives users a clear path back.
//
// The browser tab title is set to "דף לא נמצא | Shopping Waze" via usePageTitle.
// ─────────────────────────────────────────────────────────────────────────────
import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";

const NotFoundPage = () => {
  usePageTitle("דף לא נמצא");

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-24" dir="rtl">
      <p className="text-7xl mb-6 select-none">🔍</p>
      <h1 className="text-3xl font-bold text-slate-800 mb-3">404 — דף לא נמצא</h1>
      <p className="text-slate-500 text-sm mb-8 max-w-xs leading-relaxed">
        הדף שחיפשת אינו קיים. ייתכן שהכתובת שגויה או שהעמוד הוסר.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600
          text-white font-semibold text-sm transition shadow-sm"
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
};

export default NotFoundPage;
