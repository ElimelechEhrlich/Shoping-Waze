import { useState } from 'react';
import { Trash2, ShoppingBasket, ArrowRight, CreditCard, Tag, Plus, Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const Cart = () => {
  const navigate = useNavigate();
  const [itemName, setItemName] = useState(''); // סטייט מקומי לשורת ההקלדה
  
  // שליפת הפונקציות החדשות מה-Store
  const { cart, removeFromCart, clearCart, addItemToCart, loading } = useAppStore();

  // חישוב סכום הסל הנוכחי
  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0).toFixed(2);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    await addItemToCart(itemName); // קורא ל-Store שמושך נתונים מה-DB
    setItemName(''); // ניקוי השדה לאחר הוספה
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 pb-32 animate-in fade-in slide-in-from-bottom-4">
      
      {/* כותרת */}
      <div className="flex justify-between items-center mb-8 px-4">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <ShoppingBasket className="text-blue-600" size={32} />
          הסל שלי
        </h1>
        {cart.length > 0 && (
          <button 
            onClick={clearCart}
            className="text-sm text-red-500 font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            נקה הכל
          </button>
        )}
      </div>

      {/* שורת הוספה ידנית מה-DB */}
      <form onSubmit={handleAddProduct} className="mb-8 px-2 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-3.5 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="מה להוסיף לסל? (למשל: חלב תנובה)"
            className="w-full pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            disabled={loading}
          />
        </div>
        <button 
          type="submit"
          disabled={loading || !itemName.trim()}
          className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 disabled:bg-slate-300 shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
        </button>
      </form>

      {/* רשימת מוצרים או מצב ריק */}
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-12 p-6 text-center opacity-60">
          <ShoppingBasket size={64} className="text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium italic">הסל שלך מחכה שתמלא אותו...</p>
        </div>
      ) : (
        <div className="space-y-3 px-2">
          {cart.map((item, index) => (
            <div 
              key={index} 
              className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 font-bold border border-slate-100">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{item.name}</h3>
                  <p className="text-xs text-slate-400">
                    {item.price > 0 ? `מחיר ממוצע ב-DB: ₪${item.price}` : 'מוצר חדש - אין עדיין מחיר'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-lg font-black text-slate-900">
                   {item.price > 0 ? `₪${item.price}` : '--'}
                </span>
                <button 
                  onClick={() => removeFromCart(index)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* סיכום תחתון צף (מוצג רק כשיש פריטים) */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">סה"כ מוערך</p>
              <p className="text-3xl font-black text-slate-900">₪{total}</p>
            </div>
            
            <button 
              onClick={() => navigate('/compare')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-2xl font-black shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              <CreditCard size={24} />
              השווה מחירים עכשיו
              <ArrowRight size={20} className="mr-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;