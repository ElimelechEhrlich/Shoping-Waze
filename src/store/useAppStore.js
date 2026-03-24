import { create } from 'zustand';
import api from '../api/client'; // חשוב לייבא את ה-API client

const useAppStore = create((set, get) => ({
  user: null, 
  token: localStorage.getItem('token') || null,
  currentReceipt: null,
  cart: [], 
  loading: false,
  error: null,

  // --- ניהול משתמש ---
  setUser: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, currentReceipt: null, cart: [] });
  },

  // --- ניהול סריקה (מודיעין מחירים) ---
  setReceipt: (receipt) => set({ currentReceipt: receipt, loading: false }),

  // פונקציה ששולחת את מחירי הקבלה ל-DB בלי לגעת בסל
  syncReceiptWithDB: async () => {
    const { currentReceipt } = get();
    if (!currentReceipt) return;

    set({ loading: true });
    try {
      // נתנאל צריך להקים Endpoint כזה שמקבל מערך מוצרים ומעדכן מחירים
      await api.post('/products/update-prices', { 
        items: currentReceipt.items,
        store: currentReceipt.store_name 
      });
      set({ currentReceipt: null, loading: false });
    } catch (err) {
      set({ error: "שגיאה בסנכרון המחירים מול השרת", loading: false });
    }
  },

  // --- ניהול הסל (פעולות מול ה-DB) ---
  
  // הוספת מוצר ידנית: מחפש את המחיר ב-DB ומוסיף לסל
  addItemToCart: async (itemName) => {
    set({ loading: true, error: null });
    try {
      // קריאה לשרת: "מה המחיר הכי עדכני של המוצר הזה?"
      const response = await api.get(`/products/price?name=${encodeURIComponent(itemName)}`);
      const priceFromDB = response.data.price || 0;

      set((state) => ({ 
        cart: [...state.cart, { name: itemName, price: priceFromDB }],
        loading: false 
      }));
    } catch (err) {
      // אם המוצר לא קיים ב-DB, מוסיפים אותו עם מחיר 0
      set((state) => ({ 
        cart: [...state.cart, { name: itemName, price: 0 }],
        loading: false 
      }));
    }
  },

  removeFromCart: (index) => set((state) => ({
    cart: state.cart.filter((_, i) => i !== index)
  })),

  clearCart: () => set({ cart: [] }),

  // --- עזרים ---
  setLoading: (status) => set({ loading: status }),
  setError: (msg) => set({ error: msg, loading: false }),
}));

export default useAppStore;