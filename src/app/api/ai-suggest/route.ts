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
      You are an expert business analyst for GB Sales Machine. Analyze the complete business knowledge base to generate highly relevant sales target suggestions.

      BUSINESS KNOWLEDGE BASE:
      ${JSON.stringify(businessContext, null, 2)}

      KEY DISCOVERY DATA:
      ${businessContext?.discoveryAnswers ? `
      TARGET AUDIENCE: ${businessContext.discoveryAnswers.target_audience || 'Not specified'}
      MEASURABLE OUTCOME: ${businessContext.discoveryAnswers.measurable_outcome || 'Not specified'}
      KEY DIFFERENTIATOR: ${businessContext.discoveryAnswers.key_differentiator || 'Not specified'}
      SUCCESS STORY: ${businessContext.discoveryAnswers.success_story || 'Not specified'}
      QUALIFICATION CRITERIA: ${businessContext.discoveryAnswers.qualification_criteria || 'Not specified'}
      ` : 'Discovery data incomplete'}

      BUSINESS ANALYSIS:
      ${businessContext?.businessName ? `BUSINESS: ${businessContext.businessName}` : ''}
      ${businessContext?.industry ? `INDUSTRY: ${businessContext.industry}` : ''}
      ${businessContext?.valueProposition ? `VALUE PROP: ${businessContext.valueProposition}` : ''}
      ${businessContext?.targetCustomers ? `TARGET CUSTOMERS: ${JSON.stringify(businessContext.targetCustomers)}` : ''}

      LOCATION: ${location || 'United States'}

      CRITICAL TASK:
      Generate 6-8 specific business types that would be ideal prospects based on:
      1. TARGET AUDIENCE from discovery answers (PRIMARY source)
      2. Business analysis data (SECONDARY source)
      3. Success story patterns
      4. Qualification criteria

      REQUIREMENTS:
      - Each suggestion must be 1-3 words (e.g., "Medical Clinics", "Law Firms", "Tech Startups")
      - Focus on businesses that match the target audience profile
      - Consider who would need the measurable outcome described
      - Avoid generic suggestions unless they specifically match the business context

      RESPOND WITH VALID JSON ARRAY ONLY - NO OTHER TEXT:
      ["Business Type 1", "Business Type 2", "Business Type 3", ...]
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      try {
        // Clean the response - remove markdown code blocks and extra text
        let cleanText = text
        if (text.includes('```json')) {
          cleanText = text.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || text
        } else if (text.includes('```')) {
          cleanText = text.match(/```\s*([\s\S]*?)\s*```/)?.[1] || text
        }
        
        // Remove any leading/trailing backticks or quotes
        cleanText = cleanText.replace(/^[`"]+|[`"]+$/g, '').trim()
        
        console.log('Clean AI response:', cleanText)
        
        const suggestions = JSON.parse(cleanText)
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          return NextResponse.json({ 
            success: true, 
            suggestions: suggestions
          })
        }
      } catch (parseError) {
        console.log('JSON parse error:', parseError)
        console.log('Original AI response:', text)
      }

      // Enhanced fallback using business knowledge base if AI parsing fails
      console.log('Using fallback suggestions with business context:', businessContext)
      let fallbackSuggestions: string[] = []
      
      if (businessContext?.discoveryAnswers?.target_audience) {
        // Try to extract business types from target audience
        const targetAudience = businessContext.discoveryAnswers.target_audience.toLowerCase()
        console.log('Target audience:', targetAudience)
        
        if (targetAudience.includes('health') || targetAudience.includes('medical') || targetAudience.includes('clinic')) {
          fallbackSuggestions = ['Weight Loss Clinics', 'Medical Spas', 'Hormone Therapy Clinics', 'Dermatology Practices', 'Wellness Centers', 'Physical Therapy Clinics']
        } else if (targetAudience.includes('tech') || targetAudience.includes('software') || targetAudience.includes('startup')) {
          fallbackSuggestions = ['SaaS Companies', 'Tech Startups', 'Software Agencies', 'E-commerce Platforms', 'Digital Marketing Agencies', 'App Development Studios']
        } else if (targetAudience.includes('business') || targetAudience.includes('professional') || targetAudience.includes('service')) {
          fallbackSuggestions = ['Professional Services', 'Consulting Firms', 'Accounting Firms', 'Legal Practices', 'Marketing Agencies', 'Business Consultants']
        } else if (targetAudience.includes('retail') || targetAudience.includes('store') || targetAudience.includes('shop')) {
          fallbackSuggestions = ['Retail Stores', 'Boutique Shops', 'Auto Dealerships', 'Furniture Stores', 'Electronics Retailers', 'Fashion Boutiques']
        }
      }
      
      // Final fallback based on industry if we still don't have suggestions
      if (fallbackSuggestions.length === 0) {
        const industry = businessContext?.industry?.toLowerCase() || ''
        
        if (industry.includes('health') || industry.includes('medical')) {
          fallbackSuggestions = ['Medical Clinics', 'Dental Practices', 'Physical Therapy', 'Urgent Care Centers']
        } else if (industry.includes('tech') || industry.includes('software')) {
          fallbackSuggestions = ['Software Companies', 'Tech Startups', 'IT Services', 'Digital Agencies']
        } else {
          // Last resort generic suggestions
          fallbackSuggestions = ['Professional Services', 'Small Businesses', 'Service Companies', 'Local Retailers']
        }
      }

      return NextResponse.json({ 
        success: true, 
        suggestions: fallbackSuggestions,
        fallback_used: true
      })
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