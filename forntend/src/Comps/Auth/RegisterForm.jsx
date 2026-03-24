// components/auth/RegisterForm.jsx
// ─────────────────────────────────────────────────────────
// טופס הרשמה.
// כולל ולידציה מקומית (לפני שליחה לשרת) לחוויית משתמש טובה.
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * @param {{ onSwitch: () => void }} props
 * onSwitch — מעבר לטופס ההתחברות
 */
const RegisterForm = ({ onSwitch }) => {
  const { register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /** ולידציה מקומית לפני שליחה לשרת */
  const validate = () => {
    if (form.name.trim().length < 2) return "שם חייב להכיל לפחות 2 תווים";
    if (form.password.length < 6)    return "סיסמה חייבת להכיל לפחות 6 תווים";
    if (form.password !== form.confirm) return "הסיסמאות אינן תואמות";
    return null; // תקין
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

  // הגדרת שדות הטופס — מאפשר רינדור דינמי ומנע קוד כפול
  const fields = [
    { name: "name",     label: "שם מלא",       type: "text",     placeholder: "ישראל ישראלי" },
    { name: "email",    label: "אימייל",        type: "email",    placeholder: "your@email.com" },
    { name: "password", label: "סיסמה",         type: "password", placeholder: "לפחות 6 תווים" },
    { name: "confirm",  label: "אימות סיסמה",   type: "password", placeholder: "••••••" },
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">הרשמה</h2>
      <p className="text-sm text-gray-500 mb-6">צור חשבון חדש</p>

      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        {fields.map(({ name, label, type, placeholder }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                text-sm transition"
            />
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60
            text-white font-semibold rounded-xl transition text-sm shadow-sm"
        >
          {loading ? "נרשם..." : "הרשמה"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        יש לך חשבון?{" "}
        <button onClick={onSwitch} className="text-emerald-600 font-semibold hover:underline">
          התחבר
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
