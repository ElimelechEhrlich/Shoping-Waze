// pages/SharedCartListPage.jsx
// רשימת הסלים השיתופיים של המשתמש + יצירה/הצטרפות

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSharedCart from "../hooks/useSharedCart.js";
import { useAuth } from "../hooks/useAuth.js";
import usePageTitle from "../hooks/usePageTitle.js";
import HomeButton from "../Comps/HomeButton.jsx";
import Button from "../Comps/ui/Button.jsx";
import EmptyState from "../Comps/ui/EmptyState.jsx";
import ConfirmDialog from "../Comps/ui/ConfirmDialog.jsx";

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
  const [pendingAction, setPendingAction] = useState(null); // { cartId, isOwner }

  useEffect(() => {
    const ac = new AbortController();
    fetchMySharedCarts(ac.signal);
    return () => ac.abort();
  }, [fetchMySharedCarts]);

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

  const confirmAction = async () => {
    if (!pendingAction) return;
    if (pendingAction.isOwner) await deleteCart(pendingAction.cartId);
    else                       await leaveCart(pendingAction.cartId);
    setPendingAction(null);
  };

  return (
    <div className="min-h-screen bg-zinc-100" dir="rtl">

      <header className="bg-white border-b border-zinc-200 px-4 py-3 sticky top-[60px] z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <HomeButton />
          <h1 className="text-base font-semibold text-zinc-900 flex-1">סלים משותפים</h1>
          {sharedCarts.length > 0 && (
            <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-sm">
              {sharedCarts.length}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── כפתורי פעולה ────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => { setShowCreate(true); setShowJoin(false); }}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            צור סל חדש
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => { setShowJoin(true); setShowCreate(false); }}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            }
          >
            הצטרף עם קוד
          </Button>
        </div>

        {/* ── פאנל יצירה ──────────────────────────────── */}
        {showCreate && (
          <div className="bg-white rounded-md border border-zinc-200 p-4 space-y-3">
            <div>
              <label htmlFor="new-cart-name" className="block text-xs font-medium text-zinc-700 mb-1">
                שם לסל החדש
              </label>
              <input
                id="new-cart-name"
                autoFocus
                value={cartName}
                onChange={(e) => setCartName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="למשל: קניות שבת עם רותי"
                className="w-full border border-zinc-300 rounded-sm px-3 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400
                  placeholder:text-zinc-400"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setShowCreate(false)}>ביטול</Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreate}
                loading={busy}
                disabled={!cartName.trim()}
              >
                {busy ? "יוצר..." : "צור סל"}
              </Button>
            </div>
          </div>
        )}

        {/* ── פאנל הצטרפות ────────────────────────────── */}
        {showJoin && (
          <div className="bg-white rounded-md border border-zinc-200 p-4 space-y-3">
            <div>
              <label htmlFor="join-code" className="block text-xs font-medium text-zinc-700 mb-1">
                קוד הזמנה
              </label>
              <p className="text-[11px] text-zinc-500 mb-2">קוד של 6 תווים שנשלח אליך מחבר הסל</p>
              <input
                id="join-code"
                autoFocus
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                maxLength={6}
                placeholder="ABC123"
                inputMode="text"
                className="w-full border border-zinc-300 rounded-sm px-3 py-2.5 text-base text-center
                  tracking-[0.4em] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-zinc-400
                  focus:border-zinc-400 placeholder:text-zinc-300"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setShowJoin(false)}>ביטול</Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleJoin}
                loading={busy}
                disabled={joinCode.length !== 6}
              >
                {busy ? "מצטרף..." : "הצטרף"}
              </Button>
            </div>
          </div>
        )}

        {/* ── רשימת סלים ──────────────────────────────── */}
        {loading && (
          <div className="space-y-2.5">
            {[1, 2].map((k) => (
              <div key={k} className="bg-white rounded-md h-24 animate-pulse border border-zinc-200" />
            ))}
          </div>
        )}

        {!loading && sharedCarts.length === 0 && !showCreate && !showJoin && (
          <EmptyState
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            title="עדיין אין סלים משותפים"
            description="פתח סל חדש ושתף עם משפחה או חברים, או הצטרף לסל קיים עם קוד הזמנה."
          />
        )}

        {!loading && sharedCarts.map((cart) => (
          <div
            key={cart._id}
            className="bg-white rounded-md border border-zinc-200 overflow-hidden"
          >
            <button
              onClick={() => navigate(`/shared-cart/${cart._id}`)}
              className="w-full text-right px-4 py-3 hover:bg-zinc-50 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-zinc-900 truncate">{cart.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {cart.items.length} פריטים · {cart.members.length} חברים
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cart.members.slice(0, 4).map((m, i) => (
                      <span key={i}
                        className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-sm">
                        {m.displayName}
                        {m.userId?.toString() === user?._id?.toString() && " (אני)"}
                      </span>
                    ))}
                    {cart.members.length > 4 && (
                      <span className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-sm">
                        +{cart.members.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                <svg className="w-4 h-4 text-zinc-400 mt-1 flex-shrink-0 rotate-180"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <div className="border-t border-zinc-200 px-4 py-2.5 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">קוד</span>
                <span className="font-mono font-semibold text-zinc-900 tracking-[0.2em] text-xs bg-white
                  border border-zinc-200 px-2 py-0.5 rounded-sm select-all">
                  {cart.inviteCode}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingAction({ cartId: cart._id, isOwner: isOwner(cart) });
                }}
                className="text-xs text-red-700 hover:text-red-800 hover:underline transition"
              >
                {isOwner(cart) ? "מחק סל" : "עזוב"}
              </button>
            </div>
          </div>
        ))}
      </main>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.isOwner ? "למחוק את הסל המשותף?" : "לעזוב את הסל המשותף?"}
        description={
          pendingAction?.isOwner
            ? "מחיקת הסל תסיר אותו לצמיתות עבור כל החברים. לא ניתן לבטל פעולה זו."
            : "אתה תוסר מהסל אך השאר ימשיכו להשתמש בו. תמיד אפשר להצטרף שוב עם קוד ההזמנה."
        }
        confirmLabel={pendingAction?.isOwner ? "כן, מחק" : "כן, צא"}
        cancelLabel="ביטול"
        destructive
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
};

export default SharedCartListPage;
