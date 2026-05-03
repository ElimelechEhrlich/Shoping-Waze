import { Link } from "react-router-dom";

const VARIANTS = {
  primary:   "bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-900",
  secondary: "bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-300",
  ghost:     "bg-transparent text-zinc-700 hover:bg-zinc-100 border border-transparent",
  danger:    "bg-white text-red-700 hover:bg-red-50 border border-red-200",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs h-8",
  md: "px-4 py-2 text-sm h-10",
  lg: "px-5 py-2.5 text-sm h-11",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-sm font-semibold " +
  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
  "disabled:opacity-50 disabled:cursor-not-allowed select-none touch-manipulation";

const Spinner = () => (
  <span
    aria-hidden="true"
    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
  />
);

const Button = ({
  as,
  to,
  href,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconAfter,
  fullWidth = false,
  className = "",
  children,
  ...rest
}) => {
  const cls = [
    BASE,
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      {loading ? <Spinner /> : icon}
      {children && <span>{children}</span>}
      {!loading && iconAfter}
    </>
  );

  if (as === "link" || to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button
      type={type}
      disabled={loading || rest.disabled}
      className={cls}
      {...rest}
    >
      {inner}
    </button>
  );
};

export default Button;
