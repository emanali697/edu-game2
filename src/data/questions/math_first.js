/**
 * الرياضيات - الصف الأول
 * المستوى: وسط (standard)
 *
 * Format: Each question must have: id, text, options[], correctIndex, difficulty (1-3)
 * Optional: visual, explanation
 */
const MATH_FIRST = {
  meta: {
    subject: "math",
    grade: "first",
    level: "standard",
    totalQuestions: 10,
  },
  questions: [
    {
      id: "m1_q01",
      text: "كم يساوي 2 + 3؟",
      visual: "🍎🍎 + 🍎🍎🍎",
      options: ["4", "5", "6", "3"],
      correctIndex: 1,
      difficulty: 1,
      explanation: "نجمع ٢ تفاحات مع ٣ تفاحات = ٥ تفاحات",
    },
    {
      id: "m1_q02",
      text: "كم يساوي 1 + 4؟",
      visual: "🌟 + 🌟🌟🌟🌟",
      options: ["3", "4", "5", "6"],
      correctIndex: 2,
      difficulty: 1,
    },
    {
      id: "m1_q03",
      text: "أي رقم يأتي بعد 7؟",
      visual: "7 ← ؟",
      options: ["6", "9", "8", "5"],
      correctIndex: 2,
      difficulty: 1,
    },
    {
      id: "m1_q04",
      text: "كم يساوي 6 - 2؟",
      visual: "🍎🍎🍎🍎🍎🍎 ✂️ 🍎🍎",
      options: ["3", "5", "4", "2"],
      correctIndex: 2,
      difficulty: 2,
    },
    {
      id: "m1_q05",
      text: "أي شكل هذا؟ ⬜",
      options: ["دائرة", "مثلث", "مربع", "مستطيل"],
      correctIndex: 2,
      difficulty: 1,
    },
    {
      id: "m1_q06",
      text: "كم يساوي 3 + 3؟",
      visual: "🐱🐱🐱 + 🐱🐱🐱",
      options: ["5", "6", "7", "9"],
      correctIndex: 1,
      difficulty: 1,
    },
    {
      id: "m1_q07",
      text: "رتّب من الأصغر: 5, 2, 8",
      options: ["8, 5, 2", "2, 5, 8", "5, 2, 8", "2, 8, 5"],
      correctIndex: 1,
      difficulty: 2,
    },
    {
      id: "m1_q08",
      text: "كم يساوي 7 + 2؟",
      visual: "🌙🌙🌙🌙🌙🌙🌙 + 🌙🌙",
      options: ["8", "10", "9", "7"],
      correctIndex: 2,
      difficulty: 1,
    },
    {
      id: "m1_q09",
      text: "أيهم أكبر؟",
      options: ["3", "9", "5", "7"],
      correctIndex: 1,
      difficulty: 1,
    },
    {
      id: "m1_q10",
      text: "كم يساوي 10 - 5؟",
      visual: "🔟 - 5️⃣",
      options: ["4", "6", "3", "5"],
      correctIndex: 3,
      difficulty: 2,
    },
  ],
};

export default MATH_FIRST;
