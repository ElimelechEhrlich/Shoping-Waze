import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const normalizeItems = (receipt) => {
  if (!receipt?.items || !Array.isArray(receipt.items)) return [];
  return receipt.items.map((item) => ({
    name: item.name || "מוצר",
    qty: Number(item.qty ?? item.quantity ?? 1) || 1,
    // backend_server returns unit_price/total_price, UI expects unit price in `price`
    price: Number(item.price ?? item.unit_price ?? 0) || 0,
    category: item.category || "כללי",
  }));
};

const ReceiptDetailsPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const receipt = state?.receipt;

  const items = useMemo(() => normalizeItems(receipt), [receipt]);
  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.qty * item.price, 0),
    [items]
  );

  const onApprove = async () => {
    if (!items.length) return;

    const token = localStorage.getItem("token") || "";
    const payload = { data: [{ items }] };
    const response = await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("failed to add items to cart");
    }

    navigate("/cart");
  };

  if (!receipt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10" dir="rtl">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-900">אין קבלה להצגה</h1>
          <p className="text-sm text-slate-500">חזור למסך הסריקה והעלה קבלה חדשה.</p>
          <button
            type="button"
            onClick={() => navigate("/scan")}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
          >
            חזרה לסריקה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{receipt.store_name || "פרטי קבלה"}</h1>
          <p className="text-sm text-slate-500 mt-1">{receipt.date || "תאריך לא זוהה"}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/scan")}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
        >
          חזרה לסריקה
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-slate-600">מוצר</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-600">כמות</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-600">מחיר</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.name}-${index}`} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-3 text-sm text-slate-800">{item.name}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.qty}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">₪{item.price.toFixed(2)}</td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="px-4 py-5 text-sm text-slate-500" colSpan={3}>
                  לא זוהו פריטים בקבלה.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <p className="text-sm text-slate-500">סה״כ מחושב</p>
        <p className="text-xl font-bold text-emerald-700">₪{total.toFixed(2)}</p>
      </div>

      <button
        type="button"
        onClick={onApprove}
        disabled={!items.length}
        className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold"
      >
        אשר והוסף לסל
      </button>
    </div>
  );
};

export default ReceiptDetailsPage;
