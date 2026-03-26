import { useCallback, useState } from "react";
import { useToast } from "../Contexts/ToastContext.jsx";

const DATA_API_URL = import.meta.env.VITE_DATA_API_URL || "http://localhost:8000";
const COMPARE_TIMEOUT_MS = 45_000;

export default function useCompare() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const compare = useCallback(async (cart, baselineStore) => {
    if (!Array.isArray(cart) || cart.length === 0) return null;

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), COMPARE_TIMEOUT_MS);

    setLoading(true);
    try {
      const res = await fetch(`${DATA_API_URL}/basket/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          baseline_store: baselineStore || null,
          items: cart.map((i) => ({ name: i.name, quantity: i.qty })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "השוואה נכשלה");

      return { results: data.results || [], cheapest: data.cheapest || null };
    } catch (err) {
      const isTimeout = err.name === "AbortError";
      const msg = isTimeout
        ? "השוואת המחירים לקחה יותר מדי זמן — נסה שוב"
        : err.message || "שגיאה בהשוואת מחירים";
      showToast(msg, "error");
      return null;
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [showToast]);

  return { compare, loading };
}
