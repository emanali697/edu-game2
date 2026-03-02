import { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { getChildrenByParent, getChildAchievements, getAllAchievementDefinitions } from "@services/firebase";
import { buildWhatsAppShareURL } from "@utils/helpers";
import { APP_NAME } from "@utils/constants";

// ── عبارات التهنئة العشوائية ────────────────────────────────────
const CONGRATS_PHRASES = [
  { text: "تهانينا! لقد حققت إنجازاً رائعاً!", emoji: "🎉" },
  { text: "أحسنت! أنت متميز حقاً وتستحق كل التقدير!", emoji: "🏆" },
  { text: "ما شاء الله! استمر في التفوق والتميز!", emoji: "⭐" },
  { text: "رائع! أنت نجم عالم التعلّم الحقيقي!", emoji: "🌟" },
  { text: "بطل! إنجاز يستحق الفخر والاحتفال!", emoji: "💪" },
  { text: "عظيم! كل خطوة تقربك من القمة!", emoji: "🚀" },
  { text: "ممتاز! إنجازاتك تُلهم من حولك!", emoji: "✨" },
  { text: "مبدع! هذا الإنجاز يعكس تميزك وجهدك!", emoji: "🎯" },
];

function randomPhrase() {
  return CONGRATS_PHRASES[Math.floor(Math.random() * CONGRATS_PHRASES.length)];
}

// ── Share Modal ──────────────────────────────────────────────────
function ShareModal({ achievementId, def, unlockedAt, childName, onClose }) {
  const [copied, setCopied] = useState(false);
  const [phrase] = useState(randomPhrase);

  const shareText =
    `${phrase.emoji} ${phrase.text}\n` +
    `يا ${childName} لقد اجتزت شارة ${def.icon} "${def.title}" في ${APP_NAME}!\n` +
    `📖 ${def.description}\n` +
    `#عالم_التعلم #تعليم_الأطفال #تفوق`;

  async function handleNativeShare() {
    try {
      await navigator.share({ title: `إنجاز: ${def.title}`, text: shareText });
    } catch (_) {}
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {}
  }

  function handleWhatsApp() {
    window.open(buildWhatsAppShareURL(shareText), "_blank");
  }

  function handleTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  }

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: "rgba(0,0,0,0.55)", zIndex: 9999, backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card shadow-lg text-center anim-scale"
        style={{ maxWidth: 420, width: "100%", borderRadius: "1.75rem", overflow: "hidden" }}>

        {/* Header gradient */}
        <div style={{ background: "linear-gradient(135deg, var(--c-primary) 0%, #a29bfe 100%)", padding: "2rem 1.5rem 1.5rem" }}>
          {/* Celebration emojis */}
          <div className="f-display mb-2" style={{ fontSize: "1.4rem", opacity: 0.9 }}>
            🎊 🎉 🎊
          </div>
          {/* Achievement icon */}
          <div className="anim-bounce d-inline-block mb-2" style={{ fontSize: "4rem" }}>
            {def.icon}
          </div>
          {/* Congrats phrase */}
          <h4 className="f-display text-white mb-1" style={{ fontSize: "1.15rem" }}>
            {phrase.emoji} {phrase.text}
          </h4>
          <p className="f-body mb-0" style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem" }}>
            يا <strong>{childName}</strong> لقد اجتزت شارة
          </p>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Achievement details */}
          <div className="p-3 rounded-3 mb-4" style={{ background: "rgba(108,92,231,0.07)" }}>
            <h5 className="f-display mb-1" style={{ color: "var(--c-primary)" }}>{def.title}</h5>
            <p className="f-body small text-c-light mb-2">{def.description}</p>
            <span className="badge rounded-pill bg-success bg-opacity-10 text-c-correct f-body" style={{ fontSize: "0.75rem" }}>
              ✅ تم الفتح: {new Date(unlockedAt).toLocaleDateString("ar-SA")}
            </span>
          </div>

          {/* Share label */}
          <p className="f-display small text-c-light mb-3">شارك هذا الإنجاز مع عائلتك وأصدقائك 📲</p>

          {/* Share buttons */}
          <div className="d-flex flex-column gap-2 mb-3">
            {/* WhatsApp */}
            <button onClick={handleWhatsApp}
              className="btn w-100 f-display d-flex align-items-center justify-content-center gap-2"
              style={{ background: "#25D366", color: "#fff", borderRadius: "0.9rem", fontSize: "1rem" }}>
              <span style={{ fontSize: "1.2rem" }}>💬</span> مشاركة عبر واتساب
            </button>

            {/* Twitter / X */}
            <button onClick={handleTwitter}
              className="btn w-100 f-display d-flex align-items-center justify-content-center gap-2"
              style={{ background: "#000", color: "#fff", borderRadius: "0.9rem", fontSize: "1rem" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 900 }}>𝕏</span> مشاركة عبر X (تويتر)
            </button>

            {/* Native share (mobile) / Copy */}
            {navigator.share ? (
              <button onClick={handleNativeShare}
                className="btn w-100 f-display d-flex align-items-center justify-content-center gap-2"
                style={{ background: "var(--c-primary)", color: "#fff", borderRadius: "0.9rem", fontSize: "1rem" }}>
                📤 مشاركة عبر التطبيقات
              </button>
            ) : (
              <button onClick={handleCopy}
                className="btn w-100 f-display d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: copied ? "var(--c-correct)" : "rgba(108,92,231,0.1)",
                  color: copied ? "#fff" : "var(--c-primary)",
                  borderRadius: "0.9rem", fontSize: "1rem",
                  transition: "all 0.3s",
                }}>
                {copied ? "✅ تم النسخ!" : "📋 نسخ نص المشاركة"}
              </button>
            )}
          </div>

          {/* Close */}
          <button onClick={onClose}
            className="btn btn-link text-c-light text-decoration-none f-body small w-100">
            إغلاق ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function AchievementsPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [unlocked, setUnlocked] = useState({});
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState(null); // { id, def, unlockedAt }

  const allDefs = getAllAchievementDefinitions();

  useEffect(() => { loadChildren(); }, [user]);

  async function loadChildren() {
    if (!user) return;
    setLoading(true);
    const kids = await getChildrenByParent(user.uid);
    setChildren(kids);
    if (kids.length > 0) selectChild(kids[0]);
    setLoading(false);
  }

  async function selectChild(child) {
    setSelectedChild(child);
    const ach = await getChildAchievements(child.id);
    setUnlocked(ach || {});
  }

  function openShareModal(id, def) {
    setShareModal({ id, def, unlockedAt: unlocked[id]?.unlockedAt });
  }

  const unlockedCount = Object.keys(unlocked).length;
  const totalCount = Object.keys(allDefs).length;

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-c-primary" />
      </div>
    );
  }

  return (
    <div className="bg-app min-vh-100 py-4">

      {/* ── Share Modal ── */}
      {shareModal && (
        <ShareModal
          achievementId={shareModal.id}
          def={shareModal.def}
          unlockedAt={shareModal.unlockedAt}
          childName={selectedChild?.name || ""}
          onClose={() => setShareModal(null)}
        />
      )}

      <div className="container" style={{ maxWidth: 750 }}>
        <h1 className="f-display fs-3 mb-2">الإنجازات 🏆</h1>
        <p className="f-body text-c-light mb-4">اضغط على أي إنجاز مفتوح لمشاركته مع عائلتك!</p>

        {/* Child selector */}
        {children.length > 0 && (
          <div className="d-flex gap-2 mb-4 flex-wrap">
            {children.map((child) => (
              <button key={child.id}
                onClick={() => selectChild(child)}
                className={`btn rounded-pill px-3 py-2 f-display small ${selectedChild?.id === child.id ? "btn-primary" : "btn-outline-secondary"}`}>
                {child.avatar || "👦"} {child.name}
              </button>
            ))}
          </div>
        )}

        {/* Progress */}
        <div className="card border-c p-4 mb-4 text-center">
          <div className="f-display fs-4 text-c-primary">{unlockedCount} / {totalCount}</div>
          <div className="game-progress mx-auto mt-2" style={{ maxWidth: 300 }}>
            <div className="fill" style={{ width: `${(unlockedCount / totalCount) * 100}%`, backgroundColor: "var(--c-primary)" }} />
          </div>
          <small className="f-body text-c-light mt-2 d-block">إنجاز مفتوح</small>
        </div>

        {/* Achievement Grid */}
        <div className="row g-3">
          {Object.entries(allDefs).map(([id, def]) => {
            const isUnlocked = !!unlocked[id];
            return (
              <div key={id} className="col-6 col-sm-4 col-lg-3">
                <div
                  onClick={() => isUnlocked && openShareModal(id, def)}
                  className={`card border-c p-3 text-center h-100 ${isUnlocked ? "feature-card" : "opacity-50"}`}
                  style={{
                    background: isUnlocked ? "#faf7ff" : "#f5f5f5",
                    cursor: isUnlocked ? "pointer" : "default",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  {/* Unlocked glow top bar */}
                  {isUnlocked && (
                    <div style={{
                      position: "absolute", top: 0, right: 0, left: 0, height: 4,
                      background: "linear-gradient(90deg, var(--c-primary), #a29bfe)",
                      borderRadius: "1.25rem 1.25rem 0 0",
                    }} />
                  )}

                  <div style={{ fontSize: "2.5rem", filter: isUnlocked ? "none" : "grayscale(1)", marginTop: isUnlocked ? 4 : 0 }}>
                    {def.icon}
                  </div>
                  <h6 className="f-display small mt-2 mb-1">{def.title}</h6>
                  <small className="f-body text-c-light" style={{ fontSize: "0.75rem" }}>{def.description}</small>

                  {isUnlocked ? (
                    <div className="mt-2">
                      <span className="badge rounded-pill bg-success bg-opacity-10 text-c-correct d-block mb-1" style={{ fontSize: "0.65rem" }}>
                        ✅ {new Date(unlocked[id].unlockedAt).toLocaleDateString("ar-SA")}
                      </span>
                      <span className="f-body" style={{ fontSize: "0.7rem", color: "var(--c-primary)", opacity: 0.8 }}>
                        📤 اضغط للمشاركة
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <span className="badge rounded-pill bg-secondary bg-opacity-10 text-c-light" style={{ fontSize: "0.65rem" }}>🔒 مقفل</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
