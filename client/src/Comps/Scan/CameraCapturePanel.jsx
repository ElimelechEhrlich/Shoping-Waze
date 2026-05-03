import { useEffect, useRef, useState } from "react";

const CameraIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CameraCapturePanel = ({ stream, onCapture, onCaptureKeepOpen, onCancel, capturedCount = 0 }) => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const multiMode = Boolean(onCaptureKeepOpen);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;

    const onCanPlay = () => setVideoReady(true);
    video.addEventListener("canplay", onCanPlay);
    return () => video.removeEventListener("canplay", onCanPlay);
  }, [stream]);

  return (
    <div className="bg-zinc-950 text-white rounded-md p-4 space-y-3 border border-zinc-800" dir="rtl">

      <div className="text-center space-y-0.5">
        <p className="text-sm font-semibold text-white inline-flex items-center gap-2">
          כוונו את הקבלה אל המסגרת
          {multiMode && capturedCount > 0 && (
            <span className="bg-zinc-800 text-white text-[11px] font-semibold px-2 py-0.5 rounded-sm">
              {capturedCount} צולמו
            </span>
          )}
        </p>
        <p className="text-xs text-zinc-400">
          {multiMode
            ? "צלמו חלק אחד של הקבלה בכל פעם — כל החלקים יאוחדו אוטומטית"
            : "החזיקו את הטלפון ישר מעל הקבלה · מרחק 15–25 ס״מ"}
        </p>
      </div>

      <div
        className="relative rounded-sm overflow-hidden bg-black border border-zinc-800 mx-auto w-full"
        style={{ aspectRatio: "6/9", maxWidth: "340px" }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          aria-label="תצוגה מקדימה של המצלמה"
        />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/25" />

          <div className="absolute inset-x-6 inset-y-8">
            {[
              "top-0 left-0 border-t-2 border-l-2",
              "top-0 right-0 border-t-2 border-r-2",
              "bottom-0 left-0 border-b-2 border-l-2",
              "bottom-0 right-0 border-b-2 border-r-2",
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-6 h-6 border-white ${cls}`}
              />
            ))}
            <div className="absolute left-3 right-3 top-1/2 -translate-y-px h-px bg-white/30" />
          </div>
        </div>

        {!videoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80">
            <p className="text-xs text-zinc-400 animate-pulse">פותח מצלמה…</p>
          </div>
        )}
      </div>

      <ul className="text-xs text-zinc-400 space-y-0.5 px-1 list-none">
        <li>· ודאו שהתאורה מספקת ואין צל על הקבלה</li>
        <li>· הקבלה צריכה למלא את כל המסגרת</li>
        <li>· המתינו שהתמונה תתמקד לפני הצילום</li>
      </ul>

      <div className="flex flex-wrap gap-2">
        {multiMode ? (
          <>
            <button
              type="button"
              onClick={() => onCaptureKeepOpen(videoRef.current)}
              disabled={!videoReady}
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-sm
                bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed
                font-semibold text-sm transition"
            >
              <CameraIcon />
              {capturedCount === 0 ? "צלם חלק ראשון" : "צלם חלק נוסף"}
            </button>
            {capturedCount > 0 && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 h-11 rounded-sm bg-emerald-600 hover:bg-emerald-700
                  text-white font-semibold text-sm transition"
              >
                סיימתי
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="px-4 h-11 rounded-sm border border-zinc-700 text-zinc-200
                hover:bg-zinc-800 font-semibold text-sm transition"
            >
              ביטול
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onCapture(videoRef.current)}
              disabled={!videoReady}
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-sm
                bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed
                font-semibold text-sm transition"
            >
              <CameraIcon />
              צלם עכשיו
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 h-11 rounded-sm border border-zinc-700 text-zinc-200
                hover:bg-zinc-800 font-semibold text-sm transition"
            >
              ביטול
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapturePanel;
