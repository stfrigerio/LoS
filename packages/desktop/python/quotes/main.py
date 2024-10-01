import json
import time
import requests
from flask import Flask, jsonify
from threading import Thread

#^ this was used to steal all them quotes from quotable.io

app = Flask(__name__)

QUOTES_FILE = 'quotes.json'
API_URL = 'https://api.quotable.io/quotes/random'  # Updated URL
FETCH_INTERVAL = 1  # Fetch every second
LIMIT = 1000  # Number of quotes to fetch per request

def load_quotes():
    try:
        with open(QUOTES_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_quotes(quotes):
    with open(QUOTES_FILE, 'w') as f:
        json.dump(quotes, f, indent=2)

def fetch_and_save_quote():
    quotes = load_quotes()
    while True:
        try:
            response = requests.get(f"{API_URL}?limit={LIMIT}")
            if response.status_code == 200:
                new_quotes = response.json()
                added_count = 0
                for new_quote in new_quotes:
                    if not any(q['_id'] == new_quote['_id'] for q in quotes):
                        quotes.append(new_quote)
                        added_count += 1
                if added_count > 0:
                    save_quotes(quotes)
                    print(f"Added {added_count} new quotes")
                print(f"Total quotes stored: {len(quotes)}")
            else:
                print(f"Error fetching quotes: HTTP {response.status_code}")
        except Exception as e:
            print(f"Error fetching quotes: {e}")
        time.sleep(FETCH_INTERVAL)

@app.route('/quote')
def get_random_quote():
    quotes = load_quotes()
    if quotes:
        return jsonify(quotes[int(time.time()) % len(quotes)])
    else:
        return jsonify({"error": "No quotes available"}), 404

if __name__ == '__main__':
    Thread(target=fetch_and_save_quote, daemon=True).start()
    app.run(host='0.0.0.0', port=5000)