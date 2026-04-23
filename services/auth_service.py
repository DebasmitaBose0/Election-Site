"""
Google OAuth 2.0 Authentication Service.
Handles user authentication via Google Sign-In.
"""

import json
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from config import Config

# Allow HTTP for local development
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'


class AuthService:
    """Service class for Google OAuth 2.0 authentication."""

    def __init__(self):
        """Initialize the auth service."""
        self.configured = Config.is_oauth_configured()

    def get_auth_flow(self) -> Flow:
        """
        Create and return a Google OAuth flow.

        Returns:
            Google OAuth Flow object
        """
        client_config = {
            'web': {
                'client_id': Config.GOOGLE_CLIENT_ID,
                'client_secret': Config.GOOGLE_CLIENT_SECRET,
                'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
                'token_uri': 'https://oauth2.googleapis.com/token',
                'redirect_uris': [Config.GOOGLE_REDIRECT_URI],
            }
        }

        flow = Flow.from_client_config(
            client_config,
            scopes=Config.GOOGLE_OAUTH_SCOPES,
            redirect_uri=Config.GOOGLE_REDIRECT_URI,
        )
        return flow

    def get_user_info(self, credentials: Credentials) -> dict:
        """
        Get user info from Google using credentials.

        Args:
            credentials: Google OAuth credentials

        Returns:
            dict with user profile info
        """
        try:
            from googleapiclient.discovery import build
            service = build('oauth2', 'v2', credentials=credentials)
            user_info = service.userinfo().get().execute()
            return {
                'id': user_info.get('id'),
                'email': user_info.get('email'),
                'name': user_info.get('name'),
                'picture': user_info.get('picture'),
            }
        except Exception:
            return None

    def credentials_to_dict(self, credentials: Credentials) -> dict:
        """Convert credentials to a serializable dict for session storage."""
        return {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': list(credentials.scopes) if credentials.scopes else [],
        }

    def dict_to_credentials(self, creds_dict: dict) -> Credentials:
        """Reconstruct credentials from a dict."""
        return Credentials(**creds_dict)


# Singleton instance
auth_service = AuthService()
