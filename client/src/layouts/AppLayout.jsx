// layouts/AppLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Layout route לכל הדפים המאומתים.
//
// מספק:
//   1. AppHeader  — פס כותרת גלובלי עם המבורגר
//   2. NavDrawer  — תפריט ניווט צדדי (נפתח מהמבורגר)
//   3. <Outlet /> — תוכן הדף הנוכחי
//
// state של הדרוואר (drawerOpen) מנוהל כאן ומועבר ל-AppHeader ו-NavDrawer.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Outlet }   from "react-router-dom";
import AppHeader    from "../Comps/AppHeader.jsx";
import NavDrawer    from "../Comps/NavDrawer.jsx";

const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* כותרת גלובלית — מעבירה callback לפתיחת הדרוואר */}
      <AppHeader onMenuClick={() => setDrawerOpen(true)} />

      {/* תפריט ניווט צדדי */}
      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* תוכן הדף */}
      <Outlet />
    </div>
  );
};

export default AppLayout;
