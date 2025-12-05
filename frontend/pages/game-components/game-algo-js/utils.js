

export const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const COLOR_MAP = {
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  yellow: "#eab308",
  purple: "#9333ea",
  orange: "#ea580c"
};

export const getColorStyle = (color) => {
  return { backgroundColor: COLOR_MAP[color] || color };
};

export const getTextColor = (color) => {
  return COLOR_MAP[color] || color;
};

export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const generateRandomSequence = (items, length) => {
  return Array.from({ length }, () => items[Math.floor(Math.random() * items.length)]);
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

