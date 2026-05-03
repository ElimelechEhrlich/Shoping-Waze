import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import Button from "../Comps/ui/Button.jsx";

const NotFoundPage = () => {
  usePageTitle("דף לא נמצא");

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-24" dir="rtl">
      <div className="w-12 h-12 rounded-sm bg-zinc-200 text-zinc-500 flex items-center justify-center mb-5">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
        </svg>
      </div>

      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">
        שגיאה 404
      </p>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">הדף לא נמצא</h1>
      <p className="text-zinc-500 text-sm mb-7 max-w-xs leading-relaxed">
        ייתכן שהכתובת שגויה או שהעמוד הוסר. נסה לחזור לדף הבית.
      </p>

      <div className="flex items-center gap-2">
        <Button to="/" variant="primary" size="md">
          לדף הבית
        </Button>
        <Link
          to="/cart"
          className="text-sm text-zinc-600 hover:text-zinc-900 underline underline-offset-2 transition"
        >
          לסל הקניות
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
