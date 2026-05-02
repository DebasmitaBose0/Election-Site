# 🗳️ Electionant: Your Interactive Civic Portal

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)](https://flask.palletsprojects.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-orange.svg)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Empowering Indian citizens with real-time election intelligence and democratic engagement.**

---

## 🌟 Majestic Features

Electionant is more than just an information portal; it's a high-performance civic experience designed for the 2026 Assembly Elections.

### 📢 Live Pulse News Ticker
Stay updated with a **dynamic, scrolling news bar** that fetches real-time Indian election headlines via GNews and the Election Commission of India. It keeps you informed about counting dates, registration deadlines, and official announcements.

### 📜 Digital Voter Pledge & Certificate
Take the ethical voting pledge and instantly generate a **premium, print-ready Digital Certificate**. 
- Features unique **Pledge IDs** for authenticity.
- **A4 Landscape optimized** for professional printing and social sharing.
- "Project by Debasmita" watermark for official attribution.

### 📍 Smart Polling Booth Finder
A high-accuracy, cost-free mapping solution using **Leaflet & Overpass API**.
- Detects polling stations, schools, and community centers in a 5km radius.
- Supports both individual nodes and building polygons (Ways).
- Built-in **Google Maps navigation** links for every booth.

### 🏛️ Tiered Representative Lookup
A robust failover system to ensure you always find your leaders.
1. **Google Civic API**: Primary official source.
2. **Verified Fallback**: Local database for 100% uptime in major Indian cities.
3. **AI Discovery**: Real-time representative research for new/changing jurisdictions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Python / Flask |
| **AI Engine** | Google Gemini 2.5 Pro (State-of-the-art reasoning) |
| **Mapping** | Leaflet.js / OpenStreetMap / Overpass API |
| **News Feed** | GNews API (India-specific filtering) |
| **Styling** | Vanilla CSS3 (Custom Glassmorphism / Premium Dark Mode) |
| **Deployment** | Docker / Google Cloud Run (Serverless) |

---

## 🚀 Quick Setup

### 1. Clone & Install
```bash
git clone https://github.com/DebasmitaBose0/Election-Site.git
cd Election-Site
pip install -r requirements.txt
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_key
GOOGLE_CIVIC_API_KEY=your_civic_key
GNEWS_API_KEY=your_gnews_key
SECRET_KEY=any_random_string
```

### 3. Run Locally
```bash
python app.py
```
Visit `http://localhost:5002` 🗳️

---

## ☁️ Cloud Deployment

Electionant is optimized for **Google Cloud Run**. To deploy in under 5 minutes:

```bash
gcloud run deploy electionant --source . --region us-central1 --allow-unauthenticated
```

---

## 📖 Project Philosophy
This project was built to bridge the gap between complex electoral data and citizen understanding. By combining **Official Government Data** with **Generative AI**, we create a platform that is not just a tool, but a democratic companion.

---

### ✨ Project by Debasmita Bose
Built with ❤️ for a more informed and engaged India. 🇮🇳

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/DebasmitaBose0)
