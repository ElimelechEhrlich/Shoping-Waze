// Comps/SharePanel.jsx
// ─────────────────────────────────────────────────────────
// רכיב שיתוף גמיש — משמש גם לשיתוף האפליקציה וגם לשיתוף
// קוד הזמנה לסל משותף.
//
// עדיפות:
//   1. Web Share API  — פותח את מגש השיתוף הנייטיב של iOS/Android
//      (מציג WhatsApp, Messages, מייל, טלגרם וכו' אוטומטית).
//   2. Fallback       — כפתורי WhatsApp, מייל והעתקת קישור לדסקטופ /
//      דפדפנים שלא תומכים ב-Web Share.
// ─────────────────────────────────────────────────────────

import { useState } from "react";

// ── אייקונים ──────────────────────────────────────────────
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const NativeShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

// ── SharePanel ─────────────────────────────────────────────
// Props:
//   title   — כותרת להודעה (למשל "הצטרף לסל שלי")
//   text    — גוף ההודעה
//   url     — קישור לשיתוף (ברירת מחדל: window.location.origin)
//   color   — "emerald" | "blue" | "purple" (ברירת מחדל: "emerald")
const SharePanel = ({ title, text, url, color = "emerald" }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl  = url || (typeof window !== "undefined" ? window.location.origin : "");
  const shareText = text || title;

  const colors = {
    emerald: {
      native:  "bg-emerald-500 hover:bg-emerald-600 text-white",
      wapp:    "bg-green-500  hover:bg-green-600  text-white",
      email:   "border border-slate-200 text-slate-700 hover:bg-slate-50",
      copy:    "border border-slate-200 text-slate-700 hover:bg-slate-50",
    },
    blue: {
      native:  "bg-blue-500   hover:bg-blue-600   text-white",
      wapp:    "bg-green-500  hover:bg-green-600  text-white",
      email:   "border border-slate-200 text-slate-700 hover:bg-slate-50",
      copy:    "border border-slate-200 text-slate-700 hover:bg-slate-50",
    },
    purple: {
      native:  "bg-purple-500 hover:bg-purple-600 text-white",
      wapp:    "bg-green-500  hover:bg-green-600  text-white",
      email:   "border border-slate-200 text-slate-700 hover:bg-slate-50",
      copy:    "border border-slate-200 text-slate-700 hover:bg-slate-50",
    },
  };
  const c = colors[color] || colors.emerald;

  // ── Web Share API (iOS / Android native) ────────────────
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text: shareText, url: shareUrl });
    } catch {
      // המשתמש סגר את החלון — לא שגיאה
    }
  };

  // ── WhatsApp ─────────────────────────────────────────────
  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener");
  };

  // ── מייל ─────────────────────────────────────────────────
  const handleEmail = () => {
    const subject = encodeURIComponent(title);
    const body    = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // ── העתקת קישור ──────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // אם Web Share API זמין (מובייל) — כפתור אחד פותח הכל
  if (canNativeShare) {
    return (
      <button
        onClick={handleNativeShare}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${c.native}`}
      >
        <NativeShareIcon />
        שתף
      </button>
    );
  }

  // Fallback לדסקטופ — שלושה כפתורים
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={handleWhatsApp}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${c.wapp}`}>
        <WhatsAppIcon />
        WhatsApp
      </button>
      <button onClick={handleEmail}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition ${c.email}`}>
        <EmailIcon />
        מייל
      </button>
      <button onClick={handleCopy}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition ${c.copy}`}>
        {copied ? <><CheckIcon />הועתק!</> : <><CopyIcon />העתק קישור</>}
      </button>
    </div>
  );
};

export default SharePanel;
