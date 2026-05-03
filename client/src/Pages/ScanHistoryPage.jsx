// pages/ScanHistoryPage.jsx
// היסטוריית קבלות שנסרקו ואושרו

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../Contexts/useToast.js";
import usePageTitle from "../hooks/usePageTitle.js";
import HomeButton from "../Comps/HomeButton.jsx";
import EmptyState from "../Comps/ui/EmptyState.jsx";
import ConfirmDialog from "../Comps/ui/ConfirmDialog.jsx";

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
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = useCallback(async (signal) => {
    try {
      if (!signal?.aborted) setLoading(true);
      const res = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
        ...(signal && { signal }),
      });
      if (signal?.aborted) return;
      const data = await res.json();
      if (signal?.aborted) return;
      if (data.success) setHistory(data.history);
    } catch {
      if (signal?.aborted) return;
      showToast("שגיאה בטעינת ההיסטוריה", "error");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    const ac = new AbortController();
    fetchHistory(ac.signal);
    return () => ac.abort();
  }, [fetchHistory]);

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await fetch(`${API_URL}/history/${pendingDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((h) => h._id !== pendingDelete));
      showToast("הרשומה נמחקה", "info");
    } catch {
      showToast("שגיאה במחיקה", "error");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100" dir="rtl">

      <header className="bg-white border-b border-zinc-200 px-4 py-3 sticky top-[60px] z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <HomeButton />
          <h1 className="text-base font-semibold text-zinc-900 flex-1">היסטוריית סריקות</h1>
          {history.length > 0 && (
            <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-sm">
              {history.length} קבלות
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-3">

        {loading && (
          <div className="space-y-2.5">
            {[1, 2, 3].map((k) => (
              <div key={k} className="bg-white rounded-md h-20 animate-pulse border border-zinc-200" />
            ))}
          </div>
        )}

        {!loading && history.length === 0 && (
          <EmptyState
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="אין קבלות בהיסטוריה"
            description="קבלות שתסרוק ותאשר יופיעו כאן ויאפשרו לך לעקוב אחרי הוצאות לאורך זמן."
            actionLabel="לסריקת קבלה"
            actionTo="/scan"
          />
        )}

        {!loading && history.map((entry) => {
          const isOpen = expanded === entry._id;
          const date   = new Date(entry.scannedAt).toLocaleDateString("he-IL", {
            day: "numeric", month: "long", year: "numeric",
          });

          return (
            <div key={entry._id}
              className="bg-white rounded-md border border-zinc-200 overflow-hidden">

              {/* שורה ראשית */}
              <button
                onClick={() => setExpanded(isOpen ? null : entry._id)}
                aria-expanded={isOpen}
                className="w-full text-right px-4 py-3 hover:bg-zinc-50 transition flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-sm bg-zinc-100 text-zinc-700 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="font-semibold text-zinc-900 text-sm truncate">{entry.storeName}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {date} · {entry.items.length} פריטים
                  </p>
                </div>
                <div className="text-left flex-shrink-0 flex items-center gap-2">
                  <p className="font-semibold text-zinc-900 text-sm">{fmt(entry.total)}</p>
                  <svg className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* פרטי פריטים */}
              {isOpen && (
                <div className="border-t border-zinc-200 px-4 pb-3 bg-zinc-50/50">
                  <table className="w-full text-sm mt-3">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                        <th className="text-right pb-1.5 font-medium">מוצר</th>
                        <th className="text-center pb-1.5 font-medium w-12">כמות</th>
                        <th className="text-left pb-1.5 font-medium w-20">מחיר</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.items.map((item, i) => (
                        <tr key={i} className="border-b border-zinc-100 last:border-0">
                          <td className="py-1.5 text-zinc-800">{item.name}</td>
                          <td className="py-1.5 text-center text-zinc-600">{item.qty}</td>
                          <td className="py-1.5 text-left text-zinc-700">
                            {item.price > 0 ? `₪${item.price.toFixed(2)}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    onClick={() => setPendingDelete(entry._id)}
                    className="mt-3 text-xs text-red-700 hover:text-red-800 hover:underline transition"
                  >
                    מחק מהיסטוריה
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </main>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="למחוק את הרשומה?"
        description="הרשומה תוסר לצמיתות מההיסטוריה ולא ניתן יהיה לשחזר אותה."
        confirmLabel="כן, מחק"
        cancelLabel="ביטול"
        destructive
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default ScanHistoryPage;
