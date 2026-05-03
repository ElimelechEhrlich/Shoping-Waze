// Comps/Onboarding/OnboardingModal.jsx
// ─────────────────────────────────────────────────────────
// מדריך כניסה ראשונית — מוצג פעם אחת בלבד (localStorage).
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import { markOnboardingDone } from "./onboardingStorage.js";

const SLIDES = [
  {
    title: "ברוכים הבאים",
    points: [
      "מערכת לניהול קניות וחיסכון בכסף",
      "סריקת קבלות, ניהול סל והשוואת מחירים",
      "סלים משותפים בזמן אמת עם המשפחה",
      "היסטוריה מלאה שמורה תמיד בחשבון",
    ],
  },
  {
    title: "סריקת קבלה",
    points: [
      "צילום מהמצלמה או העלאה מהגלריה",
      "קבלה ארוכה: כמה חלקים מתאחדים אוטומטית",
      "זיהוי פריטים, כמויות ומחירים בעברית",
      "עריכה והוספת פריטים לפני אישור",
    ],
  },
  {
    title: "ניהול סל",
    points: [
      "הוספה מהקטלוג או יצירת מוצר חדש ידנית",
      "מיון לפי שם, קטגוריה או מחיר",
      "שמירת תבניות וטעינה בלחיצה",
      "ייצוא הסל ל-CSV לפני יציאה לקניות",
    ],
  },
  {
    title: "השוואת מחירים",
    points: [
      "השוואה של תוכן הסל מול רשתות סופרמרקט",
      "תצוגה ברורה של ההפרש בין הרשתות",
      "הנתונים מבוססים על מאגר מקבלות אמיתיות",
      "הוספה ידנית של מחירים לשיפור ההשוואה",
    ],
  },
  {
    title: "סל משותף",
    points: [
      "יצירת סל וקוד הזמנה של שישה תווים",
      "הצטרפות בלחיצה אחת עם הקוד",
      "עדכונים מקבילים מכל המשתתפים",
      "הסל האישי שלך נשאר נפרד",
    ],
  },
  {
    title: "היסטוריה וכלים",
    points: [
      "כל קבלה שאושרה נשמרת אוטומטית",
      "צפייה בקבלות עבר עם פירוט מלא",
      "מוצרים פופולריים בדף הבית",
      "החזרת מוצרים נפוצים לסל בלחיצה",
    ],
  },
  {
    title: "מוכן להתחיל",
    points: [
      "סריקה של הקבלה האחרונה",
      "בניית סל ובדיקת המחיר הזול",
      "שיתוף עם המשפחה וחיסכון משותף",
    ],
    isLast: true,
  },
];

const OnboardingModal = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = Boolean(slide.isLast);

  const handleClose = () => {
    markOnboardingDone();
    onClose();
  };

  const next = () => {
    if (isLast) { handleClose(); return; }
    setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => s - 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      dir="rtl"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-sm shadow-md w-full max-w-md overflow-hidden animate-fade-in">

        {/* ── כותרת ──────────────────────────────────── */}
        <div className="px-6 pt-6 pb-5 relative border-b border-zinc-200">
          <button
            onClick={handleClose}
            className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center
              rounded-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 text-sm transition"
            aria-label="סגור"
          >
            ✕
          </button>

          <p className="text-[11px] font-medium text-zinc-500 tracking-widest uppercase mb-1">
            שלב {step + 1} מתוך {SLIDES.length}
          </p>
          <h2 className="text-lg font-semibold text-zinc-900 leading-snug">{slide.title}</h2>

          <div className="flex gap-1 mt-4">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`שלב ${i + 1}`}
                className={`flex-1 h-1 rounded-sm transition-colors ${
                  i <= step ? "bg-zinc-900" : "bg-zinc-200 hover:bg-zinc-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── תוכן ─────────────────────────────────── */}
        <div className="px-6 py-5">
          <ul className="space-y-3">
            {slide.points.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-sm bg-zinc-200 text-zinc-800
                  text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-zinc-700 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── ניווט ────────────────────────────────── */}
        <div className="px-6 pb-6 flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={prev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-sm border border-zinc-300
                text-zinc-700 hover:bg-zinc-50 text-sm font-medium transition"
            >
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              הקודם
            </button>
          )}

          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm
              text-white font-semibold text-sm transition bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
          >
            {isLast ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                בואו נתחיל
              </>
            ) : (
              <>
                הבא
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* דלג */}
        {!isLast && (
          <div className="pb-4 text-center">
            <button
              onClick={handleClose}
              className="text-xs text-zinc-500 hover:text-zinc-800 transition underline underline-offset-2"
            >
              דלג
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
