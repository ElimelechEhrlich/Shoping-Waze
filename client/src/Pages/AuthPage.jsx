import { useState } from "react";
import LoginForm from "../Comps/Auth/LoginForm.jsx";
import RegisterForm from "../Comps/Auth/RegisterForm.jsx";
import usePageTitle from "../hooks/usePageTitle.js";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  usePageTitle(isLogin ? "כניסה למערכת" : "הרשמה");

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">

        {/* ── Brand ─────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-sm mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-zinc-900">קניות חכמות</h1>
          <p className="text-sm text-zinc-500 mt-0.5">ניהול קניות וחיסכון</p>
        </div>

        {/* ── Tabs ──────────────────────────────────── */}
        <div
          role="tablist"
          aria-label="סוג טופס"
          className="flex items-center bg-white border border-zinc-200 rounded-md p-1 mb-4"
        >
          <button
            role="tab"
            aria-selected={isLogin}
            onClick={() => setIsLogin(true)}
            className={`flex-1 h-9 text-sm font-semibold rounded-sm transition-colors ${
              isLogin
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            התחברות
          </button>
          <button
            role="tab"
            aria-selected={!isLogin}
            onClick={() => setIsLogin(false)}
            className={`flex-1 h-9 text-sm font-semibold rounded-sm transition-colors ${
              !isLogin
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            הרשמה
          </button>
        </div>

        {/* ── Form card ─────────────────────────────── */}
        <div className="bg-white rounded-md p-6 sm:p-7 border border-zinc-200">
          {isLogin
            ? <LoginForm onSwitch={() => setIsLogin(false)} />
            : <RegisterForm onSwitch={() => setIsLogin(true)} />
          }
        </div>

        <p className="text-center text-[11px] text-zinc-400 mt-5">
          המשך השימוש מהווה הסכמה לתנאי השימוש
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
