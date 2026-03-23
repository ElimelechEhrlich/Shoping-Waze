import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAppStore from "./store/useAppStore";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Scanner from "./components/Scanner";
import ReceiptDetails from "./components/ReceiptDetails";
import Cart from "./components/Cart"; // 1. ייבוא הקומפוננטה החדשה

function App() {
  const { token, currentReceipt } = useAppStore();
  const navigate = useNavigate();

  // 2. לוגיקת "דחיפה" לפרטי קבלה:
  // אם פתאום יש קבלה (מסיים סריקה), אנחנו רוצים להעביר את המשתמש לדף הפירוט
  useEffect(() => {
    if (currentReceipt) {
      navigate('/details');
    }
  }, [currentReceipt, navigate]);

  // אם אין טוקן - תמיד מציגים לוגין
  if (!token) return <Login />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans rtl" dir="rtl">
      <Navbar />
      
      <main className="p-4">
        <Routes>
          {/* דף הבית של המשתמש */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* מסך הסורק */}
          <Route path="/scan" element={<Scanner />} />

          {/* פרטי הקבלה שנסרקה (עדכון מחירון) */}
          <Route path="/details" element={<ReceiptDetails />} />

          {/* 3. דף הסל שלי (ניהול רשימת קניות) */}
          <Route path="/cart" element={<Cart />} />
          
          {/* ברירת מחדל: אם המשתמש מנסה נתיב שלא קיים או נכנס ל- / */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;