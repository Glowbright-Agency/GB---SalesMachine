from supabase import create_client, Client
from src.config import Config

def get_supabase_client() -> Client:
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

def create_tables():
    client = get_supabase_client()
    
    print("Setting up database tables...")
    
    tables_sql = """
    -- Leads table
    CREATE TABLE IF NOT EXISTS leads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        business_name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        category TEXT,
        rating FLOAT,
        reviews_count INTEGER,
        latitude FLOAT,
        longitude FLOAT,
        google_place_id TEXT UNIQUE,
        status TEXT DEFAULT 'new',
        enriched BOOLEAN DEFAULT FALSE,
        validated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Contact details table
    CREATE TABLE IF NOT EXISTS contact_details (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        contact_name TEXT,
        position TEXT,
        phone TEXT,
        email TEXT,
        linkedin_url TEXT,
        source TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- AI analysis table
    CREATE TABLE IF NOT EXISTS ai_analysis (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        business_description TEXT,
        services JSONB,
        target_market TEXT,
        company_size TEXT,
        relevance_score FLOAT,
        analysis_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Call logs table
    CREATE TABLE IF NOT EXISTS call_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        call_id TEXT,
        duration INTEGER,
        status TEXT,
        transcript TEXT,
        outcome TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_enriched ON leads(enriched);
    CREATE INDEX IF NOT EXISTS idx_leads_validated ON leads(validated);
    CREATE INDEX IF NOT EXISTS idx_leads_google_place_id ON leads(google_place_id);
    """
    
    try:
        client.postgrest.rpc('exec_sql', {'query': tables_sql}).execute()
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")
        print("Note: You may need to create tables manually in Supabase dashboard")

if __name__ == "__main__":
    create_tables()