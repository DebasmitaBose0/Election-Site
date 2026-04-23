"""
Basic test suite for the Election Assistant Flask application.
"""

import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_index_page(client):
    """Test that the home page loads successfully."""
    response = client.get('/')
    assert response.status_code == 200
    assert b'Election Assistant' in response.data

def test_api_timeline(client):
    """Test the timeline API endpoint."""
    response = client.get('/api/timeline')
    assert response.status_code == 200
    data = response.get_json()
    assert 'timeline' in data
    assert len(data['timeline']) > 0

def test_api_guides(client):
    """Test the guides API endpoint."""
    response = client.get('/api/guides')
    assert response.status_code == 200
    data = response.get_json()
    assert 'guides' in data
    assert len(data['guides']) > 0

def test_api_guide_detail(client):
    """Test fetching a specific guide."""
    response = client.get('/api/guides/voter-registration')
    assert response.status_code == 200
    data = response.get_json()
    assert 'guide' in data
    assert data['guide']['title'] == 'Voter Registration'

def test_api_faqs(client):
    """Test the FAQs API endpoint."""
    response = client.get('/api/faqs')
    assert response.status_code == 200
    data = response.get_json()
    assert 'faqs' in data

def test_chat_no_message(client):
    """Test chat API with missing payload."""
    response = client.post('/api/chat', json={})
    assert response.status_code == 400
