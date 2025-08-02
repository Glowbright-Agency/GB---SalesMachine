'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface BusinessData {
  businessName: string
  industry: string
  description: string
  valueProposition: string
  targetMarkets: any[]
  competitiveAdvantage: string
}

interface LocationSuggestion {
  city: string
  state: string
  display: string
}

export default function NewCampaignPage() {
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [location, setLocation] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null)
  
  // Sales targets based on business type
  const [salesTargets, setSalesTargets] = useState<string[]>([])
  const [customTarget, setCustomTarget] = useState('')
  
  // Decision makers - will be populated by AI based on business analysis
  const [decisionMakers, setDecisionMakers] = useState<string[]>([])
  const [customDecisionMaker, setCustomDecisionMaker] = useState('')
  
  // Service selection
  const [selectedService, setSelectedService] = useState<'scraping' | 'scraping_calling' | null>(null)
  const [numberOfLeads, setNumberOfLeads] = useState(50)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Load business data from localStorage (from onboarding)
    const analysisData = localStorage.getItem('businessAnalysis')
    if (analysisData) {
      try {
        const analysis = JSON.parse(analysisData)
        setBusinessData(analysis)
        
        // Set AI-suggested sales targets from business analysis
        setDefaultSalesTargets(analysis)
        
        // Set AI-suggested decision makers from business analysis
        setAIDecisionMakers(analysis)
      } catch (e) {
        console.error('Failed to parse business data:', e)
      }
    }
  }, [])

  const setDefaultSalesTargets = (analysis: BusinessData) => {
    // Use AI-suggested keywords/targets from business analysis
    const aiSuggestedTargets: string[] = []
    
    // Extract suggested search queries or keywords from the analysis
    if (analysis.targetMarkets && analysis.targetMarkets.length > 0) {
      analysis.targetMarkets.forEach(market => {
        if (typeof market === 'string') {
          aiSuggestedTargets.push(market)
        } else if (market && typeof market === 'object') {
          if (market.industry) aiSuggestedTargets.push(market.industry)
          if (market.businessType) aiSuggestedTargets.push(market.businessType)
          if (market.keyword) aiSuggestedTargets.push(market.keyword)
        }
      })
    }
    
    // If we have AI suggestions, use them
    if (aiSuggestedTargets.length > 0) {
      setSalesTargets(aiSuggestedTargets)
      return
    }
    
    // Fallback to industry-based suggestions if no AI data
    const lowerIndustry = analysis.industry?.toLowerCase() || ''
    
    if (lowerIndustry.includes('health') || lowerIndustry.includes('medical')) {
      setSalesTargets([
        'Weight Loss Clinics',
        'Hormone Therapy Clinics',
        'MedSpas',
        'Longevity Clinics',
        'Dermatology Practices'
      ])
    } else if (lowerIndustry.includes('tech') || lowerIndustry.includes('software')) {
      setSalesTargets([
        'Software Companies',
        'IT Services',
        'SaaS Startups',
        'Technology Consultants',
        'Digital Agencies'
      ])
    } else if (lowerIndustry.includes('restaurant') || lowerIndustry.includes('food')) {
      setSalesTargets([
        'Restaurants',
        'Fast Food Chains',
        'Catering Services',
        'Food Trucks',
        'Bars & Nightclubs'
      ])
    } else {
      setSalesTargets([
        'Small Businesses',
        'Professional Services',
        'Retail Stores',
        'Consultants',
        'Local Services'
      ])
    }
  }

  const setAIDecisionMakers = (analysis: BusinessData) => {
    const industry = analysis.industry?.toLowerCase() || ''
    const businessType = analysis.description?.toLowerCase() || ''
    
    let aiSuggestedDecisionMakers: string[] = []
    
    // Generate decision makers based on industry and business analysis
    if (industry.includes('health') || industry.includes('medical') || businessType.includes('health') || businessType.includes('medical')) {
      aiSuggestedDecisionMakers = [
        'Chief Medical Officer (CMO)',
        'Medical Director',
        'Clinical Director',
        'Practice Manager',
        'Clinic Administrator',
        'Head of Operations',
        'Founder/Owner',
        'Chief Executive Officer (CEO)'
      ]
    } else if (industry.includes('tech') || industry.includes('software') || businessType.includes('tech') || businessType.includes('software')) {
      aiSuggestedDecisionMakers = [
        'Chief Technology Officer (CTO)',
        'Chief Executive Officer (CEO)',
        'Founder',
        'Head of Engineering',
        'VP of Product',
        'Chief Product Officer (CPO)',
        'Head of Operations',
        'Chief Operating Officer (COO)'
      ]
    } else if (industry.includes('restaurant') || industry.includes('food') || businessType.includes('restaurant') || businessType.includes('food')) {
      aiSuggestedDecisionMakers = [
        'Owner/Proprietor',
        'General Manager',
        'Restaurant Manager',
        'Operations Manager',
        'Franchise Owner',
        'Regional Manager',
        'Food & Beverage Director'
      ]
    } else if (industry.includes('retail') || businessType.includes('retail') || businessType.includes('store')) {
      aiSuggestedDecisionMakers = [
        'Store Manager',
        'Regional Manager',
        'Operations Manager',
        'Owner',
        'District Manager',
        'Merchandising Manager',
        'General Manager'
      ]
    } else if (industry.includes('finance') || businessType.includes('finance') || businessType.includes('financial')) {
      aiSuggestedDecisionMakers = [
        'Chief Financial Officer (CFO)',
        'Managing Director',
        'Branch Manager',
        'Operations Manager',
        'Chief Executive Officer (CEO)',
        'Head of Operations',
        'Regional Director'
      ]
    } else if (industry.includes('service') || businessType.includes('service') || businessType.includes('consulting')) {
      aiSuggestedDecisionMakers = [
        'Founder',
        'Managing Partner',
        'Chief Executive Officer (CEO)',
        'Operations Manager',
        'Service Manager',
        'Business Development Manager',
        'Principal'
      ]
    } else {
      // Generic business decision makers
      aiSuggestedDecisionMakers = [
        'Chief Executive Officer (CEO)',
        'Founder',
        'Managing Director',
        'Operations Manager',
        'General Manager',
        'Business Owner',
        'Chief Operating Officer (COO)',
        'Head of Operations'
      ]
    }
    
    setDecisionMakers(aiSuggestedDecisionMakers)
  }

  const searchLocations = (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([])
      return
    }

    // Mock location suggestions - in production, this would call a geocoding API
    const mockSuggestions = [
      { city: 'Miami', state: 'FL', display: 'Miami, FL' },
      { city: 'New York', state: 'NY', display: 'New York, NY' },
      { city: 'Los Angeles', state: 'CA', display: 'Los Angeles, CA' },
      { city: 'Chicago', state: 'IL', display: 'Chicago, IL' },
      { city: 'Houston', state: 'TX', display: 'Houston, TX' },
      { city: 'Phoenix', state: 'AZ', display: 'Phoenix, AZ' },
      { city: 'Philadelphia', state: 'PA', display: 'Philadelphia, PA' },
      { city: 'San Antonio', state: 'TX', display: 'San Antonio, TX' },
      { city: 'San Diego', state: 'CA', display: 'San Diego, CA' },
      { city: 'Dallas', state: 'TX', display: 'Dallas, TX' }
    ]

    const filtered = mockSuggestions.filter(loc => 
      loc.display.toLowerCase().includes(query.toLowerCase())
    )
    
    setLocationSuggestions(filtered)
  }

  const addSalesTarget = () => {
    if (customTarget.trim() && !salesTargets.includes(customTarget.trim())) {
      setSalesTargets([...salesTargets, customTarget.trim()])
      setCustomTarget('')
    }
  }

  const removeSalesTarget = (target: string) => {
    setSalesTargets(salesTargets.filter(t => t !== target))
  }

  const addDecisionMaker = () => {
    if (customDecisionMaker.trim() && !decisionMakers.includes(customDecisionMaker.trim())) {
      setDecisionMakers([...decisionMakers, customDecisionMaker.trim()])
      setCustomDecisionMaker('')
    }
  }

  const removeDecisionMaker = (maker: string) => {
    setDecisionMakers(decisionMakers.filter(m => m !== maker))
  }

  const handleCreateCampaign = async () => {
    if (!selectedLocation || !selectedService || salesTargets.length === 0) {
      alert('Please complete all required fields')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Create campaign
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${businessData?.businessName || 'Campaign'} - ${selectedLocation.display}`,
          location: selectedLocation,
          salesTargets,
          decisionMakers,
          service: selectedService,
          businessData
        }),
      })

      if (response.ok) {
        router.push('/campaigns')
      } else {
        alert('Failed to create campaign')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('An error occurred while creating the campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
      <div className="bg-purple-300 rounded-3xl mx-4 min-h-[calc(100vh-160px)] p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-medium text-gray-800 mb-2">
              Create New Campaign
            </h1>
            <p className="text-lg text-gray-600">
              Set up your lead generation campaign with location targeting and sales focus
            </p>
          </div>

          {/* Business Recap */}
          {businessData && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Campaign for: {businessData.businessName}</h2>
              <p className="text-gray-700">
                {businessData.industry} • {businessData.valueProposition}
              </p>
            </div>
          )}

          <div className="space-y-8">
            
            {/* Step 1: Location Targeting */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Location Targeting</h2>
              <p className="text-gray-600 mb-4">Choose the location where you want to find leads (USA only)</p>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Start typing city name (e.g., Mi... for Miami, FL)"
                  className="w-full text-lg text-gray-600 placeholder-gray-500 bg-transparent border-0 border-b-2 border-gray-700 focus:border-gray-900 focus:outline-none py-3"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value)
                    searchLocations(e.target.value)
                  }}
                />
                
                {locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setSelectedLocation(suggestion)
                          setLocation(suggestion.display)
                          setLocationSuggestions([])
                        }}
                      >
                        {suggestion.display}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedLocation && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">✓ Selected: {selectedLocation.display}</p>
                </div>
              )}
            </div>

            {/* Step 2: Sales Targets */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. AI-Suggested Keywords</h2>
              <p className="text-gray-600 mb-4">
                AI-suggested search keywords for {businessData?.businessName} based on your business analysis (customize by adding or removing)
              </p>
              
              <div className="space-y-3 mb-6">
                {salesTargets.map((target, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-800">{target}</span>
                    <button
                      onClick={() => removeSalesTarget(target)}
                      className="text-red-600 hover:text-red-800 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Add custom search keyword"
                  className="flex-1 text-lg text-gray-600 placeholder-gray-500 bg-transparent border-0 border-b-2 border-gray-700 focus:border-gray-900 focus:outline-none py-3"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSalesTarget()}
                />
                <button
                  onClick={addSalesTarget}
                  className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Step 3: Decision Makers */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Key Decision-Making Roles</h2>
              <p className="text-gray-600 mb-4">Target these decision makers at your prospect businesses</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {decisionMakers.map((maker, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-800">{maker}</span>
                    <button
                      onClick={() => removeDecisionMaker(maker)}
                      className="text-red-600 hover:text-red-800 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Add custom decision maker role"
                  className="flex-1 text-lg text-gray-600 placeholder-gray-500 bg-transparent border-0 border-b-2 border-gray-700 focus:border-gray-900 focus:outline-none py-3"
                  value={customDecisionMaker}
                  onChange={(e) => setCustomDecisionMaker(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDecisionMaker()}
                />
                <button
                  onClick={addDecisionMaker}
                  className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Step 4: Number of Leads */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. How Many Leads?</h2>
              <p className="text-gray-600 mb-6">Choose how many leads you want to generate (minimum 5, maximum 1000)</p>
              
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900 mb-2">{numberOfLeads}</p>
                  <p className="text-gray-600">leads to generate</p>
                </div>
                
                <div className="relative">
                  <input
                    type="range"
                    min="5"
                    max="1000"
                    step="5"
                    value={numberOfLeads}
                    onChange={(e) => setNumberOfLeads(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>5</span>
                    <span>1000</span>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  <p>Cost estimate: <span className="font-semibold">${(numberOfLeads * 4).toLocaleString()}</span> for lead scraping</p>
                </div>
              </div>
            </div>

            {/* Step 5: Service Selection */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Choose Service</h2>
              
              <div className="space-y-4">
                <div 
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedService === 'scraping' 
                      ? 'border-gray-900 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedService('scraping')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Lead Scraping Only</h3>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">${(numberOfLeads * 4).toLocaleString()}</span>
                      <p className="text-sm text-gray-500">({numberOfLeads} leads × $4)</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Get a downloadable list of leads with contact information. Perfect for your internal sales team to follow up.
                  </p>
                </div>
                
                <div 
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedService === 'scraping_calling' 
                      ? 'border-gray-900 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedService('scraping_calling')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Lead Scraping + AI Calling</h3>
                    <span className="text-2xl font-bold text-gray-900">$7/call + $3/appointment</span>
                  </div>
                  <p className="text-gray-600">
                    AI will scrape leads AND make personalized sales calls using custom scripts. Appointments automatically scheduled when prospects show interest.
                  </p>
                </div>
              </div>
            </div>

            {/* Create Campaign Button */}
            <div className="text-center">
              <button
                onClick={handleCreateCampaign}
                disabled={loading || !selectedLocation || !selectedService}
                className="bg-gray-900 text-white px-12 py-4 rounded-full font-medium text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Creating Campaign...' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}