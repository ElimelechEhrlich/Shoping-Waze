import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../Contexts/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const normalizeItems = (receipt) => {
  if (!receipt?.items || !Array.isArray(receipt.items)) return [];
  return receipt.items.map((item) => ({
    name:     item.name     || "מוצר",
    qty:      Number(item.qty ?? item.quantity ?? 1) || 1,
    price:    Number(item.price ?? item.unit_price ?? 0) || 0,
    category: item.category || "כללי",
  }));
};

const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ReceiptDetailsPage = () => {
  const navigate       = useNavigate();
  const { state }      = useLocation();
  const { showToast }  = useToast();
  const receipt        = state?.receipt;

  usePageTitle(receipt?.store_name ? `קבלה — ${receipt.store_name}` : "פרטי קבלה");

  const [items, setItems]       = useState(() => normalizeItems(receipt));
  const [approving, setApproving] = useState(false);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.qty * item.price, 0),
    [items]
  );

  const updateField = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: field === "name" ? value : Math.max(0, Number(value) || 0) } : item
      )
    );
  };

  const removeRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const onApprove = async () => {
    const validItems = items.filter((i) => i.name.trim());
    if (!validItems.length) return;
    setApproving(true);
    try {
      const token    = localStorage.getItem("token") || "";
      const payload  = { data: [{ items: validItems }] };
      const response = await fetch(`${API_URL}/cart`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });

      if (response.status === 401) {
        showToast("פג תוקף ההתחברות — נא להתחבר מחדש", "warning");
        navigate("/login");
        return;
      }
      if (!response.ok) throw new Error("שגיאה בהוספת פריטים לסל");

      showToast(`${validItems.length} פריטים נוספו לסל`, "success");
      navigate("/cart");
    } catch (err) {
      showToast(err.message || "שגיאה בלתי צפויה — נסה שוב", "error");
    } finally {
      setApproving(false);
    }
  };

  if (!receipt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10" dir="rtl">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-900">אין קבלה להצגה</h1>
          <p className="text-sm text-slate-500">חזור למסך הסריקה והעלה קבלה חדשה.</p>
          <button type="button" onClick={() => navigate("/scan")}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">
            חזרה לסריקה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{receipt.store_name || "פרטי קבלה"}</h1>
          <p className="text-sm text-slate-500 mt-1">{receipt.date || "תאריך לא זוהה"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate("/scan")}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold">
            חזרה לסריקה
          </button>
          <Link to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
              text-slate-600 hover:bg-slate-50 text-sm font-medium transition">
            <HomeIcon />
            בית
          </Link>
        </div>
      </div>

      {/* hint */}
      <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
        ✏️ ניתן לערוך שם, כמות ומחיר לפני אישור — לתיקון שגיאות של הסריקה
      </p>

      {/* Editable table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-slate-600">מוצר</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-600 w-24">כמות</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-600 w-28">מחיר (₪)</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-b-0 group">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    className="w-full text-sm text-slate-800 bg-transparent border border-transparent
                      rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-300 focus:bg-emerald-50
                      hover:border-slate-200 transition"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="0.001"
                    step="1"
                    value={item.qty}
                    onChange={(e) => updateField(index, "qty", e.target.value)}
                    className="w-full text-sm text-slate-700 bg-transparent border border-transparent
                      rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-300 focus:bg-emerald-50
                      hover:border-slate-200 transition text-center"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateField(index, "price", e.target.value)}
                    className="w-full text-sm font-semibold text-slate-900 bg-transparent border border-transparent
                      rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-300 focus:bg-emerald-50
                      hover:border-slate-200 transition text-center"
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center
                      rounded-full hover:bg-red-100 text-slate-300 hover:text-red-500 transition"
                    aria-label="הסר שורה"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="px-4 py-5 text-sm text-slate-500" colSpan={4}>
                  לא זוהו פריטים בקבלה.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <p className="text-sm text-slate-500">סה״כ מחושב</p>
        <p className="text-xl font-bold text-emerald-700">₪{total.toFixed(2)}</p>
      </div>

      {/* Approve */}
      <button
        type="button"
        onClick={onApprove}
        disabled={!items.length || approving}
        className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50
          text-white font-semibold flex items-center justify-center gap-2"
      >
        {approving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {approving ? "מוסיף לסל..." : "אשר והוסף לסל"}
      </button>
    </div>
  );
};

export default ReceiptDetailsPage;
