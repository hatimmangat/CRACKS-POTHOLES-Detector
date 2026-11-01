/**
 * EmptyState.jsx — Shown when no image has been selected yet.
 */

export default function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center animate-fade-in"
      aria-label="No image selected"
    >
      {/* Illustration */}
      <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-5">
        <svg
          className="w-10 h-10 text-primary-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM3.75 4.5h16.5M3.75 19.5h16.5"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-700">No Image Selected</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-xs">
        Upload a road image to begin detection. The AI will identify cracks and
        potholes with bounding boxes and confidence scores.
      </p>
    </div>
  );
}
