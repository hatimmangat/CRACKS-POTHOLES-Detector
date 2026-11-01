/**
 * ImagePreview.jsx — Displays the selected image with a remove button.
 */

import { formatFileSize } from '../utils/formatters';

export default function ImagePreview({ file, previewUrl, onRemove }) {
  if (!file || !previewUrl) return null;

  return (
    <div className="relative rounded-2xl border border-gray-100 shadow-card overflow-hidden animate-scale-in">
      {/* Remove button */}
      <button
        id="remove-image-btn"
        onClick={onRemove}
        aria-label="Remove selected image"
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200
                   flex items-center justify-center shadow-sm
                   hover:bg-red-50 hover:border-red-200 hover:text-red-600
                   transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Image */}
      <img
        src={previewUrl}
        alt="Selected road image preview"
        className="w-full max-h-72 object-contain bg-gray-50"
      />

      {/* File info bar */}
      <div className="px-4 py-2.5 bg-white border-t border-gray-100 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-primary-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="text-sm text-gray-700 font-medium truncate">{file.name}</span>
        <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
          {formatFileSize(file.size)}
        </span>
      </div>
    </div>
  );
}
