// hooks/usePopularProducts.js
// ─────────────────────────────────────────────────────────
// Hook לשליפת המוצרים הפופולריים מהשרת.
// מנהל: loading, error, data.
// ─────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const usePopularProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/products/popular`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  return { products, loading, error };
};

export default usePopularProducts;
