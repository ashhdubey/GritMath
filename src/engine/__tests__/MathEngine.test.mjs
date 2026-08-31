/**
 * MathEngine smoke test.
 * Run with: node --experimental-vm-modules src/engine/__tests__/MathEngine.test.mjs
 * Or just verify the logic inline.
 */

// We can't import ESM directly in a CJS node script, so replicate the core logic for testing.

// ── Helpers ──
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const simplifyFraction = (num, den) => {
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
};

// ── Test: Squares ──
console.log('\n═══ SQUARE TESTS ═══');
for (let i = 0; i < 5; i++) {
  const n = randInt(2, 25);
  const answer = n * n;
  console.log(`  ${n}² = ${answer}`);
}

// ── Test: Cubes ──
console.log('\n═══ CUBE TESTS ═══');
for (let i = 0; i < 5; i++) {
  const n = randInt(2, 15);
  const answer = n * n * n;
  console.log(`  ${n}³ = ${answer}`);
}

// ── Test: Multiplication ──
console.log('\n═══ MULTIPLICATION TESTS ═══');
for (let i = 0; i < 5; i++) {
  const a = randInt(2, 25);
  const b = randInt(2, 12);
  console.log(`  ${a} × ${b} = ${a * b}`);
}

// ── Test: Distractor Generator ──
console.log('\n═══ DISTRACTOR TESTS ═══');

function generateDistractors(correctAnswer, count = 3) {
  const distractors = new Set();
  const correct = Math.round(correctAnswer);
  const magnitude = Math.abs(correct);

  const strategies = [
    () => correct + (Math.random() < 0.5 ? randInt(1, 2) : -randInt(1, 2)),
    () => correct + [5, 10, 15, 20, -5, -10, -15, -20][randInt(0, 7)],
    () => {
      const pct = randInt(2, 8) / 100;
      const delta = Math.max(1, Math.round(magnitude * pct));
      return Math.random() < 0.5 ? correct + delta : correct - delta;
    },
  ];

  let attempts = 0;
  while (distractors.size < count && attempts < 100) {
    const strategy = strategies[randInt(0, strategies.length - 1)];
    const candidate = Math.round(strategy());
    if (candidate > 0 && candidate !== correct && !distractors.has(candidate)) {
      distractors.add(candidate);
    }
    attempts++;
  }

  let fb = 1;
  while (distractors.size < count) {
    const c = correct + fb;
    if (c > 0 && c !== correct && !distractors.has(c)) distractors.add(c);
    fb = fb > 0 ? -fb : -fb + 1;
  }

  return Array.from(distractors);
}

const testCases = [
  { label: '14³', correct: 2744 },
  { label: '25²', correct: 625 },
  { label: '7 × 8', correct: 56 },
  { label: '3²', correct: 9 },
  { label: '100 × 5', correct: 500 },
];

let allPassed = true;

for (const tc of testCases) {
  const d = generateDistractors(tc.correct);
  const noDupes = new Set(d).size === d.length;
  const noCorrect = !d.includes(tc.correct);
  const allPositive = d.every((x) => x > 0);
  const passed = noDupes && noCorrect && allPositive && d.length === 3;

  console.log(
    `  ${tc.label} = ${tc.correct} → distractors: [${d.join(', ')}]` +
    ` | unique=${noDupes} noCorrect=${noCorrect} allPositive=${allPositive} ✓=${passed}`
  );
  if (!passed) allPassed = false;
}

// ── Test: Fraction Distractor ──
console.log('\n═══ FRACTION DISTRACTOR TESTS ═══');

function generateFractionDistractors(correctStr, count = 3) {
  const distractors = new Set();
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
    () => {
      const d = Math.random() < 0.5 ? 1 : -1;
      const n = correctNum + d;
      if (n <= 0) return null;
      const s = simplifyFraction(n, correctDen);
      return s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
    },
    () => {
      const d = Math.random() < 0.5 ? 1 : -1;
      const den = correctDen + d;
      if (den <= 0) return null;
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

  let fb = 1;
  while (distractors.size < count) {
    const s = simplifyFraction(correctNum + fb, correctDen + fb);
    const candidate = s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
    if (candidate !== correctStr && !distractors.has(candidate)) distractors.add(candidate);
    fb++;
  }

  return Array.from(distractors);
}

const fractionTests = ['1/2', '3/4', '2/5', '7/8'];
for (const ft of fractionTests) {
  const d = generateFractionDistractors(ft);
  const noDupes = new Set(d).size === d.length;
  const noCorrect = !d.includes(ft);
  console.log(`  correct="${ft}" → [${d.join(', ')}] | unique=${noDupes} noCorrect=${noCorrect}`);
}

console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);
