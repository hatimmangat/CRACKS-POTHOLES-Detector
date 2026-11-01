/**
 * PredictionButton.jsx — Primary action button with loading state.
 *
 * Props:
 *   label — button text (default: "Detect Defects")
 */

export default function PredictionButton({ onClick, isLoading, disabled, label = 'Detect Defects' }) {
  return (
    <button
      id="detect-defects-btn"
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-label={isLoading ? 'Analyzing, please wait' : label}
      className="btn-primary w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          {/* Inline spinner */}
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Analyzing&hellip;
        </>
      ) : (
        <>
          {/* Scan icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

