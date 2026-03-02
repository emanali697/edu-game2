import ProgressBar from "@components/common/ProgressBar";

export default function GameHeader({ childName, score, currentIndex, totalQuestions, streak, subjectIcon, subjectColor }) {
  return (
    <div className="mb-4">
      {/* Top row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: "1.5rem" }}>{subjectIcon}</span>
          <span className="f-display fs-5">{childName}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          {streak >= 2 && (
            <span className="anim-bounce badge rounded-pill bg-warning bg-opacity-25 text-warning fw-bold px-3 py-1" style={{ fontSize: "0.85rem" }}>
              🔥 {streak}
            </span>
          )}
          <span className="f-display badge rounded-pill px-3 py-2" style={{ background: "rgba(108,92,231,0.12)", color: "var(--c-primary-dark)", fontSize: "0.95rem" }}>
            ⭐ {score}
          </span>
        </div>
      </div>
      {/* Progress */}
      <div className="d-flex align-items-center gap-3">
        <div className="flex-grow-1">
          <ProgressBar value={currentIndex} max={totalQuestions} color={subjectColor} />
        </div>
        <span className="f-body small text-c-light text-nowrap">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>
    </div>
  );
}
