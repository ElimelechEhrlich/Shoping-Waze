import { useEffect, useRef, useState } from "react";

const CameraCapturePanel = ({ stream, onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;

    const onCanPlay = () => setVideoReady(true);
    video.addEventListener("canplay", onCanPlay);
    return () => video.removeEventListener("canplay", onCanPlay);
  }, [stream]);

  return (
    <div className="bg-slate-950 text-white rounded-xl p-4 space-y-3" dir="rtl">
      {/* Instruction */}
      <div className="text-center space-y-0.5">
        <p className="text-sm font-semibold text-white">כוונו את הקבלה אל המסגרת</p>
        <p className="text-xs text-slate-400">
          החזיקו את הטלפון ישר מעל הקבלה · מרחק 15–25 ס״מ
        </p>
      </div>

      {/* Camera viewport — 6:9 portrait */}
      <div
        className="relative rounded-lg overflow-hidden bg-black border border-slate-700 mx-auto w-full"
        style={{ aspectRatio: "6/9", maxWidth: "340px" }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          aria-label="camera preview"
        />

        {/* Corner-bracket overlay — shows the capture zone */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Semi-transparent mask outside the receipt area */}
          <div className="absolute inset-0 bg-black/25" />

          {/* Receipt frame — centered, slightly inset */}
          <div className="absolute inset-x-6 inset-y-8">
            {/* Corner brackets */}
            {[
              "top-0 left-0 border-t-2 border-l-2 rounded-tl",
              "top-0 right-0 border-t-2 border-r-2 rounded-tr",
              "bottom-0 left-0 border-b-2 border-l-2 rounded-bl",
              "bottom-0 right-0 border-b-2 border-r-2 rounded-br",
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-6 h-6 border-emerald-400 ${cls}`}
              />
            ))}

            {/* Thin centre line — helps align the receipt horizontally */}
            <div className="absolute left-3 right-3 top-1/2 -translate-y-px h-px bg-emerald-400/40" />
          </div>
        </div>

        {/* "Not ready" overlay */}
        {!videoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
            <p className="text-xs text-slate-400 animate-pulse">פותח מצלמה…</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <ul className="text-xs text-slate-400 space-y-0.5 px-1 list-none">
        <li>✓ &nbsp;ודאו שהתאורה מספקת ואין צל על הקבלה</li>
        <li>✓ &nbsp;הקבלה צריכה למלא את כל המסגרת</li>
        <li>✓ &nbsp;המתינו שהתמונה תתמקד לפני שתצלמו</li>
      </ul>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onCapture(videoRef.current)}
          disabled={!videoReady}
          className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600
            disabled:opacity-40 text-white font-semibold text-sm transition"
        >
          📷 &nbsp;צלם עכשיו
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-slate-500 text-slate-100
            hover:bg-slate-800 font-semibold text-sm transition"
        >
          ביטול
        </button>
      </div>
    </div>
  );
};

export default CameraCapturePanel;
