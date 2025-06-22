# 🎧 Podcast Summarizer – Full Setup & Instructions

A modern AI-powered app that summarizes podcast audio/video/text into clear, concise summaries using Whisper and Transformers.

---

## 🗂️ Project Structure

```
podcast-summarizer/
├── client/                       # React + Tailwind frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   └── (images/icons)
│   │   ├── components/
│   │   │   ├── PodcastSummarizer.tsx
│   │   │   └── WaveformAnimation.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── main.tsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
├── server/                       # Flask backend
│   ├── venv/                     # Python virtual environment
│   ├── app.py                    # Flask server with Whisper + Transformers
│   ├── requirements.txt          # Python dependencies
├── podcast_test.txt              # Sample podcast transcript (for text upload)
```

---

## ✅ Prerequisites

- Node.js ≥ 18.x
- Python ≥ 3.8
- Git
- ffmpeg (for audio extraction from video)
```bash
sudo apt install ffmpeg           # Linux
brew install ffmpeg              # macOS
choco install ffmpeg             # Windows (Chocolatey)
```

---

## 🧰 Backend Setup (Flask + Whisper + Transformers)

### 1. Create and activate virtual environment

```bash
cd server
python -m venv venv
# Activate:
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### requirements.txt
```
flask
flask-cors
transformers
torch
whisper
moviepy
```
> Run `pip freeze > requirements.txt` to regenerate if needed

### 3. Run the server

```bash
python app.py
```

- Backend runs on: `http://localhost:5000`

---

## 🌐 Frontend Setup (React + TypeScript + Tailwind + Framer Motion)

```bash
cd client
npm install
```

### Scripts

- `npm run dev` – Start dev server
- `npm run build` – Build for production

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Podcast Summarizer</title>
  </head>
  <body class="bg-gray-100">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### App.tsx

```tsx
import PodcastSummarizer from './components/PodcastSummarizer';
function App() {
  return <PodcastSummarizer />;
}
export default App;
```

### App.css & index.css

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* App.css */
body {
  font-family: 'Inter', sans-serif;
}
```

---

## 📄 PodcastSummarizer.tsx

- Core UI logic for uploading, summarizing, copying, listening.
- Upload formats: `.mp3`, `.wav`, `.m4a`, `.txt`, `.mp4`, etc.
- Dark/light theme toggle
- Speech synthesis for listening to summaries

---

## 🎛️ WaveformAnimation.tsx

- Animated waveform visualization (framer-motion)
- Reflects whether the AI is active

---

## 🧪 Test Input

### podcast_test.txt (example)
```
Welcome to the Tech Times podcast. Today we're diving into generative AI...
```
> You can drag this file or paste the content to test the summary

---

## 🚀 Deploy (Optional)

### 1. Build frontend

```bash
cd client
npm run build
```

### 2. Serve frontend with backend using Flask + static

Add this to `app.py` if serving frontend from Flask:

```py
from flask import send_from_directory
@app.route('/')
def serve_index():
    return send_from_directory('../client/dist', 'index.html')
```

Use `client/dist` as `static_folder` in Flask if needed.

---

## 🩺 Health Check

```
GET http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "models_loaded": true,
  "service": "podcast-summarizer"
}
```

---

## 📦 Future Improvements

- Use OpenAI Whisper API for faster cloud inference
- Add chunk-based progress bar
- Deploy on Render/Netlify/Vercel

---

## 👨‍💻 Author

Built with 💙 by [Santhosh Thouda]

---

## 📜 License

MIT License