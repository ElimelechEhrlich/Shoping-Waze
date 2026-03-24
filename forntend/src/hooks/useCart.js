// hooks/useCart.js
// ─────────────────────────────────────────────────────────
// ניהול כל לוגיקת הסל: fetch, עדכון, הוספה, מחיקה, סופרמרקט.
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const useCart = () => {
  const { token } = useAuth();
  const [cart, setCart]                   = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  // ── שליפת הסל מהשרת ────────────────────────────────────
  const fetchCart = useCallback(async () => {
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      setLoading(true);
      const res  = await fetch(`${API_URL}/cart`, { headers: authHeaders });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setCart(data.cart);
      setSelectedStore(data.selectedStore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchCart();
  }, [token, fetchCart]);

  // ── עדכון כמות ו/או מחיר של פריט ─────────────────────
  // אם הפריט לא קיים בסל — השרת יוסיף אותו (addToCart מטפל בזה)
  const updateItem = async (name, fields) => {
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // אם הפריט לא קיים בסל — שולחים POST להוספה
    const exists = cart.some((c) => c.name.toLowerCase() === name.toLowerCase());

    if (!exists) {
      // הוספה דרך POST /api/cart עם מבנה JSON של הצוות
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          data: [{
            items: [{
              name:     name,
              qty:      fields.qty ?? 1,
              price:    fields.price ?? 0,
              category: fields.category ?? "כללי",
            }],
          }],
        }),
      });
      const data = await res.json();
      if (data.success) setCart(data.cart);
      return;
    }

    // עדכון פריט קיים
    const res  = await fetch(`${API_URL}/cart/${encodeURIComponent(name)}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify(fields),
    });
    const data = await res.json();
    if (data.success) setCart(data.cart);
  };

  // ── מחיקת פריט ────────────────────────────────────────
  const removeItem = async (name) => {
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const res  = await fetch(`${API_URL}/cart/${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    const data = await res.json();
    if (data.success) setCart(data.cart);
  };

  // ── שמירת סופרמרקט ────────────────────────────────────
  const saveStore = async (store) => {
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const res  = await fetch(`${API_URL}/cart/store`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ store }),
    });
    const data = await res.json();
    if (data.success) setSelectedStore(data.selectedStore);
  };

  // ── סיכומים לFooter ────────────────────────────────────
  const totalItems  = cart.reduce((acc, i) => acc + i.qty, 0);
  const totalPrice  = cart.reduce((acc, i) => acc + (i.price > 0 ? i.price * i.qty : 0), 0);
  const missingPrice = cart.some((i) => i.price === 0);

  return {
    cart, selectedStore, loading, error,
    updateItem, removeItem, saveStore,
    totalItems, totalPrice, missingPrice,
  };
};

export default useCart;
