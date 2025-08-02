export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          phone: string | null
          timezone: string
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          timezone?: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          timezone?: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          website_url: string
          business_name: string | null
          description: string | null
          value_proposition: string | null
          industry: string | null
          target_markets: any
          decision_maker_roles: any
          analysis_data: any
          discovery_answers: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          website_url: string
          business_name?: string | null
          description?: string | null
          value_proposition?: string | null
          industry?: string | null
          target_markets?: any
          decision_maker_roles?: any
          analysis_data?: any
          discovery_answers?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          website_url?: string
          business_name?: string | null
          description?: string | null
          value_proposition?: string | null
          industry?: string | null
          target_markets?: any
          decision_maker_roles?: any
          analysis_data?: any
          discovery_answers?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          business_id: string
          name: string
          status: string
          search_parameters: any
          budget_limit: number | null
          credits_allocated: number
          leads_scraped: number
          leads_called: number
          appointments_booked: number
          total_spent: number
          created_at: string
          updated_at: string
          started_at: string | null
          completed_at: string | null
          vapi_assistant_id: string | null
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          status?: string
          search_parameters?: any
          budget_limit?: number | null
          credits_allocated?: number
          leads_scraped?: number
          leads_called?: number
          appointments_booked?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
          vapi_assistant_id?: string | null
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          status?: string
          search_parameters?: any
          budget_limit?: number | null
          credits_allocated?: number
          leads_scraped?: number
          leads_called?: number
          appointments_booked?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
          vapi_assistant_id?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          campaign_id: string
          business_name: string
          address: string | null
          phone: string | null
          website: string | null
          email: string | null
          industry: string | null
          category: string | null
          rating: number | null
          reviews_count: number | null
          google_place_id: string | null
          place_url: string | null
          latitude: number | null
          longitude: number | null
          validation_score: number | null
          validation_data: any
          contact_name: string | null
          contact_title: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_linkedin: string | null
          enrichment_data: any
          status: string
          created_at: string
          updated_at: string
          validated_at: string | null
          enriched_at: string | null
          called_at: string | null
        }
      }
    }
  }
}