import pytest
from app import app
import json

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_election_results_api(client):
    """Test the newly added election results API."""
    response = client.get('/api/election-results')
    assert response.status_code == 200
    data = response.get_json()
    assert "West Bengal" in data
    assert "Tamil Nadu" in data
    assert data["West Bengal"]["total_seats"] == 294

def test_security_headers(client):
    """Verify that high-score security headers are present."""
    response = client.get('/')
    assert 'Content-Security-Policy' in response.headers
    assert 'X-Content-Type-Options' in response.headers
    assert 'Strict-Transport-Security' in response.headers
    assert 'manifest-src' in response.headers['Content-Security-Policy']

def test_pwa_manifest(client):
    """Ensure manifest.json is served correctly for PWA scoring."""
    response = client.get('/static/manifest.json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["short_name"] == "Electionant"

def test_representative_lookup_fallback(client):
    """Test that the representative lookup handles address input."""
    # Since we can't easily mock the Gemini/Civic API here without more setup,
    # we just test the endpoint's basic response to invalid input.
    response = client.get('/api/representatives?address=')
    assert response.status_code == 400

def test_live_news_ticker(client):
    """Test the news ticker API."""
    response = client.get('/api/live-news')
    assert response.status_code == 200
    data = response.get_json()
    assert "headlines" in data
    assert len(data["headlines"]) >= 4
