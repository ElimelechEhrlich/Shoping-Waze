import { useEffect, useState } from "react";
import { useToast } from "../Contexts/useToast.js";

const DATA_API_URL    = import.meta.env.VITE_DATA_API_URL || "http://localhost:8000";
const CACHE_KEY       = "products_cache";
const CACHE_TTL_MS    = 5 * 60 * 1000; // 5 minutes

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

export default function useProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState(() => readCache() || []);
  const [loading, setLoading]   = useState(() => !readCache());
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (readCache()) return; // fresh cache — skip fetch

    const ac = new AbortController();
    const { signal } = ac;

    const fetchProducts = async () => {
      try {
        if (!signal.aborted) setLoading(true);
        setError(null);
        const res = await fetch(`${DATA_API_URL}/products`, { signal });
        if (signal.aborted) return;
        const data = await res.json();
        if (signal.aborted) return;
        if (!res.ok) throw new Error(data?.detail || "שגיאה בטעינת המוצרים");
        setProducts(data.products || []);
        writeCache(data.products || []);
      } catch (err) {
        if (signal.aborted || err.name === "AbortError") return;
        const msg = err.message || "שגיאה בטעינת המוצרים";
        setError(msg);
        showToast(msg, "error");
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => ac.abort();
  }, [showToast]);

  return { products, loading, error };
}
