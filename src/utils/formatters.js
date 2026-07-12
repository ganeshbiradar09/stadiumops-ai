/**
 * Formatting helpers for StadiumOps AI Dashboard
 */

/**
 * Formats a number with comma separators (e.g. 10420 -> 10,420)
 * @param {number} num 
 * @returns {string}
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Formats a decimal/fraction as a percentage string (e.g. 86.8 -> 86.8%)
 * @param {number} percent 
 * @returns {string}
 */
export const formatPercent = (percent) => {
  if (percent === null || percent === undefined || isNaN(percent)) return '0%';
  return `${percent}%`;
};

/**
 * Capitalizes a string (e.g. "open" -> "Open")
 * @param {string} str 
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
