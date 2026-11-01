/**
 * DetectionResult.jsx — Side-by-side original and annotated result images with download options.
 */

import { useState } from 'react';
import { getResultImageUrl } from '../services/api';
import { downloadFromUrl, downloadFile } from '../utils/download';

function ImagePanel({ title, src, alt, badge, onDownload, isDownloading }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          {badge && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
              {badge}
            </span>
          )}
        </div>
        {src && !imgError && onDownload && (
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title={`Download ${title}`}
            aria-label={`Download ${title}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
        )}
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-100 shadow-card bg-gray-50 flex items-center justify-center min-h-52">
        {imgError ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-500 font-medium">Image failed to load</p>
            <p className="text-xs text-gray-400">Check that the backend and ML service are running.</p>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain max-h-96"
            loading="lazy"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </div>
  );
}

export default function DetectionResult({ originalUrl, originalFile, result }) {
  const [downloading, setDownloading] = useState(false);
  const annotatedUrl = result?.result_image_url
    ? getResultImageUrl(result.result_image_url)
    : null;

  const totalDetections = result?.summary?.total_detections ?? 0;

  const handleDownloadOriginal = () => {
    if (originalFile) {
      downloadFile(originalFile, originalFile.name || 'original_road_image.jpg');
    } else if (originalUrl) {
      downloadFromUrl(originalUrl, 'original_road_image.jpg');
    }
  };

  const handleDownloadAnnotated = async () => {
    if (!annotatedUrl) return;
    setDownloading(true);
    try {
      await downloadFromUrl(annotatedUrl, 'detected_road_defects.jpg');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadBoth = async () => {
    setDownloading(true);
    try {
      handleDownloadOriginal();
      if (annotatedUrl) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await downloadFromUrl(annotatedUrl, 'detected_road_defects.jpg');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Images row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImagePanel
          title="Original Image"
          src={originalUrl}
          alt="Original uploaded road image"
          onDownload={handleDownloadOriginal}
        />
        {annotatedUrl ? (
          <ImagePanel
            title="Detected Image"
            src={annotatedUrl}
            alt="Road image with YOLO bounding box annotations"
            badge={`${totalDetections} detection${totalDetections !== 1 ? 's' : ''}`}
            onDownload={handleDownloadAnnotated}
            isDownloading={downloading}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700">Detected Image</h3>
            <div className="rounded-xl border border-gray-100 shadow-card bg-gray-50 flex items-center justify-center min-h-52">
              <p className="text-sm text-gray-400">
                {totalDetections === 0
                  ? 'No defects detected in this image.'
                  : 'Annotated image unavailable.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Download Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Export Results</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {originalUrl && (
            <button
              id="download-original-image-btn"
              onClick={handleDownloadOriginal}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Original Image
            </button>
          )}

          {annotatedUrl && (
            <button
              id="download-detected-image-btn"
              onClick={handleDownloadAnnotated}
              disabled={downloading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Detected Image
            </button>
          )}

          {originalUrl && annotatedUrl && (
            <button
              id="download-both-images-btn"
              onClick={handleDownloadBoth}
              disabled={downloading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              Download Both
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
