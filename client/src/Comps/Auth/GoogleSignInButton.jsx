// components/auth/GoogleSignInButton.jsx
// ─────────────────────────────────────────────────────────
// Sign in with Google — רוחב מלא, ממורכז, מסגרת תואמת לטפסים.
// ─────────────────────────────────────────────────────────

import { useState, useRef, useLayoutEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../hooks/useAuth.js";

const MIN_W = 240;
const MAX_W = 520;

const GoogleSignInButton = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [btnWidth, setBtnWidth] = useState(320);
  const wrapRef = useRef(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      const w = Math.floor(el.getBoundingClientRect().width);
      setBtnWidth(Math.max(MIN_W, Math.min(MAX_W, w || MIN_W)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!clientId) return null;

  const handleSuccess = async (credentialResponse) => {
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
  };

  return (
    <div className="w-full" dir="rtl">
      <div
        ref={wrapRef}
        className="relative w-full flex justify-center"
      >
        <div
          className={[
            "w-full max-w-full rounded-xl border border-gray-200 bg-white shadow-sm",
            "overflow-hidden flex justify-center items-center min-h-[48px]",
            "transition-opacity duration-200",
            loading ? "opacity-50 pointer-events-none" : "opacity-100",
          ].join(" ")}
        >
          <div className="w-full flex justify-center py-1 px-1 [&>div]:flex [&>div]:justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError("ההתחברות עם Google נכשלה")}
              text="continue_with"
              shape="rectangular"
              size="large"
              theme="outline"
              logo_alignment="center"
              width={btnWidth}
              locale="he"
            />
          </div>
        </div>

        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-[1px]"
            aria-busy="true"
            aria-live="polite"
          >
            <span className="text-sm font-medium text-emerald-700">מתחבר…</span>
          </div>
        )}
      </div>

      {error && !loading && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl mt-3 text-center border border-red-100">
          {error}
        </p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
