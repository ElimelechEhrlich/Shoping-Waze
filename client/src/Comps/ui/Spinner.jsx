const SIZES = {
  xs: "w-3 h-3 border-2",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
};

const Spinner = ({ size = "md", className = "", label = "טוען" }) => (
  <span
    role="status"
    aria-label={label}
    className={`inline-block ${SIZES[size] || SIZES.md} border-current border-t-transparent
      rounded-full animate-spin ${className}`}
  />
);

export const FullPageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center text-zinc-700">
    <Spinner size="lg" />
  </div>
);

export default Spinner;
