import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    // For testing purposes, create a temporary user ID if not authenticated
    const userId = user?.id || 'temp-user-' + Date.now()

    const { websiteUrl } = await request.json()
    
    if (!websiteUrl) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 })
    }

    // Fetch website content
    const websiteContent = await fetchWebsiteContent(websiteUrl)
    
    // Analyze with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const prompt = `You are a business analyst creating a comprehensive knowledge base. Analyze this website content and extract detailed business information to build an AI knowledge base.

IMPORTANT RULES:
1. Extract ALL available information from the website content
2. Be comprehensive but factual - include everything that could be useful for sales/marketing
3. Create detailed profiles that AI can use for sales scripts, targeting, and personalization
4. If information is not explicit, make reasonable inferences based on industry standards
5. Structure data for maximum AI utility

Website URL: ${websiteUrl}
Website Content: ${websiteContent}

Create a comprehensive business knowledge base in JSON format:

{
  "businessName": "Company name from headers, titles, or domain",
  "description": "Detailed description of what the business does (2-3 sentences)",
  "valueProposition": "Main value proposition and unique selling points",
  "industry": "Primary industry classification",
  "businessModel": "B2B, B2C, SaaS, etc.",
  "companySize": "Estimated size - startup, small, medium, large, enterprise",
  "services": ["List of services/products offered"],
  "targetCustomers": [
    {
      "type": "Customer segment",
      "description": "Why they need this service",
      "painPoints": ["Common problems this segment faces"],
      "buyingMotivations": ["What drives their purchasing decisions"]
    }
  ],
  "competitiveAdvantage": "What makes them unique vs competitors",
  "keyFeatures": ["Main product/service features"],
  "pricingModel": "How they price (if mentioned)",
  "geographicFocus": "Service areas or geographic focus",
  "companyValues": ["Core values or mission if mentioned"],
  "socialProof": ["Testimonials, case studies, awards mentioned"],
  "technicalCapabilities": ["Technical strengths or expertise"],
  "industryExpertise": ["Specific industry knowledge or specializations"],
  "salesProcess": "How they typically engage customers (if apparent)",
  "keyDifferentiators": ["Specific ways they differ from competitors"],
  "targetDecisionMakers": [
    {
      "title": "Decision maker role",
      "department": "Department they work in",
      "painPoints": ["Specific pain points this role faces"],
      "priorities": ["What this role cares about most"],
      "communicationStyle": "How to best communicate with this role"
    }
  ]
}

RESPOND ONLY WITH VALID JSON. Be thorough and detailed for AI training purposes.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON from response with improved error handling
    let analysisData
    try {
      // Clean the response text
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      // Try to find JSON in the response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
        
        // Validate required fields and provide fallbacks
        analysisData = {
          businessName: analysisData.businessName || extractBusinessName(websiteUrl),
          description: analysisData.description || 'Business analysis completed',
          valueProposition: analysisData.valueProposition || 'Providing valuable services to clients',
          industry: analysisData.industry || 'Business Services',
          targetMarkets: Array.isArray(analysisData.targetMarkets) ? analysisData.targetMarkets : [],
          competitiveAdvantage: analysisData.competitiveAdvantage || 'Quality service and customer focus',
          targetCustomers: analysisData.targetCustomers || [],
          targetDecisionMakers: analysisData.targetDecisionMakers || []
        }
      } else {
        throw new Error('No valid JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError)
      console.error('Raw response:', text)
      
      // Fallback to extracted data from URL and basic content analysis
      analysisData = {
        businessName: extractBusinessName(websiteUrl),
        description: 'Business services and solutions provider',
        valueProposition: 'Delivering quality services to meet client needs',
        industry: 'Business Services',
        targetMarkets: [],
        competitiveAdvantage: 'Experienced team and customer-focused approach',
        targetCustomers: [],
        targetDecisionMakers: []
      }
    }

    // For testing, return mock data without database
    const business = {
      id: 'test-business-' + Date.now(),
      user_id: userId,
      website_url: websiteUrl,
      business_name: analysisData.businessName,
      description: analysisData.description,
      value_proposition: analysisData.valueProposition,
      industry: analysisData.industry,
      target_markets: analysisData.targetMarkets || [],
      decision_maker_roles: analysisData.targetDecisionMakers || [],
      analysis_data: analysisData
    }

    // Try to save to database if user is authenticated
    if (user) {
      const { data: savedBusiness, error } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          website_url: websiteUrl,
          business_name: analysisData.businessName,
          description: analysisData.description,
          value_proposition: analysisData.valueProposition,
          industry: analysisData.industry,
          target_markets: analysisData.targetMarkets || [],
          decision_maker_roles: analysisData.targetDecisionMakers || [],
          analysis_data: analysisData
        })
        .select()
        .single()

      if (!error && savedBusiness) {
        return NextResponse.json({ 
          success: true, 
          business: savedBusiness,
          analysis: analysisData 
        })
      }
    }


    return NextResponse.json({ 
      success: true, 
      business,
      analysis: analysisData 
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    )
  }
}

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GBSalesMachine/1.0)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Basic HTML to text conversion
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000) // Limit content length
    
    return textContent
  } catch (error) {
    console.error('Failed to fetch website:', error)
    return 'Unable to fetch website content'
  }
}

function extractBusinessName(url: string): string {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
  } catch {
    return 'Unknown Business'
  }
}