// Comps/Cart/TemplateModal.jsx
// מודל שמירה וטעינה של תבניות סל

import { useState, useEffect } from "react";
import useTemplates from "../../hooks/useTemplates.js";
import Button from "../ui/Button.jsx";

const TemplateModal = ({ cart, onLoad, onClose }) => {
  const { templates, saveTemplate, deleteTemplate } = useTemplates();
  const [tab,      setTab]      = useState(templates.length === 0 ? "save" : "load");
  const [name,     setName]     = useState("");
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

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
    <div
      className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-md w-full max-w-sm overflow-hidden animate-fade-in">

        {/* כותרת */}
        <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between">
          <h3 id="template-title" className="font-semibold text-white text-sm">תבניות סל</h3>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="w-7 h-7 rounded-sm flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* טאבים */}
        <div role="tablist" className="flex border-b border-zinc-200">
          {[{ id: "save", label: "שמור" }, { id: "load", label: `טעינה (${templates.length})` }].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-semibold transition ${
                tab === t.id
                  ? "text-zinc-900 border-b-2 border-zinc-900"
                  : "text-zinc-500 hover:text-zinc-800 border-b-2 border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === "save" && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                שמור את הסל הנוכחי ({cart.length} פריטים) כתבנית לשימוש חוזר.
              </p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder='למשל: "סל שבועי רגיל"'
                className="w-full border border-zinc-300 rounded-sm px-3 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400
                  placeholder:text-zinc-400"
              />
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleSave}
                disabled={!name.trim() || saved}
              >
                {saved ? "נשמר" : "שמור תבנית"}
              </Button>
            </div>
          )}

          {tab === "load" && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {templates.length === 0 ? (
                <p className="text-center text-zinc-500 text-sm py-6">
                  אין תבניות שמורות עדיין
                </p>
              ) : templates.map((t) => (
                <div key={t.id}
                  className="flex items-center gap-2 bg-zinc-50 rounded-sm border border-zinc-200 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 text-sm truncate">{t.name}</p>
                    <p className="text-xs text-zinc-500">
                      {t.items.length} פריטים · {new Date(t.savedAt).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => handleLoad(t)}>
                    טען
                  </Button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    aria-label={`מחק את ${t.name}`}
                    className="w-8 h-8 flex items-center justify-center text-red-700
                      hover:text-red-800 hover:bg-red-50 rounded-sm transition flex-shrink-0"
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
