export default function ProgressBar({ value = 0, max = 100, color = "var(--c-primary)", label = "", showPct = false }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="w-100">
      {(label || showPct) && (
        <div className="d-flex justify-content-between mb-1 f-body small text-c-light">
          {label && <span>{label}</span>}
          {showPct && <span>{pct}%</span>}
        </div>
      )}
      <div className="game-progress">
        <div className="fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
