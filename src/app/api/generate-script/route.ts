import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { readFileSync } from 'fs'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessData, decisionMaker, salesTargets, location, businessId } = await request.json()

    if (!businessData || !decisionMaker) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // Get comprehensive business knowledge base from database
    let knowledgeBase = businessData
    if (businessId) {
      const { data: business } = await supabase
        .from('businesses')
        .select('analysis_data, discovery_answers')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .single()
      
      if (business?.analysis_data) {
        knowledgeBase = business.analysis_data
      }
    }

    // Read sales script guidelines
    const guidelinesPath = '/Users/federicocappuccilli/Desktop/GB - SalesMachine/sales-script-guidelines.md'
    let salesGuidelines = ''
    try {
      salesGuidelines = readFileSync(guidelinesPath, 'utf-8')
    } catch (error) {
      console.error('Could not read sales script guidelines:', error)
      salesGuidelines = 'Use professional sales script best practices focusing on value proposition, discovery questions, objection handling, and clear next steps.'
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    // Create comprehensive prompt using sales script guidelines and knowledge base
    const prompt = `You are an expert sales script writer. Create a professional cold calling script using the provided sales guidelines and comprehensive business knowledge base.

SALES SCRIPT GUIDELINES:
${salesGuidelines}

COMPREHENSIVE BUSINESS KNOWLEDGE BASE:
${JSON.stringify(knowledgeBase, null, 2)}

CAMPAIGN CONTEXT:
- Target Decision Maker: ${decisionMaker}
- Target Industries: ${salesTargets?.join(', ') || 'Not specified'}
- Target Location: ${location || 'Not specified'}

INSTRUCTIONS:
1. Use the sales script guidelines EXACTLY as provided - follow all structure and best practices
2. Leverage ALL information from the business knowledge base for maximum personalization
3. Tailor the script specifically for the ${decisionMaker} role using their pain points and priorities
4. Reference the company's competitive advantages, unique value propositions, and key differentiators
5. Include industry-specific language, challenges, and opportunities
6. Use the decision maker's communication style and priorities from the knowledge base
7. Create urgency based on the cost of inaction specific to their role

Create a highly personalized script with:
- Opening that resonates with this specific decision maker
- Value proposition using the company's unique advantages
- Discovery questions relevant to their role and industry challenges  
- Objection handling for their specific concerns
- Clear call-to-action with specific next steps

Generate TWO parts exactly as requested:
1. FIRST_MESSAGE: The opening message to get attention and permission (follow guidelines for timing)
2. SYSTEM_PROMPT: Complete conversation guide with discovery, objection handling, and closing

Format as JSON:
{
  "firstMessage": "Professional opening message here...",
  "systemPrompt": "Complete conversation guide here..."
}

RESPOND ONLY WITH VALID JSON. No explanations or markdown.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Try to parse as JSON, fallback to structured format
    let scriptData
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        scriptData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON found')
      }
    } catch (e) {
      console.error('Failed to parse script response:', e)
      console.error('Raw response:', text)
      
      // Fallback using knowledge base data
      const companyName = knowledgeBase.businessName || businessData.businessName || 'our company'
      const valueProposition = knowledgeBase.valueProposition || businessData.valueProposition || 'improve business operations'
      const targetIndustry = salesTargets?.[0] || 'businesses'
      
      scriptData = {
        firstMessage: `Hi [Name], this is [Your Name] from ${companyName}. I know I'm calling out of the blue, but we help ${decisionMaker}s at ${targetIndustry} companies ${valueProposition.toLowerCase()}. Do you have 30 seconds for me to explain why I called?`,
        systemPrompt: `You are calling a ${decisionMaker} at a ${targetIndustry} company in ${location}. Your goal is to book a 15-minute discovery call to discuss how ${companyName} can help them with ${valueProposition}. 

Key talking points from knowledge base:
- Competitive advantage: ${knowledgeBase.competitiveAdvantage || businessData.competitiveAdvantage || 'quality service and expertise'}
- Target pain points: ${knowledgeBase.targetDecisionMakers?.find((dm: any) => dm.title === decisionMaker)?.painPoints?.join(', ') || 'operational efficiency and cost reduction'}
- Key features: ${knowledgeBase.keyFeatures?.join(', ') || 'proven solutions'}

Discovery questions to ask:
1. How are you currently handling [relevant process]?
2. What's the biggest challenge with your current approach?
3. How does that impact your [department/goals]?
4. What would an ideal solution look like for you?

Handle objections professionally:
- "Not interested" → "I understand, but what if I could show you how we helped [similar company] achieve [specific result]?"
- "Send me info" → "I could send information, but what if I took just 30 seconds to explain the key point that's relevant to your situation?"
- "No budget" → "That's exactly why this might be valuable - let me ask, what's the cost of continuing with your current approach?"

Close with: "Based on what you've shared, I think a brief 15-minute call would be valuable. I have [day] at [time] or [day] at [time] - which works better for you?"`
      }
    }

    // Ensure we have valid responses
    if (!scriptData.firstMessage || !scriptData.systemPrompt) {
      throw new Error('Invalid script generation response')
    }

    return NextResponse.json(scriptData)

  } catch (error) {
    console.error('Error generating script:', error)
    return NextResponse.json({ 
      error: 'Failed to generate script',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}