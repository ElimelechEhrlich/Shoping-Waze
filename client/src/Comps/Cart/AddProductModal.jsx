// Comps/Cart/AddProductModal.jsx
// Modal for adding a new product to the global catalog (MySQL).
// Optionally includes a price + store, and can add to cart immediately.
import { useState } from "react";
import { useToast } from "../../Contexts/ToastContext.jsx";

const DATA_API_URL = import.meta.env.VITE_DATA_API_URL || "http://localhost:8000";

const KNOWN_STORES = ["שופרסל", "רמי לוי", "ויקטורי", "מגה", "אחר"];

const AddProductModal = ({ onClose, onCreated }) => {
  const { showToast } = useToast();

  const [name, setName]           = useState("");
  const [price, setPrice]         = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading]     = useState(false);
  const [nameError, setNameError] = useState("");

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

      // Bust sessionStorage cache so products list reloads
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">הוספת מוצר חדש למאגר</h2>
          <button onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
            aria-label="סגור">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* שם המוצר */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              שם המוצר <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(""); }}
              placeholder="לדוגמה: חלב תנובה 3%"
              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none
                focus:ring-2 focus:ring-emerald-400 transition
                ${nameError ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              autoFocus
            />
            {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
          </div>

          {/* מחיר + רשת — אופציונלי */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              מחיר ורשת — אופציונלי
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">מחיר (₪)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white
                    text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">רשת</label>
                <select
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white
                    text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                >
                  <option value="">בחר רשת</option>
                  {KNOWN_STORES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              מחיר ורשת יתרמו למאגר הנתונים המשותף לכלל המשתמשים
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600
                hover:bg-slate-50 text-sm font-medium transition"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600
                disabled:opacity-50 text-white text-sm font-semibold flex items-center
                justify-center gap-2 transition"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? "שומר..." : "הוסף למאגר"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
