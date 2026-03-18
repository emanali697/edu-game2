import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGameConfig } from "@context/GameContext";
import FORGIVENESS_ACTIONS, { TOTAL_FLOWERS } from "@data/forgiveness-game";
import { shuffleArray } from "@utils/helpers";
import { SUPPORT_WHATSAPP } from "@utils/constants";

const STATES = {
  WELCOME: "welcome",
  PLAYING: "playing",
  CORRECT: "correct",
  WRONG: "wrong",
  COMPLETED: "completed",
};

export default function ForgivenessGamePage() {
  const navigate = useNavigate();
  const { gameConfig } = useGameConfig();
  const { childName, childToken, isDemo, demoMaxQuestions } = gameConfig;

  const [state, setState] = useState(STATES.WELCOME);
  const [demoLimitReached, setDemoLimitReached] = useState(false);
  const [actions, setActions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collectedFlowers, setCollectedFlowers] = useState([]);
  const [currentAction, setCurrentAction] = useState(null);
  const [flowerAnim, setFlowerAnim] = useState(false);
  const [replayCount, setReplayCount] = useState(0);

  // Redirect if no config
  useEffect(() => {
    if (!childName) {
      navigate(childToken ? `/child-play/${childToken}` : "/");
    }
  }, [childName, childToken, navigate]);

  // Shuffle all actions on start and replay
  const shuffledActions = useMemo(() => shuffleArray([...FORGIVENESS_ACTIONS]), [replayCount]);

  useEffect(() => {
    setActions(shuffledActions);
  }, [shuffledActions]);

  const handleStart = () => {
    setState(STATES.PLAYING);
    setCurrentAction(shuffledActions[0]);
  };

  const handleSelect = (isForgivenessAction) => {
    if (state !== STATES.PLAYING || !currentAction) return;

    const answeredCorrectly =
      (currentAction.isCorrect && isForgivenessAction) ||
      (!currentAction.isCorrect && !isForgivenessAction);

    if (answeredCorrectly) {
      // Correct answer → add flower
      setCollectedFlowers((prev) => [...prev, currentAction.flower]);
      setFlowerAnim(true);
      setState(STATES.CORRECT);
      setTimeout(() => setFlowerAnim(false), 800);
    } else {
      // Wrong answer
      setState(STATES.WRONG);
    }
  };

  const handleNext = () => {
    // Demo limit check
    if (isDemo && currentIndex + 1 >= (demoMaxQuestions || 3)) {
      setDemoLimitReached(true);
      return;
    }
    // Check if garden is complete (all forgiveness actions found)
    if (collectedFlowers.length >= TOTAL_FLOWERS) {
      setState(STATES.COMPLETED);
      return;
    }
    const nextIdx = currentIndex + 1;
    if (nextIdx >= actions.length) {
      setState(STATES.COMPLETED);
    } else {
      setCurrentIndex(nextIdx);
      setCurrentAction(actions[nextIdx]);
      setState(STATES.PLAYING);
    }
  };

  const handleRetry = () => {
    setState(STATES.PLAYING);
  };

  const gardenProgress = (collectedFlowers.length / TOTAL_FLOWERS) * 100;

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center p-3 p-sm-4"
      style={{ background: "linear-gradient(180deg, #e8f5e9 0%, #f1f8e9 40%, #fff9c4 100%)" }}
    >
      <div className="w-100" style={{ maxWidth: 560 }}>
        {/* ══════ Welcome ══════ */}
        {state === STATES.WELCOME && (
          <div className="anim-fade-up text-center mt-5 pt-4">
            <div className="anim-float mb-3" style={{ fontSize: "5rem" }}>🌸</div>
            <h1 className="f-display display-6 mb-2">لعبة التسامح</h1>
            <div className="d-inline-block px-3 py-1 rounded-pill mb-3"
              style={{ background: "#e8f5e920", color: "#2e7d32" }}>
              🤝 التسامح والعفو
            </div>
            <p className="fs-5 text-c-light mb-1">مرحباً يا {childName}! 👋</p>
            <p className="text-c-light mb-2">
              ساعدنا نزرع حديقة التسامح! 🌷
            </p>
            <p className="text-c-light mb-4" style={{ fontSize: "0.9rem" }}>
              سنعرض عليك أفعال مختلفة — اختر الأفعال التي تدل على التسامح
              <br />
              كل فعل صحيح يزرع وردة في حديقتك! 🌺
            </p>
            <button
              onClick={handleStart}
              className="btn btn-lg px-5 py-3 fw-bold text-white"
              style={{
                background: "linear-gradient(135deg, #43a047, #66bb6a)",
                border: "none",
                borderRadius: 16,
                fontSize: "1.2rem",
                boxShadow: "0 4px 20px rgba(67,160,71,0.3)",
              }}
            >
              🌱 ابدأ الزراعة!
            </button>
          </div>
        )}

        {/* ══════ Playing / Correct / Wrong ══════ */}
        {(state === STATES.PLAYING || state === STATES.CORRECT || state === STATES.WRONG) && currentAction && (
          <>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: "1.5rem" }}>🌸</span>
                <span className="f-display fs-6" style={{ color: "#2e7d32" }}>لعبة التسامح</span>
              </div>
              <div className="text-c-light f-body small">
                {currentIndex + 1} / {actions.length}
              </div>
            </div>

            {/* Garden Visual */}
            <div className="card shadow-sm border-0 p-3 mb-3" style={{ borderRadius: 16 }}>
              <div className="text-center mb-2">
                <small className="text-c-light">🌷 حديقة التسامح</small>
              </div>
              {/* Flower grid */}
              <div className="d-flex flex-wrap justify-content-center gap-1 mb-2" style={{ minHeight: 48 }}>
                {Array.from({ length: TOTAL_FLOWERS }).map((_, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 40,
                      height: 40,
                      background: collectedFlowers[i] ? "#e8f5e9" : "#f5f5f5",
                      border: `2px solid ${collectedFlowers[i] ? "#43a047" : "#e0e0e0"}`,
                      fontSize: collectedFlowers[i] ? "1.3rem" : "0.8rem",
                      transition: "all 0.3s",
                    }}
                  >
                    {collectedFlowers[i] || ""}
                  </div>
                ))}
              </div>
              {/* Flower animation */}
              {flowerAnim && (
                <div className="text-center" style={{ fontSize: "2rem", animation: "flowerGrow 0.6s ease-out" }}>
                  {currentAction.flower}
                </div>
              )}
              <div className="text-center mt-1">
                <small style={{ color: "#2e7d32", fontWeight: 600 }}>
                  {collectedFlowers.length} / {TOTAL_FLOWERS} وردة
                </small>
              </div>
              {/* Progress bar */}
              <div className="mt-2" style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
                <div style={{
                  height: "100%",
                  width: `${gardenProgress}%`,
                  background: "linear-gradient(90deg, #66bb6a, #43a047)",
                  borderRadius: 3,
                  transition: "width 0.5s ease-out",
                }} />
              </div>
            </div>

            {/* Action Card */}
            <div className="card shadow-sm border-0 p-4 mb-3" style={{ borderRadius: 16 }}>
              <div className="text-center mb-3">
                <span className="px-3 py-1 rounded-pill"
                  style={{ background: "#e8f5e9", color: "#2e7d32", fontSize: "0.85rem", fontWeight: 600 }}>
                  🤔 هل هذا الفعل يدل على التسامح؟
                </span>
              </div>

              <p className="f-body fs-5 text-center mb-4" style={{ lineHeight: 1.8 }}>
                "{currentAction.text}"
              </p>

              {/* Two buttons: Yes / No */}
              {state === STATES.PLAYING && (
                <div className="d-flex gap-3">
                  <button
                    onClick={() => handleSelect(true)}
                    className="btn btn-lg flex-fill py-3"
                    style={{
                      background: "#e8f5e9",
                      border: "2px solid #43a047",
                      borderRadius: 14,
                      color: "#2e7d32",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  >
                    ✅ نعم، تسامح
                  </button>
                  <button
                    onClick={() => handleSelect(false)}
                    className="btn btn-lg flex-fill py-3"
                    style={{
                      background: "#fff3e0",
                      border: "2px solid #ff9800",
                      borderRadius: 14,
                      color: "#e65100",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  >
                    ❌ لا، ليس تسامح
                  </button>
                </div>
              )}
            </div>

            {/* Correct feedback */}
            {state === STATES.CORRECT && (
              <div className="card border-0 p-4 text-center anim-fade-up"
                style={{ borderRadius: 16, background: "#d4edda", border: "2px solid #28a745" }}>
                <div style={{ fontSize: "2.5rem" }} className="mb-2">🎉</div>
                <p className="f-display fs-5 mb-2" style={{ color: "#155724" }}>
                  أحسنت يا {childName}!
                </p>
                <p className="f-body mb-3">
                  {currentAction.isCorrect ? currentAction.feedback : `صحيح! هذا الفعل لا يدل على التسامح. ${currentAction.correction}`}
                </p>
                <p className="f-body mb-3" style={{ fontSize: "1.5rem" }}>
                  {currentAction.flower} وردة جديدة في حديقتك!
                </p>
                <button onClick={handleNext}
                  className="btn btn-lg text-white px-4"
                  style={{ background: "#28a745", border: "none", borderRadius: 12 }}>
                  {collectedFlowers.length >= TOTAL_FLOWERS ? "🏆 شوف الحديقة!" : "➡️ الفعل التالي"}
                </button>
              </div>
            )}

            {/* Wrong feedback — positive correction */}
            {state === STATES.WRONG && (
              <div className="card border-0 p-4 text-center anim-fade-up"
                style={{ borderRadius: 16, background: "#fff3cd", border: "2px solid #ffc107" }}>
                <div style={{ fontSize: "2.5rem" }} className="mb-2">💭</div>
                <p className="f-display fs-5 mb-2" style={{ color: "#856404" }}>
                  فكّر مرة ثانية يا {childName}
                </p>
                <p className="f-body mb-3">
                  {currentAction.isCorrect
                    ? `هذا الفعل يدل على التسامح فعلاً! ${currentAction.feedback}`
                    : currentAction.correction}
                </p>
                <button onClick={handleRetry}
                  className="btn btn-lg text-dark px-4"
                  style={{ background: "#ffc107", border: "none", borderRadius: 12 }}>
                  🔄 أحاول مرة ثانية
                </button>
              </div>
            )}
          </>
        )}

        {/* ══════ Completed ══════ */}
        {state === STATES.COMPLETED && (
          <div className="anim-fade-up text-center mt-4 pt-3">
            <div className="card shadow border-0 p-4 mb-4" style={{ borderRadius: 20 }}>
              <div style={{ fontSize: "4rem" }} className="mb-2">🌸</div>
              <h2 className="f-display display-6 mb-2" style={{ color: "#2e7d32" }}>
                مبروك يا {childName}! 🎉
              </h2>
              <p className="f-body fs-5 mb-3">أكملت حديقة التسامح!</p>

              {/* Completed garden */}
              <div className="d-flex flex-wrap justify-content-center gap-2 mb-3 p-3 rounded-4"
                style={{ background: "#e8f5e9" }}>
                {collectedFlowers.map((flower, i) => (
                  <span key={i} style={{ fontSize: "2rem", animation: `flowerGrow 0.3s ease-out ${i * 0.1}s both` }}>
                    {flower}
                  </span>
                ))}
              </div>

              <div className="d-inline-block px-4 py-2 rounded-pill mb-3"
                style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                🤝 التسامح والعفو — {collectedFlowers.length} وردة
              </div>

              <p className="text-c-light">
                تعلمت قيمة التسامح والعفو. أنت إنسان رائع! 💚
              </p>
            </div>

            <div className="d-flex flex-column gap-2">
              {childToken && (
                <button onClick={() => navigate(`/child-play/${childToken}`)}
                  className="btn btn-lg text-white px-4"
                  style={{ background: "linear-gradient(135deg, #43a047, #66bb6a)", border: "none", borderRadius: 14 }}>
                  📚 اختر فضيلة أخرى
                </button>
              )}
              <button onClick={() => {
                setReplayCount((c) => c + 1);
                setCurrentIndex(0);
                setCollectedFlowers([]);
                setState(STATES.WELCOME);
              }}
                className="btn btn-outline-secondary btn-lg" style={{ borderRadius: 14 }}>
                🔄 أعد اللعب
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes flowerGrow {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>

      {/* Demo Limit Modal */}
      {demoLimitReached && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 9999 }}>
          <div className="card p-4 p-sm-5 text-center shadow-lg mx-3 anim-fade-up" style={{ maxWidth: 420 }}>
            <div style={{ fontSize: "3rem" }} className="mb-3">🌸</div>
            <h4 className="f-display fs-5 mb-2">عجبتك اللعبة؟</h4>
            <p className="f-body text-c-light mb-4">
              هذه نسخة تجريبية محدودة
              <br />اطلب النسخة الكاملة وافتح كل الألعاب لطفلك!
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
