"""
Google Calendar API Service.
Allows users to add election dates and reminders to their Google Calendar.
"""

from datetime import datetime, timedelta


class CalendarService:
    """Service class for Google Calendar API interactions."""

    @staticmethod
    def create_election_event(credentials, event_data: dict) -> dict:
        """
        Create an event in user's Google Calendar.

        Args:
            credentials: Google OAuth credentials
            event_data: Event details (title, description, date)

        Returns:
            dict with event link or error message
        """
        try:
            from googleapiclient.discovery import build
            service = build('calendar', 'v3', credentials=credentials)

            event_date = event_data.get('date', datetime.now().strftime('%Y-%m-%d'))
            title = event_data.get('title', 'Election Reminder')
            description = event_data.get('description', '')

            event = {
                'summary': f'🗳️ {title}',
                'description': description,
                'start': {
                    'date': event_date,
                    'timeZone': 'Asia/Kolkata',
                },
                'end': {
                    'date': event_date,
                    'timeZone': 'Asia/Kolkata',
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'popup', 'minutes': 1440},  # 1 day before
                        {'method': 'popup', 'minutes': 60},     # 1 hour before
                    ],
                },
                'colorId': '9',  # Blueberry color
            }

            created_event = service.events().insert(
                calendarId='primary', body=event
            ).execute()

            return {
                'success': True,
                'event_link': created_event.get('htmlLink', ''),
                'event_id': created_event.get('id', ''),
                'error': None
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to create calendar event: {str(e)}',
                'event_link': None,
                'event_id': None
            }

    @staticmethod
    def get_election_dates() -> list:
        """
        Get a list of important election dates that can be added to calendar.

        Returns:
            List of election date events
        """
        # These would typically come from a dynamic source
        current_year = datetime.now().year
        return [
            {
                'id': 'national_voters_day',
                'title': 'National Voters Day',
                'date': f'{current_year}-01-25',
                'description': 'National Voters Day - Celebrated to encourage voter enrollment and participation.',
                'category': 'awareness'
            },
            {
                'id': 'voter_reg_deadline',
                'title': 'Voter Registration Review',
                'date': f'{current_year}-06-01',
                'description': 'Review and update your voter registration details. Ensure your address and information are current.',
                'category': 'registration'
            },
            {
                'id': 'election_prep',
                'title': 'Election Preparation Reminder',
                'date': f'{current_year}-09-01',
                'description': 'Start preparing for upcoming elections. Check your voter ID, know your polling station.',
                'category': 'preparation'
            },
        ]


# Singleton instance
calendar_service = CalendarService()
