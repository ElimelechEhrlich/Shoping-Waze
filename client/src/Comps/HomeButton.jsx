// Comps/HomeButton.jsx — כפתור בית אחיד לכל העמודים
import { Link } from "react-router-dom";

const HomeButton = () => (
  <Link
    to="/"
    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
      text-slate-600 hover:bg-slate-50 text-sm font-medium transition flex-shrink-0"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
    בית
  </Link>
);

export default HomeButton;
