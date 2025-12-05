/**
 * Shared utility functions for game algorithms
 */

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} arr - Array to shuffle
 * @returns {Array} - Shuffled array copy
 */
export const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Color style mappings for games
 */
export const COLOR_MAP = {
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  yellow: "#eab308",
  purple: "#9333ea",
  orange: "#ea580c"
};

/**
 * Get background color style for a color name
 * @param {string} color - Color name
 * @returns {Object} - Style object with backgroundColor
 */
export const getColorStyle = (color) => {
  return { backgroundColor: COLOR_MAP[color] || color };
};

/**
 * Get text color hex value for a color name
 * @param {string} color - Color name
 * @returns {string} - Hex color code
 */
export const getTextColor = (color) => {
  return COLOR_MAP[color] || color;
};

/**
 * Generate random integer between min (inclusive) and max (exclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Generate random sequence from array of items
 * @param {Array} items - Items to choose from
 * @param {number} length - Sequence length
 * @returns {Array} - Random sequence
 */
export const generateRandomSequence = (items, length) => {
  return Array.from({ length }, () => items[Math.floor(Math.random() * items.length)]);
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} - Percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum bound
 * @param {number} max - Maximum bound
 * @returns {number} - Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

