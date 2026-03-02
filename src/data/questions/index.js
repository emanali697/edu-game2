/**
 * ===== Question Registry =====
 * 4 subjects × 9 grades = 36 question sets
 */

// Math
import MATH_KG1 from "./math_kg1";
import MATH_KG2 from "./math_kg2";
import MATH_KG3 from "./math_kg3";
import MATH_FIRST from "./math_first";
import MATH_SECOND from "./math_second";
import MATH_THIRD from "./math_third";
import MATH_FOURTH from "./math_fourth";
import MATH_FIFTH from "./math_fifth";
import MATH_SIXTH from "./math_sixth";

// Arabic
import ARABIC_KG1 from "./arabic_kg1";
import ARABIC_KG2 from "./arabic_kg2";
import ARABIC_KG3 from "./arabic_kg3";
import ARABIC_FIRST from "./arabic_first";
import ARABIC_SECOND from "./arabic_second";
import ARABIC_THIRD from "./arabic_third";
import ARABIC_FOURTH from "./arabic_fourth";
import ARABIC_FIFTH from "./arabic_fifth";
import ARABIC_SIXTH from "./arabic_sixth";

// English
import ENGLISH_KG1 from "./english_kg1";
import ENGLISH_KG2 from "./english_kg2";
import ENGLISH_KG3 from "./english_kg3";
import ENGLISH_FIRST from "./english_first";
import ENGLISH_SECOND from "./english_second";
import ENGLISH_THIRD from "./english_third";
import ENGLISH_FOURTH from "./english_fourth";
import ENGLISH_FIFTH from "./english_fifth";
import ENGLISH_SIXTH from "./english_sixth";

// Science
import SCIENCE_KG1 from "./science_kg1";
import SCIENCE_KG2 from "./science_kg2";
import SCIENCE_KG3 from "./science_kg3";
import SCIENCE_FIRST from "./science_first";
import SCIENCE_SECOND from "./science_second";
import SCIENCE_THIRD from "./science_third";
import SCIENCE_FOURTH from "./science_fourth";
import SCIENCE_FIFTH from "./science_fifth";
import SCIENCE_SIXTH from "./science_sixth";

const QUESTION_REGISTRY = {
  // Math (9)
  math_kg1_standard: MATH_KG1,
  math_kg2_standard: MATH_KG2,
  math_kg3_standard: MATH_KG3,
  math_first_standard: MATH_FIRST,
  math_second_standard: MATH_SECOND,
  math_third_standard: MATH_THIRD,
  math_fourth_standard: MATH_FOURTH,
  math_fifth_standard: MATH_FIFTH,
  math_sixth_standard: MATH_SIXTH,

  // Arabic (9)
  arabic_kg1_standard: ARABIC_KG1,
  arabic_kg2_standard: ARABIC_KG2,
  arabic_kg3_standard: ARABIC_KG3,
  arabic_first_standard: ARABIC_FIRST,
  arabic_second_standard: ARABIC_SECOND,
  arabic_third_standard: ARABIC_THIRD,
  arabic_fourth_standard: ARABIC_FOURTH,
  arabic_fifth_standard: ARABIC_FIFTH,
  arabic_sixth_standard: ARABIC_SIXTH,

  // English (9)
  english_kg1_standard: ENGLISH_KG1,
  english_kg2_standard: ENGLISH_KG2,
  english_kg3_standard: ENGLISH_KG3,
  english_first_standard: ENGLISH_FIRST,
  english_second_standard: ENGLISH_SECOND,
  english_third_standard: ENGLISH_THIRD,
  english_fourth_standard: ENGLISH_FOURTH,
  english_fifth_standard: ENGLISH_FIFTH,
  english_sixth_standard: ENGLISH_SIXTH,

  // Science (9)
  science_kg1_standard: SCIENCE_KG1,
  science_kg2_standard: SCIENCE_KG2,
  science_kg3_standard: SCIENCE_KG3,
  science_first_standard: SCIENCE_FIRST,
  science_second_standard: SCIENCE_SECOND,
  science_third_standard: SCIENCE_THIRD,
  science_fourth_standard: SCIENCE_FOURTH,
  science_fifth_standard: SCIENCE_FIFTH,
  science_sixth_standard: SCIENCE_SIXTH,
};

export function getQuestionSet(subject, grade, level = "standard") {
  const key = `${subject}_${grade}_${level}`;
  return QUESTION_REGISTRY[key] || null;
}

export function hasQuestionSet(subject, grade, level = "standard") {
  const key = `${subject}_${grade}_${level}`;
  return key in QUESTION_REGISTRY;
}

export function getAvailableSets() {
  return Object.keys(QUESTION_REGISTRY).map((key) => {
    const [subject, grade, level] = key.split("_");
    return { key, subject, grade, level };
  });
}

export default QUESTION_REGISTRY;
