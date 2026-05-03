import { useEffect } from "react";
import Button from "./Button.jsx";

const ConfirmDialog = ({
  open,
  title = "האם להמשיך?",
  description,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onCancel?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={(e) => e.target === e.currentTarget && onCancel?.()}
    >
      <div className="bg-white rounded-md shadow-md w-full max-w-sm p-5 animate-fade-in">
        <h2 id="confirm-title" className="text-base font-semibold text-zinc-900">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{description}</p>
        )}
        <div className="flex items-center justify-end gap-2 mt-5">
          <Button variant="secondary" size="md" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            size="md"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
