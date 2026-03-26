import { useCallback, useState } from "react";

const DATA_API_URL = import.meta.env.VITE_DATA_API_URL || "http://localhost:8000";

export default function useCompare() {
  const [loading, setLoading] = useState(false);

  const compare = useCallback(async (cart, baselineStore) => {
    if (!Array.isArray(cart) || cart.length === 0) return null;

    setLoading(true);
    try {
      const res = await fetch(`${DATA_API_URL}/basket/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseline_store: baselineStore || null,
          items: cart.map((i) => ({ name: i.name, quantity: i.qty })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "compare failed");

      // CompareResultsPage expects compareData shape: { results, cheapest }
      return { results: data.results || [], cheapest: data.cheapest || null };
    } finally {
      setLoading(false);
    }
  }, []);

  return { compare, loading };
}

