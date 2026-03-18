import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGameConfig } from "@context/GameContext";
import MEMORY_CARDS, { PAIRS_PER_GAME } from "@data/memory-game";
import VIRTUES from "@data/config/virtues";
import { shuffleArray } from "@utils/helpers";
import { SUPPORT_WHATSAPP } from "@utils/constants";

const STATES = { WELCOME: "welcome", PLAYING: "playing", COMPLETED: "completed" };

export default function MemoryGamePage() {
  const navigate = useNavigate();
  const { gameConfig } = useGameConfig();
  const { childName, childToken, virtueId, isDemo, demoMaxQuestions } = gameConfig;

  const virtue = VIRTUES[virtueId];
  const pairs = MEMORY_CARDS[virtueId] || [];

  const [state, setState] = useState(STATES.WELCOME);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null);
  const [demoLimitReached, setDemoLimitReached] = useState(false);

  useEffect(() => {
    if (!childName) navigate(childToken ? `/child-play/${childToken}` : "/");
  }, [childName, childToken, navigate]);

  // Build card deck: each pair becomes 2 cards (A side and B side)
  const deck = useMemo(() => {
    if (!pairs.length) return [];
    const cardList = [];
    pairs.forEach((pair) => {
      cardList.push({ uid: `${pair.id}-a`, pairId: pair.id, emoji: pair.emoji, text: pair.text, feedback: pair.feedback });
      cardList.push({ uid: `${pair.id}-b`, pairId: pair.id, emoji: pair.emoji, text: pair.text, feedback: pair.feedback });
    });
    return shuffleArray(cardList);
  }, [virtueId]);

  const handleStart = () => {
    // Reshuffle deck on each start/replay
    const newDeck = shuffleArray([...deck.map(c => ({...c}))]);
    setCards(newDeck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setState(STATES.PLAYING);
  };

  const handleCardClick = (index) => {
    if (flipped.length >= 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index].pairId)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].pairId === cards[second].pairId && first !== second) {
        // Match!
        const newMatched = [...matched, cards[first].pairId];
        setMatched(newMatched);
        setShowFeedback(cards[first].feedback);
        setTimeout(() => {
          setFlipped([]);
          setShowFeedback(null);
          // Demo limit check
          if (isDemo && newMatched.length >= (demoMaxQuestions || 2)) {
            setDemoLimitReached(true);
            return;
          }
          if (newMatched.length >= PAIRS_PER_GAME) {
            setState(STATES.COMPLETED);
          }
        }, 1500);
      } else {
        // No match
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  if (!virtue || !pairs.length) return null;

  const virtueName = virtue.name;
  const virtueColor = virtue.color;

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center p-3 p-sm-4"
      style={{ background: "linear-gradient(180deg, #e3f2fd 0%, #f3e5f5 50%, #fff 100%)" }}>
      <div className="w-100" style={{ maxWidth: 560 }}>

        {/* Welcome */}
        {state === STATES.WELCOME && (
          <div className="anim-fade-up text-center mt-5 pt-4">
            <div className="anim-float mb-3" style={{ fontSize: "5rem" }}>🃏</div>
            <h1 className="f-display display-6 mb-2">تطابق الصور</h1>
            <div className="d-inline-block px-3 py-1 rounded-pill mb-3"
              style={{ background: virtue.colorLight, color: virtueColor }}>
              {virtue.icon} {virtueName}
            </div>
            <p className="fs-5 text-c-light mb-1">مرحباً يا {childName}! 👋</p>
            <p className="text-c-light mb-2">اقلب الكروت وابحث عن الأزواج المتشابهة!</p>
            <p className="text-c-light mb-4" style={{ fontSize: "0.9rem" }}>
              كل زوج متطابق يعلّمك شيء جديد عن {virtueName} 🌟
            </p>
            <button onClick={handleStart} className="btn btn-lg px-5 py-3 fw-bold text-white"
              style={{ background: `linear-gradient(135deg, ${virtueColor}, ${virtueColor}cc)`, border: "none", borderRadius: 16, fontSize: "1.2rem", boxShadow: `0 4px 20px ${virtueColor}40` }}>
              🃏 ابدأ اللعب!
            </button>
          </div>
        )}

        {/* Playing */}
        {state === STATES.PLAYING && (
          <>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: "1.5rem" }}>🃏</span>
                <span className="f-display fs-6" style={{ color: virtueColor }}>تطابق — {virtueName}</span>
              </div>
              <div className="d-flex gap-3">
                <span className="f-body small text-c-light">🎯 {matched.length}/{PAIRS_PER_GAME}</span>
                <span className="f-body small text-c-light">🔄 {moves}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-3" style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
              <div style={{ height: "100%", width: `${(matched.length / PAIRS_PER_GAME) * 100}%`, background: `linear-gradient(90deg, ${virtueColor}, ${virtueColor}cc)`, borderRadius: 3, transition: "width 0.5s ease-out" }} />
            </div>

            {/* Card Grid */}
            <div className="row g-2">
              {cards.map((card, index) => {
                const isFlipped = flipped.includes(index);
                const isMatched = matched.includes(card.pairId);
                return (
                  <div key={card.uid} className="col-4 col-sm-3">
                    <div
                      onClick={() => !isMatched && handleCardClick(index)}
                      className="d-flex flex-column align-items-center justify-content-center rounded-3 position-relative"
                      style={{
                        height: 100,
                        cursor: isMatched ? "default" : "pointer",
                        background: isMatched ? "#e8f5e9" : isFlipped ? "#fff" : `linear-gradient(135deg, ${virtueColor}20, ${virtueColor}40)`,
                        border: `2px solid ${isMatched ? "#43a047" : isFlipped ? virtueColor : "#e0e0e0"}`,
                        transition: "all 0.3s",
                        transform: isFlipped && !isMatched ? "scale(1.05)" : "",
                        opacity: isMatched ? 0.7 : 1,
                      }}>
                      {isFlipped || isMatched ? (
                        <>
                          <span style={{ fontSize: "1.8rem" }}>{card.emoji}</span>
                          <small className="f-body text-center mt-1" style={{ fontSize: "0.65rem", color: virtueColor, lineHeight: 1.2 }}>{card.text}</small>
                        </>
                      ) : (
                        <span style={{ fontSize: "2rem" }}>❓</span>
                      )}
                      {isMatched && (
                        <div className="position-absolute" style={{ top: 4, right: 4 }}>
                          <span style={{ fontSize: "0.8rem" }}>✅</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Match Feedback */}
            {showFeedback && (
              <div className="card border-0 p-3 mt-3 text-center anim-fade-up" style={{ borderRadius: 12, background: "#d4edda" }}>
                <p className="f-display small mb-0" style={{ color: "#155724" }}>🎉 تطابق! {showFeedback}</p>
              </div>
            )}
          </>
        )}

        {/* Completed */}
        {state === STATES.COMPLETED && (
          <div className="anim-fade-up text-center mt-4 pt-3">
            <div className="card shadow border-0 p-4 mb-4" style={{ borderRadius: 20 }}>
              <div style={{ fontSize: "4rem" }} className="mb-2">🏆</div>
              <h2 className="f-display display-6 mb-2" style={{ color: virtueColor }}>مبروك يا {childName}! 🎉</h2>
              <p className="f-body fs-5 mb-3">أكملت تطابق {virtueName}!</p>
              <div className="d-inline-block px-4 py-2 rounded-pill mb-3" style={{ background: virtue.colorLight, color: virtueColor }}>
                {virtue.icon} {virtueName} — {moves} محاولة
              </div>
              <p className="text-c-light">
                {moves <= PAIRS_PER_GAME + 2 ? "ذاكرتك قوية جداً! 🧠" : moves <= PAIRS_PER_GAME * 2 ? "أداء رائع! 👏" : "أحسنت! حاول مرة ثانية لتحسين النتيجة 💪"}
              </p>
            </div>
            <div className="d-flex flex-column gap-2">
              {childToken && childToken !== "demo" && (
                <button onClick={() => navigate(`/child-play/${childToken}`)} className="btn btn-lg text-white px-4"
                  style={{ background: `linear-gradient(135deg, ${virtueColor}, ${virtueColor}cc)`, border: "none", borderRadius: 14 }}>
                  📚 اختر لعبة أخرى
                </button>
              )}
              <button onClick={handleStart} className="btn btn-outline-secondary btn-lg" style={{ borderRadius: 14 }}>🔄 أعد اللعب</button>
            </div>
          </div>
        )}
      </div>

      {/* Demo Limit */}
      {demoLimitReached && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.6)", zIndex: 9999 }}>
          <div className="card p-4 p-sm-5 text-center shadow-lg mx-3 anim-fade-up" style={{ maxWidth: 420 }}>
            <div style={{ fontSize: "3rem" }} className="mb-3">🃏</div>
            <h4 className="f-display fs-5 mb-2">عجبتك اللعبة؟</h4>
            <p className="f-body text-c-light mb-4">هذه نسخة تجريبية محدودة<br />اطلب النسخة الكاملة وافتح كل الألعاب لطفلك!</p>
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
