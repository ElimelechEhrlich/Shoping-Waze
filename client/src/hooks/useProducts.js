import { useEffect, useState } from "react";
import { useAuth } from "./useAuth.js";

const DATA_API_URL = import.meta.env.VITE_DATA_API_URL || "http://localhost:8000";

export default function useProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${DATA_API_URL}/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || "failed to load products");
        setProducts(data.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  return { products, loading, error };
}

