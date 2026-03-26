// hooks/usePopularProducts.js
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth.js";
import { useToast } from "../Contexts/ToastContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const usePopularProducts = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res  = await fetch(`${API_URL}/products/popular`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setProducts(data.products);
      } catch (err) {
        const msg = err.message || "שגיאה בטעינת מוצרים פופולריים";
        setError(msg);
        showToast(msg, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  return { products, loading, error };
};

export default usePopularProducts;
