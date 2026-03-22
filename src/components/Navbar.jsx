import { ScanLine, ShoppingBasket, BarChart3, LogOut, User } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const Navbar = () => {
  const { user, logout, currentReceipt, setReceipt } = useAppStore();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
        
        <div className="flex items-center gap-8">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setReceipt(null)} 
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-blue-200 shadow-lg">
              <ShoppingBasket className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tighter">SmartSave<span className="text-blue-600">.ai</span></span>
          </div>

          {user && (
            <div className="hidden md:flex items-center gap-1 text-gray-500 font-medium">
              <button 
                onClick={() => setReceipt(null)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${!currentReceipt ? 'text-blue-600 bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <ScanLine size={18} />
                <span>סריקה</span>
              </button>
              
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                <ShoppingBasket size={18} />
                <span>הסל שלי</span>
              </button>

              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                <BarChart3 size={18} />
                <span>השוואת מחירים</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-start leading-none hidden sm:flex text-left">
                <span className="text-sm font-bold text-gray-800">{user.name || 'משתמש'}</span>
                <span className="text-[10px] text-gray-400">צרכן חכם</span>
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
            <span className="text-sm text-blue-600 font-bold">התחברות למערכת</span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;