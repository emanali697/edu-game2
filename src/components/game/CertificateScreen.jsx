import { useRef } from "react";
import { APP_NAME } from "@utils/constants";

export default function CertificateScreen({ childName, virtueTitle, virtueIcon, virtueColor, totalStages, onClose }) {
  const certRef = useRef(null);
  const dateStr = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const phrases = [
    "أنت بطل حقيقي!",
    "فخورين فيك يا بطل!",
    "ما شاء الله عليك!",
    "أخلاقك تاج على راسك!",
    "قدوة لكل الأطفال!",
  ];
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

  async function handleShare() {
    const shareText =
      `🏆 شهادة إتمام\n\n` +
      `${virtueIcon} ${virtueTitle}\n` +
      `👤 الطالب: ${childName}\n` +
      `📊 المراحل المكتملة: ${totalStages}/${totalStages}\n` +
      `📅 تاريخ الإتمام: ${dateStr}\n` +
      `⭐ ${randomPhrase}\n\n` +
      `🎮 ${APP_NAME} — منصة تعليمية وتربوية ممتعة للأطفال\n` +
      `🔗 ${window.location.origin}/`;

    // On mobile use native share, on desktop open WhatsApp Web directly
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch { /* cancelled */ }
    } else {
      const waUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, "_blank");
    }
  }

  return (
    <div className="anim-fade-up">
      <div
        ref={certRef}
        className="card shadow border-0 p-4 p-sm-5 text-center mx-auto"
        style={{
          maxWidth: 440,
          borderRadius: 24,
          background: "linear-gradient(135deg, #fff 0%, #faf7ff 100%)",
          border: `3px solid ${virtueColor}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative corners */}
        <div style={{ position: "absolute", top: 10, right: 10, fontSize: "1.5rem", opacity: 0.2 }}>✦</div>
        <div style={{ position: "absolute", top: 10, left: 10, fontSize: "1.5rem", opacity: 0.2 }}>✦</div>
        <div style={{ position: "absolute", bottom: 10, right: 10, fontSize: "1.5rem", opacity: 0.2 }}>✦</div>
        <div style={{ position: "absolute", bottom: 10, left: 10, fontSize: "1.5rem", opacity: 0.2 }}>✦</div>

        {/* Header */}
        <div style={{ fontSize: "3rem" }} className="mb-2">🏆</div>
        <h2 className="f-display fs-4 mb-1" style={{ color: virtueColor }}>
          شهادة إتمام
        </h2>
        <div
          className="mx-auto mb-3"
          style={{ width: 60, height: 3, background: virtueColor, borderRadius: 2 }}
        />

        {/* Virtue */}
        <div
          className="d-inline-block px-4 py-2 rounded-pill mb-3"
          style={{ background: virtueColor + "15", color: virtueColor }}
        >
          <span style={{ fontSize: "1.2rem" }}>{virtueIcon}</span>{" "}
          <span className="f-display">{virtueTitle}</span>
        </div>

        {/* Child name */}
        <p className="f-body text-c-light mb-1">يُشهد بأن الطالب/ة</p>
        <h3 className="f-display fs-3 mb-3" style={{ color: "#333" }}>
          {childName}
        </h3>

        {/* Details */}
        <p className="f-body mb-1">
          أتم/ت جميع مراحل فضيلة <strong style={{ color: virtueColor }}>{virtueTitle}</strong>
        </p>
        <p className="f-body text-c-light mb-1">
          📊 المراحل المكتملة: <strong>{totalStages}/{totalStages}</strong>
        </p>
        <p className="f-body text-c-light mb-3">
          📅 تاريخ الإتمام: <strong>{dateStr}</strong>
        </p>

        {/* Motivational phrase */}
        <div
          className="p-3 rounded-3 mb-3"
          style={{ background: virtueColor + "10" }}
        >
          <p className="f-display fs-5 mb-0" style={{ color: virtueColor }}>
            ⭐ {randomPhrase}
          </p>
        </div>

        {/* App branding + marketing link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-block mt-2 px-3 py-1 rounded-pill text-decoration-none"
          style={{
            background: "var(--c-primary)",
            color: "#fff",
            fontSize: "0.75rem",
            fontFamily: "var(--f-display)",
          }}
        >
          🎮 اكتشف المزيد من {APP_NAME}
        </a>
      </div>

      {/* Action buttons */}
      <div className="d-flex flex-column gap-2 mt-3" style={{ maxWidth: 440, margin: "0 auto" }}>
        <button
          onClick={handleShare}
          className="btn btn-lg text-white"
          style={{
            background: "#25D366",
            border: "none",
            borderRadius: 14,
          }}
        >
          📤 شارك الشهادة
        </button>
        <button
          onClick={onClose}
          className="btn btn-outline-secondary btn-lg"
          style={{ borderRadius: 14 }}
        >
          رجوع
        </button>
      </div>
    </div>
  );
}
