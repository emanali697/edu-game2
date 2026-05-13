import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameConfig } from "@context/GameContext";
import { useGame, GAME_STATUS } from "@hooks/useGame";
import SUBJECTS from "@data/config/subjects";
import GameHeader from "@components/game/GameHeader";
import QuestionCard from "@components/game/QuestionCard";
import OptionsGrid from "@components/game/OptionsGrid";
import EncouragementOverlay from "@components/game/EncouragementOverlay";
import ResultScreen from "@components/game/ResultScreen";
import { QUESTIONS_PER_GAME, SUPPORT_WHATSAPP } from "@utils/constants";

export default function GamePlayPage() {
  const navigate = useNavigate();
  const { gameConfig } = useGameConfig();
  const { childName, subject, grade, level, childId, childToken, isDemo, demoMaxQuestions } = gameConfig;
  const [demoLimitReached, setDemoLimitReached] = useState(false);

  useEffect(() => {
    if (!childName || !subject || !grade) navigate("/setup");
  }, [childName, subject, grade, navigate]);

  const {
    gameState, feedback, results,
    isPlaying, isAnswered, isFinished, isIdle,
    startGame, submitAnswer, goNext, restartGame,
  } = useGame({ subject, grade,
     level, childName, 
     childId,  
     questionCount: QUESTIONS_PER_GAME });

  const sub = SUBJECTS[subject];
  if (!gameState || !sub) return null;

  const handleGoNext = () => {
    if (isDemo && gameState.currentIndex + 1 >= (demoMaxQuestions || 2)) {
      setDemoLimitReached(true);
      return;
    }
    goNext();
  };

  return (
    <div
      className={`theme-${subject} min-vh-100 d-flex flex-column align-items-center p-3 p-sm-4`}
      style={{ background: `linear-gradient(180deg, ${sub.colorLight} 0%, var(--c-bg) 40%)` }}
    >
      <div className="w-100 game-area" style={{ maxWidth: 560 }}>

        {/* === Welcome === */}
        {isIdle && (
          <div className="anim-fade-up text-center mt-5 pt-5">
            <div className="anim-float mb-3" style={{ fontSize: "4.5rem" }}>{sub.icon}</div>
            <h1 className="f-display display-6 mb-2">مرحباً يا {childName}! 👋</h1>
            <p className="fs-5 text-c-light mb-1">{sub.name}</p>
            <p className="text-c-light mb-5">{gameState.totalQuestions} سؤال بانتظارك. جاهز؟</p>
            <button onClick={startGame} className="btn btn-subject btn-xl anim-glow">
              🎮 ابدأ اللعب!
            </button>
          </div>
        )}

        {/* === Playing / Answered === */}
        {(isPlaying || isAnswered) && (
          <>
            <GameHeader
              childName={childName}
              score={gameState.score}
              currentIndex={gameState.currentIndex}
              totalQuestions={gameState.totalQuestions}
              streak={gameState.streak}
              subjectIcon={sub.icon}
              subjectColor={sub.color}
            />
            <div className="card shadow-sm border-c p-4 p-sm-5">
              <QuestionCard question={gameState.currentQuestion} />
              <OptionsGrid
                options={gameState.currentQuestion?.options || []}
                onSelect={submitAnswer}
                disabled={isAnswered}
                feedback={feedback}
              />
              {isAnswered && feedback && (
                <EncouragementOverlay feedback={feedback} onNext={handleGoNext} />
              )}
            </div>
          </>
        )}

        {/* === Results === */}
        {isFinished && results && (
          <ResultScreen
            results={results}
            onReplay={restartGame}
            onHome={() => navigate(childToken ? `/child-play/?t=${childToken}` : "/setup")}
            showChooseSubject={!!childToken}
            onChooseSubject={() => navigate(`/child-play/?t=${childToken}`)}
          />
        )}

        {/* === Demo Limit === */}
        {demoLimitReached && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(0,0,0,0.6)", zIndex: 9999 }}>
            <div className="card p-4 p-sm-5 text-center shadow-lg mx-3 anim-fade-up" style={{ maxWidth: 420 }}>
              <div style={{ fontSize: "3rem" }} className="mb-3">🌟</div>
              <h4 className="f-display fs-5 mb-2">عجبتك اللعبة؟</h4>
              <p className="f-body text-c-light mb-4">
                هذه نسخة تجريبية محدودة
                <br />اطلب النسخة الكاملة وافتح كل المواد والأسئلة لطفلك!
              </p>
              <div className="d-flex flex-column gap-2">
                <button onClick={() => navigate("/order")} className="btn btn-primary rounded-pill px-4">
                  اطلب النسخة الكاملة 📋
                </button>
                <a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("السلام عليكم، جربت اللعبة وأبغى أطلبها")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-success rounded-pill px-4">
                  💬 تواصل معنا
                </a>
                <button onClick={() => navigate("/demo")} className="btn btn-outline-secondary btn-sm rounded-pill">
                  رجوع للتجربة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
