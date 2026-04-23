# 🗳️ Electionant

An AI-powered interactive assistant that demystifies the election process for citizens. Built with Flask, Google Gemini AI, Google Civic Information API, and Google Calendar API.

## 🌟 Features

- 🤖 **AI Chat Assistant**: Ask any election-related questions and get instant, factual answers powered by Google Gemini.
- 📅 **Interactive Timeline**: Visualize the entire election lifecycle from announcement to results.
- 📋 **Step-by-Step Guides**: Detailed instructions for voter registration, voting procedures, and more.
- 🏛️ **Representative Lookup**: Find your elected officials by simply entering your address.
- 🔔 **Calendar Integration**: Add important election dates directly to your Google Calendar.
- 🔐 **Google Sign-In**: Securely authenticate to access personalized features.
- 📱 **Responsive Design**: Modern, glassmorphic UI that works beautifully on all devices.

## 🛠️ Tech Stack

- **Backend**: Python, Flask
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
- **AI Engine**: Google Gemini API (`gemini-2.0-flash`)
- **Data APIs**: Google Civic Information API, Google Calendar API
- **Auth**: Google OAuth 2.0
- **Security**: Flask-Limiter, CSRF Protection, Input Sanitization (Bleach)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/DebasmitaBose0/Election-Site.git
cd Election-Site
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```
You will need:
- **GEMINI_API_KEY**: From [Google AI Studio](https://aistudio.google.com/)
- **GOOGLE_CLIENT_ID** & **SECRET**: From [Google Cloud Console](https://console.cloud.google.com/) (OAuth 2.0 credentials)
- **GOOGLE_CIVIC_API_KEY**: From Google Cloud Console (Civic Information API)

### 4. Run the Application
```bash
python app.py
```
Open `http://localhost:5000` in your browser.

## 📖 Approach and Logic

### Vertical: Civic Education & Awareness
This solution addresses the "Civic Education" vertical, aiming to bridge the gap between complex election laws and citizen understanding through interactive technology.

### Architecture
The app follows a modular service-oriented architecture:
- **Service Layer**: Decouples external API logic (Gemini, Civic, Calendar) from the web routes.
- **SPA Frontend**: Uses a single-page approach for smooth transitions and a premium feel.
- **Secure by Design**: Implements rate limiting, CSRF protection, and strict input sanitization.

### Assumptions
- The application primarily targets the **Indian Electoral System** but is architected to be extensible.
- Users have a Google account for Calendar and Sign-In features.
- The Civic Information API coverage depends on Google's data availability for the specified region.

## 🧪 Evaluation Focus Areas

- **Code Quality**: Modular Python services and clean, documented JavaScript.
- **Security**: Rate limiting on AI and lookup endpoints; CSRF protection; Bleach sanitization.
- **Efficiency**: Lazy loading of page-specific logic and cached static data.
- **Accessibility**: Semantic HTML, ARIA labels, and skip-to-main-content links.
- **Google Services**: Deep integration of 4 major Google Cloud/AI services.

---
Built with ❤️ for democratic engagement.
