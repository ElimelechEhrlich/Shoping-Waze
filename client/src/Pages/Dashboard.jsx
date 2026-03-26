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
import OnboardingModal, { shouldShowOnboarding } from "../Comps/Onboarding/OnboardingModal.jsx";

// ── כותרת סעיף ────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{children}</span>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

// ── כרטיס ניווט ───────────────────────────────────────────
const ActionCard = ({ to, onClick, color = "emerald", icon, title, subtitle, badge, size = "normal" }) => {
  const colors = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", hover: "hover:border-emerald-200 hover:bg-emerald-50/60" },
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    hover: "hover:border-blue-200 hover:bg-blue-50/60"    },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600",   hover: "hover:border-amber-200 hover:bg-amber-50/60"  },
    purple:  { bg: "bg-purple-50",  text: "text-purple-600",  hover: "hover:border-purple-200 hover:bg-purple-50/60"},
    rose:    { bg: "bg-rose-50",    text: "text-rose-600",    hover: "hover:border-rose-200 hover:bg-rose-50/60"    },
  };
  const c = colors[color] || colors.emerald;

  const inner = (
    <div className={`group relative flex items-center gap-4
      ${size === "large" ? "p-6" : "p-4"}
      bg-white rounded-2xl border border-slate-100 shadow-sm
      transition-all duration-200 cursor-pointer ${c.hover}`}
    >
      <div className={`${c.bg} ${c.text} ${size === "large" ? "p-4" : "p-3"} rounded-xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-slate-800 ${size === "large" ? "text-lg" : "text-base"} truncate`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-slate-400 text-sm mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {badge > 0 && (
        <span className="absolute -top-2 -left-2 min-w-[1.4rem] h-[1.4rem] flex items-center justify-center
          rounded-full bg-emerald-500 text-white text-xs font-bold px-1 shadow">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-400 rotate-180 transition-colors flex-shrink-0"
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
  useEffect(() => { fetchMySharedCarts(); }, [fetchMySharedCarts]);

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
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">{today}</p>
          <h1 className="text-2xl font-bold text-slate-900">
            שלום, {user?.name?.split(" ")[0]} 👋
          </h1>
        </div>

        {/* ══════════════════════════════════════════════════
            סעיף 1 — סריקת קבלה
        ══════════════════════════════════════════════════ */}
        <section>
          <SectionLabel>סריקת קבלה</SectionLabel>
          <ActionCard
            to="/scan"
            color="emerald"
            size="large"
            icon={
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              color="blue"
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
              color="purple"
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
            color="amber"
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

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* כפתור פתיחה/סגירה */}
            <button
              onClick={() => setCreateOpen((v) => !v)}
              className={`w-full flex items-center gap-4 p-4 transition-colors text-right
                ${createOpen ? "bg-purple-50 border-b border-purple-100" : "hover:bg-slate-50"}`}
            >
              <div className={`p-3 rounded-xl flex-shrink-0 transition-colors
                ${createOpen ? "bg-purple-500 text-white" : "bg-purple-50 text-purple-600"}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1 text-right">
                <p className={`font-bold text-base ${createOpen ? "text-purple-700" : "text-slate-800"}`}>
                  יצירת סל משותף חדש
                </p>
                <p className="text-slate-400 text-sm mt-0.5">
                  {createOpen ? "הזן שם לסל החדש" : "צור סל ושתף עם חברים ומשפחה"}
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-slate-300 transition-transform duration-200 flex-shrink-0
                  ${createOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* טופס יצירה inline — מוצג בלחיצה */}
            {createOpen && (
              <div className="px-5 pb-5 pt-4 space-y-3">
                <input
                  ref={createInputRef}
                  type="text"
                  value={cartName}
                  onChange={(e) => setCartName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="לדוגמה: קניות שבת עם הורים"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCreateOpen(false); setCartName(""); }}
                    className="flex-1 py-2 rounded-xl border border-slate-200
                      text-slate-600 text-sm hover:bg-slate-50 transition"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!cartName.trim() || creating}
                    className="flex-1 py-2 rounded-xl bg-purple-500 hover:bg-purple-600
                      disabled:opacity-60 text-white text-sm font-semibold transition"
                  >
                    {creating ? "יוצר..." : "צור סל"}
                  </button>
                </div>
              </div>
            )}
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
