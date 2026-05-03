// pages/Dashboard.jsx
// ─────────────────────────────────────────────────────────
// דף הבית לאחר התחברות — מחולק ל-4 סעיפים ברורים:
//   1. סריקת קבלה
//   2. הסלים שלי (סל פרטי + סלים משותפים)
//   3. היסטוריית קבלות
//   4. יצירת סל משותף חדש (טופס inline)
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth }     from "../hooks/useAuth.js";
import useCart         from "../hooks/useCart.js";
import useSharedCart   from "../hooks/useSharedCart.js";
import usePageTitle    from "../hooks/usePageTitle.js";
import PopularProducts from "../Comps/Dashboard/PopularProducts.jsx";
import OnboardingModal from "../Comps/Onboarding/OnboardingModal.jsx";
import { shouldShowOnboarding } from "../Comps/Onboarding/onboardingStorage.js";
import SharePanel from "../Comps/SharePanel.jsx";

// ── כותרת סעיף ────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{children}</span>
    <div className="flex-1 h-px bg-zinc-200" />
  </div>
);

// ── כרטיס ניווט ───────────────────────────────────────────
const ActionCard = ({ to, onClick, icon, title, subtitle, badge, size = "normal" }) => {
  const c = {
    bg: "bg-zinc-100",
    text: "text-zinc-800",
    hover: "hover:border-zinc-300 hover:bg-zinc-50",
  };

  const inner = (
    <div className={`group relative flex items-center gap-3
      ${size === "large" ? "px-5 py-4" : "px-4 py-3"}
      bg-white rounded-sm border border-zinc-200
      transition-colors cursor-pointer ${c.hover}`}
    >
      <div className={`${c.bg} ${c.text} ${size === "large" ? "p-2.5" : "p-2"} rounded-sm flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-zinc-900 ${size === "large" ? "text-base" : "text-sm"} truncate`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-zinc-500 text-xs mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {badge > 0 && (
        <span className="absolute -top-2 -left-2 min-w-[1.4rem] h-[1.4rem] flex items-center justify-center
          rounded-sm bg-zinc-900 text-white text-xs font-bold px-1 border border-zinc-700">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <svg className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 rotate-180 transition-colors flex-shrink-0"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );

  if (to)     return <Link to={to}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className="w-full text-right">{inner}</button>;
  return inner;
};

// ── Dashboard ─────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user }           = useAuth();
  const { cart, totalItems, updateItem } = useCart();
  const { sharedCarts, fetchMySharedCarts, createSharedCart, loading: sharedLoading } = useSharedCart();
  usePageTitle("דף הבית");

  const [showOnboarding, setShowOnboarding] = useState(() => shouldShowOnboarding());

  // ── יצירת סל משותף inline ────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [cartName,   setCartName]   = useState("");
  const [creating,   setCreating]   = useState(false);
  const createInputRef = useRef(null);

  // טעינת הסלים המשותפים לתצוגת מספר הסלים
  useEffect(() => {
    const ac = new AbortController();
    fetchMySharedCarts(ac.signal);
    return () => ac.abort();
  }, [fetchMySharedCarts]);

  // פוקוס אוטומטי על שדה שם הסל
  useEffect(() => {
    if (createOpen) setTimeout(() => createInputRef.current?.focus(), 50);
  }, [createOpen]);

  const handleCreate = async () => {
    const name = cartName.trim();
    if (!name) return;
    setCreating(true);
    const cart = await createSharedCart(name);
    setCreating(false);
    if (cart) {
      setCartName("");
      setCreateOpen(false);
      navigate(`/shared-cart/${cart._id}`);
    }
  };

  // פורמט תאריך עברי
  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div>
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* ── ברכה ──────────────────────────────────────── */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{today}</p>
          <h1 className="text-2xl font-bold text-zinc-900">
            שלום, {user?.name?.split(" ")[0]}
          </h1>
        </div>

        {/* ══════════════════════════════════════════════════
            סעיף 1 — סריקת קבלה
        ══════════════════════════════════════════════════ */}
        <section>
          <SectionLabel>סריקת קבלה</SectionLabel>
          <ActionCard
            to="/scan"
            size="large"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            title="סריקת קבלה"
            subtitle="צלם קבלה וייבא פריטים אוטומטית לסל"
          />
        </section>

        {/* ══════════════════════════════════════════════════
            סעיף 2 — הסלים שלי (פרטי + משותפים יחד)
        ══════════════════════════════════════════════════ */}
        <section>
          <SectionLabel>הסלים שלי</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* סל פרטי */}
            <ActionCard
              to="/cart"
              badge={totalItems}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title="הסל הפרטי שלי"
              subtitle={totalItems > 0 ? `${totalItems} פריטים בסל` : "הסל שלך ריק כרגע"}
            />

            {/* סלים משותפים */}
            <ActionCard
              to="/shared-carts"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="הסלים המשותפים"
              subtitle={
                sharedLoading
                  ? "טוען..."
                  : sharedCarts.length > 0
                    ? `${sharedCarts.length} סל${sharedCarts.length === 1 ? "" : "ים"} פעיל${sharedCarts.length === 1 ? "" : "ים"}`
                    : "אין סלים משותפים עדיין"
              }
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            סעיף 3 — היסטוריית קבלות
        ══════════════════════════════════════════════════ */}
        <section>
          <SectionLabel>היסטוריית קבלות</SectionLabel>
          <ActionCard
            to="/history"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="היסטוריית קבלות"
            subtitle="כל הקבלות שסרקת ואישרת"
          />
        </section>

        {/* ══════════════════════════════════════════════════
            סעיף 4 — יצירת סל משותף חדש (inline)
        ══════════════════════════════════════════════════ */}
        <section>
          <SectionLabel>פעולה מהירה</SectionLabel>

          <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">

            {/* כפתור פתיחה/סגירה */}
            <button
              onClick={() => setCreateOpen((v) => !v)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-right
                ${createOpen ? "bg-zinc-50 border-b border-zinc-200" : "hover:bg-zinc-50"}`}
            >
              <div className={`p-2 rounded-sm flex-shrink-0 transition-colors
                ${createOpen ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1 text-right min-w-0">
                <p className="font-semibold text-sm text-zinc-900">
                  יצירת סל משותף חדש
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {createOpen ? "הזן שם לסל החדש" : "צור סל ושתף עם חברים ומשפחה"}
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0
                  ${createOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* טופס יצירה inline — מוצג בלחיצה */}
            {createOpen && (
              <div className="px-4 pb-4 pt-3 space-y-2.5">
                <input
                  ref={createInputRef}
                  type="text"
                  value={cartName}
                  onChange={(e) => setCartName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="לדוגמה: קניות שבת עם הורים"
                  className="w-full border border-zinc-300 rounded-sm px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setCreateOpen(false); setCartName(""); }}
                    className="flex-1 h-10 rounded-sm border border-zinc-300 bg-white
                      text-zinc-700 text-sm font-semibold hover:bg-zinc-50 transition"
                  >
                    ביטול
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!cartName.trim() || creating}
                    className="flex-1 h-10 rounded-sm bg-zinc-900 hover:bg-zinc-800
                      disabled:opacity-50 text-white text-sm font-semibold transition"
                  >
                    {creating ? "יוצר..." : "צור סל"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            סעיף 5 — שתף את האפליקציה
        ══════════════════════════════════════════════════ */}
        <section>
          <SectionLabel>שתף עם חברים</SectionLabel>
          <div className="bg-white rounded-md border border-zinc-200 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-100 text-zinc-700 rounded-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zinc-900 text-sm">שתף עם חברים</p>
              <p className="text-xs text-zinc-500 mt-0.5">שלח קישור לחבר שיוכל לסרוק קבלות ולהשוות מחירים</p>
            </div>
            <SharePanel
              title="קבלות חכמות"
              text="נסה את קבלות חכמות — סריקה, ניהול סל קניות והשוואת מחירים."
              color="emerald"
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            מוצרים פופולריים — מבוסס על היסטוריית הקניות
        ══════════════════════════════════════════════════ */}
        <PopularProducts cart={cart} onAddAgain={updateItem} />

      </main>

      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
};

export default Dashboard;
