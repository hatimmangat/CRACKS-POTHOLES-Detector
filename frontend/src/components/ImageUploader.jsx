/**
 * ImageUploader.jsx — Drag-and-drop + click-to-select image upload area.
 */

import { useCallback, useRef, useState } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 20;

export default function ImageUploader({ onFileSelect }) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState('');

  const validateAndSelect = useCallback(
    (file) => {
      setDragError('');

      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setDragError('Unsupported file type. Please upload a JPG, PNG, or WebP image.');
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setDragError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSelect(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div>
      <div
        id="image-upload-zone"
        role="button"
        tabIndex={0}
        aria-label="Upload road image — click or drag and drop"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-10 text-center
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${
            isDragOver
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-gray-50 hover:border-primary-400 hover:bg-primary-50'
          }`}
      >
        {/* Upload icon */}
        <div
          className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors duration-200
            ${isDragOver ? 'bg-primary-100' : 'bg-white border border-gray-200'}`}
        >
          <svg
            className={`w-7 h-7 transition-colors duration-200 ${isDragOver ? 'text-primary-600' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
          </svg>
        </div>

        <p className="font-semibold text-gray-700">
          {isDragOver ? 'Drop the image here' : 'Drag & drop your road image'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          or{' '}
          <span className="text-primary-600 font-medium underline underline-offset-2">
            click to browse
          </span>
        </p>
        <p className="mt-3 text-xs text-gray-400">
          Supports: JPG, PNG, WebP &nbsp;·&nbsp; Max {MAX_SIZE_MB} MB
        </p>

        <input
          ref={inputRef}
          id="file-input"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleInputChange}
          aria-label="File input"
        />
      </div>

      {dragError && (
        <p className="mt-2 text-sm text-red-600 font-medium" role="alert">
          {dragError}
        </p>
      )}
    </div>
  );
}
