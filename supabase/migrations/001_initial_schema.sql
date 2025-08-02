-- GB Sales Machine Database Schema
-- Version: 1.0.0
-- Created: 2025-01-08

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses table (analyzed companies)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  business_name TEXT,
  description TEXT,
  value_proposition TEXT,
  industry TEXT,
  target_markets JSONB DEFAULT '[]'::JSONB,
  decision_maker_roles JSONB DEFAULT '[]'::JSONB,
  analysis_data JSONB DEFAULT '{}'::JSONB,
  discovery_answers JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  search_parameters JSONB DEFAULT '{}'::JSONB,
  budget_limit DECIMAL(10,2),
  credits_allocated INTEGER DEFAULT 0,
  leads_scraped INTEGER DEFAULT 0,
  leads_called INTEGER DEFAULT 0,
  appointments_booked INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  industry TEXT,
  category TEXT,
  rating DECIMAL(2,1),
  reviews_count INTEGER,
  google_place_id TEXT,
  place_url TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  validation_score INTEGER,
  validation_data JSONB DEFAULT '{}'::JSONB,
  contact_name TEXT,
  contact_title TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_linkedin TEXT,
  enrichment_data JSONB DEFAULT '{}'::JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'validated', 'enriched', 'queued', 'calling', 'called', 'converted', 'disqualified')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  enriched_at TIMESTAMPTZ,
  called_at TIMESTAMPTZ
);

-- Call logs table
CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  vapi_call_id TEXT UNIQUE,
  phone_number_from TEXT,
  phone_number_to TEXT,
  duration_seconds INTEGER,
  outcome TEXT CHECK (outcome IN ('completed', 'no_answer', 'busy', 'failed', 'voicemail', 'appointment_booked')),
  transcript TEXT,
  recording_url TEXT,
  vapi_data JSONB DEFAULT '{}'::JSONB,
  cost DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  call_log_id UUID REFERENCES public.call_logs(id) ON DELETE SET NULL,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  meeting_type TEXT DEFAULT 'phone' CHECK (meeting_type IN ('phone', 'video', 'in_person')),
  meeting_link TEXT,
  calendar_event_id TEXT,
  attendee_name TEXT,
  attendee_email TEXT,
  attendee_phone TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'rescheduled', 'completed', 'no_show', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales scripts table
CREATE TABLE IF NOT EXISTS public.sales_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  decision_maker_role TEXT,
  script_type TEXT NOT NULL CHECK (script_type IN ('first_message', 'system_prompt', 'objection_handler', 'closing')),
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::JSONB,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  performance_metrics JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing transactions table
CREATE TABLE IF NOT EXISTS public.billing_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('credit_purchase', 'lead_scraped', 'lead_enriched', 'lead_called', 'appointment_booked')),
  amount DECIMAL(10,2) NOT NULL,
  credits_used INTEGER,
  credits_added INTEGER,
  balance_after INTEGER,
  description TEXT,
  related_id UUID,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX idx_campaigns_business_id ON public.campaigns(business_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_leads_campaign_id ON public.leads(campaign_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_call_logs_lead_id ON public.call_logs(lead_id);
CREATE INDEX idx_call_logs_campaign_id ON public.call_logs(campaign_id);
CREATE INDEX idx_appointments_lead_id ON public.appointments(lead_id);
CREATE INDEX idx_appointments_scheduled_time ON public.appointments(scheduled_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_sales_scripts_business_id ON public.sales_scripts(business_id);
CREATE INDEX idx_billing_transactions_user_id ON public.billing_transactions(user_id);
CREATE INDEX idx_billing_transactions_type ON public.billing_transactions(type);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Users can view own businesses" ON public.businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses" ON public.businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own businesses" ON public.businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Campaigns policies
CREATE POLICY "Users can view own campaigns" ON public.campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = campaigns.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create campaigns for own businesses" ON public.campaigns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = campaigns.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own campaigns" ON public.campaigns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = campaigns.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Leads policies
CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      JOIN public.businesses ON businesses.id = campaigns.business_id
      WHERE campaigns.id = leads.campaign_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create leads for own campaigns" ON public.leads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      JOIN public.businesses ON businesses.id = campaigns.business_id
      WHERE campaigns.id = leads.campaign_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own leads" ON public.leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      JOIN public.businesses ON businesses.id = campaigns.business_id
      WHERE campaigns.id = leads.campaign_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Similar policies for call_logs, appointments, sales_scripts
CREATE POLICY "Users can view own call logs" ON public.call_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      JOIN public.businesses ON businesses.id = campaigns.business_id
      WHERE campaigns.id = call_logs.campaign_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      JOIN public.businesses ON businesses.id = campaigns.business_id
      WHERE campaigns.id = appointments.campaign_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own sales scripts" ON public.sales_scripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = sales_scripts.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Billing transactions policies
CREATE POLICY "Users can view own transactions" ON public.billing_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_scripts_updated_at BEFORE UPDATE ON public.sales_scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update campaign statistics
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'leads' THEN
    UPDATE campaigns
    SET leads_scraped = (
      SELECT COUNT(*) FROM leads WHERE campaign_id = NEW.campaign_id
    )
    WHERE id = NEW.campaign_id;
  ELSIF TG_TABLE_NAME = 'call_logs' THEN
    UPDATE campaigns
    SET leads_called = (
      SELECT COUNT(DISTINCT lead_id) FROM call_logs WHERE campaign_id = NEW.campaign_id
    )
    WHERE id = NEW.campaign_id;
  ELSIF TG_TABLE_NAME = 'appointments' THEN
    UPDATE campaigns
    SET appointments_booked = (
      SELECT COUNT(*) FROM appointments 
      WHERE campaign_id = NEW.campaign_id 
      AND status IN ('scheduled', 'confirmed', 'completed')
    )
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for campaign statistics
CREATE TRIGGER update_campaign_stats_on_lead_insert
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_campaign_stats();

CREATE TRIGGER update_campaign_stats_on_call_insert
  AFTER INSERT ON public.call_logs
  FOR EACH ROW EXECUTE FUNCTION update_campaign_stats();

CREATE TRIGGER update_campaign_stats_on_appointment_insert
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_campaign_stats();

-- Function to handle user credit balance
CREATE OR REPLACE FUNCTION update_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type IN ('lead_scraped', 'lead_enriched', 'lead_called', 'appointment_booked') THEN
    UPDATE users
    SET credits = credits - NEW.credits_used
    WHERE id = NEW.user_id;
  ELSIF NEW.type = 'credit_purchase' THEN
    UPDATE users
    SET credits = credits + NEW.credits_added
    WHERE id = NEW.user_id;
  END IF;
  
  -- Update balance_after
  NEW.balance_after = (SELECT credits FROM users WHERE id = NEW.user_id);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credits_on_transaction
  BEFORE INSERT ON public.billing_transactions
  FOR EACH ROW EXECUTE FUNCTION update_user_credits();

-- Views for easier querying
CREATE OR REPLACE VIEW campaign_performance AS
SELECT 
  c.id,
  c.name,
  c.status,
  c.leads_scraped,
  c.leads_called,
  c.appointments_booked,
  CASE 
    WHEN c.leads_scraped > 0 THEN ROUND((c.leads_called::DECIMAL / c.leads_scraped) * 100, 2)
    ELSE 0
  END as call_rate,
  CASE 
    WHEN c.leads_called > 0 THEN ROUND((c.appointments_booked::DECIMAL / c.leads_called) * 100, 2)
    ELSE 0
  END as conversion_rate,
  c.total_spent,
  c.created_at,
  b.business_name,
  u.email as user_email
FROM campaigns c
JOIN businesses b ON b.id = c.business_id
JOIN users u ON u.id = b.user_id;

-- Initial data
INSERT INTO public.users (id, email) 
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;