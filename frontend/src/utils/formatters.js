/**
 * formatters.js — Utility functions for formatting values in the UI.
 */

/**
 * Format a confidence value (0–1) as a percentage string.
 * @param {number} value
 * @param {number} [decimals=1]
 * @returns {string} e.g. "91.4%"
 */
export function formatConfidence(value, decimals = 1) {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a file size in bytes to a human-readable string.
 * @param {number} bytes
 * @returns {string} e.g. "2.4 MB"
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
