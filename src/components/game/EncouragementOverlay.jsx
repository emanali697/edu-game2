export default function EncouragementOverlay({ feedback, onNext }) {
  if (!feedback) return null;
  return (
    <div className="anim-scale text-center mt-4">
      <div className="anim-bounce mb-2" style={{ fontSize: "3rem" }}>{feedback.emoji}</div>
      <p className="f-display fs-4 mb-2">{feedback.message}</p>
      {feedback.isCorrect && (
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <span className="fw-bold text-c-primary">+{feedback.pointsEarned} نقطة</span>
          {feedback.streakBonus && (
            <span className="anim-pop badge rounded-pill bg-warning bg-opacity-25 text-warning fw-bold small">
              🔥 مكافأة السلسلة!
            </span>
          )}
        </div>
      )}
      <button onClick={onNext} className="btn btn-primary btn-lg mt-2">
        السؤال التالي ←
      </button>
    </div>
  );
}
