// pages/SharedCartListPage.jsx
// ─────────────────────────────────────────────────────────
// רשימת הסלים השיתופיים של המשתמש + יצירה/הצטרפות
// ─────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSharedCart from "../hooks/useSharedCart.js";
import { useAuth } from "../hooks/useAuth.js";
import usePageTitle from "../hooks/usePageTitle.js";
import HomeButton from "../Comps/HomeButton.jsx";

const SharedCartListPage = () => {
  usePageTitle("סלים משותפים");
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    sharedCarts, loading,
    fetchMySharedCarts, createSharedCart, joinSharedCart,
    leaveCart, deleteCart,
  } = useSharedCart();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin,   setShowJoin]   = useState(false);
  const [cartName,   setCartName]   = useState("");
  const [joinCode,   setJoinCode]   = useState("");
  const [busy,       setBusy]       = useState(false);

  useEffect(() => { fetchMySharedCarts(); }, [fetchMySharedCarts]);

  const handleCreate = async () => {
    if (!cartName.trim()) return;
    setBusy(true);
    const cart = await createSharedCart(cartName.trim());
    setBusy(false);
    if (cart) {
      setCartName("");
      setShowCreate(false);
      navigate(`/shared-cart/${cart._id}`);
    }
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) return;
    setBusy(true);
    const cart = await joinSharedCart(code);
    setBusy(false);
    if (cart) {
      setJoinCode("");
      setShowJoin(false);
      navigate(`/shared-cart/${cart._id}`);
    }
  };

  const isOwner = (cart) => cart.ownerId?.toString() === user?._id?.toString()
    || cart.ownerId === user?._id;

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <HomeButton />
          <h1 className="text-lg font-bold text-slate-900 flex-1">סלים משותפים</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* ── כפתורי פעולה ────────────────────────────── */}
        <div className="flex gap-3">
          <button
            onClick={() => { setShowCreate(true); setShowJoin(false); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600
              text-white font-semibold rounded-xl transition shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            צור סל חדש
          </button>
          <button
            onClick={() => { setShowJoin(true); setShowCreate(false); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600
              text-white font-semibold rounded-xl transition shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            הצטרף עם קוד
          </button>
        </div>

        {/* ── פאנל יצירה ──────────────────────────────── */}
        {showCreate && (
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-slate-800">שם לסל החדש</h2>
            <input
              autoFocus
              value={cartName}
              onChange={(e) => setCartName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="למשל: קניות שבת עם רותי"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">
                ביטול
              </button>
              <button
                onClick={handleCreate}
                disabled={!cartName.trim() || busy}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600
                  disabled:opacity-60 text-white text-sm font-semibold transition"
              >
                {busy ? "יוצר..." : "צור סל"}
              </button>
            </div>
          </div>
        )}

        {/* ── פאנל הצטרפות ────────────────────────────── */}
        {showJoin && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-slate-800">הזן קוד הזמנה</h2>
            <p className="text-xs text-slate-400">קוד של 6 תווים שנשלח אליך מחבר הסל</p>
            <input
              autoFocus
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              maxLength={6}
              placeholder="ABC123"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-center
                tracking-[0.4em] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowJoin(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">
                ביטול
              </button>
              <button
                onClick={handleJoin}
                disabled={joinCode.length !== 6 || busy}
                className="flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600
                  disabled:opacity-60 text-white text-sm font-semibold transition"
              >
                {busy ? "מצטרף..." : "הצטרף"}
              </button>
            </div>
          </div>
        )}

        {/* ── רשימת סלים ──────────────────────────────── */}
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((k) => (
              <div key={k} className="bg-white rounded-2xl h-20 animate-pulse border border-slate-100" />
            ))}
          </div>
        )}

        {!loading && sharedCarts.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <p className="text-4xl mb-3">🛒</p>
            <p className="text-slate-400 text-sm">אין לך סלים משותפים עדיין</p>
            <p className="text-slate-400 text-xs mt-1">צור סל חדש או הצטרף עם קוד</p>
          </div>
        )}

        {!loading && sharedCarts.map((cart) => (
          <div
            key={cart._id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => navigate(`/shared-cart/${cart._id}`)}
              className="w-full text-right px-5 py-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{cart.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cart.items.length} פריטים · {cart.members.length} חברים
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cart.members.slice(0, 4).map((m, i) => (
                      <span key={i}
                        className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {m.displayName}
                        {m.userId?.toString() === user?._id?.toString() && " (אני)"}
                      </span>
                    ))}
                    {cart.members.length > 4 && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        +{cart.members.length - 4} נוספים
                      </span>
                    )}
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0 rotate-180"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* קוד הזמנה + כפתורי ניהול */}
            <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">קוד הזמנה:</span>
                <span className="font-mono font-bold text-slate-700 tracking-widest text-sm bg-white
                  border border-slate-200 px-2 py-0.5 rounded-lg select-all">
                  {cart.inviteCode}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isOwner(cart) ? deleteCart(cart._id) : leaveCart(cart._id);
                }}
                className="text-xs text-red-400 hover:text-red-600 transition"
              >
                {isOwner(cart) ? "מחק" : "עזוב"}
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default SharedCartListPage;
