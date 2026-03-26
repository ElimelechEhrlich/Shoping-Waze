import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CameraCapturePanel from "../Comps/Scan/CameraCapturePanel.jsx";
import { useCameraCapture } from "../hooks/useCameraCapture.js";
import { useToast } from "../Contexts/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";

const MAX_FILE_MB   = 5;
const OCR_TIMEOUT_MS = 60_000;

const DATA_API_URL = import.meta.env.VITE_DATA_API_URL || "http://localhost:8000";

const ScanPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  usePageTitle("סריקת קבלה");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    stream,
    isOpen: isCameraOpen,
    error: cameraError,
    loading: cameraLoading,
    openCamera,
    closeCamera,
    capturePhoto,
  } = useCameraCapture();

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const applyReceiptFile = (nextFile) => {
    if (!nextFile) return;

    if (nextFile.size > MAX_FILE_MB * 1024 * 1024) {
      showToast(`הקובץ גדול מדי — מקסימום ${MAX_FILE_MB}MB`, "warning");
      return;
    }

    setPreview((previousPreview) => {
      if (previousPreview) URL.revokeObjectURL(previousPreview);
      return URL.createObjectURL(nextFile);
    });
    setFile(nextFile);
    setError("");
  };

  const clearFile = () => {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFile(null);
    setError("");
  };

  const onSelectFile = (event) => {
    const selectedFile = event.target.files?.[0];
    applyReceiptFile(selectedFile);
  };

  const onCapture = async (videoElement) => {
    try {
      const capturedFile = await capturePhoto(videoElement);
      applyReceiptFile(capturedFile);
    } catch {
      setError("לא הצלחנו לצלם כרגע. אפשר לנסות שוב או להעלות תמונה.");
    }
  };

  const onUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${DATA_API_URL}/receipts/upload`, {
        method: "POST",
        signal: controller.signal,
        body: formData,
      });

      if (response.status === 413) {
        throw new Error(`הקובץ גדול מדי — מקסימום ${MAX_FILE_MB}MB`);
      }
      if (!response.ok) {
        throw new Error("העלאת הקבלה נכשלה — בדוק שהשרת פעיל");
      }

      const data = await response.json();
      if (!data?.receipt) throw new Error("תגובה לא תקינה מהשרת");

      navigate("/details", { state: { receipt: data.receipt } });
    } catch (err) {
      const isTimeout = err.name === "AbortError";
      const msg = isTimeout
        ? "הסריקה לקחה יותר מדי זמן — נסה שוב"
        : err.message || "סריקה לא זמינה כרגע";
      setError(msg);
      showToast(msg, "error");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">סריקת קבלה</h1>
          <p className="text-sm text-slate-500 mt-1">העלה תמונה כדי להמיר אותה לרשימת מוצרים.</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
            text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          בית
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition">
            <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
            <span className="text-sm font-medium text-slate-700">בחר תמונת קבלה</span>
            <p className="text-xs text-slate-400 mt-1">PNG / JPG / WEBP</p>
          </label>

          <button
            type="button"
            onClick={openCamera}
            disabled={cameraLoading}
            className="w-full border-2 border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition disabled:opacity-60"
          >
            <span className="text-sm font-medium text-slate-700">{cameraLoading ? "פותח מצלמה..." : "צלם קבלה"}</span>
            <p className="text-xs text-slate-400 mt-1">פתיחה ישירה של המצלמה לצילום</p>
          </button>
        </div>

        {isCameraOpen && (
          <CameraCapturePanel stream={stream} onCapture={onCapture} onCancel={closeCamera} />
        )}

        {preview && (
          <div className="relative rounded-xl overflow-hidden border border-slate-200">
            <img
              src={preview}
              alt="receipt preview"
              className="w-full max-h-96 object-contain bg-slate-50"
            />
            {/* X button — clears selection before upload */}
            <button
              type="button"
              onClick={clearFile}
              aria-label="הסר תמונה"
              className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center
                rounded-full bg-slate-800/70 hover:bg-red-600 text-white text-xs
                transition shadow"
            >
              ✕
            </button>
          </div>
        )}

        {(error || cameraError) && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{error || cameraError}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onUpload}
            disabled={!file || loading}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm"
          >
            {loading ? "מעלה..." : "סרוק קבלה"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm"
          >
            מעבר לסל
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
