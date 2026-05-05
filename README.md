# 🗳️ Electionant: Your Interactive Civic Portal

```text
  ______ _           _   _                       _   
 |  ____| |         | | (_)                     | |  
 | |__  | | ___  ___| |_ _  ___  _ __   __ _ _ _| |_ 
 |  __| | |/ _ \/ __| __| |/ _ \| '_ \ / _` | '_ \ __|
 | |____| |  __/ (__| |_| | (_) | | | | (_| | | | |_ 
 |______|_|\___|\___|\__|_|\___/|_| |_|\__,_|_| |_|\__|
```

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)](https://flask.palletsprojects.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-orange.svg)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Empowering Indian citizens with real-time election intelligence and democratic engagement.**

### 🚀 Live Production URL
**[View Electionant Live on Google Cloud Run](https://electionant-746960260176.us-central1.run.app/)**

---

## 🌟 Majestic Features

Electionant is more than just an information portal; it's a high-performance civic experience designed for the 2026 Assembly Elections.

### 📢 Live Pulse News Ticker
Stay updated with a **high-performance, scrolling news bar** that fetches real-time Indian election headlines. Optimized with smooth CSS animations and zero-layout-shift positioning, it keeps you informed about counting dates and official announcements without interrupting your experience.

### 📊 Real-Time Election Results Banner
Integrated a **Live Polling Result Banner** directly into the navigation bar. 
- Features a dynamic, cycling display of counting data (e.g., "Tamil Nadu - 156/234 Counted").
- Includes a blinking 'LIVE' indicator for instant visual confirmation of real-time updates.
- Auto-collapses on smaller viewports to prioritize essential navigation.

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

## 🚧 Current Development Status

- **[IN PROGRESS] Firebase Authentication**: We are currently migrating to a unified **Firebase-based login/registration system**.
  - **Google One-Click Sign-in**: Integration in progress for seamless access.
  - **Email/Password Auth**: Secure account creation via Firebase SDK.
  - **Voter Profile Sync**: In development to personalize your dashboard experience.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Python / Flask |
| **AI Engine** | Google Gemini 2.5 Pro (State-of-the-art reasoning) |
| **Mapping** | Leaflet.js / OpenStreetMap / Overpass API |
| **News Feed** | GNews API (India-specific filtering) |
| **Styling** | Vanilla CSS3 (Zero-CLS / 100% Zoom Optimized / Premium Dark Mode) |
| **Deployment** | Docker / Google Cloud Run (Serverless) |
| **UX Polish** | Professional Preloader / High-Contrast Mode / Fluid Typography |

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
**Status: Initial Deployment Complete ✅**

Electionant is live and optimized for **Google Cloud Run**. 

**Live Link:** [https://electionant-746960260176.us-central1.run.app/](https://electionant-746960260176.us-central1.run.app/)

To redeploy or update:

```bash
gcloud run deploy electionant --source . --region us-central1 --allow-unauthenticated
```

---

---

## 💎 UI/UX Optimization
The platform is meticulously tuned for **100% Browser Zoom** on standard desktop resolutions (1280px+). 
- **Header Stability**: A fixed stack of Top Bar, Navbar, and News Ticker provides constant access to tools.
- **Visual Excellence**: Uses Google Fonts (Inter/Outfit) and custom glassmorphism for a premium, government-grade aesthetic.
- **Fast Interaction**: Optimized script loading and a professional preloader ensure a smooth first-contentful-paint (FCP).

## 📖 Project Philosophy
This project was built to bridge the gap between complex electoral data and citizen understanding. By combining **Official Government Data** with **Generative AI**, we create a platform that is not just a tool, but a democratic companion.

---

### ✨ Project by Debasmita Bose
Built with ❤️ for a more informed and engaged India. 🇮🇳

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/DebasmitaBose0)
