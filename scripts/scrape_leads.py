#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.scrapers.google_maps import GoogleMapsScraper
from src.database.setup import get_supabase_client
import argparse

def main():
    parser = argparse.ArgumentParser(description='Scrape business leads from Google Maps')
    parser.add_argument('--query', '-q', required=True, help='Search query (e.g., "restaurants", "dentists")')
    parser.add_argument('--location', '-l', required=True, help='Location (e.g., "New York, NY")')
    parser.add_argument('--max', '-m', type=int, default=50, help='Maximum results (default: 50)')
    
    args = parser.parse_args()
    
    print(f"🔍 Scraping {args.query} in {args.location}...")
    
    # Scrape data
    scraper = GoogleMapsScraper()
    results = scraper.search_businesses(args.query, args.location, args.max)
    
    if not results:
        print("No results found!")
        return
    
    # Save to database
    client = get_supabase_client()
    
    saved_count = 0
    for lead in results:
        try:
            # Check if already exists
            existing = client.table('leads').select('id').eq('google_place_id', lead['google_place_id']).execute()
            
            if not existing.data:
                client.table('leads').insert(lead).execute()
                saved_count += 1
                print(f"✅ Saved: {lead['business_name']}")
            else:
                print(f"⏭️  Skipped (already exists): {lead['business_name']}")
        except Exception as e:
            print(f"❌ Error saving {lead['business_name']}: {e}")
    
    print(f"\n📊 Summary: Saved {saved_count} new leads out of {len(results)} found")

if __name__ == "__main__":
    main()