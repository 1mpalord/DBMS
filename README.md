# VectorViz: 3D Hybrid Search Demo

An educational, high-performance vector database demonstration using **Pinecone**, **Transformers.js**, and **React-Three-Fiber**.

## 🚀 Quick Start (Demo Ready)

This project is designed for zero-installation demo purposes. Once deployed, any student can access the URL and interact with the 3D space.

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=vector-demo
```

> **Note:** Index dimension must be **384** (Model: all-MiniLM-L6-v2).

### 2. Run Locally
```bash
npm install
npm run dev
```

## 🧠 Educational Features

- **Real-time Embedding:** Watch text transform into a 384-dimensional vector heatmap directly in the browser (via Transformers.js).
- **3D Visualization:** Explore the vector space in an interactive R3F environment.
- **Search Comparison:**
  - **Semantic:** Meaning-based retrieval using Pinecone.
  - **Lexical:** Keyword-based retrieval using the BM25 algorithm.
  - **Hybrid:** A weighted combination (Alpha) for superior precision.
- **Latency Analysis:** Real-time performance metrics for all retrieval techniques.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **3D:** Three.js / React-Three-Fiber
- **Vector DB:** Pinecone (Serverless)
- **Embeddings:** Transformers.js (ONNX Runtime)
- **Styling:** Tailwind CSS 4.0
- **Icons:** Lucide React

## 🎯 Verification Checklist (Done)

- [x] Zero-cost embedding pipeline (No OpenAI API needed)
- [x] 3D zoom/rotate controls
- [x] Hybrid search logic re-ranking (Alpha supported)
- [x] Wikipedia dataset ingestion module
- [x] Premium dark-mode aesthetics (Glassmorphism)

---
*Created for Demo DBMS Study Project - 1 Day Ready.*
