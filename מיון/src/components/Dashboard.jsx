import { useNavigate } from 'react-router-dom';
import { ScanLine, ShoppingCart, History, TrendingDown } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const Dashboard = () => {
  // השינוי המרכזי: שימוש ב-navigate במקום ב-Prop ידני
  const navigate = useNavigate();
  const { user } = useAppStore();

  const menuItems = [
    { 
      id: 'scan', 
      path: '/scan', // הנתיב אליו ננווט
      title: 'סריקת קבלה', 
      desc: 'צילום קבלה ועדכון מחירים', 
      icon: <ScanLine size={32} />, 
      color: 'bg-blue-600' 
    },
    { 
      id: 'cart', 
      path: '/cart', 
      title: 'הסל שלי', 
      desc: 'ניהול רשימת קניות חכמה', 
      icon: <ShoppingCart size={32} />, 
      color: 'bg-green-600' 
    },
    { 
      id: 'history', 
      path: '/history', 
      title: 'היסטוריה', 
      desc: 'צפייה בקבלות קודמות', 
      icon: <History size={32} />, 
      color: 'bg-purple-600' 
    },
    { 
      id: 'compare', 
      path: '/compare', 
      title: 'השוואת מחירים', 
      desc: 'איפה הכי זול לקנות היום?', 
      icon: <TrendingDown size={32} />, 
      color: 'bg-amber-600' 
    },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* כותרת אישית */}
      <header className="mb-10 text-right">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          היי {user?.name || 'חבר'},
        </h1>
        <p className="text-slate-500 text-lg mt-2">מה נרצה לעשות היום?</p>
      </header>

      {/* גריד הכפתורים */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)} // הניווט האמיתי קורה כאן
            className="flex items-center gap-6 p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-right group outline-none focus:ring-4 focus:ring-blue-100"
          >
            {/* אייקון עם רקע צבעוני */}
            <div className={`${item.color} text-white p-5 rounded-[1.5rem] shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {item.icon}
            </div>

            {/* טקסט */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* אזור "סטטיסטיקה מהירה" (אופציונלי - מוסיף המון ל-UI) */}
      <div className="mt-12 grid grid-cols-3 gap-4">
        {[
          { label: 'קבלות החודש', value: '12' },
          { label: 'חיסכון מצטבר', value: '₪240' },
          { label: 'פריטים בסל', value: '5' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-100/50 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;