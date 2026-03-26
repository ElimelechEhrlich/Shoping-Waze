// Comps/Onboarding/OnboardingModal.jsx
// ─────────────────────────────────────────────────────────
// מדריך כניסה ראשונית — מוצג פעם אחת בלבד (localStorage).
// ─────────────────────────────────────────────────────────

import { useState } from "react";

const STORAGE_KEY = "onboarding_done_v1";

export const shouldShowOnboarding = () =>
  !localStorage.getItem(STORAGE_KEY);

export const markOnboardingDone = () =>
  localStorage.setItem(STORAGE_KEY, "1");

// ── תוכן השקופיות ─────────────────────────────────────────
const SLIDES = [
  {
    emoji: "🛒",
    title: "ברוכים הבאים לקבלות חכמות!",
    color: "from-emerald-500 to-teal-600",
    points: [
      "מערכת חכמה לניהול קניות וחיסכון בכסף",
      "סרוק קבלות, נהל סל קניות ומצא את הסופר הזול ביותר",
      "שתף סל עם בני משפחה וחברים בזמן אמת",
    ],
  },
  {
    emoji: "📷",
    title: "סריקת קבלה",
    color: "from-blue-500 to-indigo-600",
    points: [
      "צלם את הקבלה שלך או העלה תמונה מהגלריה",
      "קבלה ארוכה? צלם כמה חלקים — המערכת תאחד אותם",
      "ה-AI מזהה אוטומטית את כל הפריטים, כמויות ומחירים",
      "ערוך את הפריטים לפני שמירה לסל",
    ],
  },
  {
    emoji: "📊",
    title: "השוואת מחירים",
    color: "from-orange-500 to-amber-600",
    points: [
      "הוסף מוצרים לסל הקניות שלך",
      "לחץ על 'השווה מחירים' וראה באיזה סופר הסל הכי זול",
      "המערכת מחשבת את ההפרש בין הרשתות",
      "אפשר גם להוסיף מוצרים ידנית עם מחיר ורשת",
    ],
  },
  {
    emoji: "👥",
    title: "סל משותף",
    color: "from-purple-500 to-violet-600",
    points: [
      "צור סל משותף וקבל קוד הזמנה ייחודי",
      "שלח את הקוד לבני משפחה — הם יצטרפו בלחיצה אחת",
      "כולם יכולים להוסיף מוצרים לסל בו-זמנית",
      "הסל האישי שלך נשאר ללא שינוי",
    ],
  },
  {
    emoji: "🚀",
    title: "מוכן להתחיל?",
    color: "from-emerald-500 to-cyan-600",
    points: [
      "התחל מסריקת קבלה מהסופר האחרון שלך",
      "בנה את סל הקניות הרגיל שלך",
      "השווה מחירים בין הרשתות וחסוך",
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      dir="rtl"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">

        {/* ── כותרת צבעונית ────────────────────────── */}
        <div className={`bg-gradient-to-br ${slide.color} px-6 py-8 text-white text-center relative`}>
          {/* כפתור סגירה */}
          <button
            onClick={handleClose}
            className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center
              rounded-full bg-white/20 hover:bg-white/30 text-white text-sm transition"
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
                className={`rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-5 h-2 bg-white"
                    : "w-2 h-2 bg-white/40 hover:bg-white/60"
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
                <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600
                  text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── ניווט ────────────────────────────────── */}
        <div className="px-6 pb-6 flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={prev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200
                text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
            >
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              הקודם
            </button>
          )}

          <button
            onClick={next}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
              text-white font-semibold text-sm transition bg-gradient-to-r ${slide.color}
              hover:opacity-90 shadow-sm`}
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
              className="text-xs text-slate-400 hover:text-slate-600 transition underline underline-offset-2"
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
