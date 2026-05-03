import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../Contexts/useToast.js";
import { useAuth } from "../hooks/useAuth.js";
import usePageTitle from "../hooks/usePageTitle.js";
import HomeButton from "../Comps/HomeButton.jsx";
import Button from "../Comps/ui/Button.jsx";

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

const fmtPrice = (n) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 2 }).format(n);

const ReceiptDetailsPage = () => {
  const navigate       = useNavigate();
  const { state }      = useLocation();
  const { showToast }  = useToast();
  const { refreshUser } = useAuth();
  const receipt        = state?.receipt;

  usePageTitle(receipt?.store_name ? `קבלה — ${receipt.store_name}` : "פרטי קבלה");

  // רענון דף — אין state → חזור לסריקה
  useEffect(() => {
    if (!receipt) navigate("/scan", { replace: true });
  }, [receipt, navigate]);

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
      const token   = localStorage.getItem("token") || "";
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

      const cartRes = await fetch(`${API_URL}/cart`, {
        method: "POST", headers,
        body: JSON.stringify({ data: [{ items: validItems }] }),
      });
      if (cartRes.status === 401) {
        showToast("פג תוקף ההתחברות — נא להתחבר מחדש", "warning");
        navigate("/login");
        return;
      }
      if (!cartRes.ok) throw new Error("שגיאה בהוספת פריטים לסל");

      const total = validItems.reduce((s, i) => s + i.price * i.qty, 0);
      try {
        const histRes = await fetch(`${API_URL}/history`, {
          method: "POST", headers,
          body: JSON.stringify({
            storeName: receipt?.store_name || "לא ידוע",
            items:     validItems,
            total,
          }),
        });
        if (histRes.ok) await refreshUser();
      } catch {
        /* היסטוריה לא חוסמת את ה-flow */
      }

      showToast(`${validItems.length} פריטים נוספו לסל`, "success");
      navigate("/cart");
    } catch (err) {
      showToast(err.message || "שגיאה בלתי צפויה — נסה שוב", "error");
    } finally {
      setApproving(false);
    }
  };

  if (!receipt) return null;

  const inputClass =
    "w-full text-sm bg-transparent border border-transparent rounded-sm px-2 py-1.5 " +
    "focus:outline-none focus:bg-zinc-50 focus:border-zinc-300 hover:bg-zinc-50/60 transition";

  return (
    <div dir="rtl">

      <header className="bg-white border-b border-zinc-200 px-4 py-3 sticky top-[60px] z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-zinc-900 truncate">
              {receipt.store_name || "פרטי קבלה"}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">{receipt.date || "תאריך לא זוהה"}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="md" onClick={() => navigate("/scan")}>
              חזרה לסריקה
            </Button>
            <HomeButton />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* hint */}
        <p className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-sm px-3 py-2">
          ניתן לערוך שם, כמות ומחיר לפני אישור — לתיקון שגיאות שזוהו בסריקה.
        </p>

        {/* Editable table */}
        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[460px]">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-zinc-500">מוצר</th>
                  <th className="px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-zinc-500 w-24 text-center">כמות</th>
                  <th className="px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-zinc-500 w-28 text-center">מחיר (₪)</th>
                  <th className="px-2 py-2.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-zinc-100 last:border-b-0 group">
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateField(index, "name", e.target.value)}
                        className={`${inputClass} text-zinc-900 font-medium`}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="number"
                        min="0.001"
                        step="1"
                        value={item.qty}
                        onChange={(e) => updateField(index, "qty", e.target.value)}
                        className={`${inputClass} text-zinc-700 text-center`}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateField(index, "price", e.target.value)}
                        className={`${inputClass} text-zinc-900 text-center`}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="opacity-50 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition
                          w-7 h-7 flex items-center justify-center rounded-sm
                          text-zinc-400 hover:text-red-700 hover:bg-red-50"
                        aria-label="הסר שורה"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td className="px-4 py-5 text-sm text-zinc-500 text-center" colSpan={4}>
                      לא זוהו פריטים בקבלה.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="bg-white border border-zinc-200 rounded-md px-4 py-3 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">סה״כ מחושב</p>
          <p className="text-lg font-bold text-zinc-900">{fmtPrice(total)}</p>
        </div>

        {/* Approve */}
        <Button
          type="button"
          onClick={onApprove}
          disabled={!items.length}
          loading={approving}
          variant="primary"
          size="lg"
          fullWidth
        >
          {approving ? "מוסיף לסל..." : "אשר והוסף לסל"}
        </Button>
      </div>
    </div>
  );
};

export default ReceiptDetailsPage;
