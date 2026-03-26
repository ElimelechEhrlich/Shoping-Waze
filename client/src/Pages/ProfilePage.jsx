// Pages/ProfilePage.jsx
// ─────────────────────────────────────────────────────────
// עמוד פרופיל — שם, אווטר, דירוג אמון (Trust), דיווחים/משוב.
//
// דירוג האמון מחושב בשרת לפי:
//   • קבלות שאושרו ונשמרו בהיסטוריה
//   • דיווחים ששלחת (משוב, מחיר שגוי וכו') — עוזרים לשפר את המערכת
// ─────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { useAuth }    from "../hooks/useAuth.js";
import usePageTitle   from "../hooks/usePageTitle.js";
import { Avatar }     from "../Comps/NavDrawer.jsx";
import { useToast }   from "../Contexts/ToastContext.jsx";

const AVATAR_COLORS = [
  { label: "ירוק",   value: "bg-emerald-500" },
  { label: "כחול",   value: "bg-blue-500"    },
  { label: "סגול",   value: "bg-purple-500"  },
  { label: "ורוד",   value: "bg-pink-500"    },
  { label: "תכלת",   value: "bg-cyan-500"    },
  { label: "כתום",   value: "bg-orange-500"  },
  { label: "אדום",   value: "bg-red-500"     },
  { label: "ענבר",   value: "bg-amber-500"   },
];

const REPORT_TYPES = [
  { value: "price_wrong",     label: "מחיר לא מדויק בקטלוג" },
  { value: "product_missing", label: "חסר מוצר בקטלוג" },
  { value: "app_bug",         label: "תקלה באפליקציה" },
  { value: "suggestion",      label: "הצעה לשיפור" },
  { value: "other",           label: "אחר" },
];

const defaultTrust = (u) =>
  u?.trust ?? {
    score:             8,
    level:             "new",
    levelLabel:        "מתחיל",
    stars:             1,
    receiptsConfirmed: 0,
    reportsSubmitted:  0,
  };

const ProfilePage = () => {
  usePageTitle("הפרופיל שלי");

  const { user, updateProfile, submitReport } = useAuth();
  const { showToast } = useToast();

  const trust = useMemo(() => defaultTrust(user), [user]);

  const [name,        setName]        = useState(user?.name        || "");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || "bg-emerald-500");
  const [saving,      setSaving]      = useState(false);

  const [reportOpen,  setReportOpen]  = useState(false);
  const [reportType,  setReportType]  = useState("suggestion");
  const [reportMsg,   setReportMsg]   = useState("");
  const [reporting,   setReporting]   = useState(false);

  const hasChanges =
    name.trim() !== (user?.name || "") ||
    avatarColor  !== (user?.avatarColor || "bg-emerald-500");

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      showToast("שם חייב להכיל לפחות 2 תווים", "warning");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), avatarColor });
      showToast("הפרופיל עודכן בהצלחה ✓", "success");
    } catch (err) {
      showToast(err.message || "שגיאה בשמירה", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReport = async () => {
    const msg = reportMsg.trim();
    if (msg.length < 8) {
      showToast("נא לפרט לפחות 8 תווים", "warning");
      return;
    }
    setReporting(true);
    try {
      await submitReport({ type: reportType, message: msg });
      setReportMsg("");
      setReportOpen(false);
      showToast("תודה! הדיווח נשלח ויעזור לנו לשפר את האפליקציה", "success");
    } catch (err) {
      showToast(err.message || "שליחה נכשלה", "error");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">

      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-[60px] z-30">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-slate-900">הפרופיל שלי</h1>
          <p className="text-xs text-slate-400 mt-0.5">עדכן את פרטיך האישיים</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* ── דירוג אמון ─────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                דירוג אמון בקהילה
              </p>
              <p className="text-xl font-bold">{trust.levelLabel}</p>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-[240px]">
                הציון מבוסס על קבלות שאישרת ועל דיווחים ששלחת — ככל שתורם יותר, הציון עולה.
              </p>
            </div>
            <div className="text-left flex-shrink-0">
              <p className="text-3xl font-black text-emerald-400 leading-none">{trust.score}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">מתוך 100</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg ${i < trust.stars ? "text-amber-400" : "text-slate-600"}`}
              >
                ★
              </span>
            ))}
          </div>

          <div className="h-2 bg-slate-700 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${trust.score}%` }}
            />
          </div>

          <div className="flex justify-between mt-3 text-xs text-slate-400">
            <span>קבלות מאושרות: <strong className="text-slate-200">{trust.receiptsConfirmed}</strong></span>
            <span>דיווחים נשלחו: <strong className="text-slate-200">{trust.reportsSubmitted}</strong></span>
          </div>
        </div>

        {/* ── אווטר ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-4">
          <Avatar name={name || user?.name} avatarColor={avatarColor} size="lg" />
          <div className="text-center">
            <p className="font-bold text-slate-800 text-base">{name || user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* ── טופס עריכה ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              שם מלא
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="השם שלך"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              אימייל
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full border border-slate-100 rounded-xl px-4 py-2.5 text-sm
                text-slate-400 bg-slate-50 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">לא ניתן לשנות את האימייל</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              צבע אווטר
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  onClick={() => setAvatarColor(value)}
                  className={`w-9 h-9 rounded-full ${value} transition-all
                    ${avatarColor === value
                      ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                      : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!hasChanges || saving || !name.trim()}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600
              disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-semibold text-sm transition"
          >
            {saving ? "שומר..." : "שמור שינויים"}
          </button>
        </div>

        {/* ── דיווח / משוב (מעלה את דירוג האמון) ──────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setReportOpen((o) => !o)}
            className={`w-full flex items-center justify-between px-5 py-4 text-right transition-colors
              ${reportOpen ? "bg-amber-50 border-b border-amber-100" : "hover:bg-slate-50"}`}
          >
            <div>
              <p className={`font-semibold text-sm ${reportOpen ? "text-amber-800" : "text-slate-800"}`}>
                דיווח או משוב
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                עוזר לנו לשפר מחירים ומוצרים — ומחזק את דירוג האמון שלך
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0
                ${reportOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {reportOpen && (
            <div className="px-5 pb-5 pt-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">סוג</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">פירוט</label>
                <textarea
                  value={reportMsg}
                  onChange={(e) => setReportMsg(e.target.value)}
                  rows={4}
                  placeholder="תאר את הבעיה או ההצעה (לפחות 8 תווים)..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-y min-h-[100px]
                    focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={reporting || reportMsg.trim().length < 8}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold
                  disabled:opacity-50 transition"
              >
                {reporting ? "שולח..." : "שלח דיווח"}
              </button>
            </div>
          )}
        </div>

        {/* ── פרטי חשבון ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            פרטי חשבון
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">תאריך הצטרפות</span>
              <span className="font-medium text-slate-700">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("he-IL")
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">מזהה משתמש</span>
              <span className="font-mono text-xs text-slate-400">
                {user?._id?.toString().slice(-8) || "—"}
              </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ProfilePage;
