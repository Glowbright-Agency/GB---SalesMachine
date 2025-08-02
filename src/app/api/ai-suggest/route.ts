import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { type, location, context, businessContext, questionId, question, businessAnalysis } = await request.json()
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }) // Use Gemini 2.5 as the brain
    
    if (type === 'sales_targets') {
      // Generate sales target suggestions based on COMPLETE business knowledge base
      const prompt = `
      You are Gemini 2.5, the AI brain of the GB Sales Machine. Use the COMPLETE business knowledge base from onboarding to generate intelligent sales target suggestions.

      COMPREHENSIVE BUSINESS KNOWLEDGE BASE:
      ${JSON.stringify(businessContext, null, 2)}

      CRITICAL DISCOVERY INSIGHTS:
      ${businessContext?.discoveryAnswers ? `
      - Measurable Outcome: ${businessContext.discoveryAnswers.measurable_outcome || 'Not provided'}
      - Target Audience: ${businessContext.discoveryAnswers.target_audience || 'Not provided'}
      - Key Differentiator: ${businessContext.discoveryAnswers.key_differentiator || 'Not provided'}
      - Success Story: ${businessContext.discoveryAnswers.success_story || 'Not provided'}
      - Qualification Criteria: ${businessContext.discoveryAnswers.qualification_criteria || 'Not provided'}
      ` : 'Discovery answers not available'}

      CONTEXT:
      - Location: ${location || 'United States'}
      - Purpose: ${context || 'business lead scraping'}

      INSTRUCTIONS:
      1. ANALYZE both website analysis AND discovery answers
      2. Use the TARGET AUDIENCE from discovery answers as your primary guide
      3. Cross-reference with website analysis for additional insights
      4. Focus on the QUALIFICATION CRITERIA - who fits the buying profile?
      5. Consider the SUCCESS STORY - what type of businesses succeeded?
      6. Generate 6-8 specific business types that match the target audience profile
      7. Each suggestion should be 1-3 words maximum

      PRIORITY LOGIC:
      1. FIRST: Use target_audience from discovery answers
      2. THEN: Cross-reference with targetCustomers from website analysis  
      3. FINALLY: Apply success_story patterns and qualification_criteria

      Return as a JSON array of strings targeting businesses that perfectly match your ideal customer profile.
      
      RESPOND ONLY WITH VALID JSON ARRAY.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      try {
        const suggestions = JSON.parse(text)
        return NextResponse.json({ 
          success: true, 
          suggestions: Array.isArray(suggestions) ? suggestions : []
        })
      } catch (parseError) {
        // Fallback suggestions
        return NextResponse.json({ 
          success: true, 
          suggestions: [
            'Restaurants',
            'Law Firms',
            'Medical Clinics', 
            'Real Estate Agencies',
            'Dental Practices',
            'Auto Repair Shops'
          ]
        })
      }
    }

    // Original discovery question logic
    if (!questionId || !question || !businessAnalysis) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const prompt = `
    Based on the business analysis provided, please generate a specific and actionable answer for the discovery question.

    Business Analysis:
    - Business Name: ${businessAnalysis.businessName}
    - Description: ${businessAnalysis.description}
    - Value Proposition: ${businessAnalysis.valueProposition}
    - Industry: ${businessAnalysis.industry}
    - Target Markets: ${JSON.stringify(businessAnalysis.targetMarkets)}
    - Decision Maker Roles: ${JSON.stringify(businessAnalysis.decisionMakerRoles)}
    - Competitive Advantage: ${businessAnalysis.competitiveAdvantage}

    Discovery Question: ${question}
    Question ID: ${questionId}

    Instructions:
    - Provide a specific, actionable answer based on the business analysis
    - Include numbers, percentages, or concrete examples where possible
    - Make the answer realistic and grounded in the business context
    - Keep the answer concise but comprehensive
    - If it's about objections, provide 3-5 common objections with responses
    - If it's about success stories, create a realistic example based on the industry
    - If it's about target audience, be specific about company size, revenue, roles

    Return only the suggested answer, no additional formatting or explanation.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const suggestion = response.text().trim()

    return NextResponse.json({ 
      success: true, 
      suggestion 
    })
    
  } catch (error) {
    console.error('AI suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI suggestion' },
      { status: 500 }
    )
  }
}