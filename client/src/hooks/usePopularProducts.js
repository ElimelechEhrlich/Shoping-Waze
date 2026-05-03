// hooks/usePopularProducts.js
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth.js";
import { useToast } from "../Contexts/useToast.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const usePopularProducts = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!token) return;

    const ac = new AbortController();
    const { signal } = ac;

    const fetchProducts = async () => {
      try {
        if (!signal.aborted) setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/products/popular`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });
        if (signal.aborted) return;
        const data = await res.json();
        if (signal.aborted) return;
        if (!data.success) throw new Error(data.message);
        setProducts(data.products);
      } catch (err) {
        if (signal.aborted || err.name === "AbortError") return;
        const msg = err.message || "שגיאה בטעינת מוצרים פופולריים";
        setError(msg);
        showToast(msg, "error");
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => ac.abort();
  }, [token, showToast]);

  return { products, loading, error };
};

export default usePopularProducts;
