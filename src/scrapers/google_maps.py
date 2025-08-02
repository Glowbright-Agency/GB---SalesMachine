import requests
import time
from typing import List, Dict
from src.config import Config

class GoogleMapsScraper:
    def __init__(self):
        self.api_key = Config.APIFY_API_KEY
        self.base_url = "https://api.apify.com/v2"
    
    def search_businesses(self, search_query: str, location: str, max_results: int = 100) -> List[Dict]:
        """
        Search for businesses on Google Maps using Apify
        """
        actor_id = Config.GOOGLE_MAPS_EXTRACTOR
        
        input_data = {
            "searchQueries": [f"{search_query} in {location}"],
            "maxPlacesPerQuery": max_results,
            "language": "en",
            "exportPlaceUrls": True,
            "includeWebResults": True,
            "includeOpeningHours": True,
            "includeReviews": False
        }
        
        print(f"🔍 Searching for '{search_query}' in {location}...")
        
        # Start the actor
        run_url = f"{self.base_url}/acts/{actor_id}/runs?token={self.api_key}"
        response = requests.post(run_url, json=input_data)
        
        if response.status_code != 201:
            print(f"Error starting actor: {response.text}")
            return []
        
        run_id = response.json()['data']['id']
        
        # Wait for completion
        print("⏳ Scraping in progress...")
        while True:
            status_url = f"{self.base_url}/acts/{actor_id}/runs/{run_id}?token={self.api_key}"
            status_response = requests.get(status_url)
            status = status_response.json()['data']['status']
            
            if status == 'SUCCEEDED':
                break
            elif status in ['FAILED', 'ABORTED']:
                print(f"Actor run failed with status: {status}")
                return []
            
            time.sleep(5)
        
        # Get results
        dataset_id = status_response.json()['data']['defaultDatasetId']
        results_url = f"{self.base_url}/datasets/{dataset_id}/items?token={self.api_key}"
        results_response = requests.get(results_url)
        
        results = results_response.json()
        print(f"✅ Found {len(results)} businesses")
        
        # Format results
        formatted_results = []
        for place in results:
            formatted_results.append({
                'business_name': place.get('name', ''),
                'address': place.get('address', ''),
                'phone': place.get('phone', ''),
                'website': place.get('website', ''),
                'category': ', '.join(place.get('categories', [])),
                'rating': place.get('rating'),
                'reviews_count': place.get('totalScore'),
                'latitude': place.get('location', {}).get('lat'),
                'longitude': place.get('location', {}).get('lng'),
                'google_place_id': place.get('placeId', ''),
                'place_url': place.get('url', '')
            })
        
        return formatted_results

if __name__ == "__main__":
    scraper = GoogleMapsScraper()
    results = scraper.search_businesses("restaurants", "New York", max_results=10)
    for r in results[:3]:
        print(f"- {r['business_name']} | {r['phone']} | {r['rating']}⭐")