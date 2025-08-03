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

CRITICAL JSON FORMATTING RULES:
1. MUST return ONLY valid JSON - no text before or after
2. Use double quotes for ALL strings and property names
3. NO trailing commas anywhere
4. Escape quotes inside strings with backslashes
5. Arrays and objects must be properly closed

ANALYSIS RULES:
1. Extract ALL available information from the website content
2. Be comprehensive but factual - include everything that could be useful for sales/marketing
3. Create detailed profiles that AI can use for sales scripts, targeting, and personalization
4. If information is not explicit, make reasonable inferences based on industry standards
5. Structure data for maximum AI utility

Website URL: ${websiteUrl}
Website Content: ${websiteContent}

Return ONLY this JSON structure (no extra text):

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

RESPOND ONLY WITH VALID JSON. Be thorough and detailed for AI training purposes.

REMEMBER: Your response must be parseable by JSON.parse() - no markdown formatting, no extra text, just pure JSON.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON from response with robust error handling
    let analysisData
    try {
      // Clean the response text more thoroughly
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      // Try to find JSON in the response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        let jsonString = jsonMatch[0]
        
        // Try multiple parsing strategies
        let parsed = null
        
        // Strategy 1: Try to parse as-is
        try {
          parsed = JSON.parse(jsonString)
        } catch (error1) {
          console.log('First parse attempt failed, trying repair...')
          
          // Strategy 2: Try with repair
          try {
            const repairedJson = repairJSON(jsonString)
            parsed = JSON.parse(repairedJson)
          } catch (error2) {
            console.log('Repair attempt failed, trying aggressive cleanup...')
            
            // Strategy 3: Try aggressive cleanup
            try {
              // More aggressive JSON cleaning
              let aggressiveClean = jsonString
                .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
                .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')  // Quote property names
                .replace(/:\s*([^",\[\]{}\n\r]+?)(\s*[,\]}])/g, (match, value, suffix) => {
                  const trimmed = value.trim()
                  if (/^(\d+\.?\d*|true|false|null)$/.test(trimmed) || trimmed.startsWith('"')) {
                    return match
                  }
                  return `: "${trimmed.replace(/"/g, '\\"')}"${suffix}`
                })
              
              parsed = JSON.parse(aggressiveClean)
            } catch (error3) {
              console.log('All parsing strategies failed, using fallback')
              throw new Error('Unable to parse JSON after all repair attempts')
            }
          }
        }
        
        if (parsed) {
          // Validate required fields and provide fallbacks
          analysisData = {
            businessName: parsed.businessName || extractBusinessName(websiteUrl),
            description: parsed.description || 'Business analysis completed',
            valueProposition: parsed.valueProposition || 'Providing valuable services to clients',
            industry: parsed.industry || 'Business Services',
            targetMarkets: Array.isArray(parsed.targetMarkets) ? parsed.targetMarkets : [],
            competitiveAdvantage: parsed.competitiveAdvantage || 'Quality service and customer focus',
            targetCustomers: Array.isArray(parsed.targetCustomers) ? parsed.targetCustomers : [],
            targetDecisionMakers: Array.isArray(parsed.targetDecisionMakers) ? parsed.targetDecisionMakers : []
          }
        } else {
          throw new Error('No valid JSON found in response')
        }
      } else {
        throw new Error('No JSON structure found in response')
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

function repairJSON(jsonString: string): string {
  try {
    // First, try to validate if it's already valid JSON
    try {
      JSON.parse(jsonString)
      return jsonString // If it parses successfully, return as-is
    } catch {
      // Continue with repairs if it fails
    }

    // More comprehensive JSON repair
    let repaired = jsonString

    // Remove trailing commas before closing brackets/braces
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1')
    
    // Fix unquoted property names
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
    
    // Remove trailing commas in objects and arrays
    repaired = repaired.replace(/,(\s*})/g, '$1')
    repaired = repaired.replace(/,(\s*])/g, '$1')
    
    // Fix issues with quotes inside strings (but be careful not to break structure)
    // Replace smart quotes with regular quotes
    repaired = repaired.replace(/[""]/g, '"')
    repaired = repaired.replace(/['']/g, "'")
    
    // Fix common escape sequence issues
    repaired = repaired.replace(/\\'/g, "'")
    
    // Remove any control characters that might break JSON
    repaired = repaired.replace(/[\x00-\x1F\x7F]/g, '')
    
    // Try to fix missing commas between object properties
    repaired = repaired.replace(/"\s*\n\s*"/g, '",\n  "')
    repaired = repaired.replace(/}\s*\n\s*{/g, '},\n  {')
    repaired = repaired.replace(/]\s*\n\s*\[/g, '],\n  [')
    
    // Fix missing quotes around string values that look like they should be quoted
    repaired = repaired.replace(/:\s*([^",\[\]{}\n]+)([,\]}])/g, (match, value, suffix) => {
      const trimmed = value.trim()
      // Don't quote numbers, booleans, null, or already quoted strings
      if (/^(\d+\.?\d*|true|false|null)$/.test(trimmed) || trimmed.startsWith('"')) {
        return match
      }
      return `: "${trimmed}"${suffix}`
    })

    return repaired
  } catch (error) {
    console.error('Error repairing JSON:', error)
    return jsonString
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