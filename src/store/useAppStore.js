import { create } from 'zustand';

const useAppStore = create((set) => ({
  user: null, 
  token: localStorage.getItem('token') || null,
  currentReceipt: null,
  loading: false,
  error: null,

  setUser: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  
  setReceipt: (receipt) => set({ currentReceipt: receipt, loading: false }),
  setLoading: (status) => set({ loading: status }),
  setError: (msg) => set({ error: msg, loading: false }),
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, currentReceipt: null });
  }
}));

export default useAppStore;