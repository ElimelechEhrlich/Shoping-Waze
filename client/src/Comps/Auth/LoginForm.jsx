// components/auth/LoginForm.jsx
// ─────────────────────────────────────────────────────────
// טופס התחברות.
// מנהל state מקומי של השדות + מצב שגיאה + loading.
// קורא ל-login מה-AuthContext בלבד — לא מכיר את ה-API ישירות.
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * @param {{ onSwitch: () => void }} props
 * onSwitch — מעבר לטופס ההרשמה
 */
const LoginForm = ({ onSwitch }) => {
  const { login } = useAuth();

  // state מקומי לשדות הטופס
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /** עדכון שדה בודד בלי לאבד את שאר הערכים */
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      // אחרי login מוצלח — AuthContext מעדכן user ו-App מרנדר Dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">ברוך הבא</h2>
      <p className="text-sm text-gray-500 mb-6">התחבר לחשבון שלך</p>

      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
              text-sm transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
              text-sm transition"
          />
        </div>

        {/* הצגת שגיאה מהשרת */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60
            text-white font-semibold rounded-xl transition text-sm shadow-sm"
        >
          {loading ? "מתחבר..." : "התחבר"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        אין לך חשבון?{" "}
        <button onClick={onSwitch} className="text-emerald-600 font-semibold hover:underline">
          הרשם עכשיו
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
