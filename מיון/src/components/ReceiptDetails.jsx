import useAppStore from '../store/useAppStore';
import { ChevronRight, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

const ReceiptDetails = () => {
  const { currentReceipt, setReceipt } = useAppStore();

  if (!currentReceipt) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <button 
        onClick={() => setReceipt(null)}
        className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium"
      >
        <ChevronRight size={18} />
        חזרה לסריקה
      </button>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{currentReceipt.store_name || "סופר לא ידוע"}</h2>
          <p className="text-slate-400 text-sm">{currentReceipt.city || "מיקום לא זוהה"} | {currentReceipt.date || "היום"}</p>
        </div>
        <div className="text-left">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">סה"כ קבלה</p>
          <p className="text-3xl font-black text-blue-600">₪{currentReceipt.total_amount || "0.00"}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-500">מוצר</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 text-center">כמות</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500">מחיר</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentReceipt.items?.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700">{item.name}</td>
                <td className="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
                <td className="px-6 py-4 font-bold text-slate-900">₪{item.price}</td>
                <td className="px-6 py-4 flex justify-end gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600"><Edit3 size={16}/></button>
                  <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2">
        <CheckCircle2 size={20} />
        אשר ועדכן מחירים 
      </button>
    </div>
  );
};

export default ReceiptDetails;