import { v4 as uuidv4 } from 'uuid'

interface VAPIAssistant {
  id: string
  name: string
  voice: {
    provider: string
    voiceId: string
  }
  model: {
    provider: string
    model: string
    temperature: number
  }
  firstMessage: string
  systemPrompt: string
  endCallFunctionEnabled?: boolean
  recordingEnabled?: boolean
  hipaaEnabled?: boolean
}

interface VAPICallRequest {
  assistantId: string
  phoneNumber: string
  customer: {
    name: string
    email?: string
    number: string
  }
  metadata?: Record<string, any>
}

interface VAPICall {
  id: string
  assistantId: string
  phoneNumber: string
  customer: any
  status: string
  duration?: number
  cost?: number
  recording?: string
  transcript?: string
  startedAt?: string
  endedAt?: string
}

export class VAPIClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY!
    this.baseUrl = 'https://api.vapi.ai'
  }

  async createAssistant(config: Partial<VAPIAssistant>): Promise<VAPIAssistant> {
    const response = await fetch(`${this.baseUrl}/assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: config.name || 'Sales Assistant',
        voice: config.voice || {
          provider: 'elevenlabs',
          voiceId: '21m00Tcm4TlvDq8ikWAM'
        },
        model: config.model || {
          provider: 'openai',
          model: 'gpt-4o',
          temperature: 0.7
        },
        firstMessage: config.firstMessage,
        systemPrompt: config.systemPrompt,
        endCallFunctionEnabled: true,
        recordingEnabled: true,
        hipaaEnabled: false,
        ...config
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to create assistant: ${response.statusText}`)
    }

    return await response.json()
  }

  async updateAssistant(assistantId: string, updates: Partial<VAPIAssistant>): Promise<VAPIAssistant> {
    const response = await fetch(`${this.baseUrl}/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error(`Failed to update assistant: ${response.statusText}`)
    }

    return await response.json()
  }

  async makeCall(request: VAPICallRequest): Promise<VAPICall> {
    const response = await fetch(`${this.baseUrl}/call/phone`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistantId: request.assistantId,
        phoneNumber: request.phoneNumber,
        customer: request.customer,
        metadata: request.metadata
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to make call: ${error}`)
    }

    return await response.json()
  }

  async getCall(callId: string): Promise<VAPICall> {
    const response = await fetch(`${this.baseUrl}/call/${callId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get call: ${response.statusText}`)
    }

    return await response.json()
  }

  async listCalls(assistantId?: string): Promise<VAPICall[]> {
    const params = new URLSearchParams()
    if (assistantId) {
      params.append('assistantId', assistantId)
    }

    const response = await fetch(`${this.baseUrl}/call?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to list calls: ${response.statusText}`)
    }

    return await response.json()
  }

  async generateSalesScript(
    businessInfo: any,
    targetRole: string,
    leadInfo: any
  ): Promise<{ systemPrompt: string; firstMessage: string }> {
    const discovery = businessInfo.discovery_answers || {}
    
    // Generate system prompt following sales-script-guidelines.md
    const systemPrompt = `You are a professional sales representative for ${businessInfo.business_name}. 

MODEL: Use GPT-4o for best performance.

CRITICAL INFORMATION FROM DISCOVERY:

1. MEASURABLE OUTCOME: ${discovery.measurable_outcome || businessInfo.value_proposition}

2. TARGET AUDIENCE: ${discovery.target_audience || 'Business decision makers'}

3. KEY DIFFERENTIATOR: ${discovery.key_differentiator || 'Unique solution approach'}

4. TOP OBJECTIONS AND RESPONSES:
${discovery.top_objections || `
- "We already have a solution" → "I completely understand. Most of our clients said the same initially. On a scale of 1-10, how would you rate your current solution?"
- "No budget" → "I understand budget is critical. Is addressing this problem a priority this year, just not funded yet? Often our solution pays for itself through specific savings."
- "Not a priority right now" → "I get it, you have competing priorities. Where does solving this problem rank on your list?"
`}

5. URGENCY FACTORS: ${discovery.urgency_factors || 'Cost of inaction and competitive pressure'}

6. SUCCESS STORY: ${discovery.success_story || 'Similar companies achieving significant results'}

7. QUALIFICATION CRITERIA: ${discovery.qualification_criteria || 'Problem severity, budget authority, implementation timeline'}

CALL STRUCTURE (Follow exactly):
1. OPENING (10 seconds): Pattern interrupt + personalization + permission
2. VALUE PROPOSITION (20 seconds): Problem + solution + quantified benefit
3. DISCOVERY (2-3 minutes): Use SPIN questions (Situation, Problem, Implication, Need-payoff)
4. CLOSE (30 seconds): Summary + specific meeting request

CURRENT CALL CONTEXT:
- Prospect: ${leadInfo.contact_name || 'the business owner'} at ${leadInfo.business_name}
- Title: ${targetRole || leadInfo.contact_title || 'decision maker'}
- Category: ${leadInfo.category}
- Validation Score: ${leadInfo.validation_score}/100

VOICE TONALITY (PAVP Framework):
- Pitch: Medium-low for authority
- Articulation: Crystal clear
- Volume: Slightly above conversational
- Pace: 140-160 words per minute

FATAL PHRASES TO AVOID:
- Never say "How are you today?"
- Never say "Did I catch you at a bad time?"
- Never say "Do you have a few minutes?"
- Never say "Is this something you'd be interested in?"

Remember: The goal is NOT to make a sale, but to:
1. Determine if there's a potential fit
2. Create enough interest for a deeper conversation
3. Book a specific next step`

    // Generate first message using pattern interrupt opening
    const openingType = this.selectOpeningType(leadInfo)
    let firstMessage = ''

    switch (openingType) {
      case 'research_based':
        firstMessage = `Hi ${leadInfo.contact_name?.split(' ')[0] || 'there'}, I saw your business ${leadInfo.business_name} has ${leadInfo.rating ? `an impressive ${leadInfo.rating} star rating` : 'been growing in the area'}. Your focus on ${leadInfo.category} caught my attention. I'm ${businessInfo.agent_name || 'calling'} from ${businessInfo.business_name}, and that's exactly why I'm reaching out.`
        break
      
      case 'competitor_social_proof':
        firstMessage = `Hi ${leadInfo.contact_name?.split(' ')[0] || 'there'}, ${businessInfo.agent_name || 'this is'} from ${businessInfo.business_name}. We recently helped a ${leadInfo.category} business similar to ${leadInfo.business_name} ${discovery.measurable_outcome || 'achieve significant results'}. Given you're in the same space, I thought this might be relevant to you. Got a minute?`
        break
      
      case 'pattern_interrupt':
        firstMessage = `Hi ${leadInfo.contact_name?.split(' ')[0] || 'there'}, I know I'm calling out of the blue. I'll be brief. ${this.generateCompellingStatement(discovery, leadInfo)}. Do you have 30 seconds for me to explain why I called?`
        break
      
      default: // honest_direct
        firstMessage = `Hi ${leadInfo.contact_name?.split(' ')[0] || 'there'}, this is a cold call. Do you want to hang up, or can I have 30 seconds to tell you why I called?`
    }

    return { systemPrompt, firstMessage }
  }

  private selectOpeningType(leadInfo: any): string {
    // Logic to select best opening based on lead data
    if (leadInfo.rating >= 4.5 || leadInfo.reviews_count > 50) {
      return 'research_based'
    } else if (leadInfo.validation_score >= 80) {
      return 'competitor_social_proof'
    } else if (leadInfo.validation_score >= 60) {
      return 'pattern_interrupt'
    } else {
      return 'honest_direct'
    }
  }

  private generateCompellingStatement(discovery: any, leadInfo: any): string {
    const statements = [
      discovery.measurable_outcome,
      `Most ${leadInfo.category} businesses are losing money on ${discovery.urgency_factors || 'inefficiencies'}`,
      `There's a new way to ${discovery.key_differentiator || 'solve your biggest challenge'}`
    ].filter(Boolean)

    return statements[0] || 'I have something important to share about your business'
  }


  async createCampaignAssistant(campaign: any, business: any): Promise<string> {
    // Create a unique assistant for this campaign
    const assistantName = `${campaign.name} - ${business.business_name}`
    
    const assistant = await this.createAssistant({
      name: assistantName,
      voice: {
        provider: 'elevenlabs',
        voiceId: '21m00Tcm4TlvDq8ikWAM' // Professional female voice
      },
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.7
      },
      // These will be customized per lead
      firstMessage: 'This will be customized per lead',
      systemPrompt: 'This will be customized per lead'
    })

    return assistant.id
  }

  async handleWebhook(body: any): Promise<void> {
    const { type, call } = body

    switch (type) {
      case 'call.started':
        console.log(`Call started: ${call.id}`)
        break
      
      case 'call.ended':
        console.log(`Call ended: ${call.id}, duration: ${call.duration}s`)
        // Update call log in database
        break
      
      case 'call.failed':
        console.error(`Call failed: ${call.id}`)
        break
      
      case 'appointment.booked':
        console.log(`Appointment booked from call: ${call.id}`)
        // Create appointment record
        break
    }
  }
}