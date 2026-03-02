export default function QuestionCard({ question }) {
  if (!question) return null;
  return (
    <div className="anim-fade-up text-center mb-4">
      {question.visual && (
        <div className="anim-float mb-3" style={{ fontSize: "2.75rem" }}>
          {question.visual}
        </div>
      )}
      <h2 className="f-display fs-3 lh-base">{question.text}</h2>
    </div>
  );
}
