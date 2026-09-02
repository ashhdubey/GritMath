/**
 * MathEngine.js
 * ─────────────────────────────────────────────────────────
 * Procedural math question generator for GritMath.
 * Generates questions for: Multiplication (Tables), Squares,
 * Cubes, and Fractions based on difficulty & numeric range.
 *
 * 100 % offline – no network calls.
 * ─────────────────────────────────────────────────────────
 */

// ──────────────────────── helpers ────────────────────────

/**
 * Returns a random integer in [min, max] (inclusive).
 */
const randInt = (min, max) => {
  if (min > max) return min; // BUG-06 guard: never crash on inverted range
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Shuffles an array in‑place using Fisher–Yates.
 */
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Greatest Common Divisor (Euclidean algorithm).
 */
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/**
 * Simplify a fraction { num, den } to lowest terms.
 */
const simplifyFraction = (num, den) => {
  if (den === 0) return { num: 0, den: 1 }; // safety guard
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
};

// ──────────────────── difficulty ranges ──────────────────

/**
 * Returns the default numeric range for a given difficulty.
 *   easy   → 2..12
 *   medium → 2..25
 *   hard   → 2..50
 */
const getDefaultRange = (difficulty = 'medium') => {
  switch (difficulty) {
    case 'easy':
      return { min: 2, max: 12 };
    case 'hard':
      return { min: 2, max: 50 };
    case 'medium':
    default:
      return { min: 2, max: 25 };
  }
};

// ──────────────── question generators ────────────────────

/**
 * Category: MULTIPLICATION (Tables)
 * e.g. "What is 7 × 8?"
 */
const generateMultiplication = (range) => {
  const a = randInt(range.min, range.max);
  const b = randInt(2, 12);
  return {
    category: 'multiplication',
    questionText: `${a} × ${b}`,
    correctAnswer: a * b,
    operands: { a, b },
  };
};

/**
 * Category: SQUARE
 * e.g. "What is 14²?"
 */
const generateSquare = (range) => {
  const n = randInt(range.min, range.max);
  return {
    category: 'square',
    questionText: `${n}²`,
    correctAnswer: n * n,
    operands: { n },
  };
};

/**
 * Category: CUBE
 * e.g. "What is 14³?"
 */
const generateCube = (range) => {
  // Cubes grow fast – cap the range sensibly
  const cappedMax = Math.min(range.max, 30);
  const n = randInt(range.min, cappedMax);
  return {
    category: 'cube',
    questionText: `${n}³`,
    correctAnswer: n * n * n,
    operands: { n },
  };
};

/**
 * Category: FRACTION
 * Generates an addition / subtraction of two simple fractions and
 * expects the answer as a simplified fraction string "num/den" or whole number.
 * e.g. "1/3 + 1/6 = ?"  →  "1/2"
 *
 * FIX BUG-04: replaced infinite recursion with a bounded retry loop.
 */
const generateFraction = (range, _attempts = 0) => {
  // Safety guard: if retried too many times, fall back to simple addition
  if (_attempts > 20) {
    const num1 = randInt(1, 5);
    const den1 = randInt(num1 + 1, 10);
    const num2 = randInt(1, 5);
    const den2 = randInt(num2 + 1, 10);
    const resultNum = num1 * den2 + num2 * den1;
    const resultDen = den1 * den2;
    const simplified = simplifyFraction(resultNum, resultDen);
    const correctAnswerStr = simplified.den === 1
      ? `${simplified.num}`
      : `${simplified.num}/${simplified.den}`;
    return {
      category: 'fraction',
      questionText: `${num1}/${den1} + ${num2}/${den2}`,
      correctAnswer: correctAnswerStr,
      correctAnswerNumeric: resultNum / resultDen,
      operands: { num1, den1, num2, den2, op: '+' },
    };
  }

  const den1 = randInt(2, Math.min(range.max, 12));
  const den2 = randInt(2, Math.min(range.max, 12));
  const num1 = randInt(1, den1 - 1);
  const num2 = randInt(1, den2 - 1);

  const op = Math.random() < 0.5 ? '+' : '-';

  let resultNum;
  const resultDen = den1 * den2;

  if (op === '+') {
    resultNum = num1 * den2 + num2 * den1;
  } else {
    resultNum = num1 * den2 - num2 * den1;
  }

  // Ensure a positive result for subtraction — iterative retry, not recursive
  if (resultNum <= 0) {
    return generateFraction(range, _attempts + 1);
  }

  const simplified = simplifyFraction(resultNum, resultDen);

  const correctAnswerStr =
    simplified.den === 1
      ? `${simplified.num}`
      : `${simplified.num}/${simplified.den}`;

  return {
    category: 'fraction',
    questionText: `${num1}/${den1} ${op} ${num2}/${den2}`,
    correctAnswer: correctAnswerStr,
    correctAnswerNumeric: resultNum / resultDen,
    operands: { num1, den1, num2, den2, op },
  };
};

// ──────────────── basic arithmetic ───────────────────────

/**
 * Category: BASIC ARITHMETIC (+ − × ÷)
 * FIX BUG-06: Division can now produce answers starting from 1.
 */
const generateBasicArithmetic = (range) => {
  const ops = ['+', '-', '×', '÷'];
  const op = ops[randInt(0, 3)];
  let a, b, correctAnswer;

  switch (op) {
    case '+':
      a = randInt(range.min, range.max);
      b = randInt(range.min, range.max);
      correctAnswer = a + b;
      break;
    case '-':
      a = randInt(range.min, range.max);
      b = randInt(range.min, a); // ensure non-negative
      correctAnswer = a - b;
      break;
    case '×':
      a = randInt(range.min, Math.min(range.max, 20));
      b = randInt(2, 12);
      correctAnswer = a * b;
      break;
    case '÷': {
      b = randInt(2, 12);
      // FIX: allow answer from 1, not just from range.min
      correctAnswer = randInt(1, Math.min(range.max, 20));
      a = b * correctAnswer; // ensures whole number division
      break;
    }
    default:
      break;
  }

  return {
    category: 'arithmetic',
    questionText: `${a} ${op} ${b}`,
    correctAnswer,
    operands: { a, b, op },
  };
};

// ─────────────── distractor generator ────────────────────

/**
 * Generates `count` believable but WRONG options for a given correct answer.
 *
 * FIX BUG-07: For small answers, uses smarter strategies that don't
 * just produce sequential numbers.
 */
const generateDistractors = (correctAnswer, count = 3) => {
  // For fraction string answers, use special handling
  if (typeof correctAnswer === 'string') {
    return generateFractionDistractors(correctAnswer, count);
  }

  const distractors = new Set();
  const correct = Math.round(correctAnswer);
  const magnitude = Math.max(Math.abs(correct), 10); // ensure minimum magnitude for %

  // Strategy pool – each returns a candidate number
  const strategies = [
    // 1. Unit-digit alteration  (swap last digit by ±1 or ±2)
    () => {
      const delta = Math.random() < 0.5 ? randInt(1, 2) : -randInt(1, 2);
      return correct + delta;
    },
    // 2. Scaled offset based on magnitude (works well for both small and large)
    () => {
      const delta = Math.max(1, Math.round(magnitude * (randInt(5, 20) / 100)));
      return Math.random() < 0.5 ? correct + delta : correct - delta;
    },
    // 3. Percentage‑based offset (good for cubes / large products)
    () => {
      const pct = randInt(5, 15) / 100;
      const delta = Math.max(1, Math.round(magnitude * pct));
      return Math.random() < 0.5 ? correct + delta : correct - delta;
    },
    // 4. Tens‑digit alteration
    () => {
      const delta = randInt(1, 3) * 10;
      return Math.random() < 0.5 ? correct + delta : correct - delta;
    },
    // 5. Small adjacent near-miss
    () => {
      const delta = randInt(1, 4);
      return correct + (Math.random() < 0.5 ? delta : -delta);
    },
    // 6. BUG-07 FIX: For small numbers, multiply by near-factor
    () => {
      const factors = [2, 3, 0.5];
      const f = factors[randInt(0, factors.length - 1)];
      return Math.round(correct * f);
    },
  ];

  let attempts = 0;
  const maxAttempts = 150;

  while (distractors.size < count && attempts < maxAttempts) {
    const strategy = strategies[randInt(0, strategies.length - 1)];
    const candidate = Math.round(strategy());

    // Must be positive and not the correct answer
    if (candidate > 0 && candidate !== correct && !distractors.has(candidate)) {
      distractors.add(candidate);
    }
    attempts++;
  }

  // Fallback: if we still don't have enough, force‑generate with sequential offsets
  let fallbackOffset = 1;
  while (distractors.size < count) {
    const candidate = correct + fallbackOffset;
    if (candidate > 0 && candidate !== correct && !distractors.has(candidate)) {
      distractors.add(candidate);
    }
    fallbackOffset = fallbackOffset > 0 ? -fallbackOffset : -fallbackOffset + 1;
  }

  return Array.from(distractors);
};

/**
 * Distractor generator specifically for fraction answers (string format "num/den").
 */
const generateFractionDistractors = (correctStr, count = 3) => {
  const distractors = new Set();

  // Parse the correct fraction
  let correctNum, correctDen;
  if (correctStr.includes('/')) {
    const parts = correctStr.split('/');
    correctNum = parseInt(parts[0], 10);
    correctDen = parseInt(parts[1], 10);
  } else {
    correctNum = parseInt(correctStr, 10);
    correctDen = 1;
  }

  const strategies = [
    // Off‑by‑one on numerator
    () => {
      const d = Math.random() < 0.5 ? 1 : -1;
      const n = correctNum + d;
      if (n <= 0) return null;
      const s = simplifyFraction(n, correctDen);
      return s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
    },
    // Off‑by‑one on denominator
    () => {
      const d = Math.random() < 0.5 ? 1 : -1;
      const den = correctDen + d;
      if (den <= 0) return null;
      const s = simplifyFraction(correctNum, den);
      return s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
    },
    // Double the numerator
    () => {
      const s = simplifyFraction(correctNum * 2, correctDen);
      return s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
    },
    // Use neighboring denominator
    () => {
      const den = correctDen + randInt(1, 3);
      const s = simplifyFraction(correctNum, den);
      return s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
    },
  ];

  let attempts = 0;
  while (distractors.size < count && attempts < 80) {
    const strategy = strategies[randInt(0, strategies.length - 1)];
    const candidate = strategy();
    if (candidate && candidate !== correctStr && !distractors.has(candidate)) {
      distractors.add(candidate);
    }
    attempts++;
  }

  // Fallback
  let fb = 1;
  while (distractors.size < count) {
    const s = simplifyFraction(correctNum + fb, correctDen + fb);
    const candidate = s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
    if (candidate !== correctStr && !distractors.has(candidate)) {
      distractors.add(candidate);
    }
    fb++;
  }

  return Array.from(distractors);
};

// ────────────────── public API ───────────────────────────

/**
 * The category key → generator mapping.
 */
const GENERATORS = {
  multiplication: generateMultiplication,
  square: generateSquare,
  cube: generateCube,
  fraction: generateFraction,
  arithmetic: generateBasicArithmetic,
};

/**
 * Supported category labels (used in the Dashboard grid).
 */
export const CATEGORIES = [
  { key: 'square', label: 'Square', icon: 'x²', featherIcon: 'grid', color: '#0056D2' },
  { key: 'cube', label: 'Cube', icon: 'x³', featherIcon: 'box', color: '#10B981' },
  { key: 'multiplication', label: 'Table', icon: '×', featherIcon: 'x', color: '#F59E0B' },
  { key: 'arithmetic', label: 'Arithmetic', icon: '+-', featherIcon: 'activity', color: '#EF4444' },
  { key: 'fraction', label: 'Fraction', icon: 'a/b', featherIcon: 'divide', color: '#8B5CF6' },
];

/**
 * Generate a single question object (with MCQ options pre‑attached).
 */
export const generateQuestion = (category, difficulty = 'medium', customRange = null) => {
  const actualCategory = Array.isArray(category)
    ? category[randInt(0, category.length - 1)]
    : category;

  const generator = GENERATORS[actualCategory];
  if (!generator) {
    throw new Error(`Unknown category: "${actualCategory}"`);
  }

  const range = customRange || getDefaultRange(difficulty);
  // BUG-06 FIX: Ensure range is always valid
  const safeRange = {
    min: Math.min(range.min, range.max),
    max: Math.max(range.min, range.max),
  };
  const q = generator(safeRange);

  // Build MCQ options (correct + 3 distractors), shuffled
  const distractors = generateDistractors(q.correctAnswer, 3);
  const options = shuffle([q.correctAnswer, ...distractors]);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    questionText: q.questionText,
    correctAnswer: q.correctAnswer,
    options,
    category: q.category,
  };
};

/**
 * Generate an array of `count` questions for a quiz session.
 */
export const generateQuiz = (category, count = 10, difficulty = 'medium', customRange = null) => {
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push(generateQuestion(category, difficulty, customRange));
  }
  return questions;
};

/**
 * Check if a user answer matches the correct answer.
 * Handles both numeric and fraction-string answers.
 */
export const checkAnswer = (userAnswer, correctAnswer) => {
  if (typeof correctAnswer === 'string') {
    return String(userAnswer).trim() === correctAnswer;
  }
  return Number(userAnswer) === correctAnswer;
};

export default {
  generateQuestion,
  generateQuiz,
  generateDistractors,
  checkAnswer,
  CATEGORIES,
};
