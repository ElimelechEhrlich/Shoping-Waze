// AppLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Layout route for ALL authenticated pages.
//
// How it works with React Router:
//   In App.jsx this component is the `element` of a path-less parent <Route>.
//   Child <Route> elements are listed inside that parent. React Router matches
//   the child that fits the current URL and renders it into <Outlet>.
//   ProtectedRoute (wrapping this in App.jsx) redirects to /login when the user
//   is not authenticated — so AppLayout only renders for logged-in users.
//
// What it provides to every page:
//   1. AppHeader  — global sticky brand bar (logo + user info + logout).
//      Height: ~60 px (py-3.5 padding + h-8 content). Page-specific sub-headers
//      should use "sticky top-[60px]" so they stack correctly below this bar.
//   2. min-h-screen bg-slate-100 font-sans — consistent page background.
//   3. <Outlet /> — the matched child page content.
// ─────────────────────────────────────────────────────────────────────────────
import { Outlet } from "react-router-dom";
import AppHeader from "../Comps/AppHeader.jsx";

const AppLayout = () => (
  <div className="min-h-screen bg-slate-100 font-sans">
    {/* Global sticky header — z-50 keeps it above page-level sub-headers (z-30) */}
    <AppHeader />
    {/* Current page rendered by React Router's nested route match */}
    <Outlet />
  </div>
);

export default AppLayout;
