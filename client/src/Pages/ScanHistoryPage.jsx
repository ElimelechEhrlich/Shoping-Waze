// pages/ScanHistoryPage.jsx
// ─────────────────────────────────────────────────────────
// היסטוריית קבלות שנסרקו ואושרו
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../Contexts/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import HomeButton from "../Comps/HomeButton.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const fmt = (n) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 2 }).format(n);

const ScanHistoryPage = () => {
  usePageTitle("היסטוריית סריקות");
  const { token } = useAuth();
  const { showToast } = useToast();

  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setHistory(data.history);
    } catch {
      showToast("שגיאה בטעינת ההיסטוריה", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((h) => h._id !== id));
      showToast("הרשומה נמחקה", "info");
    } catch {
      showToast("שגיאה במחיקה", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">

      {/* ── Page sub-header ────────────────────────────────
          sticky top-[60px]: stacks below the global AppHeader (≈60 px tall). */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-[60px] z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <HomeButton />
          <h1 className="text-lg font-bold text-slate-900 flex-1">היסטוריית סריקות</h1>
          <span className="text-xs text-slate-400">{history.length} קבלות</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-3">

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <div key={k} className="bg-white rounded-2xl h-20 animate-pulse border border-slate-100" />
            ))}
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-5xl mb-3">🧾</p>
            <p className="text-slate-500 font-medium">אין קבלות בהיסטוריה</p>
            <p className="text-slate-400 text-sm mt-1">קבלות יופיעו כאן לאחר אישורן</p>
            <Link to="/scan"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition">
              סרוק קבלה עכשיו
            </Link>
          </div>
        )}

        {!loading && history.map((entry) => {
          const isOpen = expanded === entry._id;
          const date   = new Date(entry.scannedAt).toLocaleDateString("he-IL", {
            day: "numeric", month: "long", year: "numeric",
          });

          return (
            <div key={entry._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

              {/* שורה ראשית */}
              <button
                onClick={() => setExpanded(isOpen ? null : entry._id)}
                className="w-full text-right px-5 py-4 hover:bg-slate-50 transition flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="font-bold text-slate-800 truncate">{entry.storeName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {date} · {entry.items.length} פריטים
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-emerald-600 text-sm">{fmt(entry.total)}</p>
                  <svg className={`w-4 h-4 text-slate-300 mt-1 mx-auto transition-transform ${isOpen ? "rotate-90" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* פרטי פריטים */}
              {isOpen && (
                <div className="border-t border-slate-100 px-5 pb-4">
                  <table className="w-full text-sm mt-3">
                    <thead>
                      <tr className="text-xs text-slate-400 border-b border-slate-100">
                        <th className="text-right pb-1.5 font-medium">מוצר</th>
                        <th className="text-center pb-1.5 font-medium w-12">כמות</th>
                        <th className="text-left pb-1.5 font-medium w-20">מחיר</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.items.map((item, i) => (
                        <tr key={i} className="border-b border-slate-50 last:border-0">
                          <td className="py-1.5 text-slate-700">{item.name}</td>
                          <td className="py-1.5 text-center text-slate-500">{item.qty}</td>
                          <td className="py-1.5 text-left text-slate-600">
                            {item.price > 0 ? `₪${item.price.toFixed(2)}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="mt-3 text-xs text-red-400 hover:text-red-600 transition"
                  >
                    מחק מהיסטוריה
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default ScanHistoryPage;
