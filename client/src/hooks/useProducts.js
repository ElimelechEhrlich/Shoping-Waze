import { useEffect, useState } from "react";
import { useToast } from "../Contexts/ToastContext.jsx";

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

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res  = await fetch(`${DATA_API_URL}/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || "שגיאה בטעינת המוצרים");
        setProducts(data.products || []);
        writeCache(data.products || []);
      } catch (err) {
        const msg = err.message || "שגיאה בטעינת המוצרים";
        setError(msg);
        showToast(msg, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}
