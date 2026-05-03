// components/dashboard/NavCard.jsx
import { Link } from "react-router-dom";

const style = {
  light: "bg-zinc-100",
  text:  "text-zinc-800",
  hover: "hover:bg-zinc-50 hover:border-zinc-300",
};

const NavCard = ({ to, icon, title, subtitle, badge }) => {
  const c = style;

  return (
    <Link
      to={to}
      className={`group relative flex items-center gap-4 p-5 bg-white rounded-md border border-zinc-200
        shadow-sm transition-all duration-200 ${c.hover} cursor-pointer`}
    >
      <div className={`${c.light} ${c.text} p-3 rounded-sm flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-zinc-900 text-base">{title}</p>
        <p className="text-zinc-500 text-sm mt-0.5">{subtitle}</p>
      </div>
      {badge > 0 && (
        <span className="absolute -top-2 -left-2 min-w-[1.4rem] h-[1.4rem] flex items-center justify-center
          rounded-sm bg-zinc-900 text-white text-xs font-bold px-1 border border-zinc-700">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <svg className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 rotate-180 transition-colors flex-shrink-0"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
};

export default NavCard;
