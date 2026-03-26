import { useEffect, useState } from "react";
import { useToast } from "../Contexts/ToastContext.jsx";

const DATA_API_URL = import.meta.env.VITE_DATA_API_URL || "http://localhost:8000";

export default function useProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res  = await fetch(`${DATA_API_URL}/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || "שגיאה בטעינת המוצרים");
        setProducts(data.products || []);
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
