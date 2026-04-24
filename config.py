"""
Configuration management for the Electionant application.
Loads settings from environment variables with secure defaults.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""

    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False

    # Google Gemini API
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    if GEMINI_API_KEY:
        print(f"DEBUG: GEMINI_API_KEY loaded successfully (Length: {len(GEMINI_API_KEY)})")
    else:
        print("DEBUG: GEMINI_API_KEY NOT FOUND in environment!")

    # Google OAuth 2.0
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')
    GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5000/auth/callback')

    # Google Maps API
    GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '')

    # Google YouTube API
    GOOGLE_YOUTUBE_API_KEY = os.getenv('GOOGLE_YOUTUBE_API_KEY', '')

    # Google Civic Information API
    GOOGLE_CIVIC_API_KEY = os.getenv('GOOGLE_CIVIC_API_KEY', '')

    # Google Calendar API Scopes
    GOOGLE_CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.events']
    GOOGLE_OAUTH_SCOPES = [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/calendar.events',
    ]

    # Rate Limiting
    RATE_LIMIT = int(os.getenv('RATE_LIMIT', '30'))

    @classmethod
    def is_gemini_configured(cls) -> bool:
        """Check if Gemini API key is configured."""
        return bool(cls.GEMINI_API_KEY)

    @classmethod
    def is_oauth_configured(cls) -> bool:
        """Check if Google OAuth is configured."""
        return bool(cls.GOOGLE_CLIENT_ID and cls.GOOGLE_CLIENT_SECRET)

    @classmethod
    def is_civic_configured(cls) -> bool:
        """Check if Civic Information API is configured."""
        return bool(cls.GOOGLE_CIVIC_API_KEY)

    @classmethod
    def is_maps_configured(cls) -> bool:
        """Check if Google Maps API is configured."""
        return bool(cls.GOOGLE_MAPS_API_KEY)

    @classmethod
    def is_youtube_configured(cls) -> bool:
        """Check if Google YouTube API is configured."""
        return bool(cls.GOOGLE_YOUTUBE_API_KEY)
