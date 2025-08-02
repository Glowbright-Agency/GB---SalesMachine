import { GoogleGenerativeAI } from '@google/generative-ai'

export class LeadValidator {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async analyzeBusinessForCampaign(
    businessData: any,
    targetCriteria: any,
    ourBusinessName: string
  ) {
    const prompt = `
    Analyze if this business is a good fit for ${ourBusinessName}'s services.
    
    Business to Analyze:
    - Name: ${businessData.business_name}
    - Category: ${businessData.category}
    - Address: ${businessData.address}
    - Rating: ${businessData.rating}
    - Reviews: ${businessData.reviews_count}
    
    Target Criteria:
    ${JSON.stringify(targetCriteria, null, 2)}
    
    Please provide a JSON response with:
    {
      "relevance_score": 0-100,
      "reasoning": "Brief explanation",
      "potential_needs": ["need1", "need2"],
      "estimated_company_size": "small/medium/large",
      "recommendation": "QUALIFY/NURTURE/DISQUALIFY"
    }
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // Fallback response
      return {
        relevance_score: 50,
        reasoning: 'Unable to fully analyze',
        potential_needs: [],
        estimated_company_size: 'unknown',
        recommendation: 'NURTURE'
      }
    } catch (error) {
      console.error('Lead validation error:', error)
      return {
        relevance_score: 0,
        reasoning: 'Analysis failed',
        potential_needs: [],
        estimated_company_size: 'unknown',
        recommendation: 'DISQUALIFY'
      }
    }
  }

  async batchAnalyzeBusinesses(businesses: any[], targetCriteria: any, ourBusinessName: string) {
    const results = []
    
    // Process in batches of 5 to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize)
      const batchPromises = batch.map(business => 
        this.analyzeBusinessForCampaign(business, targetCriteria, ourBusinessName)
      )
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Small delay between batches
      if (i + batchSize < businesses.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }
}