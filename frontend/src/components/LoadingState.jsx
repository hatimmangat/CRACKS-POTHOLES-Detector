/**
 * LoadingState.jsx — Spinner/progress shown while prediction is running.
 *
 * Props:
 *   mode — "image" (default) | "video"
 */

import { useEffect, useState } from 'react';

const VIDEO_STEPS = [
  { label: 'Uploading video', icon: '⬆️' },
  { label: 'Analyzing frames', icon: '🔍' },
  { label: 'Saving annotated result', icon: '💾' },
];

function VideoLoadingState() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s < VIDEO_STEPS.length - 1 ? s + 1 : s));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center py-16 animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label="Processing video"
    >
      {/* Animated ring spinner */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
        <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
        <svg className="absolute inset-0 m-auto w-6 h-6 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
      </div>

      <p className="text-lg font-semibold text-gray-800">Processing video&hellip;</p>
      <p className="text-sm text-gray-500 mt-1 text-center max-w-xs">
        The AI model is scanning every frame. This may take a few minutes.
      </p>

      {/* Step progress */}
      <ol className="mt-8 space-y-3 w-full max-w-xs" aria-label="Processing steps">
        {VIDEO_STEPS.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <li
              key={step.label}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-500
                ${active ? 'bg-primary-50 text-primary-700' : done ? 'text-green-600' : 'text-gray-300'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                ${active ? 'bg-primary-600 text-white animate-pulse' : done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                {done ? '✓' : i + 1}
              </span>
              {step.label}
              {active && (
                <span className="ml-auto flex gap-0.5">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function LoadingState({ mode = 'image' }) {
  if (mode === 'video') return <VideoLoadingState />;

  return (
    <div
      className="flex flex-col items-center justify-center py-16 animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label="Analyzing image"
    >
      {/* Animated ring spinner */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
        <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
      </div>

      <p className="text-lg font-semibold text-gray-800">Analyzing image&hellip;</p>
      <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
        The AI model is scanning the road image for cracks and potholes.
        This may take a moment.
      </p>
    </div>
  );
}

