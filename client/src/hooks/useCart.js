// hooks/useCart.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth.js";
import { useToast } from "../Contexts/ToastContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const useCart = () => {
  const { token, logout } = useAuth();
  const { showToast } = useToast();

  const [cart, setCart]                   = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  // ── טיפול ב-401 ─────────────────────────────────────────
  const handleResponse = useCallback(async (res) => {
    if (res.status === 401) {
      showToast("פג תוקף ההתחברות — נא להתחבר מחדש", "warning");
      logout();
      return null;
    }
    return res.json();
  }, [logout, showToast]);

  // ── שליפת הסל מהשרת ────────────────────────────────────
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch(`${API_URL}/cart`, { headers: authHeaders() });
      const data = await handleResponse(res);
      if (!data) return;
      if (!data.success) throw new Error(data.message);
      setCart(data.cart);
      setSelectedStore(data.selectedStore);
    } catch (err) {
      const msg = err.message || "שגיאה בטעינת הסל";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders, handleResponse, showToast]);

  useEffect(() => {
    if (token) fetchCart();
  }, [token, fetchCart]);

  // ── עדכון / הוספת פריט (PATCH upsert) ────────────────
  const updateItem = async (name, fields) => {
    try {
      const isNew = !cart.some((c) => c.name.toLowerCase() === name.toLowerCase());

      const res  = await fetch(`${API_URL}/cart/${encodeURIComponent(name)}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(fields),
      });
      const data = await handleResponse(res);
      if (!data) return;
      if (data.success) {
        setCart(data.cart);
        if (isNew) showToast(`${name} נוסף לסל`, "success");
      } else {
        showToast(data.message || "שגיאה בעדכון פריט", "error");
      }
    } catch (err) {
      showToast(err.message || "שגיאה בעדכון פריט", "error");
    }
  };

  // ── מחיקת פריט ────────────────────────────────────────
  const removeItem = async (name) => {
    try {
      const res  = await fetch(`${API_URL}/cart/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await handleResponse(res);
      if (!data) return;
      if (data.success) {
        setCart(data.cart);
        showToast(`${name} הוסר מהסל`, "info");
      }
    } catch (err) {
      showToast(err.message || "שגיאה במחיקת פריט", "error");
    }
  };

  // ── ריקון הסל כולו ────────────────────────────────────
  const clearCart = async () => {
    try {
      const res  = await fetch(`${API_URL}/cart`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await handleResponse(res);
      if (!data) return;
      if (data.success) {
        setCart([]);
        showToast("הסל רוקן בהצלחה", "success");
      }
    } catch (err) {
      showToast(err.message || "שגיאה בריקון הסל", "error");
    }
  };

  // ── שמירת סופרמרקט ────────────────────────────────────
  const saveStore = async (store) => {
    try {
      const res  = await fetch(`${API_URL}/cart/store`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ store }),
      });
      const data = await handleResponse(res);
      if (!data) return;
      if (data.success) setSelectedStore(data.selectedStore);
    } catch (err) {
      showToast(err.message || "שגיאה בשמירת הרשת", "error");
    }
  };

  // ── סיכומים לFooter ────────────────────────────────────
  // safeQty: מגן מפני ערכים לא תקינים שנשמרו ב-DB (float, מחרוזת וכד')
  const safeQty      = (v) => Math.max(1, Math.round(Number(v) || 1));
  const totalItems   = cart.reduce((acc, i) => acc + safeQty(i.qty), 0);
  const totalPrice   = cart.reduce((acc, i) => acc + (i.price > 0 ? i.price * safeQty(i.qty) : 0), 0);
  const missingPrice = cart.some((i) => i.price === 0);

  return {
    cart, selectedStore, loading, error,
    fetchCart,
    updateItem, removeItem, saveStore, clearCart,
    totalItems, totalPrice, missingPrice,
  };
};

export default useCart;
