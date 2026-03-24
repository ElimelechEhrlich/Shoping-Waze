import { Link, useLocation } from 'react-router-dom';
import { ScanLine, ShoppingBasket, BarChart3, LogOut, User, LayoutDashboard } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const Navbar = () => {
  const { user, logout, setReceipt } = useAppStore();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // פונקציה שמנקה את הקבלה הנוכחית כשעוברים דף
  // זה מוודא שאם התחרטנו באמצע סריקה, נוכל לנווט בחופשיות
  const handleNavClick = () => {
    setReceipt(null);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
        
        <div className="flex items-center gap-8">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={handleNavClick} // מנקה את הסריקה בחזרה הביתה
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-blue-200 shadow-lg group-hover:scale-110 transition-transform">
              <ShoppingBasket className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tighter italic">
              SmartSave<span className="text-blue-600">.ai</span>
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-1 text-gray-500 font-medium">
              <Link 
                to="/dashboard"
                onClick={handleNavClick}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${isActive('/dashboard') ? 'text-blue-600 bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <LayoutDashboard size={18} />
                <span>ראשי</span>
              </Link>

              <Link 
                to="/scan"
                onClick={handleNavClick}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${isActive('/scan') ? 'text-blue-600 bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <ScanLine size={18} />
                <span>סריקה</span>
              </Link>
              
              <Link 
                to="/cart"
                onClick={handleNavClick}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${isActive('/cart') ? 'text-blue-600 bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <ShoppingBasket size={18} />
                <span>הסל שלי</span>
              </Link>

              <Link 
                to="/compare"
                onClick={handleNavClick}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${isActive('/compare') ? 'text-blue-600 bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <BarChart3 size={18} />
                <span>השוואת מחירים</span>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end leading-none hidden sm:flex text-right">
                <span className="text-sm font-bold text-gray-800">{user.name || 'משתמש'}</span>
                <span className="text-[10px] text-gray-400 font-medium">צרכן חכם</span>
              </div>
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-gray-200">
                <User size={20} className="text-gray-500" />
              </div>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="התנתק"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/" className="text-sm text-blue-600 font-bold hover:underline">
              התחברות למערכת
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;