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
        self._cache = {}  # Simple in-memory cache for efficiency
        self.ai_service = None # Set dynamically to avoid circular import

    def get_representatives(self, address: str) -> dict:
        """Look up elected representatives by address with local fallback."""
        if not self.configured:
            return {'error': 'Civic API not configured', 'data': None}

        # Force Indian context
        if 'india' not in address.lower():
            address = f"{address}, India"

        clean_address = address.strip().lower()

        # 1. LEVEL 1: CHECK LOCAL FALLBACK FIRST (GUARANTEED RESULTS)
        import json
        import os
        fallback_path = os.path.join('data', 'representatives_fallback.json')
        if os.path.exists(fallback_path):
            with open(fallback_path, 'r') as f:
                fallbacks = json.load(f)
                for city, city_data in fallbacks.items():
                    if city.lower() in clean_address:
                        print(f"DEBUG: Using Local Verified Data for {city}")
                        return {'data': city_data, 'error': None}

        # 2. LEVEL 2: CHECK CACHE
        if clean_address in self._cache:
            return self._cache[clean_address]

        # 3. LEVEL 3: LIVE API CALL
        try:
            url = f'{CIVIC_API_BASE}/representatives'
            params = {'key': self.api_key, 'address': address}
            response = requests.get(url, params=params, timeout=10)
            print(f"DEBUG: Civic API Status: {response.status_code} for {address}")

            if response.status_code == 200:
                data = response.json()
                if not data.get('officials'):
                    # Try context retry if empty
                    if 'west bengal' not in address.lower():
                        print(f"DEBUG: Empty result. Retrying with WB context...")
                        params['address'] = f"{address.split(',')[0]}, West Bengal, India"
                        response = requests.get(url, params=params, timeout=10)
                        data = response.json()

                formatted_data = self._format_representatives(data)
                
                # ONLY cache if we actually found representatives
                if formatted_data['data']['representatives']:
                    self._cache[clean_address] = formatted_data
                
                return formatted_data
            else:
                return {'error': f'Civic API returned status {response.status_code}', 'data': None}

        except Exception as e:
            print(f"DEBUG: Civic API Exception: {e}")
            return {'error': 'Unable to fetch representative data.', 'data': None}

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

    def get_all_elections(self) -> dict:
        """
        Fetch all upcoming elections from the Google Civic API.
        
        Returns:
            dict with list of elections or error message
        """
        if not self.configured:
            return {'error': 'Civic API not configured', 'data': []}

        try:
            url = f'{CIVIC_API_BASE}/elections'
            params = {'key': self.api_key}
            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 200:
                data = response.json()
                return {'data': data.get('elections', []), 'error': None}
            else:
                return {'error': 'Failed to fetch elections', 'data': []}
        except Exception as e:
            print(f"DEBUG: Error fetching elections: {e}")
            return {'error': str(e), 'data': []}

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
