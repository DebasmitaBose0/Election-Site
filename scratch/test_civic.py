import requests
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GOOGLE_CIVIC_API_KEY')
url = f'https://www.googleapis.com/civicinfo/v2/elections?key={api_key}'
response = requests.get(url)
print(f"Status: {response.status_code}")
data = response.json()
print("Elections found:")
for e in data.get('elections', []):
    print(f"- {e.get('name')} ({e.get('electionDay')}) - {e.get('ocdDivisionId')}")
