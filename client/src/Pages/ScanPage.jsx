import { useEffect, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CameraCapturePanel from "../Comps/Scan/CameraCapturePanel.jsx";
import { useCameraCapture } from "../hooks/useCameraCapture.js";
import { useToast } from "../Contexts/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";

const MAX_FILE_MB     = 5;
const MAX_PHOTOS      = 8;
const OCR_TIMEOUT_MS  = 60_000;
const MIN_BRIGHTNESS  = 55;   // 0–255 — מתחת לזה = תמונה חשוכה מדי

const DATA_API_URL = import.meta.env.VITE_DATA_API_URL || "http://localhost:8000";

/** fetch נכשל לפני תשובת HTTP — CORS, שרת לא זמין, localhost בפרודקשן, mixed content וכו׳ */
const isNetworkFetchFailure = (err) => {
  if (!err) return false;
  if (err.name === "TypeError" && String(err.message).toLowerCase().includes("fetch")) return true;
  return err.message === "Failed to fetch" || err.message === "NetworkError when attempting to fetch resource.";
};

// ── בדיקת בהירות תמונה (Canvas, client-side) ─────────────────
const checkBrightness = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const W = Math.min(img.naturalWidth,  200);
      const H = Math.min(img.naturalHeight, 200);
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, W, H);
      const { data } = ctx.getImageData(0, 0, W, H);
      let sum = 0;
      for (let i = 0; i < data.length; i += 4)
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
      resolve(sum / (data.length / 4));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(128); };
    img.src = url;
  });

// ── מיזוג Canvas ─────────────────────────────────────────────
// טוען את כל התמונות ומשרשר אותן אנכית ומוציא תמיד JPEG.
//
// לפני: קובץ בודד הוחזר כמות שהוא (files[0]).
//        בעיה: iPhone שולח לפעמים HEIC או קובץ עם type="" שהשרת חוסם.
// אחרי: כל הקבצים עוברים Canvas → canvas.toBlob("image/jpeg").
//        כך הפורמט תמיד JPEG, הגדרות ה-MIME תמיד תקינות,
//        ו-HEIC / JPEG / PNG / WEBP — כולם מנורמלים לפני ההעלאה.
const mergePhotos = async (files) => {
  const loadImg = (file) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("שגיאה בטעינת תמונה")); };
      img.src = url;
    });

  const images  = await Promise.all(files.map(loadImg));
  const maxW    = Math.max(...images.map((i) => i.naturalWidth));
  const heights = images.map((i) => Math.round(i.naturalHeight * (maxW / i.naturalWidth)));
  const totalH  = heights.reduce((s, h) => s + h, 0);

  const canvas = document.createElement("canvas");
  canvas.width  = maxW;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, maxW, totalH);

  let y = 0;
  images.forEach((img, i) => {
    ctx.drawImage(img, 0, y, maxW, heights[i]);
    y += heights[i];
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error("מיזוג נכשל")); return; }
        resolve(new File([blob], "receipt.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  });
};

// ── ScanPage ──────────────────────────────────────────────────
const ScanPage = () => {
  const navigate    = useNavigate();
  const { showToast } = useToast();
  usePageTitle("סריקת קבלה");

  // רשימת תמונות — כל פריט: { id, file, preview }
  const [photoList, setPhotoList] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const {
    stream, isOpen: isCameraOpen, error: cameraError,
    loading: cameraLoading, openCamera, closeCamera,
    capturePhoto, capturePhotoKeepOpen,
  } = useCameraCapture();

  // ── ניקוי preview URLs בעת unmount ──────────────────────────
  useEffect(() => {
    return () => {
      photoList.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── הוספת קובץ לרשימה ───────────────────────────────────────
  const addFile = useCallback((file) => {
    if (!file) return;

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      showToast(`הקובץ גדול מדי — מקסימום ${MAX_FILE_MB}MB`, "warning");
      return;
    }
    if (photoList.length >= MAX_PHOTOS) {
      showToast(`ניתן להוסיף עד ${MAX_PHOTOS} תמונות`, "warning");
      return;
    }

    const preview = URL.createObjectURL(file);
    setPhotoList((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), file, preview },
    ]);
    setError("");
  }, [photoList.length, showToast]);

  // ── מחיקת תמונה מהרשימה ─────────────────────────────────────
  const removePhoto = (id) => {
    setPhotoList((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  // ── הזזת תמונה מעלה/מטה ─────────────────────────────────────
  const movePhoto = (id, dir) => {
    setPhotoList((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  // ── בחירת קובץ מהגלריה ──────────────────────────────────────
  const onSelectFiles = (e) => {
    Array.from(e.target.files || []).forEach(addFile);
    e.target.value = "";
  };

  // ── צילום בודד (סוגר מצלמה) ─────────────────────────────────
  const onCapture = async (videoEl) => {
    try {
      const f = await capturePhoto(videoEl);
      addFile(f);
    } catch {
      setError("לא הצלחנו לצלם. נסה שוב.");
    }
  };

  // ── צילום רב-תמונות (מצלמה נשארת פתוחה) ────────────────────
  const onCaptureKeepOpen = async (videoEl) => {
    try {
      const f = await capturePhotoKeepOpen(videoEl);
      addFile(f);
    } catch {
      setError("לא הצלחנו לצלם. נסה שוב.");
    }
  };

  // ── שליחה לOCR ──────────────────────────────────────────────
  const onUpload = async () => {
    if (photoList.length === 0) return;
    setLoading(true);
    setError("");

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS);

    try {
      const files = photoList.map((p) => p.file);

      // בדיקת בהירות לכל תמונה לפני מיזוג
      for (let i = 0; i < files.length; i++) {
        const brightness = await checkBrightness(files[i]);
        if (brightness < MIN_BRIGHTNESS) {
          showToast(
            `תמונה ${files.length > 1 ? i + 1 : ""} נראית חשוכה מדי — תאורה טובה תשפר את הסריקה`.trim(),
            "warning"
          );
        }
      }

      const merged   = await mergePhotos(files);
      const formData = new FormData();
      formData.append("file", merged);

      const response = await fetch(`${DATA_API_URL}/receipts/upload`, {
        method: "POST",
        signal: controller.signal,
        body:   formData,
      });

      if (!response.ok) {
        let detail = null;
        try {
          const j = await response.json();
          if (typeof j.detail === "string") detail = j.detail;
          else if (Array.isArray(j.detail))
            detail = j.detail.map((x) => x?.msg).filter(Boolean).join(" ");
        } catch {
          /* לא JSON */
        }

        if (response.status === 413) {
          throw new Error(
            `הקובץ גדול מדי (מקסימום ${MAX_FILE_MB}MB) — נסה לדחוס את התמונה`
          );
        }
        // השרת מחזיר 400 כשה-content-type לא תמונה
        if (response.status === 400) {
          const looksLikeTypeRejection =
            detail?.toLowerCase().includes("image") ||
            detail?.toLowerCase().includes("only");
          throw new Error(
            looksLikeTypeRejection || !detail
              ? "פורמט קובץ לא נתמך — השתמש ב-JPEG, JPG, PNG, WEBP או HEIC"
              : detail
          );
        }
        // 422 אצלנו = כשל ב-OCR/פרסור (Gemini), לא "פורמט קובץ"
        if (response.status === 422) {
          if (import.meta.env.DEV && detail) console.warn("[receipts/upload]", detail);
          throw new Error(
            "לא הצלחנו לנתח את הקבלה. הקובץ והפורמט בסדר, אבל שירות הזיהוי לא החזיר תוצאה תקינה — נסה תמונה חדה, ישרה ומוארת יותר, או נסה שוב בעוד כמה דקות."
          );
        }
        if (response.status >= 500) {
          throw new Error("השרת נתקל בבעיה — נסה שוב בעוד מספר שניות");
        }
        throw new Error(detail || "העלאת הקבלה נכשלה — בדוק שהשרת פעיל");
      }

      const data = await response.json();
      if (!data?.receipt) throw new Error("תגובה לא תקינה מהשרת");

      // OCR הצליח אבל לא זוהו פריטים
      const items = data.receipt?.items ?? [];
      if (items.length === 0) {
        const msg = "לא זוהו פריטים בקבלה — נסה תמונה ברורה יותר, ישרה ועם תאורה טובה";
        setError(msg);
        showToast(msg, "warning");
        return;
      }

      navigate("/details", { state: { receipt: data.receipt } });
    } catch (err) {
      const isTimeout = err.name === "AbortError";
      let msg;
      if (isTimeout) {
        msg = "הסריקה לקחה יותר מדי זמן — ייתכן שהתמונה גדולה מדי, נסה שוב";
      } else if (isNetworkFetchFailure(err)) {
        const isLocalhostApi = /localhost|127\.0\.0\.1/.test(DATA_API_URL);
        msg = isLocalhostApi
          ? `לא ניתן להתחבר לשרת הסריקה. הכתובת המוגדרת היא ${DATA_API_URL} — בפרודקשן (למשל Render) צריך להגדיר בבנייה את VITE_DATA_API_URL לכתובת ה-HTTPS של שירות ה-Python, ואז לבצע Deploy מחדש לאתר הסטטי.`
          : `לא ניתן להתחבר לשרת הסריקה (${DATA_API_URL}). ודא שהשירות רץ, שהכתובת נכונה, ושדף מאובטח (HTTPS) לא מנסה לפנות ל-API ב-HTTP בלבד.`;
        if (import.meta.env.DEV) console.warn("[scan] network error →", DATA_API_URL, err);
      } else {
        msg = err.message || "סריקה לא זמינה כרגע";
      }
      setError(msg);
      showToast(isNetworkFetchFailure(err) ? "לא ניתן להתחבר לשרת הסריקה — בדוק כתובת API והפעלת השרת" : msg, "error");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const hasPhotos = photoList.length > 0;

  return (
    <div dir="rtl">

      {/* ── Page sub-header ────────────────────────────────────────────────
          sticky top-[60px]: appears directly below the global AppHeader (≈60 px).
          Previously this page had no sticky header at all, making the title
          disappear on scroll. Now it stays visible alongside the global bar. */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-[60px] z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">סריקת קבלה</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasPhotos
                ? `${photoList.length} תמונה${photoList.length > 1 ? " — יאוחדו לסריקה אחת" : ""}`
                : "צלמו תמונה אחת או כמה חלקים של קבלה ארוכה"}
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
              text-slate-600 hover:bg-slate-50 text-sm font-medium transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            בית
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">

        {/* ── כפתורי הוספה ───────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-5 text-center cursor-pointer hover:bg-slate-50 transition">
            <input
              type="file"
              accept="image/*,image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
              multiple
              className="hidden"
              onChange={onSelectFiles}
              disabled={photoList.length >= MAX_PHOTOS}
            />
            <svg className="w-7 h-7 mx-auto text-slate-400 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-slate-700">
              {hasPhotos ? "הוסף תמונה נוספת" : "בחר תמונה"}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">JPG / JPEG / PNG / WEBP / HEIC</p>
          </label>

          <button
            type="button"
            onClick={openCamera}
            disabled={cameraLoading || photoList.length >= MAX_PHOTOS}
            className="w-full border-2 border-slate-200 rounded-xl p-5 text-center hover:bg-slate-50 transition disabled:opacity-60"
          >
            <svg className="w-7 h-7 mx-auto text-slate-400 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-slate-700">
              {cameraLoading ? "פותח מצלמה..." : hasPhotos ? "צלם חלק נוסף" : "צלם קבלה"}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasPhotos ? "המצלמה תישאר פתוחה לצילומים נוספים" : "פתיחת מצלמה ישירה"}
            </p>
          </button>
        </div>

        {/* ── פאנל מצלמה ─────────────────────────────── */}
        {isCameraOpen && (
          <CameraCapturePanel
            stream={stream}
            onCapture={onCapture}
            onCaptureKeepOpen={onCaptureKeepOpen}
            onCancel={closeCamera}
            capturedCount={photoList.length}
          />
        )}

        {/* ── רשימת תמונות ───────────────────────────── */}
        {hasPhotos && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                תמונות ({photoList.length}/{MAX_PHOTOS})
              </p>
              {photoList.length > 1 && (
                <p className="text-xs text-emerald-600 font-medium">
                  ↑↓ גרור לשינוי סדר — ימין = ראש הקבלה
                </p>
              )}
            </div>

            <div className="space-y-2">
              {photoList.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-200 p-2"
                >
                  {/* מספר תמונה */}
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold
                    flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>

                  {/* תצוגה מקדימה */}
                  <img
                    src={item.preview}
                    alt={`תמונה ${idx + 1}`}
                    className="h-16 w-24 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                  />

                  {/* שם קובץ */}
                  <p className="flex-1 text-sm text-slate-600 truncate min-w-0">
                    {item.file.name}
                    <span className="block text-xs text-slate-400">
                      {(item.file.size / 1024).toFixed(0)} KB
                    </span>
                  </p>

                  {/* כפתורי סדר */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => movePhoto(item.id, -1)}
                      disabled={idx === 0}
                      className="w-7 h-6 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200
                        disabled:opacity-30 flex items-center justify-center transition text-xs"
                      title="הזז למעלה"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(item.id, 1)}
                      disabled={idx === photoList.length - 1}
                      className="w-7 h-6 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200
                        disabled:opacity-30 flex items-center justify-center transition text-xs"
                      title="הזז למטה"
                    >
                      ▼
                    </button>
                  </div>

                  {/* מחיקה */}
                  <button
                    type="button"
                    onClick={() => removePhoto(item.id)}
                    className="w-7 h-7 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50
                      flex items-center justify-center transition flex-shrink-0"
                    title="הסר"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* תצוגה מקדימה של הסדר */}
            {photoList.length > 1 && (
              <div className="rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs text-emerald-600 font-semibold mb-2 text-center">
                  תצוגה מקדימה — הסדר שיישלח לסריקה
                </p>
                <div className="flex gap-1 justify-center flex-wrap">
                  {photoList.map((item, idx) => (
                    <div key={item.id} className="relative">
                      <img
                        src={item.preview}
                        alt={`חלק ${idx + 1}`}
                        className="h-20 w-14 object-cover rounded border border-emerald-300"
                      />
                      <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-emerald-500 text-white
                        text-[9px] font-bold rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── שגיאות ─────────────────────────────────── */}
        {(error || cameraError) && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {error || cameraError}
          </p>
        )}

        {/* ── כפתורי פעולה ───────────────────────────── */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onUpload}
            disabled={!hasPhotos || loading}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700
              disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {photoList.length > 1 ? "מאחד וסורק..." : "סורק..."}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
                {photoList.length > 1 ? `אחד וסרוק (${photoList.length} תמונות)` : "סרוק קבלה"}
              </>
            )}
          </button>

          {hasPhotos && (
            <button
              type="button"
              onClick={() => {
                photoList.forEach((p) => URL.revokeObjectURL(p.preview));
                setPhotoList([]);
                setError("");
              }}
              className="px-4 py-2.5 rounded-lg border border-red-200 text-red-500
                hover:bg-red-50 font-medium text-sm transition"
            >
              נקה הכל
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700
              hover:bg-slate-50 font-semibold text-sm"
          >
            מעבר לסל
          </button>
        </div>
      </div>
      </div> {/* end max-w-3xl content wrapper */}
    </div>
  );
};

export default ScanPage;
