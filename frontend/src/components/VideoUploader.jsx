/**
 * VideoUploader.jsx - Drag-and-drop + click-to-select video upload area.
 */

import { useCallback, useRef, useState } from "react";

const ACCEPTED_EXTENSIONS = [".mp4", ".avi", ".mov", ".webm"];
const MAX_SIZE_MB = 200;

export default function VideoUploader({ onFileSelect }) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState("");

  const validateAndSelect = useCallback(
    (file) => {
      setDragError("");
      if (!file) return;
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setDragError("Unsupported format. Please upload an MP4, AVI, MOV, or WEBM video.");
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

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndSelect(e.dataTransfer.files?.[0]);
  }, [validateAndSelect]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleInputChange = (e) => {
    validateAndSelect(e.target.files?.[0]);
    e.target.value = "";
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); }
  };

  return (
    <div>
      <div
        id="video-upload-zone"
        role="button"
        tabIndex={0}
        aria-label="Upload road video"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-10 text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isDragOver ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-gray-50 hover:border-primary-400 hover:bg-primary-50"}`}
      >
        <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors duration-200 ${isDragOver ? "bg-primary-100" : "bg-white border border-gray-200"}`}>
          <svg className={`w-7 h-7 transition-colors duration-200 ${isDragOver ? "text-primary-600" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        </div>
        <p className="font-semibold text-gray-700">{isDragOver ? "Drop the video here" : "Drag & drop your road video"}</p>
        <p className="mt-1 text-sm text-gray-500">or <span className="text-primary-600 font-medium underline underline-offset-2">click to browse</span></p>
        <p className="mt-3 text-xs text-gray-400">Supports: MP4, AVI, MOV, WEBM &nbsp;&#183;&nbsp; Max {MAX_SIZE_MB} MB</p>
        <input ref={inputRef} id="video-file-input" type="file" accept=".mp4,.avi,.mov,.webm" className="hidden" onChange={handleInputChange} aria-label="Video file input" />
      </div>
      {dragError && <p className="mt-2 text-sm text-red-600 font-medium" role="alert">{dragError}</p>}
    </div>
  );
}
