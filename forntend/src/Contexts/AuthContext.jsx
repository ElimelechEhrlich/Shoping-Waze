// context/AuthContext.jsx
// ─────────────────────────────────────────────────────────
// ניהול מצב ה-Auth בצד client.
// מספק: user, token, loading, login, register, logout
// לכל הקומפוננטות דרך useAuth hook.
//
// שמירת token ב-localStorage מאפשרת persist session
// גם אחרי רענון הדף.
// ─────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Provider ──────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // טוען token מ-localStorage בעת אתחול (persist session)
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  /** שומר token ומשתמש ב-state ו-localStorage */
  const saveSession = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  /** מנקה session — מתנתק */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  /**
   * בעת טעינה: אם יש token ב-localStorage,
   * בודק מול השרת שהוא עדיין תקין ומביא את פרטי המשתמש.
   */
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
        else logout(); // token פג תוקף או לא תקין
      })
      .catch(logout)
      .finally(() => setLoading(false));
  }, [token, logout]);

  /**
   * הרשמת משתמש חדש.
   * @throws {Error} עם הודעה מהשרת בכישלון
   */
  const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    saveSession(data.token, data.user);
  };

  /**
   * התחברות עם אימייל וסיסמה.
   * @throws {Error} עם הודעה מהשרת בכישלון
   */
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    saveSession(data.token, data.user);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────

/**
 * useAuth — hook לגישה ל-AuthContext.
 * חייב להיות בתוך <AuthProvider>.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
