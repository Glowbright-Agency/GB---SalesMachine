"""
VAPI Expert Agent (VP)
Specializes in VAPI voice AI configuration and management
"""

from typing import Dict, List, Any
import json

class VPAgent:
    def __init__(self):
        self.name = "VP"
        self.role = "VAPI Expert"
        self.voice_providers = ["elevenlabs", "playht", "deepgram", "azure"]
        self.models = ["gpt-4o", "gpt-4", "gpt-3.5-turbo", "claude-3", "llama-2"]
    
    def create_assistant_config(self, assistant_type: str) -> Dict:
        """Create VAPI assistant configuration"""
        configs = {
            "sales": {
                "name": "Sales Outreach Assistant",
                "firstMessage": "Hi, this is Sarah from GB Agency. I noticed your business online and wanted to reach out about how we might be able to help you grow. Do you have a moment to chat?",
                "systemPrompt": """You are a friendly, professional sales assistant for GB Agency. Your goal is to:
1. Qualify leads by understanding their business needs
2. Build rapport and trust
3. Schedule follow-up meetings for interested prospects
4. Collect key information (budget, timeline, decision makers)
5. Handle objections gracefully

Keep conversations natural and conversational. Listen actively and ask open-ended questions.""",
                "voice": {
                    "provider": "elevenlabs",
                    "voiceId": "21m00Tcm4TlvDq8ikWAM",
                    "speed": 1.0,
                    "stability": 0.8,
                    "similarityBoost": 0.75
                },
                "model": {
                    "provider": "openai",
                    "model": "gpt-4",
                    "temperature": 0.7,
                    "maxTokens": 150
                },
                "endCallFunctionEnabled": True,
                "dialKeypadFunctionEnabled": True,
                "silenceTimeoutSeconds": 30,
                "responseDelaySeconds": 0.4,
                "llmRequestDelaySeconds": 0.1,
                "numWordsToInterruptAssistant": 2
            },
            "support": {
                "name": "Customer Support Assistant",
                "firstMessage": "Hello! Thank you for calling GB Agency support. How can I help you today?",
                "systemPrompt": """You are a helpful customer support assistant. Your role is to:
1. Understand customer issues quickly
2. Provide clear, accurate solutions
3. Escalate complex issues when needed
4. Maintain a friendly, patient demeanor
5. Document issues for follow-up

Always be empathetic and solution-focused.""",
                "voice": {
                    "provider": "elevenlabs",
                    "voiceId": "MF3mGyEYCl7XYWbV9V6O",
                    "speed": 0.95
                },
                "model": {
                    "provider": "openai",
                    "model": "gpt-3.5-turbo",
                    "temperature": 0.5
                }
            },
            "appointment": {
                "name": "Appointment Scheduler",
                "firstMessage": "Hi! I'm calling to help you schedule your consultation with GB Agency. What day and time works best for you?",
                "systemPrompt": """You are an appointment scheduling assistant. Your tasks:
1. Find mutually available time slots
2. Confirm appointment details
3. Send calendar invitations
4. Handle rescheduling requests
5. Remind about preparation needed

Be efficient and clear about available options.""",
                "voice": {
                    "provider": "elevenlabs",
                    "voiceId": "pNInz6obpgDQGcFmaJgB",
                    "speed": 1.1
                }
            }
        }
        
        return configs.get(assistant_type, configs["sales"])
    
    def create_vapi_function(self, function_type: str) -> Dict:
        """Create VAPI function definitions"""
        functions = {
            "schedule_meeting": {
                "name": "scheduleMeeting",
                "description": "Schedule a meeting with the prospect",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "date": {"type": "string", "description": "Meeting date"},
                        "time": {"type": "string", "description": "Meeting time"},
                        "duration": {"type": "integer", "description": "Duration in minutes"},
                        "attendeeEmail": {"type": "string", "description": "Attendee email"},
                        "notes": {"type": "string", "description": "Meeting notes"}
                    },
                    "required": ["date", "time", "attendeeEmail"]
                }
            },
            "qualify_lead": {
                "name": "qualifyLead",
                "description": "Qualify and score a lead",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "budget": {"type": "string", "description": "Budget range"},
                        "timeline": {"type": "string", "description": "Implementation timeline"},
                        "authority": {"type": "boolean", "description": "Is decision maker"},
                        "need": {"type": "string", "description": "Primary need/pain point"},
                        "score": {"type": "integer", "description": "Lead score 1-100"}
                    }
                }
            },
            "transfer_call": {
                "name": "transferCall",
                "description": "Transfer call to human agent",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "department": {"type": "string", "enum": ["sales", "support", "technical"]},
                        "reason": {"type": "string", "description": "Transfer reason"}
                    },
                    "required": ["department"]
                }
            }
        }
        
        return functions.get(function_type, {})
    
    def create_call_script(self, script_type: str) -> str:
        """Generate call scripts for different scenarios"""
        scripts = {
            "cold_call": """
# Cold Call Script

## Opening (0-10 seconds)
"Hi [Name], this is [Your Name] from GB Agency. I know you're busy, so I'll be brief. 
We've helped businesses like yours increase revenue by 30% through our innovative solutions. 
Do you have 2 minutes to hear how this might benefit [Company Name]?"

## Value Proposition (10-30 seconds)
[If YES]: "Great! We specialize in [specific solution] that addresses [common pain point]. 
Many of our clients in [their industry] have seen [specific result]. 
What's your biggest challenge with [relevant area] right now?"

## Discovery Questions
1. "How are you currently handling [specific process]?"
2. "What would improvement in this area mean for your business?"
3. "Who else would be involved in evaluating a solution like this?"

## Close
"Based on what you've shared, I think we could really help. 
Would you be open to a 20-minute call next week to explore this further?"
""",
            "follow_up": """
# Follow-Up Call Script

## Opening
"Hi [Name], it's [Your Name] from GB Agency following up on our conversation last [day]. 
You mentioned [specific point from last call]. Have you had a chance to think about that?"

## Re-engagement
"Since we last spoke, we've helped [similar company] achieve [specific result]. 
I thought this might be relevant to your situation with [their challenge]."

## Next Steps
"What questions have come up since our last conversation?"
"What would need to happen for you to move forward with a solution?"
"When would be a good time to involve [other stakeholders] in the conversation?"
""",
            "objection_handling": """
# Common Objections & Responses

## "Too Expensive"
"I understand price is important. Let me ask - what would it cost your business 
to continue without solving [problem]? Our clients typically see ROI within [timeframe]."

## "Not Interested"
"I appreciate your directness. Before I go, can I ask - is it because you already 
have a solution in place, or is [problem area] just not a priority right now?"

## "Send Me Information"
"I'd be happy to send tailored information. To make sure it's relevant, 
what specific aspects would you like me to focus on?"

## "Call Me Later"
"Of course! When would be a better time? And so I can prepare, 
what will have changed by then that would make this conversation more valuable?"
"""
        }
        
        return scripts.get(script_type, "")
    
    def create_voice_analytics_dashboard(self) -> str:
        """Create analytics tracking configuration"""
        return """
// analytics/vapi-analytics.ts
export interface CallAnalytics {
  callId: string
  duration: number
  outcome: 'completed' | 'no-answer' | 'voicemail' | 'failed'
  sentiment: 'positive' | 'neutral' | 'negative'
  keyPoints: string[]
  nextSteps: string[]
  transcriptUrl: string
}

export class VAPIAnalytics {
  async trackCall(analytics: CallAnalytics) {
    // Store in database
    await supabase.from('call_analytics').insert({
      ...analytics,
      created_at: new Date().toISOString()
    })
    
    // Calculate metrics
    await this.updateMetrics(analytics)
  }
  
  async updateMetrics(analytics: CallAnalytics) {
    const metrics = {
      totalCalls: { $inc: 1 },
      avgDuration: analytics.duration,
      successRate: analytics.outcome === 'completed' ? 1 : 0,
      sentimentScore: this.getSentimentScore(analytics.sentiment)
    }
    
    // Update dashboard metrics
    await this.updateDashboard(metrics)
  }
  
  getSentimentScore(sentiment: string): number {
    const scores = { positive: 1, neutral: 0, negative: -1 }
    return scores[sentiment] || 0
  }
}
"""
    
    def generate_vapi_cli_commands(self) -> List[str]:
        """Generate useful VAPI CLI commands"""
        return [
            "# VAPI CLI Commands Reference",
            "",
            "# Authentication",
            "vapi login",
            "",
            "# Assistant Management",
            "vapi assistant create --config assistant.json",
            "vapi assistant list",
            "vapi assistant get <assistant-id>",
            "vapi assistant update <assistant-id> --config updates.json",
            "vapi assistant delete <assistant-id>",
            "",
            "# Phone Numbers",
            "vapi phone create --number '+1234567890' --assistant-id <id>",
            "vapi phone list",
            "vapi phone update <phone-id> --assistant-id <new-id>",
            "",
            "# Making Calls",
            "vapi call create --to '+1234567890' --assistant-id <id>",
            "vapi call list --limit 10",
            "vapi call get <call-id>",
            "",
            "# Analytics & Logs",
            "vapi analytics calls --start-date 2024-01-01",
            "vapi logs list --call-id <call-id>",
            "vapi logs errors --limit 20",
            "",
            "# Testing",
            "vapi test assistant <assistant-id>",
            "vapi test call --to '+1234567890' --duration 60"
        ]