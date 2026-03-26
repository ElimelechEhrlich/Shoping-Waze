// hooks/useSharedCart.js
import { useState, useCallback } from "react";
import { useAuth } from "./useAuth.js";
import { useToast } from "../Contexts/ToastContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const useSharedCart = () => {
  const { token, logout } = useAuth();
  const { showToast } = useToast();

  const [sharedCarts, setSharedCarts] = useState([]);
  const [currentCart,  setCurrentCart]  = useState(null);
  const [loading,      setLoading]      = useState(false);

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  const handle = useCallback(async (res) => {
    if (res.status === 401) {
      showToast("פג תוקף ההתחברות — נא להתחבר מחדש", "warning");
      logout();
      return null;
    }
    return res.json();
  }, [logout, showToast]);

  // ── שליפת כל הסלים השיתופיים של המשתמש ─────────────────
  const fetchMySharedCarts = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API_URL}/shared-carts`, { headers: headers() });
      const data = await handle(res);
      if (!data) return;
      if (data.success) setSharedCarts(data.sharedCarts);
    } catch (err) {
      showToast(err.message || "שגיאה בטעינת סלים משותפים", "error");
    } finally {
      setLoading(false);
    }
  }, [headers, handle, showToast]);

  // ── יצירת סל שיתופי חדש ─────────────────────────────────
  const createSharedCart = useCallback(async (name) => {
    try {
      setLoading(true);
      const res  = await fetch(`${API_URL}/shared-carts`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ name }),
      });
      const data = await handle(res);
      if (!data) return null;
      if (data.success) {
        setSharedCarts((prev) => [data.sharedCart, ...prev]);
        showToast("הסל השיתופי נוצר בהצלחה!", "success");
        return data.sharedCart;
      }
      showToast(data.message, "error");
      return null;
    } catch (err) {
      showToast(err.message || "שגיאה ביצירת סל", "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [headers, handle, showToast]);

  // ── הצטרפות לסל עם קוד הזמנה ────────────────────────────
  const joinSharedCart = useCallback(async (inviteCode) => {
    try {
      setLoading(true);
      const res  = await fetch(`${API_URL}/shared-carts/join`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ inviteCode }),
      });
      const data = await handle(res);
      if (!data) return null;
      if (data.success) {
        if (data.alreadyMember) {
          showToast("כבר חבר בסל זה", "info");
        } else {
          showToast("הצטרפת לסל המשותף!", "success");
        }
        setSharedCarts((prev) => {
          const alreadyIn = prev.some((c) => c._id === data.sharedCart._id);
          return alreadyIn ? prev : [data.sharedCart, ...prev];
        });
        return data.sharedCart;
      }
      showToast(data.message || "קוד הזמנה לא תקין", "error");
      return null;
    } catch (err) {
      showToast(err.message || "שגיאה בהצטרפות לסל", "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [headers, handle, showToast]);

  // ── שליפת סל ספציפי ─────────────────────────────────────
  const fetchSharedCart = useCallback(async (id) => {
    try {
      setLoading(true);
      const res  = await fetch(`${API_URL}/shared-carts/${id}`, { headers: headers() });
      const data = await handle(res);
      if (!data) return;
      if (data.success) setCurrentCart(data.sharedCart);
      else showToast(data.message, "error");
    } catch (err) {
      showToast(err.message || "שגיאה בטעינת הסל", "error");
    } finally {
      setLoading(false);
    }
  }, [headers, handle, showToast]);

  // ── הוספת פריט לסל שיתופי ───────────────────────────────
  const addItem = useCallback(async (cartId, item) => {
    try {
      const res  = await fetch(`${API_URL}/shared-carts/${cartId}/items`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(item),
      });
      const data = await handle(res);
      if (!data) return;
      if (data.success) {
        setCurrentCart((prev) => prev ? { ...prev, items: data.items } : prev);
        showToast(`${item.name} נוסף לסל`, "success");
      }
    } catch (err) {
      showToast(err.message || "שגיאה בהוספת פריט", "error");
    }
  }, [headers, handle, showToast]);

  // ── עדכון כמות פריט ─────────────────────────────────────
  const updateItem = useCallback(async (cartId, name, fields) => {
    try {
      const res  = await fetch(
        `${API_URL}/shared-carts/${cartId}/items/${encodeURIComponent(name)}`,
        { method: "PATCH", headers: headers(), body: JSON.stringify(fields) }
      );
      const data = await handle(res);
      if (!data) return;
      if (data.success)
        setCurrentCart((prev) => prev ? { ...prev, items: data.items } : prev);
    } catch (err) {
      showToast(err.message || "שגיאה בעדכון פריט", "error");
    }
  }, [headers, handle, showToast]);

  // ── מחיקת פריט ──────────────────────────────────────────
  const removeItem = useCallback(async (cartId, name) => {
    try {
      const res  = await fetch(
        `${API_URL}/shared-carts/${cartId}/items/${encodeURIComponent(name)}`,
        { method: "DELETE", headers: headers() }
      );
      const data = await handle(res);
      if (!data) return;
      if (data.success) {
        setCurrentCart((prev) => prev ? { ...prev, items: data.items } : prev);
        showToast(`${name} הוסר מהסל`, "info");
      }
    } catch (err) {
      showToast(err.message || "שגיאה במחיקת פריט", "error");
    }
  }, [headers, handle, showToast]);

  // ── עזיבת סל ────────────────────────────────────────────
  const leaveCart = useCallback(async (cartId) => {
    try {
      const res  = await fetch(`${API_URL}/shared-carts/${cartId}/leave`, {
        method: "DELETE",
        headers: headers(),
      });
      const data = await handle(res);
      if (!data) return false;
      if (data.success) {
        setSharedCarts((prev) => prev.filter((c) => c._id.toString() !== cartId));
        showToast("עזבת את הסל המשותף", "info");
        return true;
      }
      showToast(data.message, "error");
      return false;
    } catch (err) {
      showToast(err.message || "שגיאה בעזיבת הסל", "error");
      return false;
    }
  }, [headers, handle, showToast]);

  // ── מחיקת סל (בעלים בלבד) ───────────────────────────────
  const deleteCart = useCallback(async (cartId) => {
    try {
      const res  = await fetch(`${API_URL}/shared-carts/${cartId}`, {
        method: "DELETE",
        headers: headers(),
      });
      const data = await handle(res);
      if (!data) return false;
      if (data.success) {
        setSharedCarts((prev) => prev.filter((c) => c._id.toString() !== cartId));
        showToast("הסל המשותף נמחק", "info");
        return true;
      }
      showToast(data.message, "error");
      return false;
    } catch (err) {
      showToast(err.message || "שגיאה במחיקת הסל", "error");
      return false;
    }
  }, [headers, handle, showToast]);

  return {
    sharedCarts, currentCart, loading,
    fetchMySharedCarts, createSharedCart, joinSharedCart,
    fetchSharedCart, addItem, updateItem, removeItem,
    leaveCart, deleteCart,
    setCurrentCart,
  };
};

export default useSharedCart;
