// Comps/Onboarding/OnboardingModal.jsx
// ─────────────────────────────────────────────────────────
// מדריך כניסה ראשונית — מוצג פעם אחת בלבד (localStorage).
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import { markOnboardingDone } from "./onboardingStorage.js";

// ── תוכן השקופיות ─────────────────────────────────────────
const SLIDES = [
  {
    emoji: "🛒",
    title: "ברוכים הבאים לקבלות חכמות!",
    points: [
      "מערכת חכמה לניהול קניות וחיסכון בכסף",
      "סרוק קבלות, נהל סל קניות ומצא את הסופר הזול ביותר",
      "שתף סל עם בני משפחה וחברים בזמן אמת",
      "כל ההיסטוריה שלך שמורה ונגישה תמיד",
    ],
  },
  {
    emoji: "📷",
    title: "סריקת קבלה חכמה",
    points: [
      "צלם קבלה ישירות מהמצלמה או העלה תמונה מהגלריה",
      "קבלה ארוכה? צלם כמה חלקים — המערכת תאחד אותם לתמונה אחת",
      "ה-AI מזהה אוטומטית פריטים, כמויות ומחירים בעברית",
      "ערוך, הוסף או מחק פריטים לפני אישור הקבלה",
    ],
  },
  {
    emoji: "🛍️",
    title: "ניהול סל קניות",
    points: [
      "הוסף מוצרים לסל מתוך המאגר הכללי — או צור מוצר חדש ידנית",
      "מיין לפי שם, קטגוריה או מחיר",
      "שמור תבניות — 'סל שבועי', 'קניות לשבת' — וטען בלחיצה",
      "ייצא את הסל לקובץ CSV לפני היציאה לקנות",
    ],
  },
  {
    emoji: "📊",
    title: "השוואת מחירים",
    points: [
      "לחץ 'השווה מחירים' וראה באיזה סופר הסל הכי זול",
      "המערכת מציגה את ההפרש בין הרשתות בבירור",
      "הנתונים מגיעים ממאגר מחירים שנבנה מקבלות אמיתיות",
      "אפשר להוסיף מוצרים ידנית עם מחיר ורשת לשיפור ההשוואה",
    ],
  },
  {
    emoji: "👥",
    title: "סל משותף",
    points: [
      "צור סל משותף וקבל קוד הזמנה ייחודי של 6 תווים",
      "שלח את הקוד לבני משפחה — הם מצטרפים בלחיצה אחת",
      "כולם יכולים להוסיף ולעדכן פריטים בו-זמנית",
      "הסל האישי שלך נשאר ללא שינוי",
    ],
  },
  {
    emoji: "🧾",
    title: "היסטוריה וכלים",
    points: [
      "כל קבלה שאישרת נשמרת אוטומטית בהיסטוריה",
      "עיין בקבלות עבר עם פירוט מלא של הפריטים",
      "המוצרים הפופולריים שלך מוצגים בדף הבית",
      "הוסף מוצרים פופולריים חזרה לסל בלחיצה אחת",
    ],
  },
  {
    emoji: "🚀",
    title: "מוכן להתחיל?",
    points: [
      "סרוק את הקבלה מהסופר האחרון שלך",
      "בנה סל קניות ובדוק איפה הכי זול",
      "שתף עם המשפחה וחסכו ביחד",
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

        {/* ── כותרת צבעונית ────────────────────────── */}
        <div className="bg-zinc-900 px-6 py-8 text-white text-center relative border-b border-zinc-800">
          {/* כפתור סגירה */}
          <button
            onClick={handleClose}
            className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center
              rounded-sm bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition"
          >
            ✕
          </button>

          <div className="text-6xl mb-3 select-none">{slide.emoji}</div>
          <h2 className="text-xl font-bold leading-tight">{slide.title}</h2>

          {/* מחוון שלבים */}
          <div className="flex justify-center gap-1.5 mt-4">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-sm transition-all duration-200 ${
                  i === step
                    ? "w-5 h-1.5 bg-white"
                    : "w-2 h-1.5 bg-white/35 hover:bg-white/55"
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
                בואו נתחיל!
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
