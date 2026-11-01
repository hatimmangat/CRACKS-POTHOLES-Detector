/**
 * download.js — Utilities for downloading image and video files in the browser.
 */

/**
 * Trigger a browser download from a URL (e.g. backend endpoint).
 * Fetches the blob first to ensure download attribute is respected across origins.
 *
 * @param {string} url - File URL to download.
 * @param {string} filename - Desired filename for download.
 */
export async function downloadFromUrl(url, filename = 'download') {
  if (!url) return;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    // Fallback: append download=true query parameter to proxy endpoint
    const fallbackUrl = url.includes('?')
      ? `${url}&download=true&name=${encodeURIComponent(filename)}`
      : `${url}?download=true&name=${encodeURIComponent(filename)}`;
    const link = document.createElement('a');
    link.href = fallbackUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Trigger a browser download for a local File or Blob object.
 *
 * @param {File|Blob} fileOrBlob - File or Blob object.
 * @param {string} filename - Desired filename.
 */
export function downloadFile(fileOrBlob, filename) {
  if (!fileOrBlob) return;
  const name = filename || fileOrBlob.name || 'download';
  const blobUrl = URL.createObjectURL(fileOrBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
