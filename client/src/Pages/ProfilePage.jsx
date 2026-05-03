// Pages/ProfilePage.jsx
// עמוד פרופיל — שם, אווטר, דירוג אמון (Trust), דיווחים/משוב.

import { useState, useMemo } from "react";
import { useAuth }    from "../hooks/useAuth.js";
import usePageTitle   from "../hooks/usePageTitle.js";
import { Avatar }     from "../Comps/NavDrawer.jsx";
import { useToast }   from "../Contexts/useToast.js";
import HomeButton     from "../Comps/HomeButton.jsx";
import Button         from "../Comps/ui/Button.jsx";

const AVATAR_COLORS = [
  { label: "פחם",   value: "bg-zinc-800"   },
  { label: "אפור",  value: "bg-zinc-500"   },
  { label: "ירוק",  value: "bg-emerald-700"},
  { label: "כחול",  value: "bg-blue-700"   },
  { label: "סגול",  value: "bg-purple-700" },
  { label: "ורוד",  value: "bg-pink-700"   },
  { label: "ענבר",  value: "bg-amber-700"  },
  { label: "אדום",  value: "bg-red-700"    },
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

const fieldClass =
  "w-full border border-zinc-300 rounded-sm px-3 py-2.5 text-sm bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 " +
  "placeholder:text-zinc-400";

const ProfilePage = () => {
  usePageTitle("הפרופיל שלי");

  const { user, updateProfile, submitReport } = useAuth();
  const { showToast } = useToast();

  const trust = useMemo(() => defaultTrust(user), [user]);

  const [name,        setName]        = useState(user?.name        || "");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || "bg-zinc-800");
  const [saving,      setSaving]      = useState(false);

  const [reportOpen,  setReportOpen]  = useState(false);
  const [reportType,  setReportType]  = useState("suggestion");
  const [reportMsg,   setReportMsg]   = useState("");
  const [reporting,   setReporting]   = useState(false);

  const hasChanges =
    name.trim() !== (user?.name || "") ||
    avatarColor  !== (user?.avatarColor || "bg-zinc-800");

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      showToast("שם חייב להכיל לפחות 2 תווים", "warning");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), avatarColor });
      showToast("הפרופיל עודכן בהצלחה", "success");
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
      showToast("תודה! הדיווח נשלח", "success");
    } catch (err) {
      showToast(err.message || "שליחה נכשלה", "error");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100" dir="rtl">

      <header className="bg-white border-b border-zinc-200 px-4 py-3 sticky top-[60px] z-30">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <HomeButton />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-zinc-900 truncate">הפרופיל שלי</h1>
            <p className="text-xs text-zinc-500 mt-0.5">עדכון פרטים, דירוג אמון, דיווחים</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* ── דירוג אמון ─────────────────────────────────────── */}
        <div className="bg-zinc-900 text-white rounded-md p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                דירוג אמון בקהילה
              </p>
              <p className="text-lg font-semibold">{trust.levelLabel}</p>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed max-w-[260px]">
                הציון מבוסס על קבלות שאישרת ועל דיווחים ששלחת — ככל שתורם יותר, הציון עולה.
              </p>
            </div>
            <div className="text-left flex-shrink-0">
              <p className="text-3xl font-bold leading-none">{trust.score}</p>
              <p className="text-[10px] text-zinc-500 mt-1">מתוך 100</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1" aria-label={`${trust.stars} מתוך 5 כוכבים`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`text-base ${i < trust.stars ? "text-amber-400" : "text-zinc-700"}`}
              >
                ★
              </span>
            ))}
          </div>

          <div className="h-1.5 bg-zinc-800 rounded-sm mt-3 overflow-hidden">
            <div
              className="h-full bg-zinc-100 rounded-sm transition-all duration-500"
              style={{ width: `${trust.score}%` }}
            />
          </div>

          <div className="flex justify-between mt-3 text-xs text-zinc-400">
            <span>קבלות מאושרות: <strong className="text-zinc-100">{trust.receiptsConfirmed}</strong></span>
            <span>דיווחים נשלחו: <strong className="text-zinc-100">{trust.reportsSubmitted}</strong></span>
          </div>
        </div>

        {/* ── אווטר ────────────────────────────────────────────── */}
        <div className="bg-white rounded-md border border-zinc-200 p-5 flex flex-col items-center gap-3">
          <Avatar name={name || user?.name} avatarColor={avatarColor} size="lg" />
          <div className="text-center">
            <p className="font-semibold text-zinc-900">{name || user?.name}</p>
            <p className="text-xs text-zinc-500">{user?.email}</p>
          </div>
        </div>

        {/* ── טופס עריכה ───────────────────────────────────────── */}
        <div className="bg-white rounded-md border border-zinc-200 p-5 space-y-4">

          <div>
            <label htmlFor="profile-name" className="block text-xs font-medium text-zinc-700 mb-1">
              שם מלא
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="השם שלך"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-xs font-medium text-zinc-700 mb-1">
              אימייל
            </label>
            <input
              id="profile-email"
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full border border-zinc-200 rounded-sm px-3 py-2.5 text-sm
                text-zinc-500 bg-zinc-50 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-500 mt-1">לא ניתן לשנות את כתובת האימייל</p>
          </div>

          <div>
            <span id="avatar-color-label" className="block text-xs font-medium text-zinc-700 mb-2">
              צבע אווטר
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="avatar-color-label">
              {AVATAR_COLORS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={avatarColor === value}
                  title={label}
                  onClick={() => setAvatarColor(value)}
                  className={`w-9 h-9 rounded-sm ${value} transition-all
                    ${avatarColor === value
                      ? "ring-2 ring-offset-2 ring-zinc-900"
                      : "opacity-80 hover:opacity-100"}`}
                />
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSave}
            disabled={!hasChanges || !name.trim()}
            loading={saving}
          >
            {saving ? "שומר..." : "שמור שינויים"}
          </Button>
        </div>

        {/* ── דיווח / משוב ─────────────────────────────────────── */}
        <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setReportOpen((o) => !o)}
            aria-expanded={reportOpen}
            className={`w-full flex items-center justify-between px-4 py-3 text-right transition-colors
              ${reportOpen ? "bg-zinc-50 border-b border-zinc-200" : "hover:bg-zinc-50"}`}
          >
            <div>
              <p className="font-semibold text-sm text-zinc-900">דיווח או משוב</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                עוזר לנו לשפר מחירים ומוצרים — ומחזק את דירוג האמון שלך
              </p>
            </div>
            <svg
              className={`w-4 h-4 text-zinc-400 transition-transform flex-shrink-0
                ${reportOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {reportOpen && (
            <div className="px-4 pb-4 pt-3 space-y-3">
              <div>
                <label htmlFor="report-type" className="block text-xs font-medium text-zinc-700 mb-1">סוג</label>
                <select
                  id="report-type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className={fieldClass}
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="report-msg" className="block text-xs font-medium text-zinc-700 mb-1">פירוט</label>
                <textarea
                  id="report-msg"
                  value={reportMsg}
                  onChange={(e) => setReportMsg(e.target.value)}
                  rows={4}
                  placeholder="תאר את הבעיה או ההצעה (לפחות 8 תווים)..."
                  className={`${fieldClass} resize-y min-h-[100px]`}
                />
              </div>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleSubmitReport}
                loading={reporting}
                disabled={reportMsg.trim().length < 8}
              >
                {reporting ? "שולח..." : "שלח דיווח"}
              </Button>
            </div>
          )}
        </div>

        {/* ── פרטי חשבון ───────────────────────────────────────── */}
        <div className="bg-white rounded-md border border-zinc-200 p-5">
          <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            פרטי חשבון
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <dt className="text-zinc-500">תאריך הצטרפות</dt>
              <dd className="font-medium text-zinc-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("he-IL")
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-zinc-500">מזהה משתמש</dt>
              <dd className="font-mono text-xs text-zinc-500">
                {user?._id?.toString().slice(-8) || "—"}
              </dd>
            </div>
          </dl>
        </div>

      </main>
    </div>
  );
};

export default ProfilePage;
