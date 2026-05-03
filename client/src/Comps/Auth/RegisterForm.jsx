import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import GoogleSignInButton from "./GoogleSignInButton.jsx";
import Button from "../ui/Button.jsx";

const fieldClass =
  "w-full px-4 py-2.5 rounded-sm border border-zinc-300 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 " +
  "text-sm transition placeholder:text-zinc-400";

const FIELDS = [
  { name: "name",     label: "שם מלא",     type: "text",     placeholder: "ישראל ישראלי", autoComplete: "name" },
  { name: "email",    label: "אימייל",      type: "email",    placeholder: "your@email.com", autoComplete: "email" },
  { name: "password", label: "סיסמה",       type: "password", placeholder: "לפחות 6 תווים", autoComplete: "new-password" },
  { name: "confirm",  label: "אימות סיסמה", type: "password", placeholder: "••••••", autoComplete: "new-password" },
];

const RegisterForm = ({ onSwitch }) => {
  const { register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (form.name.trim().length < 2) return "שם חייב להכיל לפחות 2 תווים";
    if (form.password.length < 6)    return "סיסמה חייבת להכיל לפחות 6 תווים";
    if (form.password !== form.confirm) return "הסיסמאות אינן תואמות";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-zinc-900 mb-1">יצירת חשבון</h2>
      <p className="text-sm text-zinc-500 mb-5">חשבון חדש בחינם</p>

      <GoogleSignInButton />

      {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-zinc-400">או הרשמה עם אימייל</span>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3.5" dir="rtl">
        {FIELDS.map(({ name, label, type, placeholder, autoComplete }) => (
          <div key={name}>
            <label htmlFor={`reg-${name}`} className="block text-xs font-medium text-zinc-700 mb-1">
              {label}
            </label>
            <input
              id={`reg-${name}`}
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              autoComplete={autoComplete}
              required
              className={fieldClass}
            />
          </div>
        ))}

        {error && (
          <p
            role="alert"
            className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-sm"
          >
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} fullWidth size="lg">
          {loading ? "נרשם..." : "צור חשבון"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-500">
        כבר יש לך חשבון?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-zinc-900 font-semibold hover:underline"
        >
          להתחברות
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
