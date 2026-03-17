import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGameConfig } from "@context/GameContext";
import VIRTUES from "@data/config/virtues";
import { getVirtueData } from "@data/virtues";
import { shuffleArray } from "@utils/helpers";
import CertificateScreen from "@components/game/CertificateScreen";
import { SUPPORT_WHATSAPP } from "@utils/constants";

const BRIDGE_STATES = {
  WELCOME: "welcome",
  PLAYING: "playing",
  FEEDBACK: "feedback",
  RETRY: "retry",
  COMPLETED: "completed",
  CERTIFICATE: "certificate",
};

export default function BridgeGamePage() {
  const navigate = useNavigate();
  const { gameConfig } = useGameConfig();
  const { childName, childId, childToken, virtueId, isDemo, demoMaxQuestions } = gameConfig;

  const [state, setState] = useState(BRIDGE_STATES.WELCOME);
  const [demoLimitReached, setDemoLimitReached] = useState(false);
  const [stages, setStages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [builtPieces, setBuiltPieces] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [correctMapped, setCorrectMapped] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [animatingPiece, setAnimatingPiece] = useState(false);

  const virtue = VIRTUES[virtueId];
  const virtueData = getVirtueData(virtueId);

  // Redirect if missing config
  useEffect(() => {
    if (!childName || !virtueId) {
      navigate(childToken ? `/child-play/${childToken}` : "/");
    }
  }, [childName, virtueId, navigate, childToken]);

  // Initialize stages
  useEffect(() => {
    if (!virtueData) return;
    setStages(virtueData.stages);
  }, [virtueData]);

  // Shuffle options for current stage
  useEffect(() => {
    if (!stages.length || currentIndex >= stages.length) return;
    const stage = stages[currentIndex];
    const optionObjects = stage.options.map((text, i) => ({
      text,
      isCorrect: i === stage.correct,
    }));
    const shuffled = shuffleArray(optionObjects);
    setShuffledOptions(shuffled.map((o) => o.text));
    setCorrectMapped(shuffled.findIndex((o) => o.isCorrect));
  }, [stages, currentIndex]);

  const currentStage = stages[currentIndex];
  const totalStages = stages.length;

  const handleStart = () => {
    setState(BRIDGE_STATES.PLAYING);
  };

  const handleSelect = useCallback(
    (index) => {
      if (state !== BRIDGE_STATES.PLAYING) return;
      setSelectedOption(index);

      if (index === correctMapped) {
        // Correct answer
        setState(BRIDGE_STATES.FEEDBACK);
        setAnimatingPiece(true);
        setTimeout(() => {
          setBuiltPieces((prev) => prev + 1);
          setAnimatingPiece(false);
        }, 600);
      } else {
        // Wrong answer — encourage retry
        setState(BRIDGE_STATES.RETRY);
      }
    },
    [state, correctMapped]
  );

  const handleNext = () => {
    if (isDemo && currentIndex + 1 >= (demoMaxQuestions || 2)) {
      setDemoLimitReached(true);
      return;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalStages) {
      setState(BRIDGE_STATES.COMPLETED);
    } else {
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setState(BRIDGE_STATES.PLAYING);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setState(BRIDGE_STATES.PLAYING);
  };

  if (!virtue || !virtueData) return null;

  const progressPercent = (builtPieces / totalStages) * 100;

  // ── Place emoji mapping
  const placeEmoji = {
    "البيت": "🏠",
    "المدرسة": "🏫",
    "المسجد": "🕌",
    "الأقارب": "👨‍👩‍👧‍👦",
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center p-3 p-sm-4"
      style={{
        background: `linear-gradient(180deg, ${virtue.colorLight} 0%, #faf7ff 40%, #f0e6ff 100%)`,
      }}
    >
      <div className="w-100" style={{ maxWidth: 560 }}>
        {/* ══════ Welcome Screen ══════ */}
        {state === BRIDGE_STATES.WELCOME && (
          <div className="anim-fade-up text-center mt-5 pt-4">
            <div className="anim-float mb-3" style={{ fontSize: "5rem" }}>
              🌉
            </div>
            <h1 className="f-display display-6 mb-2">
              جسر المحبة
            </h1>
            <div
              className="d-inline-block px-3 py-1 rounded-pill mb-3"
              style={{ background: virtue.color + "20", color: virtue.color }}
            >
              {virtue.icon} {virtue.name}
            </div>
            <p className="fs-5 text-c-light mb-1">
              مرحباً يا {childName}! 👋
            </p>
            <p className="text-c-light mb-4">
              ساعد في بناء جسر المحبة من خلال {totalStages} مواقف
              <br />
              كل إجابة صحيحة تبني قطعة من الجسر!
            </p>
            <button
              onClick={handleStart}
              className="btn btn-lg px-5 py-3 fw-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${virtue.color}, ${virtue.color}cc)`,
                border: "none",
                borderRadius: 16,
                fontSize: "1.2rem",
                boxShadow: `0 4px 20px ${virtue.color}40`,
              }}
            >
              🌉 ابدأ البناء!
            </button>
          </div>
        )}

        {/* ══════ Playing / Feedback / Retry ══════ */}
        {(state === BRIDGE_STATES.PLAYING ||
          state === BRIDGE_STATES.FEEDBACK ||
          state === BRIDGE_STATES.RETRY) &&
          currentStage && (
            <>
              {/* Header */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: "1.5rem" }}>{virtue.icon}</span>
                  <span className="f-display fs-6" style={{ color: virtue.color }}>
                    {virtue.name}
                  </span>
                </div>
                <div className="text-c-light f-body small">
                  {currentIndex + 1} / {totalStages}
                </div>
              </div>

              {/* Bridge Visual */}
              <div
                className="card shadow-sm border-0 p-3 mb-3"
                style={{ borderRadius: 16, background: "#fff" }}
              >
                <div className="text-center mb-2">
                  <small className="text-c-light">جسر المحبة</small>
                </div>
                <div
                  className="position-relative mx-auto"
                  style={{
                    height: 48,
                    width: "100%",
                    maxWidth: 400,
                    background: "#f0f0f0",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {/* Built portion */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      height: "100%",
                      width: `${progressPercent}%`,
                      background: `linear-gradient(90deg, ${virtue.color}90, ${virtue.color})`,
                      borderRadius: 12,
                      transition: "width 0.6s ease-out",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {builtPieces > 0 && (
                      <span style={{ fontSize: "1.2rem" }}>
                        {Array.from({ length: Math.min(builtPieces, 6) })
                          .map(() => virtue.bridgeEmoji)
                          .join("")}
                      </span>
                    )}
                  </div>
                  {/* Animating piece */}
                  {animatingPiece && (
                    <div
                      className="position-absolute"
                      style={{
                        top: -20,
                        right: `${progressPercent}%`,
                        fontSize: "1.5rem",
                        animation: "bridgePieceDrop 0.6s ease-out forwards",
                      }}
                    >
                      {virtue.bridgeEmoji}
                    </div>
                  )}
                </div>
                <div className="text-center mt-1">
                  <small style={{ color: virtue.color, fontWeight: 600 }}>
                    {builtPieces} / {totalStages} قطعة
                  </small>
                </div>
              </div>

              {/* Scenario Card */}
              <div
                className="card shadow-sm border-0 p-4 mb-3"
                style={{ borderRadius: 16 }}
              >
                {/* Place badge */}
                <div className="mb-3">
                  <span
                    className="px-3 py-1 rounded-pill"
                    style={{
                      background: virtue.colorLight,
                      color: virtue.color,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {placeEmoji[currentStage.place] || "📍"} {currentStage.place}
                  </span>
                </div>

                {/* Scenario */}
                <p
                  className="f-body fs-5 mb-3"
                  style={{ lineHeight: 1.8 }}
                >
                  {currentStage.scenario}
                </p>

                {/* Question */}
                <p className="f-display fs-6 mb-3" style={{ color: virtue.color }}>
                  {currentStage.question}
                </p>

                {/* Options */}
                <div className="d-grid gap-2">
                  {shuffledOptions.map((option, i) => {
                    let btnStyle = {
                      border: `2px solid ${virtue.color}30`,
                      background: "#fff",
                      borderRadius: 12,
                      padding: "12px 16px",
                      textAlign: "start",
                      fontSize: "1rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    };

                    if (selectedOption !== null) {
                      if (i === correctMapped) {
                        btnStyle.background = "#d4edda";
                        btnStyle.border = "2px solid #28a745";
                      } else if (i === selectedOption && i !== correctMapped) {
                        btnStyle.background = "#fff3cd";
                        btnStyle.border = "2px solid #ffc107";
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        disabled={state !== BRIDGE_STATES.PLAYING}
                        className="d-flex align-items-center gap-2"
                        style={btnStyle}
                      >
                        <span
                          className="d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: virtue.color + "20",
                            color: virtue.color,
                            fontWeight: 700,
                            fontSize: "0.9rem",
                          }}
                        >
                          {String.fromCharCode(1571 + i)}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback overlay */}
              {state === BRIDGE_STATES.FEEDBACK && (
                <div
                  className="card border-0 p-4 text-center anim-fade-up"
                  style={{
                    borderRadius: 16,
                    background: "#d4edda",
                    border: "2px solid #28a745",
                  }}
                >
                  <div style={{ fontSize: "2.5rem" }} className="mb-2">
                    🎉
                  </div>
                  <p className="f-display fs-5 mb-2" style={{ color: "#155724" }}>
                    أحسنت يا {childName}!
                  </p>
                  <p className="f-body mb-3">{currentStage.feedback}</p>
                  <button
                    onClick={handleNext}
                    className="btn btn-lg text-white px-4"
                    style={{ background: "#28a745", border: "none", borderRadius: 12 }}
                  >
                    {currentIndex + 1 < totalStages ? "➡️ الموقف التالي" : "🏆 شوف النتيجة"}
                  </button>
                </div>
              )}

              {/* Retry overlay */}
              {state === BRIDGE_STATES.RETRY && (
                <div
                  className="card border-0 p-4 text-center anim-fade-up"
                  style={{
                    borderRadius: 16,
                    background: "#fff3cd",
                    border: "2px solid #ffc107",
                  }}
                >
                  <div style={{ fontSize: "2.5rem" }} className="mb-2">
                    🤔
                  </div>
                  <p className="f-display fs-5 mb-2" style={{ color: "#856404" }}>
                    حاول مرة ثانية!
                  </p>
                  <p className="f-body mb-3">
                    فكّر كويس يا {childName}.. أنت تقدر! 💪
                  </p>
                  <button
                    onClick={handleRetry}
                    className="btn btn-lg text-dark px-4"
                    style={{ background: "#ffc107", border: "none", borderRadius: 12 }}
                  >
                    🔄 أحاول مرة ثانية
                  </button>
                </div>
              )}
            </>
          )}

        {/* ══════ Completed Screen ══════ */}
        {state === BRIDGE_STATES.COMPLETED && (
          <div className="anim-fade-up text-center mt-4 pt-3">
            {/* Bridge complete visual */}
            <div
              className="card shadow border-0 p-4 mb-4"
              style={{ borderRadius: 20, background: "#fff" }}
            >
              <div style={{ fontSize: "4rem" }} className="mb-2">
                🌉
              </div>
              <h2 className="f-display display-6 mb-2" style={{ color: virtue.color }}>
                مبروك يا {childName}! 🎉
              </h2>
              <p className="f-body fs-5 mb-3">
                أكملت جسر المحبة بنجاح!
              </p>

              {/* Completed bridge */}
              <div
                className="mx-auto mb-3"
                style={{
                  height: 56,
                  width: "100%",
                  maxWidth: 400,
                  background: `linear-gradient(90deg, ${virtue.color}90, ${virtue.color})`,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 20px ${virtue.color}30`,
                }}
              >
                <span style={{ fontSize: "1.5rem", letterSpacing: 4 }}>
                  {Array.from({ length: 6 })
                    .map(() => virtue.bridgeEmoji)
                    .join(" ")}
                </span>
              </div>

              <div
                className="d-inline-block px-4 py-2 rounded-pill mb-3"
                style={{ background: virtue.colorLight, color: virtue.color }}
              >
                {virtue.icon} {virtue.name} — {totalStages}/{totalStages} مواقف
              </div>

              <p className="text-c-light">
                تعلمت قيمة {virtue.name} من خلال مواقف حقيقية. أنت بطل! 💪
              </p>
            </div>

            {/* Action buttons */}
            <div className="d-flex flex-column gap-2">
              <button
                onClick={() => setState(BRIDGE_STATES.CERTIFICATE)}
                className="btn btn-lg text-white px-4"
                style={{
                  background: `linear-gradient(135deg, #f39c12, #e67e22)`,
                  border: "none",
                  borderRadius: 14,
                  boxShadow: "0 4px 15px rgba(243,156,18,0.3)",
                }}
              >
                🏆 شهادة الإتمام
              </button>
              {childToken && (
                <button
                  onClick={() => navigate(`/child-play/${childToken}`)}
                  className="btn btn-lg text-white px-4"
                  style={{
                    background: `linear-gradient(135deg, ${virtue.color}, ${virtue.color}cc)`,
                    border: "none",
                    borderRadius: 14,
                  }}
                >
                  📚 اختر فضيلة أخرى
                </button>
              )}
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setBuiltPieces(0);
                  setSelectedOption(null);
                  setState(BRIDGE_STATES.WELCOME);
                }}
                className="btn btn-outline-secondary btn-lg"
                style={{ borderRadius: 14 }}
              >
                🔄 أعد اللعب
              </button>
            </div>
          </div>
        )}

        {/* ══════ Certificate Screen ══════ */}
        {state === BRIDGE_STATES.CERTIFICATE && (
          <div className="mt-4 pt-3">
            <CertificateScreen
              childName={childName}
              virtueTitle={virtue.name}
              virtueIcon={virtue.icon}
              virtueColor={virtue.color}
              totalStages={totalStages}
              onClose={() => setState(BRIDGE_STATES.COMPLETED)}
            />
          </div>
        )}
      </div>

      {/* Bridge piece drop animation */}
      <style>{`
        @keyframes bridgePieceDrop {
          0% { transform: translateY(-30px) scale(1.5); opacity: 0; }
          60% { transform: translateY(10px) scale(1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 0; }
        }
      `}</style>

      {/* Demo Limit Modal */}
      {demoLimitReached && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 9999 }}>
          <div className="card p-4 p-sm-5 text-center shadow-lg mx-3 anim-fade-up" style={{ maxWidth: 420 }}>
            <div style={{ fontSize: "3rem" }} className="mb-3">🌟</div>
            <h4 className="f-display fs-5 mb-2">عجبتك اللعبة؟</h4>
            <p className="f-body text-c-light mb-4">
              هذه نسخة تجريبية محدودة
              <br />اطلب النسخة الكاملة وافتح كل القيم والمواقف لطفلك!
            </p>
            <div className="d-flex flex-column gap-2">
              <button onClick={() => navigate("/order")} className="btn btn-primary rounded-pill px-4">اطلب النسخة الكاملة 📋</button>
              <a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("السلام عليكم، جربت اللعبة وأبغى أطلبها")}`}
                target="_blank" rel="noopener noreferrer" className="btn btn-success rounded-pill px-4">💬 تواصل معنا</a>
              <button onClick={() => navigate("/demo")} className="btn btn-outline-secondary btn-sm rounded-pill">رجوع للتجربة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
