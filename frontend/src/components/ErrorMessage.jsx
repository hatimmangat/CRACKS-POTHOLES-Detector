/**
 * ErrorMessage.jsx — Displays an error alert with an optional retry action.
 */

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-4 animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      {/* Error icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-red-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-red-800">Detection Failed</h3>
        <p className="mt-1 text-sm text-red-700 break-words">
          {message || 'Unable to analyze the image. Please try again.'}
        </p>
        {onRetry && (
          <button
            id="retry-btn"
            onClick={onRetry}
            className="mt-3 text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
