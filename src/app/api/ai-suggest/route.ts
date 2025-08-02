import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { questionId, question, businessAnalysis } = await request.json()
    
    if (!questionId || !question || !businessAnalysis) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
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