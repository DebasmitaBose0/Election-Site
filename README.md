# Electionant: Your Interactive Civic Portal

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

<<<<<<< babin
[**View Architecture**](ARCHITECTURE.md) | [**View License**](LICENSE)
=======
### 🚀 Live Production URL
**[View Electionant Live on Google Cloud Run](https://electionant-746960260176.us-central1.run.app/)**
---

## Latest Project Updates (May 2026)

- **Official Developer Signature**: Digital certificates now feature the authenticated signature: *"Signed by Electionant Developer, Debasmita Bose"*.
- **Enhanced UI Branding**: Added large, high-fidelity Lucide icons to FAQ, Privacy, and Terms pages for a more professional aesthetic.
- **Mobile-Friendly Optimization**: Improved responsiveness for the "Engagement Insight" section and standardized left-aligned footer social icons across all devices.
- **Premium Accordion Logic**: Refined FAQ section with glassmorphism styling, smooth transitions, and improved touch interactions.
---
### 📢 Live Pulse News Ticker
Stay updated with a **high-performance, scrolling news bar** that fetches real-time Indian election headlines. Optimized with smooth CSS animations and zero-layout-shift positioning, it keeps you informed about counting dates and official announcements without interrupting your experience.

### 📊 Real-Time Election Results Banner
Integrated a **Live Polling Result Banner** directly into the navigation bar. 
- Features a dynamic, cycling display of counting data (e.g., "Tamil Nadu - 156/234 Counted").
- Includes a blinking 'LIVE' indicator for instant visual confirmation of real-time updates.
- Auto-collapses on smaller viewports to prioritize essential navigation.


## Key Features

Electionant is a comprehensive, mobile-responsive civic platform designed for the 2026 Assembly Elections with cutting-edge AI integration.

### Digital Voter Pledge & Certificate
Generate professional, print-ready voter pledges with unique certificates.
- **PDF Generation**: Professional A4 landscape format with "ELECTIONANT" branding and centered developer signature.
- **Unique Pledge IDs**: Authenticity verification for each pledge.
- **Official Branding**: ECI header with platform logo for credibility.
- **Multi-Device Support**: View, download, and print on any device.
- **Social Sharing**: Easy Twitter/social media sharing of your civic commitment.

### Smart Polling Booth Finder
Accurate, cost-free polling station locator with real-time navigation.
- **Interactive Mapping**: Leaflet.js + OpenStreetMap for precise booth locations
- **Responsive Design**: 500px height on desktop, optimized 300px on mobile for visibility
- **Address Search**: Find booths using location, area name, or pincode
- **Navigation Links**: Direct Google Maps integration for real-time directions
- **Enhanced UI**: Sidebar with booth listings, filter buttons, and legend
- **Saffron Branding**: Custom-styled map with Indian flag colors

### Tiered Representative Lookup
Multi-layered system ensuring you always find your elected leaders.
1. **Google Civic API**: Official primary source for real-time data
2. **Smart Fallback**: AI-powered research using Gemini for edge cases
3. **Verified Database**: Local fallback for 100% uptime in major Indian cities
4. **Multi-Level**: Find representatives at local, state, and national levels

### AI Chat Assistance
Conversational AI powered by Google Gemini 2.5 Pro.
- **Election Intelligence**: Ask questions about voting, representatives, procedures
- **Context Awareness**: Specialized election and civic knowledge
- **Instant Responses**: Real-time AI-powered assistance
- **Fallback Ready**: Graceful degradation if primary service unavailable

### Educational Gallery
Curated video content from official election sources.
- **YouTube Integration**: Authentic educational content
- **Easy Navigation**: One-click video playback
- **Full-Screen Support**: Immersive learning experience

### Live News Ticker
Stay informed with real-time Indian election headlines.
- **Auto-Scrolling Updates**: Dynamic news bar with latest election information
- **ECI Announcements**: Official Election Commission updates
- **Election Countdowns**: Registration deadlines and voting dates

### Election Timeline
Interactive timeline of major events in the electoral cycle.
- **Key Dates**: Important milestones and deadlines
- **Phase-Wise Schedule**: Detailed phase-wise election information
- **Visual Navigation**: Easy-to-understand timeline interface

---

### Educational Gallery & Interactive Insights
- **Official Media**: Curated educational content from official election sources.
- **Data Visualization**: Interactive charts showing youth participation and engagement trends.
- **Dynamic Headers**: Branded icons for all legal and FAQ sections.

---

<<<<<<< babin
## Mobile-First Responsive Design

Fully optimized for all devices with mobile-first CSS approach.

**Device Breakpoints**:
- **Ultra-Mobile (≤480px)**: Single-column layouts, 36px touch icons, 44px buttons
- **Tablets (481-768px)**: 2-column grids, optimized spacing and typography
- **Desktop (≥769px)**: Full 4-column layouts, enhanced visual hierarchy
- **Landscape**: Optimized for short viewport heights

**Mobile Optimizations**:
- Left-aligned social icons in footer for better readability and reach.
- Word-wrap optimized headers for the Insight section.
- Stacked footer layout with centered brand emblem and left-aligned text.
- Full-height polling booth map (300px minimum).
- Adaptive padding and margins.
- Optimized form inputs for mobile keyboards.
- Reduced hero height on small screens.
=======
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
>>>>>>> main

---

## Technology Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| **Backend** | Python / Flask | 3.14 / 3.0+ |
| **Frontend** | HTML5, CSS3, JavaScript (SPA) | ES6+ / Vanilla JS |
| **AI Engine** | Google Gemini API | 2.5-pro |
| **Mapping** | Leaflet.js / OpenStreetMap | Latest |
| **APIs** | Google Civic, Maps, YouTube, Calendar | Official SDKs |
| **PDF Generation** | ReportLab | Python Library |
| **Styling** | Custom CSS3 (Glassmorphism) | No frameworks |
| **Icons** | Lucide Icons | CDN |
| **Maps** | Google Maps API / Leaflet.js | Interactive Maps |
| **Authentication** | OAuth 2.0 | Google OAuth |
| **Deployment** | Docker / Google Cloud Run | Serverless |

---

## Quick Setup

### 1. Clone & Install
```bash
git clone https://github.com/DebasmitaBose0/Election-Site.git
cd Election-Site
pip install -r requirements.txt
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CIVIC_API_KEY=your_civic_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key
YOUTUBE_API_KEY=your_youtube_api_key
SECRET_KEY=your_random_secret_key
```

### 3. Run Locally
```bash
python app.py
```
Visit **`http://localhost:8080`**

The application will start with all services configured:
- Gemini AI: Configured
- OAuth 2.0: Configured  
- Civic API: Configured
- YouTube: Configured

---
## Cloud Deployment
=======
## ☁️ Cloud Deployment
**Status: Initial Deployment Complete ✅**

Electionant is live and optimized for **Google Cloud Run**. 

**Live Link:** [https://electionant-746960260176.us-central1.run.app/](https://electionant-746960260176.us-central1.run.app/)
To redeploy or update:

```bash
gcloud run deploy electionant --source . --region us-central1 --allow-unauthenticated
```

---


## Project Philosophy
---

## 💎 UI/UX Optimization
The platform is meticulously tuned for **100% Browser Zoom** on standard desktop resolutions (1280px+). 
- **Header Stability**: A fixed stack of Top Bar, Navbar, and News Ticker provides constant access to tools.
- **Visual Excellence**: Uses Google Fonts (Inter/Outfit) and custom glassmorphism for a premium, government-grade aesthetic.
- **Fast Interaction**: Optimized script loading and a professional preloader ensure a smooth first-contentful-paint (FCP).

## 📖 Project Philosophy
This project was built to bridge the gap between complex electoral data and citizen understanding. By combining **Official Government Data** with **Generative AI**, we create a platform that is not just a tool, but a democratic companion.

---

### Project by Debasmita Bose
Built for a more informed and engaged India.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/DebasmitaBose0)
