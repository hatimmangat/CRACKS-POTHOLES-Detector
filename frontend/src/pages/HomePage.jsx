/**
 * HomePage.jsx — Landing/dashboard page with hero section.
 */

import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
    title: 'YOLO Detection',
    description: 'Custom-trained YOLO model detects road cracks and potholes with high accuracy.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    title: 'Bounding Boxes',
    description: 'Annotated output images highlight each defect with a precise bounding box.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Confidence Scores',
    description: 'Every detection includes a confidence score so you can evaluate model certainty.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Detailed Report',
    description: 'View a summary of total detections, crack count, pothole count, and average confidence.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <section
        className="relative bg-white border-b border-gray-100 overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Label pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              AI-Powered Road Inspection
            </div>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight text-balance"
            >
              AI-Powered{' '}
              <span className="text-primary-600">Road Defect</span>{' '}
              Detection
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-xl text-balance">
              Detect cracks and potholes automatically using a custom-trained YOLO model.
              Upload a road image and let the AI identify road defects with bounding boxes
              and confidence scores.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                id="hero-start-detection-btn"
                onClick={() => navigate('/detect')}
                className="btn-primary text-base px-8 py-3.5"
                aria-label="Start road defect detection"
              >
                Start Detection
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </button>
              <button
                id="hero-learn-more-btn"
                onClick={() => navigate('/about')}
                className="btn-secondary text-base px-8 py-3.5"
                aria-label="Learn about the model"
              >
                About the Model
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        aria-labelledby="features-heading"
      >
        <div className="text-center mb-14">
          <h2 id="features-heading" className="text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Upload a road image and receive a complete analysis in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="card hover:shadow-card-md transition-shadow duration-200 flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-primary-600 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <h2 className="text-2xl font-bold">Ready to inspect your road?</h2>
            <p className="mt-2 text-primary-100 text-sm max-w-md">
              Upload any road photograph and the YOLO model will highlight every crack and
              pothole it finds — instantly.
            </p>
          </div>
          <button
            id="cta-start-detection-btn"
            onClick={() => navigate('/detect')}
            className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-white text-primary-700 font-semibold rounded-xl
                       hover:bg-primary-50 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
            aria-label="Go to detection page"
          >
            Go to Detection
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </button>
        </div>
      </section>
    </main>
  );
}
