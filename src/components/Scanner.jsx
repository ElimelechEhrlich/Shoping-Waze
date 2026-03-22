import { useState } from 'react';
import api from '../api/client.js'; 
import { Upload, Loader2, FileImage, CheckCircle } from 'lucide-react';

const Scanner = ({ onScanComplete }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); 
      setError(null);
    }
  };

  // שליחה לשרת
  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('receipt', file); 

    try {
      const response = await api.post('/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        onScanComplete(response.data.receipt); 
      }
    } catch (err) {
      setError('אופס! הסריקה נכשלה. נסה שוב.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">סריקה חכמה</h2>
        <p className="text-gray-500 text-sm">העלה קבלה </p>
      </div>

      <div className="relative group">
        <label className={`
          flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-2xl cursor-pointer
          transition-all duration-300
          ${preview ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
        `}>
          {preview ? (
            <div className="relative w-full h-full p-2">
              <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <p className="text-white font-medium bg-black/50 px-3 py-1 rounded-full">החלף תמונה</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 text-gray-400 mb-3 group-hover:text-blue-500 transition-colors" />
              <p className="mb-2 text-sm text-gray-500 font-semibold text-center">לחץ לבחירה או גרור תמונה</p>
              <p className="text-xs text-gray-400 text-center">PNG, JPG או WEBP</p>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={loading} />
        </label>
      </div>

    
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`
          w-full mt-6 py-4 rounded-2xl font-bold text-white shadow-lg transition-all
          flex items-center justify-center gap-2
          ${!file || loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            מנתח קבלה ב-AI...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            סרוק עכשיו
          </>
        )}
      </button>

      {error && <p className="mt-4 text-center text-red-500 text-sm font-medium">{error}</p>}
    </div>
  );
};

export default Scanner;