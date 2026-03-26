// Pages/ProfilePage.jsx
// ─────────────────────────────────────────────────────────
// עמוד פרופיל המשתמש — עריכת שם + בחירת צבע אווטר.
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import { useAuth }    from "../hooks/useAuth.js";
import usePageTitle   from "../hooks/usePageTitle.js";
import { Avatar }     from "../Comps/NavDrawer.jsx";
import { useToast }   from "../Contexts/ToastContext.jsx";

// צבעי אווטר לבחירה
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

const ProfilePage = () => {
  usePageTitle("הפרופיל שלי");

  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name,        setName]        = useState(user?.name        || "");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || "bg-emerald-500");
  const [saving,      setSaving]      = useState(false);

  // האם יש שינויים שלא נשמרו
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

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">

      {/* ── Page sub-header ──────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-[56px] z-30">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-slate-900">הפרופיל שלי</h1>
          <p className="text-xs text-slate-400 mt-0.5">עדכן את פרטיך האישיים</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">

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

          {/* שם */}
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

          {/* אימייל — קריאה בלבד */}
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

          {/* צבע אווטר */}
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

          {/* כפתור שמירה */}
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
