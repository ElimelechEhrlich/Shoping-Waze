// components/cart/NoPriceModal.jsx
// Popup שמופיע כשמנסים להוסיף כמות למוצר ללא מחיר.

import { useState, useEffect } from "react";
import Button from "../ui/Button.jsx";

const NoPriceModal = ({ item, onConfirm, onCancel }) => {
  const [price, setPrice] = useState("");

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  const handleConfirm = () => {
    const parsed = parseFloat(price);
    onConfirm(parsed > 0 ? parsed : 0);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[80] p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="no-price-title"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-md w-full max-w-sm p-5 animate-fade-in">
        <h3 id="no-price-title" className="font-semibold text-zinc-900 text-base">
          מחיר לא ידוע
        </h3>
        <p className="text-zinc-600 text-sm mt-1">
          למוצר <span className="font-medium text-zinc-900">{item.name}</span> אין מחיר במאגר.
          ניתן להזין מחיר עכשיו או להוסיף בלעדיו.
        </p>

        <div className="mt-4">
          <label htmlFor="no-price-input" className="block text-xs font-medium text-zinc-700 mb-1">
            מחיר ליחידה (אופציונלי)
          </label>
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">₪</span>
            <input
              id="no-price-input"
              type="number"
              min="0"
              step="0.1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              placeholder="0.00"
              autoFocus
              className="w-full pr-8 pl-3 py-2.5 rounded-sm border border-zinc-300 bg-white
                focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400
                text-sm placeholder:text-zinc-400"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <Button variant="secondary" size="md" fullWidth onClick={onCancel}>
            ביטול
          </Button>
          <Button variant="primary" size="md" fullWidth onClick={handleConfirm}>
            {price > 0 ? "הוסף עם מחיר" : "הוסף בלי מחיר"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoPriceModal;
