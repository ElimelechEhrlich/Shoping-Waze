// pages/AuthPage.jsx
// ─────────────────────────────────────────────────────────
// עמוד ה-Auth — מכיל את ה-card שמחזיק את שני הטפסים.
// isLogin שולט על איזה טופס מוצג.
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import LoginForm from "../Comps/Auth/LoginForm.jsx";
import RegisterForm from "../Comps/Auth/RegisterForm.jsx";

const AuthPage = () => {
  // true = טופס התחברות, false = טופס הרשמה
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8" dir="rtl">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-2xl shadow-lg mb-3">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">קניות חכמות</h1>
          <p className="text-sm text-gray-400 mt-0.5">ניהול קניות בקלות</p>
        </div>

        {/* Card — מכיל את הטופס הפעיל */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {isLogin
            ? <LoginForm onSwitch={() => setIsLogin(false)} />
            : <RegisterForm onSwitch={() => setIsLogin(true)} />
          }
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
