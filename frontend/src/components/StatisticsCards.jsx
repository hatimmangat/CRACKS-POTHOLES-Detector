/**
 * StatisticsCards.jsx — Four summary metric cards displayed after a prediction.
 */

import { formatConfidence } from '../utils/formatters';

function StatCard({ label, value, icon, accent }) {
  return (
    <div className={`stat-card border-l-4 ${accent} animate-slide-up`}>
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
          {icon}
        </div>
      </div>
      <span className="stat-value">{value}</span>
    </div>
  );
}

export default function StatisticsCards({ summary }) {
  if (!summary) return null;

  const { total_detections, cracks, potholes, average_confidence } = summary;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Detection statistics">
      <StatCard
        label="Total Detections"
        value={total_detections}
        accent="border-primary-500"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        }
      />

      <StatCard
        label="Potholes"
        value={potholes}
        accent="border-blue-400"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" />
          </svg>
        }
      />
      <StatCard
        label="Avg Confidence"
        value={formatConfidence(average_confidence)}
        accent="border-green-400"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        }
      />
    </div>
  );
}
