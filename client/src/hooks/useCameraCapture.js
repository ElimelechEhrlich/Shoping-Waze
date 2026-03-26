import { useCallback, useEffect, useState } from "react";

const createReceiptFileFromVideo = async (videoElement) => {
  if (!videoElement?.videoWidth || !videoElement?.videoHeight) {
    throw new Error("camera_not_ready");
  }

  // Capture at full native resolution for best OCR quality
  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("canvas_unavailable");
  }

  // Sharpen rendering for text-heavy images
  context.imageSmoothingEnabled = false;
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // High quality JPEG for OCR accuracy
  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.95);
  });

  if (!blob) {
    throw new Error("capture_failed");
  }

  return new File([blob], `receipt-${Date.now()}.jpg`, { type: "image/jpeg" });
};

export const useCameraCapture = () => {
  const [stream, setStream] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const stopCamera = useCallback(() => {
    setStream((currentStream) => {
      currentStream?.getTracks().forEach((track) => track.stop());
      return null;
    });
  }, []);

  const closeCamera = useCallback(() => {
    stopCamera();
    setIsOpen(false);
  }, [stopCamera]);

  const openCamera = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError("המצלמה לא נתמכת בדפדפן הזה.");
      return;
    }

    stopCamera();
    setLoading(true);
    setError("");

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          // Portrait ratio for tall receipts (6:9 = 2:3)
          aspectRatio: { ideal: 2 / 3 },
          width: { ideal: 1080, min: 720 },
          height: { ideal: 1620, min: 960 },
        },
        audio: false,
      });

      // Enable continuous auto-focus for close-up text if the browser supports it
      const [videoTrack] = nextStream.getVideoTracks();
      if (videoTrack?.applyConstraints) {
        try {
          await videoTrack.applyConstraints({
            advanced: [
              { focusMode: "continuous" },
              { whiteBalanceMode: "continuous" },
              { exposureMode: "continuous" },
            ],
          });
        } catch {
          // Advanced constraints not supported on all browsers — ignore silently
        }
      }

      setStream(nextStream);
      setIsOpen(true);
    } catch {
      setError("לא הצלחנו לפתוח את המצלמה. בדוק הרשאות מצלמה.");
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, [stopCamera]);

  const capturePhoto = useCallback(async (videoElement) => {
    const file = await createReceiptFileFromVideo(videoElement);
    closeCamera();
    return file;
  }, [closeCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  return {
    stream,
    isOpen,
    error,
    loading,
    openCamera,
    closeCamera,
    capturePhoto,
  };
};
