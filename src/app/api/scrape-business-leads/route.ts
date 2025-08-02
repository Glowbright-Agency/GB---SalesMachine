import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { salesTargets, location, quantity } = await request.json()
    
    if (!salesTargets || !location || !quantity) {
      return NextResponse.json({ 
        error: 'Missing required fields: salesTargets, location, quantity' 
      }, { status: 400 })
    }

    // Check if user has enough credits (assuming each lead costs 1 credit for scraping)
    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!userData || userData.credits < quantity) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: quantity,
        available: userData?.credits || 0
      }, { status: 402 })
    }

    // Prepare Apify input
    const apifyInput = {
      searchStringsArray: salesTargets.map((target: string) => `${target} in ${location}`),
      maxCrawledPlacesPerSearch: Math.ceil(quantity / salesTargets.length),
      language: 'en',
      exportPlaceUrls: false,
      additionalInfo: false,
      maxReviews: 0,
      maxImages: 0,
      onlyDataFromSearchPage: true,
      includeWebResults: false
    }

    console.log('Apify input:', apifyInput)

    // Call Apify API
    const apifyResponse = await fetch('https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.APIFY_API_KEY}`
      },
      body: JSON.stringify(apifyInput)
    })

    if (!apifyResponse.ok) {
      console.error('Apify API error:', apifyResponse.status, apifyResponse.statusText)
      const errorText = await apifyResponse.text()
      console.error('Apify error details:', errorText)
      
      return NextResponse.json({ 
        error: 'Failed to scrape leads from Google Maps',
        details: `Apify API returned ${apifyResponse.status}: ${apifyResponse.statusText}`
      }, { status: 500 })
    }

    const apifyData = await apifyResponse.json()
    console.log('Apify response:', apifyData.length, 'results')

    // Transform Apify data to our lead format
    const transformedLeads = apifyData.map((item: any) => ({
      businessName: item.title || item.name || 'Unknown Business',
      category: item.categoryName || item.category || 'Unknown Category',
      website: item.website || item.url || null,
      phone: item.phone || item.phoneNumber || null,
      address: item.address || `${item.street || ''} ${item.city || ''} ${item.state || ''}`.trim() || null,
      city: item.city || extractCityFromLocation(location),
      state: item.state || extractStateFromLocation(location),
      rating: item.totalScore || item.rating || null,
      reviewsCount: item.reviewsCount || item.totalReviews || 0,
      googlePlaceId: item.placeId || null,
      placeUrl: item.url || null,
      latitude: item.location?.lat || item.latitude || null,
      longitude: item.location?.lng || item.longitude || null
    }))

    // Limit to requested quantity
    const finalLeads = transformedLeads.slice(0, quantity)

    // Deduct credits from user
    const creditsUsed = finalLeads.length
    if (creditsUsed > 0) {
      const { error: creditError } = await supabase
        .from('billing_transactions')
        .insert({
          user_id: user.id,
          type: 'lead_scraped',
          amount: creditsUsed * 1, // $1 per scraped lead
          credits_used: creditsUsed,
          description: `Scraped ${creditsUsed} business leads from Google Maps`,
          related_id: null
        })

      if (creditError) {
        console.error('Error recording billing transaction:', creditError)
      }
    }

    return NextResponse.json({ 
      success: true,
      leads: finalLeads,
      totalFound: transformedLeads.length,
      creditsUsed: creditsUsed,
      searchTerms: salesTargets,
      location: location
    })
    
  } catch (error) {
    console.error('Error scraping business leads:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function extractCityFromLocation(location: string): string {
  const parts = location.split(',')
  return parts[0]?.trim() || ''
}

function extractStateFromLocation(location: string): string {
  const parts = location.split(',')
  if (parts.length >= 2) {
    const statePart = parts[1]?.trim()
    // Extract state abbreviation (e.g., "NY" from "NY" or "New York")
    const stateMatch = statePart?.match(/\b[A-Z]{2}\b/)
    return stateMatch ? stateMatch[0] : statePart || ''
  }
  return ''
}