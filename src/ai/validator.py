import google.generativeai as genai
from typing import Dict, Optional
import requests
from bs4 import BeautifulSoup
from src.config import Config

class LeadValidator:
    def __init__(self):
        genai.configure(api_key=Config.GOOGLE_GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-pro')
    
    def analyze_business(self, business_data: Dict, target_criteria: Dict) -> Dict:
        """
        Analyze a business to determine if it matches target criteria
        """
        # Fetch website content if available
        website_content = ""
        if business_data.get('website'):
            website_content = self._fetch_website_content(business_data['website'])
        
        # Create analysis prompt
        prompt = f"""
        Analyze this business and determine if it matches our target criteria:
        
        Business Information:
        - Name: {business_data.get('business_name')}
        - Category: {business_data.get('category')}
        - Address: {business_data.get('address')}
        - Rating: {business_data.get('rating')}
        - Reviews: {business_data.get('reviews_count')}
        - Website Content: {website_content[:1000]}
        
        Target Criteria:
        {target_criteria}
        
        Please provide:
        1. Business description (2-3 sentences)
        2. List of main services/products
        3. Target market
        4. Estimated company size
        5. Relevance score (0-100) based on how well it matches criteria
        6. Recommendation (YES/NO) with brief reasoning
        
        Format as JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            analysis = self._parse_response(response.text)
            return analysis
        except Exception as e:
            print(f"Error analyzing business: {e}")
            return {
                'relevance_score': 0,
                'recommendation': 'NO',
                'error': str(e)
            }
    
    def _fetch_website_content(self, url: str) -> str:
        """Fetch and extract text from website"""
        try:
            response = requests.get(url, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            text = soup.get_text()
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            return text[:2000]  # Limit content length
        except:
            return ""
    
    def _parse_response(self, response_text: str) -> Dict:
        """Parse AI response to structured format"""
        import json
        import re
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except:
                pass
        
        # Fallback parsing
        return {
            'business_description': '',
            'services': [],
            'target_market': '',
            'company_size': '',
            'relevance_score': 0,
            'recommendation': 'NO',
            'reasoning': response_text
        }