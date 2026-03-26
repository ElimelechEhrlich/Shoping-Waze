// components/dashboard/NavCard.jsx
import { Link } from "react-router-dom";

const colorMap = {
  emerald: {
    light: "bg-emerald-50",
    text:  "text-emerald-600",
    hover: "hover:bg-emerald-50 hover:border-emerald-200",
  },
  blue: {
    light: "bg-blue-50",
    text:  "text-blue-600",
    hover: "hover:bg-blue-50 hover:border-blue-200",
  },
  purple: {
    light: "bg-purple-50",
    text:  "text-purple-600",
    hover: "hover:bg-purple-50 hover:border-purple-200",
  },
  amber: {
    light: "bg-amber-50",
    text:  "text-amber-600",
    hover: "hover:bg-amber-50 hover:border-amber-200",
  },
};

const NavCard = ({ to, color, icon, title, subtitle, badge }) => {
  const c = colorMap[color] || colorMap.emerald;

  return (
    <Link
      to={to}
      className={`group relative flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100
        shadow-sm transition-all duration-200 ${c.hover} cursor-pointer`}
    >
      <div className={`${c.light} ${c.text} p-3 rounded-xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-800 text-base">{title}</p>
        <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>
      </div>
      {badge > 0 && (
        <span className="absolute -top-2 -left-2 min-w-[1.4rem] h-[1.4rem] flex items-center justify-center
          rounded-full bg-emerald-500 text-white text-xs font-bold px-1 shadow">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-400 rotate-180 transition-colors flex-shrink-0"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
};

export default NavCard;
