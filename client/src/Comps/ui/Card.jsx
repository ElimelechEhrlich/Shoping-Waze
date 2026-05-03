const Card = ({
  className = "",
  padding = "md",
  children,
  ...rest
}) => {
  const pad = {
    none: "",
    sm:   "p-3",
    md:   "p-4",
    lg:   "p-5",
  }[padding] || "p-4";

  return (
    <div
      className={`bg-white rounded-md border border-zinc-200 ${pad} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export const SectionLabel = ({ children, suffix }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
      {children}
    </span>
    <div className="flex-1 h-px bg-zinc-200" />
    {suffix && <span className="text-[11px] text-zinc-500">{suffix}</span>}
  </div>
);

export default Card;
