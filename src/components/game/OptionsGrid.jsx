import { useState, useEffect } from "react";

export default function OptionsGrid({ options, onSelect, disabled, feedback }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => { setSelectedIndex(null); }, [options]);

  function handleClick(index) {
    if (disabled || selectedIndex !== null) return;
    setSelectedIndex(index);
    onSelect(index);
  }

  function getClass(index) {
    let cls = "option-btn";
    if (feedback === null) return cls;

    const isCorrect = index === feedback.correctIndex;
    const isSelected = index === selectedIndex;

    if (isCorrect) cls += " correct";
    else if (isSelected && !feedback.isCorrect) cls += " wrong";
    else cls += " dimmed answered";

    return cls;
  }

  function getIcon(index) {
    if (feedback === null) return null;
    if (index === feedback.correctIndex) return "✅";
    if (index === selectedIndex && !feedback.isCorrect) return "❌";
    return null;
  }

  return (
    <div className="row g-3">
      {options.map((option, index) => (
        <div key={`${option}-${index}`} className={`col-12 col-sm-6 anim-fade-up delay-${index + 1}`}>
          <button
            onClick={() => handleClick(index)}
            disabled={disabled || feedback !== null}
            className={getClass(index)}
          >
            {option}
            {getIcon(index) && (
              <span className="anim-pop ms-2" style={{ fontSize: "1.2rem" }}>{getIcon(index)}</span>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
