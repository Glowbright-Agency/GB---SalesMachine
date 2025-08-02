import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
    SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    APIFY_API_KEY = os.getenv('APIFY_API_KEY')
    GOOGLE_MAPS_CRAWLER = 'compass/crawler-google-places'
    GOOGLE_MAPS_EXTRACTOR = 'compass/google-maps-extractor'
    
    GOOGLE_GEMINI_API_KEY = os.getenv('GOOGLE_GEMINI_API_KEY')
    
    CONTACTOUT_API_KEY = os.getenv('CONTACTOUT_API_KEY')
    
    VAPI_API_KEY = os.getenv('VAPI_API_KEY')