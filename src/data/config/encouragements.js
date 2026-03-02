/**
 * Encouragement messages organized by trigger type
 * {name} placeholder is replaced with child's name at runtime
 *
 * To add new messages: just append to the relevant array
 * To add new categories: add a new key
 */
const ENCOURAGEMENTS = {
  // === Answer-level messages ===

  /** Shown when answer is correct */
  correct: [
    { text: "أحسنت يا {name}! 🌟", emoji: "🌟" },
    { text: "رائع يا {name}! 🎉", emoji: "🎉" },
    { text: "ممتاز يا بطل! 💪", emoji: "💪" },
    { text: "صحيح! أنت ذكي يا {name} ⭐", emoji: "⭐" },
    { text: "يا سلام عليك يا {name}! 🏆", emoji: "🏆" },
    { text: "إجابة صحيحة! واصل يا {name} 🔥", emoji: "🔥" },
    { text: "ما شاء الله يا {name}! 👏", emoji: "👏" },
    { text: "برافو يا {name}! 🥇", emoji: "🥇" },
  ],

  /** Shown when answer is wrong */
  wrong: [
    { text: "لا بأس يا {name}، حاول مرة ثانية! 💪", emoji: "💪" },
    { text: "قريب! حاول مرة أخرى يا {name} 🎯", emoji: "🎯" },
    { text: "لا تقلق يا {name}، الخطأ وسيلة للتعلم! 📚", emoji: "📚" },
    { text: "أنت تتعلم يا {name} وهذا رائع! ⭐", emoji: "⭐" },
    { text: "المحاولة هي أول خطوة للنجاح يا {name}! 🌈", emoji: "🌈" },
  ],

  /** Shown on consecutive correct answers (streak) */
  streak: [
    { text: "سلسلة رائعة يا {name}! واصل! 🔥🔥", emoji: "🔥" },
    { text: "لا يوقفك أحد يا {name}! 🚀", emoji: "🚀" },
    { text: "{name} على نار! 🔥🔥🔥", emoji: "🔥" },
  ],

  // === Game-end messages by score range ===

  /** Score >= 90% */
  resultPerfect: [
    { text: "أداء خرافي يا {name}! أنت نجم حقيقي! 🌟🏆", emoji: "🏆" },
    { text: "ما شاء الله يا {name}! نتيجة مبهرة! 🥇✨", emoji: "🥇" },
    { text: "يا بطل يا {name}! فخورين فيك! 👑", emoji: "👑" },
  ],

  /** Score 70-89% */
  resultGood: [
    { text: "أحسنت يا {name}! نتيجة جميلة جداً! 🌟", emoji: "🌟" },
    { text: "شغل ممتاز يا {name}! واصل التقدم! 💪", emoji: "💪" },
    { text: "رائع يا {name}! أنت تتحسن بسرعة! ⭐", emoji: "⭐" },
  ],

  /** Score 50-69% */
  resultOkay: [
    { text: "جهد جميل يا {name}! كل مرة أحسن! 📈", emoji: "📈" },
    { text: "أنت تتعلم يا {name} وهذا أهم شيء! 💫", emoji: "💫" },
    { text: "حلو يا {name}! المرة الجاية أحسن إن شاء الله! 🌱", emoji: "🌱" },
  ],

  /** Score < 50% */
  resultKeepGoing: [
    { text: "لا تيأس يا {name}! التكرار يصنع الأبطال! 💪", emoji: "💪" },
    { text: "كل محاولة تقربك من النجاح يا {name}! 🌈", emoji: "🌈" },
    { text: "أنت شجاع يا {name} لأنك حاولت! جرب مرة ثانية! ⭐", emoji: "⭐" },
  ],
};

export default ENCOURAGEMENTS;
