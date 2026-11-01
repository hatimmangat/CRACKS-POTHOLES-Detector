/**
 * DetectionTable.jsx — Table of all detections with class badges and bounding box data.
 */

import { formatConfidence, capitalise } from '../utils/formatters';

function ClassBadge({ name }) {
  const iscrack = name?.toLowerCase() === 'crack';
  return (
    <span className={iscrack ? 'badge-crack' : 'badge-pothole'}>
      {capitalise(name)}
    </span>
  );
}

export default function DetectionTable({ detections }) {
  if (!detections || detections.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500 text-sm">
        No detections to display.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 animate-fade-in">
      <table className="w-full text-sm text-left" aria-label="Detection results table">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['#', 'Class', 'Confidence', 'X1', 'Y1', 'X2', 'Y2'].map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {detections.map((det, idx) => (
            <tr
              key={idx}
              className="bg-white hover:bg-gray-50 transition-colors duration-100"
            >
              <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
              <td className="px-4 py-3">
                <ClassBadge name={det.class_name} />
              </td>
              <td className="px-4 py-3 font-semibold text-gray-800">
                {formatConfidence(det.confidence)}
              </td>
              <td className="px-4 py-3 text-gray-600 font-mono">{det.bbox.x1}</td>
              <td className="px-4 py-3 text-gray-600 font-mono">{det.bbox.y1}</td>
              <td className="px-4 py-3 text-gray-600 font-mono">{det.bbox.x2}</td>
              <td className="px-4 py-3 text-gray-600 font-mono">{det.bbox.y2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
