// pages/Dashboard.jsx
// ─────────────────────────────────────────────────────────
// עמוד הבית לאחר התחברות — סגנון מקצועי/עסקי.
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import NavCard from "../Comps/Dashboard/NavCard.jsx";
import { useAuth } from "../hooks/useAuth.js";
import useCart from "../hooks/useCart.js";
import PopularProducts from "../Comps/Dashboard/PopularProducts.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import OnboardingModal, { shouldShowOnboarding } from "../Comps/Onboarding/OnboardingModal.jsx";

const Dashboard = () => {
  // logout is now handled by AppHeader; we only need user for the greeting.
  const { user } = useAuth();
  const { cart, totalItems, updateItem } = useCart();
  usePageTitle("דף הבית");

  const [showOnboarding, setShowOnboarding] = useState(() => shouldShowOnboarding());

  // פורמט תאריך עברי
  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    // AppLayout (via the layout Route in App.jsx) already provides:
    //   • The global sticky AppHeader (brand + user info + logout)
    //   • min-h-screen bg-slate-100 font-sans page background
    // Dashboard only renders its own main content below the global header.
    <div>
      {/* ── Main ─────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* כותרת עמוד */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
              {today}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              שלום, {user?.name?.split(" ")[0]}
            </h1>
          </div>
        </div>

        {/* כפתורי ניווט */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NavCard
            to="/scan"
            color="emerald"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
            title="סריקת קבלה"
            subtitle="צלם קבלה וייבא אוטומטית"
          />
          <NavCard
            to="/cart"
            color="blue"
            badge={totalItems}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            title="סל הקניות"
            subtitle={totalItems > 0 ? `${totalItems} פריטים בסל` : "צפה ונהל את הסל שלך"}
          />
        </div>

        {/* היסטוריית סריקות */}
        <NavCard
          to="/history"
          color="amber"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="היסטוריית קבלות"
          subtitle="כל הקבלות שסרקת"
        />

        {/* סל שיתופי */}
        <NavCard
          to="/shared-carts"
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          title="סל משותף"
          subtitle="קנה ביחד עם חברים ומשפחה"
        />

        {/* טבלת מוצרים פופולריים */}
        <PopularProducts cart={cart} onAddAgain={updateItem} />
      </main>

      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
};

export default Dashboard;
