import { useEffect, useRef, useState } from "react";
import { registerSW } from "virtual:pwa-register";

const UPDATE_CHECK_INTERVAL_MS = 60 * 1000;

export default function PWAUpdater() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSWRef = useRef(null);

  useEffect(() => {
    updateSWRef.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;
        const intervalId = setInterval(() => {
          if (registration.installing || !navigator) return;
          if ("connection" in navigator && !navigator.onLine) return;
          registration.update().catch(() => {});
        }, UPDATE_CHECK_INTERVAL_MS);
        return () => clearInterval(intervalId);
      },
    });
  }, []);

  if (!needRefresh) return null;

  function handleUpdate() {
    const updateSW = updateSWRef.current;
    if (updateSW) updateSW(true);
  }

  return (
    <div
      className="position-fixed bottom-0 start-50 translate-middle-x mb-3 p-3 rounded-4 shadow-lg d-flex align-items-center gap-3 flex-wrap justify-content-center"
      style={{
        zIndex: 9999,
        background: "white",
        border: "2px solid #6c5ce7",
        maxWidth: "92vw",
      }}
      role="alert"
    >
      <div style={{ fontSize: "0.95rem", color: "#333" }}>
        نسخة جديدة متاحة 🎉
      </div>
      <button
        type="button"
        className="btn btn-sm fw-bold text-white"
        style={{ background: "#6c5ce7", border: "none" }}
        onClick={handleUpdate}
      >
        تحديث الآن
      </button>
      <button
        type="button"
        className="btn btn-sm btn-light"
        onClick={() => setNeedRefresh(false)}
      >
        لاحقاً
      </button>
    </div>
  );
}
