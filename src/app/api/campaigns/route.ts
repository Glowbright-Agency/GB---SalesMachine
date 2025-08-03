import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')

    // Build query using RLS-compliant approach
    let query = supabase
      .from('campaigns')
      .select(`
        *,
        businesses (
          id,
          business_name,
          user_id
        )
      `)
      .order('created_at', { ascending: false })

    if (businessId) {
      query = query.eq('business_id', businessId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    return NextResponse.json({ campaigns })
    
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      businessId, 
      name, 
      location,
      numberOfLeads = 100,
      service,
      businessData,
      salesTargets = [],
      decisionMakers = [],
      salesScripts = {},
      status = 'draft',
      searchParameters,
      budgetLimit
    } = body

    console.log('Creating campaign with data:', { name, location, numberOfLeads, service, status })

    // Get user's business if businessId not provided
    let business
    if (businessId) {
      const { data: businessData } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .single()
      business = businessData
    } else {
      // Get user's first business
      const { data: businessData } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      business = businessData
    }

    if (!business) {
      return NextResponse.json({ error: 'No business found. Please complete onboarding first.' }, { status: 404 })
    }

    // Prepare campaign data according to database schema
    const campaignData = {
      business_id: business.id,
      name,
      search_parameters: {
        location: location || searchParameters?.location,
        numberOfLeads,
        salesTargets,
        decisionMakers,
        service,
        scripts: salesScripts, // Store scripts in search_parameters for now
        businessData,
        createdFrom: 'campaign-wizard',
        timestamp: new Date().toISOString(),
        ...(searchParameters || {})
      },
      budget_limit: budgetLimit || (service === 'scraping' ? numberOfLeads * 4 : null),
      status
    }

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single()

    if (error) {
      console.error('Database error creating campaign:', error)
      return NextResponse.json({ error: 'Failed to create campaign: ' + error.message }, { status: 500 })
    }

    console.log('Campaign created successfully:', campaign.id)

    return NextResponse.json({ 
      success: true, 
      campaign 
    })
    
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}