export class GoogleMapsScraper {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.APIFY_API_KEY!
    this.baseUrl = 'https://api.apify.com/v2'
  }

  async searchBusinesses(searchQuery: string, location: string, maxResults: number = 100) {
    const actorId = 'compass/google-maps-scraper'
    
    const inputData = {
      searchQueries: [`${searchQuery} in ${location}`],
      maxPlacesPerQuery: maxResults,
      language: 'en',
      exportPlaceUrls: true,
      includeWebResults: true,
      includeOpeningHours: true,
      includeReviews: false
    }

    console.log(`🔍 Searching for '${searchQuery}' in ${location}...`)

    // Start the actor
    const runResponse = await fetch(`${this.baseUrl}/acts/${actorId}/runs?token=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    })

    if (!runResponse.ok) {
      throw new Error(`Failed to start scraper: ${runResponse.statusText}`)
    }

    const runData = await runResponse.json()
    const runId = runData.data.id

    // Wait for completion
    console.log('⏳ Scraping in progress...')
    let status = 'RUNNING'
    
    while (status === 'RUNNING') {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
      
      const statusResponse = await fetch(
        `${this.baseUrl}/acts/${actorId}/runs/${runId}?token=${this.apiKey}`
      )
      const statusData = await statusResponse.json()
      status = statusData.data.status

      if (status === 'FAILED' || status === 'ABORTED') {
        throw new Error(`Scraper failed with status: ${status}`)
      }
    }

    // Get results
    const datasetId = runData.data.defaultDatasetId
    const resultsResponse = await fetch(
      `${this.baseUrl}/datasets/${datasetId}/items?token=${this.apiKey}`
    )
    const results = await resultsResponse.json()

    console.log(`✅ Found ${results.length} businesses`)

    // Format results
    return results.map((place: any) => ({
      business_name: place.name || '',
      address: place.address || '',
      phone: place.phone || '',
      website: place.website || '',
      email: '', // Will be enriched later
      category: (place.categories || []).join(', '),
      rating: place.rating,
      reviews_count: place.totalScore,
      latitude: place.location?.lat,
      longitude: place.location?.lng,
      google_place_id: place.placeId || '',
      place_url: place.url || ''
    }))
  }
}