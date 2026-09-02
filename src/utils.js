/**
 * Compares two semantic version strings (e.g. "1.8.8" vs "1.8.10")
 * @param {string} v1 The first version string
 * @param {string} v2 The second version string
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export const compareSemVer = (v1, v2) => {
  const parse = (v) => v.replace(/^v/, '').trim().split('.').map(Number);
  
  const p1 = parse(v1);
  const p2 = parse(v2);
  
  const len = Math.max(p1.length, p2.length);
  
  for (let i = 0; i < len; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  
  return 0;
};
