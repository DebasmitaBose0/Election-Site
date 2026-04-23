"""
Electionant - Main Flask Application
An AI-powered interactive assistant that helps users understand
the election process, timelines, and steps.
"""

import json
import os
from functools import wraps
from datetime import datetime

from flask import (
    Flask, render_template, request, jsonify, session, redirect, url_for
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
import bleach

from config import Config
from services.gemini_service import gemini_service
from services.civic_service import civic_service
from services.calendar_service import calendar_service
from services.auth_service import auth_service

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY

# Security: CSRF Protection
csrf = CSRFProtect(app)

# Rate Limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[f"{Config.RATE_LIMIT} per minute"],
    storage_uri="memory://",
)

# Load election data
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'election_data.json')
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    ELECTION_DATA = json.load(f)


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """Sanitize user input to prevent XSS and injection attacks."""
    if not text:
        return ''
    text = text[:max_length]
    return bleach.clean(text, tags=[], strip=True)


def login_required(f):
    """Decorator to require authentication for certain routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return jsonify({'error': 'Authentication required. Please sign in with Google.'}), 401
        return f(*args, **kwargs)
    return decorated_function


# ──────────────────────────────────────────
# Page Routes
# ──────────────────────────────────────────

@app.route('/')
def index():
    """Serve the main application page."""
    return render_template(
        'index.html',
        gemini_configured=Config.is_gemini_configured(),
        oauth_configured=Config.is_oauth_configured(),
        civic_configured=Config.is_civic_configured(),
    )


# ──────────────────────────────────────────
# Chat API
# ──────────────────────────────────────────

@app.route('/api/chat', methods=['POST'])
@limiter.limit("20 per minute")
@csrf.exempt
def chat():
    """Handle chat messages via Google Gemini AI Service for Electionant."""
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'No message provided'}), 400

    message = sanitize_input(data['message'], max_length=2000)
    if not message:
        return jsonify({'error': 'Empty message'}), 400

    history = data.get('history', [])

    # Sanitize history
    clean_history = []
    for entry in history[-10:]:  # Limit to last 10 messages for context
        clean_history.append({
            'role': entry.get('role', 'user'),
            'content': sanitize_input(entry.get('content', ''), max_length=2000)
        })

    result = gemini_service.chat(message, clean_history)

    if result.get('error'):
        return jsonify({'error': result['error']}), 500

    return jsonify({'response': result['response']})


# ──────────────────────────────────────────
# Election Data API
# ──────────────────────────────────────────

@app.route('/api/timeline')
def get_timeline():
    """Get election timeline data."""
    return jsonify({'timeline': ELECTION_DATA.get('timeline', [])})


@app.route('/api/guides')
def get_guides():
    """Get all election guides."""
    guides = ELECTION_DATA.get('guides', [])
    # Return summaries without full steps for listing
    summaries = [{
        'id': g['id'],
        'title': g['title'],
        'icon': g['icon'],
        'description': g['description'],
        'step_count': len(g.get('steps', []))
    } for g in guides]
    return jsonify({'guides': summaries})


@app.route('/api/guides/<guide_id>')
def get_guide(guide_id):
    """Get a specific guide by ID."""
    guide_id = sanitize_input(guide_id, max_length=100)
    guides = ELECTION_DATA.get('guides', [])
    for guide in guides:
        if guide['id'] == guide_id:
            return jsonify({'guide': guide})
    return jsonify({'error': 'Guide not found'}), 404


@app.route('/api/faqs')
def get_faqs():
    """Get frequently asked questions."""
    return jsonify({'faqs': ELECTION_DATA.get('faqs', [])})


@app.route('/api/glossary')
def get_glossary():
    """Get election terminology glossary."""
    return jsonify({'glossary': ELECTION_DATA.get('glossary', [])})


# ──────────────────────────────────────────
# Google Civic Information API
# ──────────────────────────────────────────

@app.route('/api/representatives')
@limiter.limit("10 per minute")
def get_representatives():
    """Look up representatives by address."""
    address = request.args.get('address', '')
    address = sanitize_input(address, max_length=500)

    if not address:
        return jsonify({'error': 'Address is required'}), 400

    result = civic_service.get_representatives(address)

    if result.get('error'):
        return jsonify({'error': result['error']}), 400

    return jsonify(result['data'])


# ──────────────────────────────────────────
# Google Calendar API
# ──────────────────────────────────────────

@app.route('/api/calendar/dates')
def get_calendar_dates():
    """Get election dates available for calendar."""
    dates = calendar_service.get_election_dates()
    return jsonify({'dates': dates})


@app.route('/api/calendar/add', methods=['POST'])
@csrf.exempt
@login_required
def add_to_calendar():
    """Add an election event to user's Google Calendar."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No event data provided'}), 400

    creds_dict = session.get('credentials')
    if not creds_dict:
        return jsonify({'error': 'Not authenticated. Please sign in.'}), 401

    credentials = auth_service.dict_to_credentials(creds_dict)

    event_data = {
        'title': sanitize_input(data.get('title', 'Election Reminder'), max_length=200),
        'description': sanitize_input(data.get('description', ''), max_length=1000),
        'date': sanitize_input(data.get('date', ''), max_length=10),
    }

    result = calendar_service.create_election_event(credentials, event_data)

    if result.get('error'):
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'success': True,
        'event_link': result['event_link']
    })


# ──────────────────────────────────────────
# Authentication Routes
# ──────────────────────────────────────────

@app.route('/auth/login')
def auth_login():
    """Initiate Google OAuth login."""
    if not Config.is_oauth_configured():
        return jsonify({'error': 'OAuth is not configured'}), 500

    flow = auth_service.get_auth_flow()
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
    )
    session['oauth_state'] = state
    return redirect(authorization_url)


@app.route('/auth/callback')
def auth_callback():
    """Handle OAuth callback from Google."""
    if not Config.is_oauth_configured():
        return redirect(url_for('index'))

    flow = auth_service.get_auth_flow()
    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials
    session['credentials'] = auth_service.credentials_to_dict(credentials)

    # Get user info
    user_info = auth_service.get_user_info(credentials)
    if user_info:
        session['user'] = user_info

    return redirect(url_for('index'))


@app.route('/auth/logout')
def auth_logout():
    """Log out the user."""
    session.pop('user', None)
    session.pop('credentials', None)
    session.pop('oauth_state', None)
    return redirect(url_for('index'))


@app.route('/auth/status')
def auth_status():
    """Check authentication status."""
    user = session.get('user')
    if user:
        return jsonify({
            'authenticated': True,
            'user': {
                'name': user.get('name'),
                'email': user.get('email'),
                'picture': user.get('picture'),
            }
        })
    return jsonify({'authenticated': False})


# ──────────────────────────────────────────
# Error Handlers
# ──────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors."""
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Endpoint not found'}), 404
    return render_template('index.html',
                           gemini_configured=Config.is_gemini_configured(),
                           oauth_configured=Config.is_oauth_configured(),
                           civic_configured=Config.is_civic_configured()), 200


@app.errorhandler(429)
def rate_limit_exceeded(e):
    """Handle rate limit exceeded."""
    return jsonify({'error': 'Too many requests. Please wait a moment and try again.'}), 429


@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors."""
    return jsonify({'error': 'An internal error occurred. Please try again.'}), 500


# ──────────────────────────────────────────
# Main Entry Point
# ──────────────────────────────────────────

if __name__ == '__main__':
    print("\n🗳️  Electionant is starting...")
    print(f"   Gemini AI:  {'✅ Configured' if Config.is_gemini_configured() else '❌ Not configured'}")
    print(f"   OAuth 2.0:  {'✅ Configured' if Config.is_oauth_configured() else '❌ Not configured'}")
    print(f"   Civic API:  {'✅ Configured' if Config.is_civic_configured() else '❌ Not configured'}")
    print(f"\n   Open http://localhost:5000 in your browser\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
