"""
Google Civic Information API Service.
Provides access to representative and election information.
"""

import requests
from config import Config

CIVIC_API_BASE = 'https://www.googleapis.com/civicinfo/v2'


class CivicService:
    """Service class for Google Civic Information API."""

    def __init__(self):
        """Initialize the Civic Information service."""
        self.configured = Config.is_civic_configured()
        self.api_key = Config.GOOGLE_CIVIC_API_KEY

    def get_representatives(self, address: str) -> dict:
        """
        Look up elected representatives by address.

        Args:
            address: The address to look up representatives for

        Returns:
            dict with representative data or error message
        """
        if not self.configured:
            return {
                'error': 'Civic Information API is not configured. Add GOOGLE_CIVIC_API_KEY to .env.',
                'data': None
            }

        try:
            url = f'{CIVIC_API_BASE}/representatives'
            params = {
                'key': self.api_key,
                'address': address,
            }
            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 200:
                data = response.json()
                return self._format_representatives(data)
            elif response.status_code == 404:
                return {'error': 'No representatives found for this address.', 'data': None}
            else:
                return {'error': 'Unable to fetch representative data. Please try again.', 'data': None}

        except requests.exceptions.Timeout:
            return {'error': 'Request timed out. Please try again.', 'data': None}
        except Exception:
            return {'error': 'An error occurred while looking up representatives.', 'data': None}

    def get_election_info(self, address: str) -> dict:
        """
        Get upcoming election information for an address.

        Args:
            address: The address to look up election info for

        Returns:
            dict with election data or error message
        """
        if not self.configured:
            return {
                'error': 'Civic Information API is not configured. Add GOOGLE_CIVIC_API_KEY to .env.',
                'data': None
            }

        try:
            url = f'{CIVIC_API_BASE}/voterinfo'
            params = {
                'key': self.api_key,
                'address': address,
                'electionId': 0,
            }
            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 200:
                return {'data': response.json(), 'error': None}
            else:
                return {'error': 'No upcoming election information found.', 'data': None}

        except requests.exceptions.Timeout:
            return {'error': 'Request timed out. Please try again.', 'data': None}
        except Exception:
            return {'error': 'An error occurred while fetching election info.', 'data': None}

    def _format_representatives(self, data: dict) -> dict:
        """Format the raw API response into a cleaner structure."""
        officials = data.get('officials', [])
        offices = data.get('offices', [])

        representatives = []
        for office in offices:
            official_indices = office.get('officialIndices', [])
            for idx in official_indices:
                if idx < len(officials):
                    official = officials[idx]
                    representatives.append({
                        'name': official.get('name', 'Unknown'),
                        'office': office.get('name', 'Unknown Office'),
                        'party': official.get('party', 'Not specified'),
                        'phones': official.get('phones', []),
                        'urls': official.get('urls', []),
                        'emails': official.get('emails', []),
                        'photo_url': official.get('photoUrl', ''),
                    })

        return {
            'data': {
                'normalized_address': data.get('normalizedInput', {}),
                'representatives': representatives,
            },
            'error': None
        }


# Singleton instance
civic_service = CivicService()
