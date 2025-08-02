"""
API Expert Agent (AP)
Handles all API integrations and external service connections
"""

import json
from typing import Dict, Any, Optional, List

class APAgent:
    def __init__(self):
        self.name = "AP"
        self.role = "API Expert"
        self.api_configs = {
            "apify": {
                "base_url": "https://api.apify.com/v2",
                "auth_type": "token",
                "rate_limit": 100
            },
            "contactout": {
                "base_url": "https://api.contactout.com/v1",
                "auth_type": "api_key",
                "rate_limit": 50
            },
            "gemini": {
                "base_url": "https://generativelanguage.googleapis.com",
                "auth_type": "api_key",
                "rate_limit": 60
            },
            "vapi": {
                "base_url": "https://api.vapi.ai",
                "auth_type": "bearer",
                "rate_limit": 100
            }
        }
    
    def create_api_client(self, service_name: str):
        """Generate an API client for a specific service"""
        config = self.api_configs.get(service_name, {})
        
        return f"""
// integrations/{service_name}Client.ts
import axios, {{ AxiosInstance }} from 'axios'
import {{ RateLimiter }} from 'limiter'

export class {service_name.capitalize()}Client {{
  private client: AxiosInstance
  private limiter: RateLimiter
  
  constructor(apiKey: string) {{
    this.client = axios.create({{
      baseURL: '{config.get('base_url', '')}',
      headers: {{
        'Authorization': {self._get_auth_header(config.get('auth_type', 'bearer'))},
        'Content-Type': 'application/json'
      }}
    }})
    
    // Rate limiting: {config.get('rate_limit', 60)} requests per minute
    this.limiter = new RateLimiter({{
      tokensPerInterval: {config.get('rate_limit', 60)},
      interval: 'minute'
    }})
    
    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {{
      await this.limiter.removeTokens(1)
      return config
    }})
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {{
        console.error(`{service_name} API error:`, error.response?.data)
        throw error
      }}
    )
  }}
  
  async get(endpoint: string, params?: any) {{
    const response = await this.client.get(endpoint, {{ params }})
    return response.data
  }}
  
  async post(endpoint: string, data: any) {{
    const response = await this.client.post(endpoint, data)
    return response.data
  }}
  
  async put(endpoint: string, data: any) {{
    const response = await this.client.put(endpoint, data)
    return response.data
  }}
  
  async delete(endpoint: string) {{
    const response = await this.client.delete(endpoint)
    return response.data
  }}
}}
"""
    
    def create_webhook_handler(self, webhook_name: str):
        """Create a webhook handler"""
        return f"""
// api/webhooks/{webhook_name.lower()}/route.ts
import {{ NextRequest, NextResponse }} from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {{
  try {{
    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature')
    const body = await request.text()
    
    if (!verifyWebhookSignature(body, signature)) {{
      return NextResponse.json(
        {{ error: 'Invalid signature' }}, 
        {{ status: 401 }}
      )
    }}
    
    const data = JSON.parse(body)
    
    // Process webhook data
    await process{webhook_name}Webhook(data)
    
    return NextResponse.json({{ received: true }})
  }} catch (error) {{
    console.error('Webhook error:', error)
    return NextResponse.json(
      {{ error: 'Webhook processing failed' }}, 
      {{ status: 500 }}
    )
  }}
}}

function verifyWebhookSignature(body: string, signature: string | null): boolean {{
  if (!signature) return false
  
  const secret = process.env.{webhook_name.upper()}_WEBHOOK_SECRET
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}}

async function process{webhook_name}Webhook(data: any) {{
  // Implementation specific to webhook type
  console.log('Processing {webhook_name} webhook:', data)
}}
"""
    
    def create_api_integration_test(self, api_name: str):
        """Create integration tests for an API"""
        return f"""
// tests/integrations/{api_name.lower()}.test.ts
import {{ {api_name.capitalize()}Client }} from '@/integrations/{api_name}Client'

describe('{api_name.capitalize()} API Integration', () => {{
  let client: {api_name.capitalize()}Client
  
  beforeAll(() => {{
    client = new {api_name.capitalize()}Client(process.env.{api_name.upper()}_API_KEY!)
  }})
  
  test('should authenticate successfully', async () => {{
    // Test authentication
    const result = await client.get('/test')
    expect(result).toBeDefined()
  }})
  
  test('should handle rate limiting', async () => {{
    // Test rate limiting behavior
    const promises = Array(10).fill(null).map(() => 
      client.get('/test')
    )
    
    const results = await Promise.allSettled(promises)
    expect(results.every(r => r.status === 'fulfilled')).toBe(true)
  }})
  
  test('should handle errors gracefully', async () => {{
    // Test error handling
    await expect(client.get('/nonexistent')).rejects.toThrow()
  }})
}})
"""
    
    def _get_auth_header(self, auth_type: str) -> str:
        auth_headers = {
            "bearer": "`Bearer ${apiKey}`",
            "api_key": "`API-Key ${apiKey}`",
            "token": "`${apiKey}`"
        }
        return auth_headers.get(auth_type, "`Bearer ${apiKey}`")
    
    def generate_api_documentation(self, api_name: str, endpoints: List[Dict]):
        """Generate API documentation"""
        doc_content = f"# {api_name.upper()} API Documentation\n\n"
        
        for endpoint in endpoints:
            doc_content += f"""
## {endpoint['name']}

**Endpoint:** `{endpoint['method']} {endpoint['path']}`

**Description:** {endpoint.get('description', 'No description')}

**Parameters:**
{self._format_parameters(endpoint.get('parameters', []))}

**Response:**
```json
{json.dumps(endpoint.get('response_example', {}), indent=2)}
```

---
"""
        return doc_content
    
    def _format_parameters(self, parameters: List[Dict]) -> str:
        if not parameters:
            return "None"
        
        formatted = ""
        for param in parameters:
            formatted += f"- `{param['name']}` ({param['type']}, {param.get('required', 'optional')}): {param.get('description', '')}\n"
        
        return formatted