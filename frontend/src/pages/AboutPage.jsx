/**
 * AboutPage.jsx — Model information and performance metrics page.
 * Values sourced from Road_Crack_Pothole_Detection.ipynb training run.
 */

const metricGroups = [
  {
    title: 'Dataset',
    metrics: [
      { label: 'Total Image Pairs', value: '195', note: 'Pascal VOC XML → YOLO TXT' },
      { label: 'Training Images', value: '156', note: '80% split' },
      { label: 'Validation Images', value: '19', note: '10% split' },
      { label: 'Test Images', value: '20', note: '10% split' },
      { label: 'Pothole Annotations', value: '514', note: 'Class 1 objects' },
    ],
  },
  {
    title: 'Training',
    metrics: [
      { label: 'Base Model', value: 'YOLO26s', note: 'Ultralytics 8.4.142' },
      { label: 'Training Epochs', value: '50', note: 'Early stop patience: 10' },
      { label: 'Input Image Size', value: '640 px', note: 'Square inference' },
      { label: 'Batch Size', value: '16', note: 'Auto optimizer' },
      { label: 'Hardware', value: 'Tesla T4', note: 'Google Colab GPU' },
    ],
  },
  {
    title: 'Performance',
    metrics: [
      { label: 'Precision', value: '70.95%', note: 'Val split' },
      { label: 'Recall', value: '68.89%', note: 'Val split' },
      { label: 'mAP@50', value: '70.28%', note: 'IoU = 0.50' },
      { label: 'mAP@50-95', value: '39.99%', note: 'Strict metric' },
      { label: 'Inference Speed', value: '~13 ms', note: 'Per image on T4' },
    ],
  },
];

const classes = [
  {
    name: 'Crack',
    color: 'orange',
    description:
      'Linear fractures and fissures on the road surface. Can appear as hairline cracks, alligator/fatigue cracks, or longitudinal/transverse cracks. The current dataset focuses primarily on pothole detection — crack annotations were not present in the training set.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: 'Pothole',
    color: 'blue',
    description:
      'Bowl-shaped depressions or holes in the road surface caused by wear and structural failure. Often circular or irregular in shape. The model was trained on 514 pothole annotations across 195 road images captured in real-world conditions.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
];

const colorMap = {
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'bg-orange-100 text-orange-600',
    badge: 'badge-crack',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
    badge: 'badge-pothole',
  },
};

export default function AboutPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-labelledby="about-heading">

      {/* Page header */}
      <div className="mb-10">
        <h1 id="about-heading" className="text-3xl font-extrabold text-gray-900">About the Model</h1>
        <p className="mt-2 text-gray-500">
          Technical details and performance metrics for the custom-trained YOLO26s road defect detection model.
        </p>
      </div>

      {/* Overview card */}
      <section className="card mb-8" aria-label="Model overview">
        <h2 className="section-title mb-6">Model Overview</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          {[
            { term: 'Model Architecture', detail: 'YOLO26s (Ultralytics 8.4.142)' },
            { term: 'Task', detail: 'Object Detection' },
            { term: 'Input', detail: 'Road Images / Videos (JPG · PNG · WebP · MP4 · AVI)' },
            { term: 'Output', detail: 'Bounding Boxes + Class + Confidence' },
            { term: 'Classes', detail: 'Crack (0), Pothole (1)' },
            { term: 'Framework', detail: 'Python · Ultralytics YOLO · FastAPI' },
            { term: 'Training Platform', detail: 'Google Colab — Tesla T4 GPU' },
            { term: 'Confidence Threshold', detail: '0.25 (default)' },
            { term: 'IoU Threshold (NMS)', detail: '0.45 (default)' },
          ].map(({ term, detail }) => (
            <div key={term}>
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{term}</dt>
              <dd className="mt-1 text-sm font-medium text-gray-800">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Classes */}
      <section className="mb-8" aria-labelledby="classes-heading">
        <h2 id="classes-heading" className="section-title mb-5">Detection Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {classes.map(({ name, color, description, icon }) => {
            const c = colorMap[color];
            return (
              <div
                key={name}
                className={`rounded-2xl border ${c.border} ${c.bg} p-6 flex gap-4`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                  {icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{name}</h3>
                    <span className={c.badge}>Class {name === 'Crack' ? '0' : '1'}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Metrics */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="section-title mb-5">
          Model Metrics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {metricGroups.map(({ title, metrics }) => (
            <div key={title} className="card">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {title}
              </h3>
              <dl className="space-y-4">
                {metrics.map(({ label, value, note }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-gray-600">{label}</dt>
                    <dd className="text-sm font-semibold text-gray-800 flex-shrink-0 flex items-center gap-1.5">
                      {value}
                      <span className="text-xs font-normal text-gray-400 hidden sm:inline">
                        ({note})
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Metrics evaluated on the validation split (19 images). Inference speed measured on Google Colab Tesla T4 GPU.
        </p>
      </section>

    </main>
  );
}

