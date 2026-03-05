import { buildWhatsAppShareURL } from "@utils/helpers";
import { APP_NAME, WEBSITE_URL } from "@utils/constants";
import SUBJECTS from "@data/config/subjects";

export default function ResultScreen({ results, onReplay, onHome, showChooseSubject, onChooseSubject }) {
  if (!results) return null;

  const subject = SUBJECTS[results.subject];
  const shareText = `🎉 ${results.childName} حقق نتيجة ${results.percentage}% في ${subject?.name}!\n⭐ النقاط: ${results.score}\n✅ إجابات صحيحة: ${results.correctCount} من ${results.totalQuestions}\n🔥 أطول سلسلة: ${results.maxStreak}\n\nجرّب ${APP_NAME} لطفلك:\n${WEBSITE_URL}`;
  const whatsappURL = buildWhatsAppShareURL(shareText);
  const perfEmoji = { perfect: "🏆", good: "🌟", okay: "💪", keepGoing: "🌱" };

  return (
    <div className="anim-fade-up text-center py-4" style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Big emoji */}
      <div className="anim-pop mb-3" style={{ fontSize: "4.5rem" }}>
        {perfEmoji[results.performanceLevel] || "⭐"}
      </div>

      {/* Encouragement */}
      <h2 className="f-display fs-3 mb-4">{results.encouragement?.text}</h2>

      {/* Score card */}
      <div className="card shadow-sm border-c p-4 mb-4">
        {/* Percentage circle */}
        <div className="mx-auto mb-3" style={{ width: 110, height: 110, position: "relative" }}>
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--c-border)" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={results.percentage >= 70 ? "var(--c-correct)" : "var(--c-star)"}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${results.percentage * 2.64} 264`}
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          </svg>
          <div className="position-absolute top-50 start-50 translate-middle">
            <span className="f-display fs-2">{results.percentage}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="row text-center g-2 mb-3">
          <div className="col-4">
            <div className="f-display fs-4 text-c-correct">{results.correctCount}</div>
            <small className="text-c-light">صحيحة ✅</small>
          </div>
          <div className="col-4">
            <div className="f-display fs-4 text-c-wrong">{results.wrongCount}</div>
            <small className="text-c-light">خاطئة ❌</small>
          </div>
          <div className="col-4">
            <div className="f-display fs-4" style={{ color: "#e67e22" }}>{results.maxStreak}</div>
            <small className="text-c-light">أطول سلسلة 🔥</small>
          </div>
        </div>

        <hr className="border-c" />
        <span className="f-display text-c-primary">⭐ مجموع النقاط: {results.score}</span>
      </div>

      {/* Actions */}
      <div className="d-grid gap-2">
        <a href={whatsappURL} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-lg">
          📤 شارك النتيجة على واتساب
        </a>
        <button onClick={onReplay} className="btn btn-primary btn-lg">
          🔄 العب مرة ثانية
        </button>
        {showChooseSubject && (
          <button onClick={onChooseSubject} className="btn btn-outline-primary btn-lg">
            📚 اختر مادة أخرى
          </button>
        )}
        <button onClick={onHome} className="btn btn-ghost">
          🏠 {showChooseSubject ? "الصفحة الرئيسية" : "الرئيسية"}
        </button>
      </div>
    </div>
  );
}
