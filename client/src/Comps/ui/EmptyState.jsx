import Button from "./Button.jsx";

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  className = "",
}) => (
  <div
    className={`bg-white rounded-md border border-dashed border-zinc-300 px-6 py-10
      text-center flex flex-col items-center gap-3 ${className}`}
    role="status"
  >
    {icon && (
      <div className="w-10 h-10 rounded-sm bg-zinc-100 text-zinc-500 flex items-center justify-center">
        {icon}
      </div>
    )}
    {title && (
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
    )}
    {description && (
      <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
        {description}
      </p>
    )}
    {(actionLabel && (actionTo || onAction)) && (
      <div className="pt-1">
        <Button
          size="sm"
          variant="primary"
          to={actionTo}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    )}
  </div>
);

export default EmptyState;
