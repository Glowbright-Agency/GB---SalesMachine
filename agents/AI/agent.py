"""
AI Expert Agent (AI)
Handles AI model integration, prompt engineering, and optimization
"""

from typing import Dict, List, Any, Optional
import json

class AIExpertAgent:
    def __init__(self):
        self.name = "AI"
        self.role = "AI & Prompt Engineering Expert"
        self.models = {
            "gemini": {"pro": "gemini-1.5-pro", "flash": "gemini-1.5-flash"},
            "openai": {"gpt4": "gpt-4", "gpt35": "gpt-3.5-turbo"},
            "anthropic": {"claude3": "claude-3-opus", "claude2": "claude-2.1"}
        }
    
    def create_prompt_template(self, purpose: str) -> str:
        """Generate optimized prompt templates"""
        templates = {
            "lead_qualification": """
You are an expert business analyst. Analyze the following business information and determine if it matches our ideal customer profile.

Business Information:
- Name: {business_name}
- Industry: {industry}
- Website: {website_content}
- Reviews: {reviews}
- Location: {location}

Ideal Customer Profile:
{ideal_customer_profile}

Please analyze and provide:
1. **Match Score** (0-100): How well does this business match our ICP?
2. **Key Strengths**: What makes this a good fit? (bullet points)
3. **Concerns**: Any red flags or mismatches? (bullet points)
4. **Recommendation**: QUALIFY, NURTURE, or DISQUALIFY with reasoning
5. **Next Steps**: Specific actions to take

Format your response as JSON with these exact keys: match_score, strengths, concerns, recommendation, next_steps
""",
            
            "email_generation": """
You are a professional sales copywriter. Create a personalized outreach email.

Recipient Information:
- Name: {contact_name}
- Company: {company_name}
- Role: {role}
- Industry: {industry}
- Pain Points: {pain_points}

Our Solution:
{solution_description}

Previous Interactions:
{interaction_history}

Create an email that:
1. Has a compelling subject line
2. Personalizes the opening based on their business
3. Addresses their specific pain points
4. Presents our solution naturally
5. Includes a clear, low-commitment CTA
6. Keeps it under 150 words

Tone: Professional but conversational, not salesy

Output format:
Subject: [subject line]
Body: [email body]
""",
            
            "call_script_optimization": """
You are a sales psychology expert. Optimize this call script for better conversions.

Current Script:
{current_script}

Call Outcomes Data:
- Success Rate: {success_rate}%
- Common Objections: {objections}
- Drop-off Points: {drop_points}
- Average Duration: {avg_duration}

Target Audience:
{target_audience}

Please provide:
1. **Optimized Script** with the same structure but improved language
2. **Psychological Triggers** used and why
3. **Objection Handlers** for top 3 objections
4. **A/B Test Variations** (2 alternatives for key sections)
5. **Success Metrics** to track

Focus on: Building trust quickly, creating urgency without pressure, and qualifying effectively
""",
            
            "content_analysis": """
Analyze this website/content to extract business intelligence.

Content:
{content}

Extract and structure:
1. **Business Model**: How they make money
2. **Target Customers**: Who they serve
3. **Value Proposition**: What they offer
4. **Company Stage**: Startup/Growth/Mature
5. **Tech Stack**: Technologies mentioned
6. **Team Size**: Estimated from content
7. **Pain Points**: Problems they might face
8. **Opportunity Score**: 1-10 for our solution fit

Provide reasoning for each assessment. Format as JSON.
"""
        }
        
        return templates.get(purpose, "")
    
    def create_prompt_chain(self, task: str) -> List[Dict]:
        """Create multi-step prompt chains for complex tasks"""
        chains = {
            "full_lead_analysis": [
                {
                    "step": "website_extraction",
                    "prompt": "Extract key business information from this website content:\n{content}\n\nFocus on: services, target market, company size, technology used",
                    "output": "business_data"
                },
                {
                    "step": "competitor_analysis", 
                    "prompt": "Based on this business data:\n{business_data}\n\nIdentify likely competitors and market position",
                    "output": "market_analysis"
                },
                {
                    "step": "qualification",
                    "prompt": "Business Data:\n{business_data}\nMarket Analysis:\n{market_analysis}\n\nScore this lead and provide qualification recommendation",
                    "output": "final_score"
                }
            ],
            "personalized_outreach": [
                {
                    "step": "research",
                    "prompt": "Research this person and company:\n{contact_info}\n\nFind relevant hooks for outreach",
                    "output": "research_data"
                },
                {
                    "step": "message_creation",
                    "prompt": "Create personalized message using:\n{research_data}\n\nMake it highly relevant and engaging",
                    "output": "draft_message"
                },
                {
                    "step": "optimization",
                    "prompt": "Optimize this message for response rate:\n{draft_message}\n\nMake it shorter and more compelling",
                    "output": "final_message"
                }
            ]
        }
        
        return chains.get(task, [])
    
    def create_model_config(self, use_case: str) -> Dict:
        """Generate optimal model configurations"""
        configs = {
            "fast_scoring": {
                "model": "gemini-1.5-flash",
                "temperature": 0.3,
                "max_tokens": 500,
                "top_p": 0.9,
                "presence_penalty": 0,
                "frequency_penalty": 0,
                "system_message": "You are a precise business analyst. Be concise and accurate."
            },
            "creative_writing": {
                "model": "gpt-4",
                "temperature": 0.8,
                "max_tokens": 1000,
                "top_p": 0.95,
                "presence_penalty": 0.5,
                "frequency_penalty": 0.3,
                "system_message": "You are a creative copywriter. Write engaging, unique content."
            },
            "data_extraction": {
                "model": "gemini-1.5-pro",
                "temperature": 0.1,
                "max_tokens": 2000,
                "top_p": 0.9,
                "presence_penalty": 0,
                "frequency_penalty": 0,
                "system_message": "Extract data precisely. Output valid JSON only."
            },
            "conversation": {
                "model": "claude-3-opus",
                "temperature": 0.7,
                "max_tokens": 800,
                "top_p": 0.9,
                "presence_penalty": 0.3,
                "frequency_penalty": 0.3,
                "system_message": "You are a helpful assistant. Be conversational and natural."
            }
        }
        
        return configs.get(use_case, configs["fast_scoring"])
    
    def create_response_parser(self, expected_format: str) -> str:
        """Create response parsing logic"""
        parsers = {
            "json": """
def parse_ai_response(response: str) -> Dict:
    \"\"\"Parse AI response to structured data\"\"\"
    import json
    import re
    
    # Try direct JSON parsing
    try:
        return json.loads(response)
    except:
        pass
    
    # Extract JSON from markdown code blocks
    json_match = re.search(r'```json\\n(.*?)\\n```', response, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except:
            pass
    
    # Extract JSON from anywhere in response
    json_match = re.search(r'\\{.*\\}', response, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except:
            pass
    
    # Fallback: parse key-value pairs
    result = {}
    lines = response.split('\\n')
    for line in lines:
        if ':' in line:
            key, value = line.split(':', 1)
            result[key.strip().lower().replace(' ', '_')] = value.strip()
    
    return result
""",
            "structured": """
def parse_structured_response(response: str, structure: Dict) -> Dict:
    \"\"\"Parse response according to expected structure\"\"\"
    result = {}
    
    for field, field_type in structure.items():
        if field_type == 'list':
            # Extract bullet points or numbered lists
            pattern = r'(?:^|\\n)\\s*[•·\\-*\\d+.]\\s*(.+)'
            matches = re.findall(pattern, response, re.MULTILINE)
            result[field] = matches
        
        elif field_type == 'number':
            # Extract numbers
            pattern = rf'{field}.*?(\\d+(?:\\.\\d+)?)'
            match = re.search(pattern, response, re.IGNORECASE)
            result[field] = float(match.group(1)) if match else 0
        
        elif field_type == 'boolean':
            # Extract yes/no, true/false
            pattern = rf'{field}.*?(yes|no|true|false)'
            match = re.search(pattern, response, re.IGNORECASE)
            result[field] = match.group(1).lower() in ['yes', 'true'] if match else False
        
        else:  # string
            # Extract text after field name
            pattern = rf'{field}.*?:(.+?)(?=\\n[A-Z]|$)'
            match = re.search(pattern, response, re.IGNORECASE | re.DOTALL)
            result[field] = match.group(1).strip() if match else ''
    
    return result
"""
        }
        
        return parsers.get(expected_format, parsers["json"])
    
    def create_cost_optimizer(self) -> str:
        """Create cost optimization strategies"""
        return """
class AIKostOptimizer:
    def __init__(self):
        self.model_costs = {
            'gpt-4': 0.03,           # per 1K tokens
            'gpt-3.5-turbo': 0.002,  # per 1K tokens
            'gemini-pro': 0.001,     # per 1K tokens
            'gemini-flash': 0.0001,  # per 1K tokens
        }
        
        self.cache = {}  # Simple cache
    
    def select_model(self, task_complexity: str, speed_required: bool) -> str:
        \"\"\"Select optimal model based on task\"\"\"
        if task_complexity == 'simple' and speed_required:
            return 'gemini-flash'
        elif task_complexity == 'simple':
            return 'gpt-3.5-turbo'
        elif task_complexity == 'complex' and speed_required:
            return 'gemini-pro'
        else:
            return 'gpt-4'
    
    def optimize_prompt(self, prompt: str) -> str:
        \"\"\"Reduce prompt size while maintaining quality\"\"\"
        # Remove redundant instructions
        optimized = re.sub(r'\\s+', ' ', prompt)
        
        # Use abbreviations for common instructions
        replacements = {
            'Please provide': 'Provide',
            'Make sure to': 'Must',
            'It is important that': 'Important:',
            'In your response': 'Response:',
        }
        
        for old, new in replacements.items():
            optimized = optimized.replace(old, new)
        
        return optimized.strip()
    
    def should_use_cache(self, prompt_hash: str) -> bool:
        \"\"\"Check if we can use cached response\"\"\"
        return prompt_hash in self.cache
    
    def batch_requests(self, prompts: List[str]) -> List[str]:
        \"\"\"Batch multiple prompts for efficiency\"\"\"
        # Group similar prompts
        batches = []
        current_batch = []
        current_size = 0
        
        for prompt in prompts:
            prompt_size = len(prompt.split())
            if current_size + prompt_size > 2000:  # Token limit
                batches.append(current_batch)
                current_batch = [prompt]
                current_size = prompt_size
            else:
                current_batch.append(prompt)
                current_size += prompt_size
        
        if current_batch:
            batches.append(current_batch)
        
        return batches
"""
    
    def create_quality_metrics(self) -> str:
        """Create AI response quality measurement"""
        return """
class AIQualityMetrics:
    def measure_response_quality(self, response: str, expected_format: Dict) -> Dict:
        \"\"\"Measure quality of AI response\"\"\"
        metrics = {
            'completeness': 0,
            'accuracy': 0,
            'format_compliance': 0,
            'coherence': 0,
            'usefulness': 0
        }
        
        # Check completeness
        expected_fields = expected_format.get('required_fields', [])
        found_fields = sum(1 for field in expected_fields if field.lower() in response.lower())
        metrics['completeness'] = found_fields / len(expected_fields) if expected_fields else 1
        
        # Check format compliance
        if expected_format.get('type') == 'json':
            try:
                json.loads(response)
                metrics['format_compliance'] = 1
            except:
                metrics['format_compliance'] = 0
        
        # Check coherence (simple check for now)
        sentences = response.split('.')
        if len(sentences) > 1:
            metrics['coherence'] = 0.8 if all(len(s.strip()) > 10 for s in sentences[:-1]) else 0.5
        
        # Overall score
        metrics['overall'] = sum(metrics.values()) / len(metrics)
        
        return metrics
    
    def log_ai_interaction(self, prompt: str, response: str, metrics: Dict):
        \"\"\"Log AI interactions for analysis\"\"\"
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'prompt_length': len(prompt.split()),
            'response_length': len(response.split()),
            'quality_metrics': metrics,
            'model_used': 'gemini-pro',  # Track which model
            'cost_estimate': len(prompt.split()) * 0.001 / 1000
        }
        
        # Store in database or file
        return log_entry
"""