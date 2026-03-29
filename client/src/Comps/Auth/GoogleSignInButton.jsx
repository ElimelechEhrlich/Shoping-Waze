// components/auth/GoogleSignInButton.jsx
// ─────────────────────────────────────────────────────────
// כפתור Sign in with Google — מוצג רק כש-VITE_GOOGLE_CLIENT_ID מוגדר.
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../hooks/useAuth.js";

const GoogleSignInButton = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!clientId) return null;

  return (
    <div className="w-full" dir="rtl">
      <div className="flex justify-center w-full [&>div]:w-full [&_iframe]:!w-full">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            const cred = credentialResponse.credential;
            if (!cred) {
              setError("לא התקבל אסימון מ-Google");
              return;
            }
            setError("");
            setLoading(true);
            try {
              await loginWithGoogle(cred);
            } catch (err) {
              setError(err.message || "ההתחברות נכשלה");
            } finally {
              setLoading(false);
            }
          }}
          onError={() => setError("ההתחברות עם Google נכשלה")}
          text="continue_with"
          shape="pill"
          size="large"
          width="100%"
          locale="he"
        />
      </div>
      {loading && (
        <p className="text-center text-sm text-gray-500 mt-2">מתחבר...</p>
      )}
      {error && !loading && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl mt-3 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
