import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleMapsScraper } from '@/services/scrapers/googleMaps'
import { LeadValidator } from '@/services/ai/leadValidator'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id

    // Get campaign with business info
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        businesses!inner(
          id,
          user_id,
          business_name,
          analysis_data
        )
      `)
      .eq('id', campaignId)
      .eq('businesses.user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Check if campaign is already running
    if (campaign.status === 'active') {
      return NextResponse.json({ error: 'Campaign is already running' }, { status: 400 })
    }

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({ 
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    // Start scraping process
    const scraper = new GoogleMapsScraper()
    const validator = new LeadValidator()
    
    const { keywords, locations, numberOfLeads } = campaign.search_parameters
    const targetCriteria = campaign.businesses.analysis_data.idealCustomerProfile || {}

    let allLeads: any[] = []
    let scrapedCount = 0

    // Scrape for each location and keyword combination
    for (const location of locations) {
      for (const keyword of keywords) {
        if (scrapedCount >= numberOfLeads) break

        try {
          // Scrape leads
          const results = await scraper.searchBusinesses(
            keyword,
            location,
            Math.min(100, numberOfLeads - scrapedCount)
          )

          // Validate each lead
          for (const lead of results) {
            if (scrapedCount >= numberOfLeads) break

            // Validate with AI
            const validation = await validator.analyzeBusinessForCampaign(
              lead,
              targetCriteria,
              campaign.businesses.business_name
            )

            // Only keep leads with good validation scores
            if (validation.relevance_score >= 60) {
              const leadData = {
                campaign_id: campaignId,
                business_name: lead.business_name,
                address: lead.address,
                phone: lead.phone,
                website: lead.website,
                email: lead.email,
                industry: lead.category,
                category: lead.category,
                rating: lead.rating,
                reviews_count: lead.reviews_count,
                google_place_id: lead.google_place_id,
                place_url: lead.place_url,
                latitude: lead.latitude,
                longitude: lead.longitude,
                validation_score: validation.relevance_score,
                validation_data: validation,
                status: 'validated'
              }

              allLeads.push(leadData)
              scrapedCount++

              // Save lead to database
              await supabase
                .from('leads')
                .insert(leadData)
            }
          }
        } catch (error) {
          console.error(`Error scraping ${keyword} in ${location}:`, error)
        }
      }
    }

    // Update campaign with final counts
    await supabase
      .from('campaigns')
      .update({ 
        leads_scraped: scrapedCount,
        status: scrapedCount >= numberOfLeads ? 'completed' : 'paused'
      })
      .eq('id', campaignId)

    // Create billing transaction
    await supabase
      .from('billing_transactions')
      .insert({
        user_id: user.id,
        campaign_id: campaignId,
        type: 'lead_scraped',
        amount: scrapedCount * 4,
        credits_used: scrapedCount * 4,
        description: `Scraped ${scrapedCount} leads for campaign ${campaign.name}`
      })

    return NextResponse.json({ 
      success: true,
      leads_scraped: scrapedCount,
      campaign_id: campaignId
    })
    
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape leads' },
      { status: 500 }
    )
  }
}