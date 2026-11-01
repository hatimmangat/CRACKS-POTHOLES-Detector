# Road Defect & Pothole Detection System

An end-to-end, AI-powered road inspection and defect detection platform. This project integrates a **custom fine-tuned YOLO object detection model** with a **modern full-stack web interface** to detect, localize, and classify road surface defects—specifically **potholes** and **cracks**—in real time.

---

## 📌 Project Overview

Maintaining road infrastructure requires efficient, scalable, and automated inspection tools. This project delivers a complete solution that bridges Computer Vision and Web Engineering:

1. **Model Fine-Tuning**: 
   - A state-of-the-art YOLO object detection architecture was fine-tuned on a custom dataset containing real-world road surface images with pothole and crack annotations.
   - The dataset was preprocessed, converted from Pascal VOC XML annotations to YOLO format, and split into training, validation, and test subsets.
   - The model was trained using Ultralytics PyTorch on GPU hardware to achieve high precision, recall, and fast inference speeds (~13 ms per image).
   - The resulting optimized weights (`best.pt`) are loaded into memory for sub-second inference.

2. **Web Integration & Microservice Architecture**:
   - **Python FastAPI ML Service**: Serves as the dedicated inference engine. It loads the fine-tuned YOLO model on startup and exposes REST endpoints (`/predict`, `/health`) to process incoming images, apply Non-Maximum Suppression (NMS), draw annotated bounding boxes, and compute confidence metrics.
   - **Node.js + Express API Gateway**: Serves as the intermediate backend layer handling file validation, request routing, rate limiting/security headers, and proxying communication between the client and ML service.
   - **Interactive Web Interface (React + Vite + Tailwind CSS)**: A responsive, user-friendly frontend dashboard where users can drag-and-drop road photographs, trigger instant AI detection, view bounding box overlays, and analyze key statistics (defect counts, confidence distribution, severity breakdown).

```
┌───────────────────────────────┐
│     React Frontend (Vite)     │  ← Drag-and-drop UI, visual bounding boxes & stats
│    (http://localhost:5173)    │
└───────────────┬───────────────┘
                │  POST /api/predict (Multipart Form)
                ▼
┌───────────────────────────────┐
│   Node.js + Express Gateway   │  ← Request validation, proxying & security
│    (http://localhost:5000)    │
└───────────────┬───────────────┘
                │  POST /predict (Forwarded Image)
                ▼
┌───────────────────────────────┐
│    FastAPI + YOLO Service     │  ← Fine-Tuned YOLO Model (`best.pt`)
│    (http://localhost:8000)    │  ← Real-time inference + Bounding Box Annotations
└───────────────────────────────┘
```

---

## Project Structure

```
Interface/
├── frontend/                  ← React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/        ← Reusable UI components
│   │   ├── pages/             ← Route-level pages
│   │   ├── services/api.js    ← Axios client → Node.js backend
│   │   ├── hooks/             ← usePrediction custom hook
│   │   ├── utils/             ← formatters
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── vite.config.js
│
├── backend/                   ← Node.js + Express API gateway
│   ├── src/
│   │   ├── controllers/       ← Request handlers
│   │   ├── routes/            ← Express routes
│   │   ├── middleware/        ← Multer, error handler
│   │   ├── services/          ← FastAPI client
│   │   ├── utils/             ← Logger
│   │   ├── app.js
│   │   └── server.js
│   └── .env
│
└── mlService/                 ← Python + FastAPI + YOLO
    ├── app/
    │   ├── main.py            ← FastAPI app + endpoints
    │   ├── model.py           ← Single model load at startup
    │   ├── schemas.py         ← Pydantic models
    │   ├── predictor.py       ← YOLO inference logic
    │   └── utils.py           ← File validation + safe paths
    ├── models/
    │   └── best.pt            ← ⚠️ Add your model here (not in git)
    ├── results/               ← Annotated images (runtime generated)
    └── requirements.txt
```

---

## Requirements

| Service | Requirements |
|---------|-------------|
| Frontend | Node.js ≥ 18, npm ≥ 9 |
| Backend | Node.js ≥ 18, npm ≥ 9 |
| ML Service | Python ≥ 3.10, pip |
| Model | `best.pt` (your trained YOLO model) |

---

## Installation

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Python ML Service Dependencies

```bash
cd mlService
pip install -r requirements.txt
```

> **Tip:** Use a virtual environment:
> ```bash
> python -m venv venv
> # Windows
> venv\Scripts\activate
> # macOS/Linux
> source venv/bin/activate
> pip install -r requirements.txt
> ```

---

## ⚠️ How to Add best.pt

> **The YOLO model file is NOT included in this repository.**
> You must add it manually before starting the ML service.

1. Copy your trained model file to:
   ```
   mlService/models/best.pt
   ```

2. Verify the path in `mlService/.env`:
   ```
   MODEL_PATH=models/best.pt
   ```

3. Start the ML service — it will load the model on startup.

> **Want to commit the model to git?** Edit `mlService/.gitignore` and comment out the `models/best.pt` line. Only recommended for small models or when using Git LFS.

---

## Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

In production, set this to your deployed Node.js backend URL:
```env
VITE_API_URL=https://your-backend.example.com
```

### Node.js Backend (`backend/.env`)

```env
PORT=5000
ML_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
ML_SERVICE_TIMEOUT=30000
```

### Python ML Service (`mlService/.env`)

```env
MODEL_PATH=models/best.pt
CONFIDENCE_THRESHOLD=0.25
IOU_THRESHOLD=0.45
IMAGE_SIZE=640
DEVICE=cpu
CORS_ORIGINS=http://localhost:5000
```

---

## Starting the Application

You can start all 3 servers using the **1-Click Launcher** or by running **simple commands** in 3 separate terminals.

---

### ⚡ Option A: 1-Click Launch All Servers (Windows)

In the root `Interface/` folder, run or double-click `start.bat`:

```cmd
start.bat
```
*(This automatically opens 3 separate terminal windows running each server).*

---

### 🖥️ Option B: Run in 3 Separate Terminals

#### Quick Summary:

| Terminal | Directory | Command | Port / URL |
|---|---|---|---|
| **1. ML Service** | `mlService/` | `python run.py` | `http://localhost:8000` |
| **2. Backend API** | `backend/` | `npm run dev` | `http://localhost:5000` |
| **3. Frontend UI** | `frontend/` | `npm run dev` | `http://localhost:5173` |

---

#### Step 1 — Start ML Service (Terminal 1)
```bash
cd mlService
python run.py
```
> *(Alternative: `python -m uvicorn app.main:app --reload --port 8000`)*

#### Step 2 — Start Backend API (Terminal 2)
```bash
cd backend
npm run dev
```

#### Step 3 — Start Frontend UI (Terminal 3)
```bash
cd frontend
npm run dev
```

---

### ✅ Verifying Everything is Running

1. **Frontend UI**: [http://localhost:5173](http://localhost:5173)
2. **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
3. **FastAPI ML Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Documentation

### Python ML Service (FastAPI)

#### `GET /health`

Returns service and model status.

**Response:**
```json
{
  "status": "ok",
  "service": "ml-service",
  "model_loaded": true
}
```

---

#### `POST /predict`

Run YOLO detection on an uploaded road image.

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Road image (jpg/png/webp, max 20 MB) |
| `confidence` | float | Min confidence (default: 0.25) |
| `iou` | float | IoU threshold (default: 0.45) |
| `image_size` | int | Inference size (default: 640) |

**Response:**
```json
{
  "success": true,
  "detections": [
    {
      "class_id": 0,
      "class_name": "crack",
      "confidence": 0.91,
      "bbox": { "x1": 120, "y1": 80, "x2": 450, "y2": 300 }
    },
    {
      "class_id": 1,
      "class_name": "pothole",
      "confidence": 0.95,
      "bbox": { "x1": 500, "y1": 200, "x2": 800, "y2": 500 }
    }
  ],
  "summary": {
    "total_detections": 2,
    "cracks": 1,
    "potholes": 1,
    "average_confidence": 0.93
  },
  "image_dimensions": { "width": 1280, "height": 720 },
  "result_image_url": "/results/prediction_abc123.jpg"
}
```

---

#### `GET /results/{filename}`

Serve annotated result image. Only accepts `prediction_<uuid>.jpg` filenames.

---

### Node.js Backend

#### `GET /api/health`

Checks Node.js backend and ML service health.

#### `POST /api/predict`

Proxies the image upload to FastAPI and returns the prediction result.

#### `GET /api/results/{filename}`

Proxies the result image from FastAPI to the browser. The frontend **never contacts FastAPI directly**.

---

## Deployment

### Architecture for Deployment

You can deploy each service independently:

| Service | Recommended Hosts |
|---------|------------------|
| Frontend | Vercel, Netlify, GitHub Pages |
| Node.js Backend | Railway, Render, Fly.io, AWS EC2 |
| Python ML Service | Render, Fly.io, AWS EC2, Azure, GCP |

### ⚠️ Vercel / Serverless Limitations

The Python ML service **is NOT suitable for Vercel serverless** because:
- PyTorch + Ultralytics dependencies exceed Vercel's 50 MB compressed bundle limit
- YOLO inference time exceeds serverless execution time limits
- `best.pt` model files can be hundreds of MB

**Recommended:** Deploy the Python ML service to a container-based host (Render, Fly.io, Railway, or a VM).

### Deployment Checklist

- [ ] Set `VITE_API_URL` to your deployed Node.js URL before building frontend
- [ ] Set `ML_SERVICE_URL` in Node.js backend to your deployed Python service URL
- [ ] Set `CORS_ORIGIN` in Node.js to your deployed frontend URL
- [ ] Set `CORS_ORIGINS` in Python service to your deployed Node.js URL
- [ ] Upload `best.pt` to your Python service deployment (via volume mount, cloud storage, etc.)
- [ ] Set `DEVICE=cpu` unless your deployment has CUDA GPU

### Build Frontend for Production

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

---

## Troubleshooting

### ML Service fails to start — model not found

```
[ML] Model file not found at '...models/best.pt'
```

**Fix:** Copy `best.pt` to `mlService/models/best.pt`.

---

### "The term 'uvicorn' is not recognized"

**Fix:** Run using Python directly:
```bash
cd mlService
python run.py
```
Or ensure dependencies are installed:
```bash
pip install -r requirements.txt
```

---

### CORS errors in browser

**Fix:** Check `CORS_ORIGIN` in `backend/.env` matches your exact frontend URL (including port).

---

### "ML service is unavailable"

The Node.js backend cannot reach FastAPI.

**Fix:**
1. Ensure the Python service is running on port 8000
2. Check `ML_SERVICE_URL` in `backend/.env`

---

### Prediction takes a long time

- First prediction may be slow due to model warm-up (YOLO compiles internally)
- Subsequent predictions are fast — the model stays loaded
- Increase `ML_SERVICE_TIMEOUT` in `backend/.env` if needed

---

### "Unsupported file type" error

Supported formats: `jpg`, `jpeg`, `png`, `webp`. Maximum size: 20 MB.

---

## Security Notes

- The YOLO model file is **never exposed** as a public URL
- Result images are served only via UUID-named paths — no path traversal possible
- The browser **only communicates with the Node.js backend** — FastAPI is never directly accessible to users
- File uploads are validated by both Node.js (Multer) and FastAPI independently
- Helmet.js provides security headers on the Node.js backend

---

## Model Classes

| Class ID | Name |
|----------|------|
| 0 | crack |
| 1 | pothole |

Class names are read directly from the loaded YOLO model when available.
