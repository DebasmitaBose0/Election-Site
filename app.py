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
from werkzeug.middleware.proxy_fix import ProxyFix

from config import Config
from services.gemini_service import gemini_service
from services.civic_service import civic_service
from services.calendar_service import calendar_service
from services.auth_service import auth_service

# Initialize Flask app
app = Flask(__name__)

# Tell Flask it is behind a proxy so request.url scheme uses https when appropriate
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

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
        maps_key=Config.GOOGLE_MAPS_API_KEY,
        youtube_key=Config.GOOGLE_YOUTUBE_API_KEY,
    )
    
    # Debug: Check if keys are loading in production
    if not Config.GOOGLE_MAPS_API_KEY:
        print("DEBUG: GOOGLE_MAPS_API_KEY is MISSING in environment!")
    else:
        print(f"DEBUG: GOOGLE_MAPS_API_KEY is present (starts with {Config.GOOGLE_MAPS_API_KEY[:5]}...)")


# ──────────────────────────────────────────
# Chat API
# ──────────────────────────────────────────

@app.route('/api/chat', methods=['POST'])
@limiter.limit("20 per minute")
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

@app.route('/api/live-news')
def get_live_news():
    """Fetch real-time election headlines from GNews and local curated dates."""
    news = []
    
    # 1. Fetch from GNews API if configured (Real-time Indian Election News)
    if Config.is_gnews_configured():
        try:
            import requests
            url = f"https://gnews.io/api/v4/search?q=election+OR+voting+OR+poll&country=in&lang=en&token={Config.GNEWS_API_KEY}"
            response = requests.get(url, timeout=5)
            if response.ok:
                data = response.json()
                articles = data.get('articles', [])
                for art in articles[:5]:
                    news.append(f"📰 {art['title']}")
        except Exception as e:
            print(f"DEBUG: GNews API Error: {e}")

    # 2. Add verified upcoming dates from local data
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            local_data = json.load(f)
            timeline = local_data.get('timeline', [])
        
        for event in timeline:
            # Skip if no date or machine-readable date is missing
            if 'date' not in event:
                continue
                
            try:
                event_date = datetime.strptime(event['date'], '%Y-%m-%d')
                if event_date >= datetime.now():
                    news.append(f"🗳️ {event['phase']}: {event_date.strftime('%d %B %Y')}")
            except (ValueError, KeyError) as e:
                print(f"DEBUG: Skipping timeline event due to date format: {e}")
                continue
    except Exception as e:
        print(f"DEBUG: Local News Data Error: {e}")

    # 3. Fallback/Static High-Authority Headlines (if list is short)
    if len(news) < 3:
        news.extend([
            "📊 TOMORROW: Vote Counting starts at 8:00 AM for all 5 States. Stay tuned!",
            "📢 ECI: Model Code of Conduct remains in force until results are declared.",
            "🛡️ Security: Counting centers under 3-tier security cover across the nation.",
            "📱 Check the 'Voter Helpline App' for official results starting tomorrow morning."
        ])
    
    return jsonify({'headlines': news})


@app.route('/api/timeline')
def get_timeline():
    """Get election timeline data from curated ECI schedule."""
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        fresh_data = json.load(f)
    return jsonify({'timeline': fresh_data.get('timeline', [])})


@app.route('/api/state-elections')
def get_state_elections():
    """Get state-wise election schedule data."""
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        fresh_data = json.load(f)
    return jsonify(fresh_data.get('state_elections', {}))

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
    """Look up representatives by address with AI fallback."""
    address = request.args.get('address', '')
    address = sanitize_input(address, max_length=500)

    if not address:
        return jsonify({'error': 'Address is required'}), 400

    result = civic_service.get_representatives(address)

    # If API fails or returns no representatives, trigger AI Fallback
    if result.get('error') or not result.get('data', {}).get('representatives'):
        print(f"DEBUG: Civic API empty/failed for {address}. Falling back to AI Brain...")
        ai_data = get_ai_representatives(address)
        if ai_data:
            return jsonify(ai_data)

    if result.get('error'):
        return jsonify({'error': result['error']}), 400

    return jsonify(result['data'])


def get_ai_representatives(address):
    """Helper to fetch representatives using Gemini AI."""
    try:
        prompt = f"""Find the current elected representatives for the following address in India: {address}
        You MUST return ONLY a JSON object in this EXACT format (no other text):
        {{
            "normalized_address": {{
                "line1": "{address}",
                "city": "City Name",
                "state": "State Name"
            }},
            "representatives": [
                {{
                    "name": "Full Name",
                    "office": "Office Title (e.g. Member of Parliament)",
                    "party": "Political Party Name",
                    "phones": ["Phone Number"],
                    "urls": ["Official Website URL"],
                    "photo_url": ""
                    }}
                ]
            }}
            Identify the current MP (Member of Parliament) and MLA (Member of Legislative Assembly) for this location."""
        
        result = gemini_service.chat(prompt)
        response_text = result.get('response', '') if result else ''
        if not response_text:
            return None
        import json
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        return None
    except Exception as e:
        print(f"DEBUG: AI Fallback Error in app.py: {e}")
        return None


# ──────────────────────────────────────────
# Google Calendar API
# ──────────────────────────────────────────

@app.route('/api/calendar/dates')
def get_calendar_dates():
    """Get election dates available for calendar."""
    dates = calendar_service.get_election_dates()
    return jsonify({'dates': dates})


@app.route('/api/calendar/add', methods=['POST'])
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
    
    # Ensure authorization response uses https if the request came via https proxy
    auth_response = request.url
    if request.headers.get('X-Forwarded-Proto') == 'https':
        auth_response = auth_response.replace('http://', 'https://')
        
    flow.fetch_token(authorization_response=auth_response)

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
    port = int(os.environ.get('PORT', 5002))
    is_dev = os.environ.get('FLASK_ENV', 'development') == 'development'

    print("\n🗳️  Electionant is starting...")
    print(f"   Gemini AI:  {'✅ Configured' if Config.is_gemini_configured() else '❌ Not Found'}")
    print(f"   OAuth 2.0:  {'✅ Configured' if Config.is_oauth_configured() else '⚠️ Limited'}")
    print(f"   Civic API:  {'✅ Configured' if Config.is_civic_configured() else '❌ Not Found'}")
    print(f"   YouTube:    {'✅ Configured' if Config.is_youtube_configured() else '❌ Not Found'}")
    print(f"   Open http://localhost:{port} in your browser\n")
    app.run(debug=is_dev, host='0.0.0.0', port=port)
