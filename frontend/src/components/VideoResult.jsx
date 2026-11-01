/**
 * VideoResult.jsx — Shows the annotated result video and original video
 * with multiple format support, playback speed controls, side-by-side comparison,
 * and comprehensive download options.
 */

import { useState, useRef } from 'react';
import { getResultVideoUrl } from '../services/api';
import { downloadFromUrl, downloadFile } from '../utils/download';

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}

function VideoPlayer({ title, src, badge, onDownload, isDownloading, isOriginal }) {
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoop, setIsLoop] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleLoop = () => {
    setIsLoop(!isLoop);
    if (videoRef.current) {
      videoRef.current.loop = !isLoop;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          {badge && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Loop toggle */}
          <button
            onClick={toggleLoop}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
              isLoop
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Toggle Loop"
          >
            🔁 Loop
          </button>

          {/* Speed selector */}
          <select
            value={playbackRate}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 rounded-md px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
            title="Playback Speed"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>

          {/* Download button */}
          {src && !hasError && onDownload && (
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
      </div>

      {/* Video element container */}
      <div className="rounded-xl overflow-hidden border border-gray-100 shadow-card bg-black flex items-center justify-center min-h-60">
        {hasError ? (
          <div className="flex flex-col items-center gap-3 p-6 text-center text-white">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-200">Video format not supported by this browser</p>
              <p className="text-xs text-gray-400 mt-1">You can still download the video directly to play it locally.</p>
            </div>
            {onDownload && (
              <button
                onClick={onDownload}
                className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Download Video File
              </button>
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            className="w-full max-h-[440px] bg-black"
            aria-label={title}
            onError={() => setHasError(true)}
          >
            {/* Multiple web video format sources for maximum browser compatibility */}
            <source src={src} type="video/mp4" />
            <source src={src} type="video/webm" />
            <source src={src} type="video/ogg" />
            <source src={src} type="video/quicktime" />
            Your browser does not support HTML5 video playback.
          </video>
        )}
      </div>
    </div>
  );
}

export default function VideoResult({ result, originalUrl, originalFile }) {
  const [viewMode, setViewMode] = useState('detected'); // 'detected' | 'original' | 'split'
  const [downloading, setDownloading] = useState(false);

  const videoUrl = result?.result_video_url ? getResultVideoUrl(result.result_video_url) : null;
  const s = result?.summary;
  const totalDetections = s?.total_detections ?? 0;

  const handleDownloadOriginal = () => {
    if (originalFile) {
      downloadFile(originalFile, originalFile.name || 'original_road_video.mp4');
    } else if (originalUrl) {
      downloadFromUrl(originalUrl, 'original_road_video.mp4');
    }
  };

  const handleDownloadDetected = async () => {
    if (!videoUrl) return;
    setDownloading(true);
    try {
      await downloadFromUrl(videoUrl, 'detected_road_defects.mp4');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadBoth = async () => {
    setDownloading(true);
    try {
      handleDownloadOriginal();
      if (videoUrl) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await downloadFromUrl(videoUrl, 'detected_road_defects.mp4');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* View Switcher (if original video is available) */}
      {originalUrl && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex rounded-lg bg-gray-100 p-1 gap-1 text-xs">
            <button
              onClick={() => setViewMode('detected')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewMode === 'detected'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Detected Video
            </button>
            <button
              onClick={() => setViewMode('original')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewMode === 'original'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Original Video
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Side-by-Side
            </button>
          </div>
        </div>
      )}

      {/* Video display area */}
      {viewMode === 'split' && originalUrl ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VideoPlayer
            title="Original Video"
            src={originalUrl}
            onDownload={handleDownloadOriginal}
            isOriginal={true}
          />
          {videoUrl ? (
            <VideoPlayer
              title="Detected Video"
              src={videoUrl}
              badge={`${totalDetections} detection${totalDetections !== 1 ? 's' : ''}`}
              onDownload={handleDownloadDetected}
              isDownloading={downloading}
            />
          ) : (
            <div className="rounded-xl border border-gray-100 shadow-card bg-gray-50 flex items-center justify-center min-h-52">
              <p className="text-sm text-gray-400">Annotated video unavailable.</p>
            </div>
          )}
        </div>
      ) : viewMode === 'original' && originalUrl ? (
        <VideoPlayer
          title="Original Video"
          src={originalUrl}
          onDownload={handleDownloadOriginal}
          isOriginal={true}
        />
      ) : videoUrl ? (
        <VideoPlayer
          title="Detected Video (YOLO Annotations)"
          src={videoUrl}
          badge={`${totalDetections} detection${totalDetections !== 1 ? 's' : ''}`}
          onDownload={handleDownloadDetected}
          isDownloading={downloading}
        />
      ) : (
        <div className="rounded-xl border border-gray-100 shadow-card bg-gray-50 flex items-center justify-center min-h-52">
          <p className="text-sm text-gray-400">Annotated video unavailable.</p>
        </div>
      )}

      {/* Summary stats */}
      {s && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total Frames" value={s.total_frames ?? 0} color="text-gray-800" />
          <StatCard label="Total Detections" value={s.total_detections ?? 0} color="text-primary-600" />
         
          <StatCard label="Potholes" value={s.potholes ?? 0} color="text-blue-600" />
          <StatCard
            label="Avg Confidence"
            value={s.average_confidence ? `${(s.average_confidence * 100).toFixed(1)}%` : '—'}
            color="text-green-600"
          />
        </div>
      )}

      {/* Download Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <div>
            <span className="text-sm font-semibold text-gray-700">Export Video</span>
            <p className="text-xs text-gray-400">Web-optimized MP4 (H.264 / AAC)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {originalUrl && (
            <button
              id="download-original-video-btn"
              onClick={handleDownloadOriginal}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Original Video
            </button>
          )}

          {videoUrl && (
            <button
              id="download-detected-video-btn"
              onClick={handleDownloadDetected}
              disabled={downloading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Detected Video (MP4)
            </button>
          )}

          {originalUrl && videoUrl && (
            <button
              id="download-both-videos-btn"
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
