// Comps/Cart/AddProductModal.jsx
// Modal for adding a new product to the global catalog (MySQL).
import { useState, useEffect } from "react";
import { useToast } from "../../Contexts/useToast.js";
import Button from "../ui/Button.jsx";

const DATA_API_URL = import.meta.env.VITE_DATA_API_URL || "http://localhost:8000";

const KNOWN_STORES = ["שופרסל", "רמי לוי", "ויקטורי", "מגה", "אחר"];

const fieldClass =
  "w-full px-3 py-2.5 rounded-sm border border-zinc-300 bg-white text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 " +
  "transition placeholder:text-zinc-400";

const AddProductModal = ({ onClose, onCreated }) => {
  const { showToast } = useToast();

  const [name, setName]           = useState("");
  const [price, setPrice]         = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading]     = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) { setNameError("שם המוצר הוא שדה חובה"); return; }
    setNameError("");
    setLoading(true);

    try {
      const body = {
        name: trimmedName,
        price: price !== "" ? parseFloat(price) : null,
        store_name: storeName || null,
      };

      const res  = await fetch(`${DATA_API_URL}/products`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "שגיאה ביצירת המוצר");
      }

      showToast(data.message, data.already_existed ? "info" : "success");
      sessionStorage.removeItem("products_cache");

      onCreated({
        id:       data.id,
        name:     data.name,
        category: data.category,
        price:    data.price,
        unit:     "יח'",
      });
    } catch (err) {
      showToast(err.message || "שגיאה בלתי צפויה", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-md w-full max-w-md animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
          <h2 id="add-product-title" className="text-base font-semibold text-zinc-900">
            הוספת מוצר חדש למאגר
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-sm flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition"
            aria-label="סגור"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">

          {/* שם המוצר */}
          <div>
            <label htmlFor="prod-name" className="block text-xs font-medium text-zinc-700 mb-1">
              שם המוצר <span className="text-red-700">*</span>
            </label>
            <input
              id="prod-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(""); }}
              placeholder="לדוגמה: חלב תנובה 3%"
              className={`${fieldClass} ${nameError ? "border-red-300 bg-red-50/40" : ""}`}
              autoFocus
            />
            {nameError && <p role="alert" className="text-xs text-red-700 mt-1">{nameError}</p>}
          </div>

          {/* מחיר + רשת — אופציונלי */}
          <div className="bg-zinc-50 rounded-sm p-3 space-y-3 border border-zinc-200">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
              מחיר ורשת (אופציונלי)
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="prod-price" className="block text-xs text-zinc-700 mb-1">מחיר (₪)</label>
                <input
                  id="prod-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="prod-store" className="block text-xs text-zinc-700 mb-1">רשת</label>
                <select
                  id="prod-store"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">בחר רשת</option>
                  {KNOWN_STORES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500">
              מחיר ורשת יתרמו למאגר הנתונים המשותף לכלל המשתמשים.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" size="md" fullWidth onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" variant="primary" size="md" fullWidth loading={loading} disabled={!name.trim()}>
              {loading ? "שומר..." : "הוסף למאגר"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
