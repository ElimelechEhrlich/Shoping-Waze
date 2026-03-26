// Comps/Cart/TemplateModal.jsx
// מודל שמירה וטעינה של תבניות סל
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import useTemplates from "../../hooks/useTemplates.js";

const TemplateModal = ({ cart, onLoad, onClose }) => {
  const { templates, saveTemplate, deleteTemplate } = useTemplates();
  const [tab,      setTab]      = useState(templates.length === 0 ? "save" : "load");
  const [name,     setName]     = useState("");
  const [saved,    setSaved]    = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    const ok = saveTemplate(name, cart);
    if (ok) { setSaved(true); setTimeout(onClose, 900); }
  };

  const handleLoad = (template) => {
    onLoad(template.items);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

        {/* כותרת */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <h3 className="font-bold text-white text-base">תבניות סל</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white text-lg">✕</button>
        </div>

        {/* טאבים */}
        <div className="flex border-b border-slate-100">
          {[{ id: "save", label: "שמור תבנית" }, { id: "load", label: `טען תבנית (${templates.length})` }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-medium transition ${
                tab === t.id
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* טאב שמירה */}
          {tab === "save" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">שמור את הסל הנוכחי ({cart.length} פריטים) כתבנית לשימוש חוזר</p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder='למשל: "סל שבועי רגיל"'
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleSave}
                disabled={!name.trim() || saved}
                className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600
                  disabled:opacity-60 text-white text-sm font-semibold transition"
              >
                {saved ? "✓ נשמר!" : "שמור תבנית"}
              </button>
            </div>
          )}

          {/* טאב טעינה */}
          {tab === "load" && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {templates.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-6">
                  אין תבניות שמורות עדיין
                </p>
              ) : templates.map((t) => (
                <div key={t.id}
                  className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{t.name}</p>
                    <p className="text-xs text-slate-400">
                      {t.items.length} פריטים ·{" "}
                      {new Date(t.savedAt).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLoad(t)}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-500 hover:bg-blue-600
                      text-white rounded-lg transition flex-shrink-0"
                  >
                    טען
                  </button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="w-7 h-7 flex items-center justify-center text-red-400
                      hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
