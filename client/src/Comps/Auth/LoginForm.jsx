import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import GoogleSignInButton from "./GoogleSignInButton.jsx";
import Button from "../ui/Button.jsx";

const fieldClass =
  "w-full px-4 py-2.5 rounded-sm border border-zinc-300 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 " +
  "text-sm transition placeholder:text-zinc-400";

const LoginForm = ({ onSwitch }) => {
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-zinc-900 mb-1">ברוך הבא</h2>
      <p className="text-sm text-zinc-500 mb-5">התחבר לחשבון שלך</p>

      <GoogleSignInButton />

      {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-zinc-400">או עם אימייל</span>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3.5" dir="rtl">
        <div>
          <label htmlFor="login-email" className="block text-xs font-medium text-zinc-700 mb-1">
            אימייל
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            autoComplete="email"
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-medium text-zinc-700 mb-1">
            סיסמה
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••"
            autoComplete="current-password"
            required
            className={fieldClass}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-sm"
          >
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} fullWidth size="lg">
          {loading ? "מתחבר..." : "התחברות"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-500">
        אין לך חשבון?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-zinc-900 font-semibold hover:underline"
        >
          להרשמה
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
