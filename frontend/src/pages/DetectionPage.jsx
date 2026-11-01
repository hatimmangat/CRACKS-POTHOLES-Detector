/**
 * DetectionPage.jsx — Road defect detection page supporting image and video input.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import ImagePreview from '../components/ImagePreview';
import VideoUploader from '../components/VideoUploader';
import PredictionButton from '../components/PredictionButton';
import DetectionResult from '../components/DetectionResult';
import VideoResult from '../components/VideoResult';
import StatisticsCards from '../components/StatisticsCards';
import DetectionTable from '../components/DetectionTable';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { predictDefects, predictVideoDefects } from '../services/api';

// ── Mode toggle component ────────────────────────────────────────────────────
function ModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-gray-100 p-1 gap-1" role="tablist" aria-label="Detection mode">
      {['image', 'video'].map((m) => (
        <button
          key={m}
          id={`mode-${m}-btn`}
          role="tab"
          aria-selected={mode === m}
          onClick={() => onChange(m)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
            ${mode === m
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          {m === 'image' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          )}
          {m.charAt(0).toUpperCase() + m.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ── Video preview card ────────────────────────────────────────────────────────
function VideoPreview({ file, onRemove }) {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sizeMB} MB</p>
      </div>
      <button
        id="remove-video-btn"
        onClick={onRemove}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        aria-label="Remove video"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DetectionPage() {
  const [mode, setMode] = useState('image');

  // ── Shared state ──────────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const objectUrlRef = useRef(null);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); };
  }, []);

  const reset = useCallback(() => {
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsLoading(false);
    setResult(null);
    setError(null);
  }, []);

  const handleModeChange = useCallback((m) => {
    reset();
    setMode(m);
  }, [reset]);

  const selectFile = useCallback((file) => {
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreviewUrl(url);
    setSelectedFile(file);
    setResult(null);
    setError(null);
  }, []);

  const removeFile = useCallback(() => {
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  }, []);

  const runPrediction = useCallback(async () => {
    if (!selectedFile) { setError('Please select a file first.'); return; }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = mode === 'image'
        ? await predictDefects(selectedFile)
        : await predictVideoDefects(selectedFile);
      setResult(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Unable to analyze the file. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, mode]);

  // ── Derived state ────────────────────────────────────────────────────────
  const hasResult = !!result;
  const noDetections = hasResult && (result.summary?.total_detections === 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Road Defect Detection</h1>
        <p className="mt-1 text-sm text-gray-500">
          Detect cracks and potholes in road images or videos using the YOLO26s model.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mb-6">
        <ModeToggle mode={mode} onChange={handleModeChange} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ── Left column: upload panel ── */}
        <div className="xl:col-span-1">
          <div className="card sticky top-24">
            <h2 className="section-title mb-4">
              {mode === 'image' ? 'Upload Image' : 'Upload Video'}
            </h2>

            {/* Uploader or preview */}
            {selectedFile ? (
              mode === 'image' ? (
                <ImagePreview file={selectedFile} previewUrl={previewUrl} onRemove={removeFile} />
              ) : (
                <VideoPreview file={selectedFile} onRemove={removeFile} />
              )
            ) : (
              mode === 'image' ? (
                <ImageUploader onFileSelect={selectFile} />
              ) : (
                <VideoUploader onFileSelect={selectFile} />
              )
            )}

            {/* Detect button */}
            <div className="mt-5">
              <PredictionButton
                onClick={runPrediction}
                isLoading={isLoading}
                disabled={!selectedFile}
                label={mode === 'image' ? 'Detect Defects' : 'Analyze Video'}
              />
            </div>

            {/* Run another */}
            {hasResult && !isLoading && (
              <button
                id="run-another-btn"
                onClick={reset}
                className="btn-ghost w-full mt-3 text-sm"
                aria-label="Run another detection"
              >
                Run Another Detection
              </button>
            )}

            {/* Tips */}
            {!selectedFile && (
              <ul className="mt-5 space-y-2 text-xs text-gray-400">
                {mode === 'image' ? (
                  <>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />Supported: JPG, PNG, WebP</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />Maximum file size: 20 MB</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />Clear, well-lit photos yield best results</li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />Supported: MP4, AVI, MOV, WEBM</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />Maximum file size: 200 MB</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />Processing time depends on video length</li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right column: results area ── */}
        <div className="xl:col-span-2 space-y-8">

          {/* Loading */}
          {isLoading && (
            <div className="card">
              <LoadingState mode={mode} />
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="card">
              <ErrorMessage message={error} onRetry={runPrediction} />
            </div>
          )}

          {/* No detections */}
          {!isLoading && !error && noDetections && (
            <div className="card">
              <div className="py-10 text-center animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-700">No Defects Detected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The model did not find any cracks or potholes in this {mode}.
                </p>
              </div>
            </div>
          )}

          {/* ── IMAGE results ── */}
          {!isLoading && !error && hasResult && !noDetections && mode === 'image' && (
            <>
              <div className="card">
                <h2 className="section-title mb-6">Detection Results</h2>
                <DetectionResult
                  originalUrl={previewUrl}
                  originalFile={selectedFile}
                  result={result}
                />
              </div>
              <section aria-labelledby="stats-heading">
                <h2 id="stats-heading" className="section-title mb-4">Summary</h2>
                <StatisticsCards summary={result.summary} />
              </section>
              <div className="card">
                <h2 className="section-title mb-4">
                  Detection Details
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({result.detections?.length ?? 0} item{result.detections?.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                <DetectionTable detections={result.detections} />
              </div>
            </>
          )}

          {/* ── VIDEO results ── */}
          {!isLoading && !error && hasResult && !noDetections && mode === 'video' && (
            <>
              <div className="card">
                <h2 className="section-title mb-6">Video Detection Results</h2>
                <VideoResult
                  result={result}
                  originalUrl={previewUrl}
                  originalFile={selectedFile}
                />
              </div>
            </>
          )}

          {/* Empty state — no file selected yet */}
          {!isLoading && !error && !hasResult && !selectedFile && (
            <div className="card">
              <EmptyState />
            </div>
          )}

          {/* File selected but not run yet */}
          {!isLoading && !error && !hasResult && selectedFile && (
            <div className="card flex flex-col items-center justify-center py-14 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                {mode === 'image' ? (
                  <svg className="w-7 h-7 text-primary-500" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-primary-500" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                )}
              </div>
              <h3 className="font-semibold text-gray-700">
                {mode === 'image' ? 'Image Ready' : 'Video Ready'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Click <span className="font-medium text-primary-600">
                  {mode === 'image' ? 'Detect Defects' : 'Analyze Video'}
                </span> to start the analysis.
              </p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

