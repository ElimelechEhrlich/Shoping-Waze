import { useCallback, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function useCompare() {
  const [loading, setLoading] = useState(false);

  const compare = useCallback(async (cart) => {
    if (!Array.isArray(cart) || cart.length === 0) return null;

    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";

      const res = await fetch(`${API_URL}/cart/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // server_auth expects { items: [{name, qty}] }
          items: cart.map((i) => ({ name: i.name, qty: i.qty })),
        }),
      });

      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || "compare failed");

      // CompareResultsPage expects compareData shape: { results, cheapest }
      return data.results;
    } finally {
      setLoading(false);
    }
  }, []);

  return { compare, loading };
}

