// hooks/useTemplates.js
// שמירה וטעינה של תבניות סל — מאוחסן ב-localStorage
// ─────────────────────────────────────────────────────────

import { useState, useCallback } from "react";

const STORAGE_KEY = "cart_templates_v1";

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
};

const save = (templates) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));

const useTemplates = () => {
  const [templates, setTemplates] = useState(load);

  const saveTemplate = useCallback((name, cart) => {
    if (!name.trim() || !cart.length) return false;
    const entry = {
      id:        Date.now(),
      name:      name.trim(),
      items:     cart.map(({ name, qty, price, category }) => ({ name, qty, price, category })),
      savedAt:   new Date().toISOString(),
    };
    setTemplates((prev) => {
      const next = [entry, ...prev.filter((t) => t.name !== entry.name)];
      save(next);
      return next;
    });
    return true;
  }, []);

  const deleteTemplate = useCallback((id) => {
    setTemplates((prev) => {
      const next = prev.filter((t) => t.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { templates, saveTemplate, deleteTemplate };
};

export default useTemplates;
