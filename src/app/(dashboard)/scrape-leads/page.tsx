'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SalesTarget {
  id: string
  name: string
}

interface LocationSuggestion {
  city: string
  state: string
  displayName: string
}

export default function ScrapeLeadsPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form data
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([])
  const [location, setLocation] = useState('')
  const [quantity, setQuantity] = useState(50)
  const [scrapedLeads, setScrapedLeads] = useState<any[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [businessContext, setBusinessContext] = useState<any>(null)

  // Location suggestions
  const locationSuggestions: LocationSuggestion[] = [
    { city: 'New York', state: 'NY', displayName: 'New York, NY' },
    { city: 'Los Angeles', state: 'CA', displayName: 'Los Angeles, CA' },
    { city: 'Chicago', state: 'IL', displayName: 'Chicago, IL' },
    { city: 'Houston', state: 'TX', displayName: 'Houston, TX' },
    { city: 'Phoenix', state: 'AZ', displayName: 'Phoenix, AZ' },
    { city: 'Philadelphia', state: 'PA', displayName: 'Philadelphia, PA' },
    { city: 'San Antonio', state: 'TX', displayName: 'San Antonio, TX' },
    { city: 'San Diego', state: 'CA', displayName: 'San Diego, CA' },
    { city: 'Dallas', state: 'TX', displayName: 'Dallas, TX' },
    { city: 'Austin', state: 'TX', displayName: 'Austin, TX' },
    { city: 'Jacksonville', state: 'FL', displayName: 'Jacksonville, FL' },
    { city: 'Fort Worth', state: 'TX', displayName: 'Fort Worth, TX' },
    { city: 'Columbus', state: 'OH', displayName: 'Columbus, OH' },
    { city: 'Charlotte', state: 'NC', displayName: 'Charlotte, NC' },
    { city: 'San Francisco', state: 'CA', displayName: 'San Francisco, CA' },
    { city: 'Indianapolis', state: 'IN', displayName: 'Indianapolis, IN' },
    { city: 'Seattle', state: 'WA', displayName: 'Seattle, WA' },
    { city: 'Denver', state: 'CO', displayName: 'Denver, CO' },
    { city: 'Boston', state: 'MA', displayName: 'Boston, MA' },
    { city: 'Nashville', state: 'TN', displayName: 'Nashville, TN' }
  ]

  // Load business context and AI suggestions on page load
  useEffect(() => {
    loadBusinessContextAndSuggestions()
  }, [])

  const addSalesTarget = () => {
    if (salesTargets.length >= 3) {
      alert('Maximum 3 sales targets allowed')
      return
    }
    const newTarget: SalesTarget = {
      id: Date.now().toString(),
      name: ''
    }
    setSalesTargets([...salesTargets, newTarget])
  }

  // Load business context and generate AI suggestions on page load
  const loadBusinessContextAndSuggestions = async () => {
    try {
      // Get business knowledge base from Supabase
      const response = await fetch('/api/knowledge-base')
      if (response.ok) {
        const data = await response.json()
        if (data.business && data.knowledgeBase) {
          setBusinessContext(data.knowledgeBase)
          // Auto-generate AI suggestions based on business context
          await generateAISuggestions(data.knowledgeBase)
        }
      }
    } catch (error) {
      console.error('Error loading business context:', error)
    }
  }

  const generateAISuggestions = async (knowledgeBase = businessContext) => {
    setIsGeneratingAI(true)
    try {
      const response = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'sales_targets',
          location: location,
          businessContext: knowledgeBase, // Pass the business knowledge base
          context: 'business lead scraping based on business analysis'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestions(data.suggestions || [])
        
        // AI-FIRST: Pre-fill the first 3 suggestions automatically
        if (data.suggestions && data.suggestions.length > 0 && salesTargets.length === 0) {
          const prefilledTargets = data.suggestions.slice(0, 3).map((suggestion: string, index: number) => ({
            id: `prefilled-${index}`,
            name: suggestion
          }))
          setSalesTargets(prefilledTargets)
        }
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
      // Fallback suggestions based on business context if available
      const fallbackSuggestions = knowledgeBase?.targetCustomers?.map((customer: any) => 
        customer.type || customer.description
      ).filter(Boolean).slice(0, 6) || [
        'Restaurants',
        'Law Firms', 
        'Medical Clinics',
        'Real Estate Agencies',
        'Dental Practices',
        'Auto Repair Shops'
      ]
      setAiSuggestions(fallbackSuggestions)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const useSuggestion = (suggestion: string) => {
    if (salesTargets.length >= 3) {
      alert('Maximum 3 sales targets allowed')
      return
    }
    const newTarget: SalesTarget = {
      id: Date.now().toString(),
      name: suggestion
    }
    setSalesTargets([...salesTargets, newTarget])
  }

  const updateSalesTarget = (id: string, name: string) => {
    setSalesTargets(salesTargets.map(target => 
      target.id === id ? { ...target, name } : target
    ))
  }

  const removeSalesTarget = (id: string) => {
    setSalesTargets(salesTargets.filter(target => target.id !== id))
  }

  const nextStep = () => {
    if (step === 1 && !location) {
      alert('Please select a location')
      return
    }
    if (step === 2 && salesTargets.length === 0) {
      alert('Please add at least one sales target')
      return
    }
    if (step === 3) {
      startScraping()
      return
    }
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const startScraping = async () => {
    setIsLoading(true)
    setScrapedLeads([])
    
    try {
      const validTargets = salesTargets.filter(t => t.name.trim()).map(t => t.name.trim())
      
      if (validTargets.length === 0) {
        alert('Please add at least one sales target')
        return
      }

      // Process each target in stages
      let allLeads: any[] = []
      const leadsPerTarget = Math.ceil(quantity / validTargets.length)
      
      for (let i = 0; i < validTargets.length; i++) {
        const target = validTargets[i]
        console.log(`Processing target ${i + 1}/${validTargets.length}: ${target}`)
        
        const response = await fetch('/api/scrape-business-leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            salesTargets: [target], // Single target per request
            location,
            quantity: leadsPerTarget,
            stage: i + 1,
            totalStages: validTargets.length
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to scrape leads')
        }

        const data = await response.json()
        if (data.leads && data.leads.length > 0) {
          allLeads = [...allLeads, ...data.leads]
          setScrapedLeads(allLeads) // Update progress
        }
      }

      setStep(4) // Results step
    } catch (error) {
      console.error('Error scraping leads:', error)
      alert(`Failed to scrape leads: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Location</h2>
              <p className="text-gray-600">Choose the city where you want to scrape business leads</p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Type a location (e.g., Miami, FL)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none text-lg"
              />
            </div>

            {!location && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-3">Or choose from popular cities:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {locationSuggestions.slice(0, 12).map((loc) => (
                    <button
                      key={loc.displayName}
                      onClick={() => setLocation(loc.displayName)}
                      className="p-3 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                    >
                      <div className="text-sm font-medium text-gray-900">{loc.displayName}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sales Targets</h2>
              <p className="text-gray-600">What types of businesses do you want to target? (Max 3)</p>
            </div>

            {/* Business Context Display */}
            {businessContext && (
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600">🧠</span>
                  <h3 className="font-semibold text-green-800">Complete Knowledge Base Active</h3>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  <strong>{businessContext.businessName}</strong> 
                  {businessContext.industry && ` (${businessContext.industry})`}
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs text-green-600">
                  <div>
                    <span className="font-medium">📊 Website Analysis:</span> 
                    {businessContext.valueProposition ? ' ✓' : ' ⏳'}
                  </div>
                  <div>
                    <span className="font-medium">💬 Discovery Questions:</span> 
                    {businessContext.discoveryAnswers?.target_audience ? ' ✓' : ' ⏳'}
                  </div>
                </div>
                {businessContext.discoveryAnswers?.target_audience && (
                  <p className="text-xs text-green-600 mt-2">
                    <strong>Target:</strong> {businessContext.discoveryAnswers.target_audience}
                  </p>
                )}
              </div>
            )}

            {/* AI-Generated Suggestions */}
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">🤖 Gemini 2.5 Suggestions</h3>
                <button
                  onClick={() => generateAISuggestions()}
                  disabled={isGeneratingAI}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isGeneratingAI
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isGeneratingAI ? 'Regenerating...' : 'Regenerate AI'}
                </button>
              </div>
              
              <p className="text-sm text-purple-700 mb-4">
                Based on your business analysis, these are ideal prospects who need your services:
              </p>
              
              {aiSuggestions.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {aiSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => useSuggestion(suggestion)}
                      disabled={salesTargets.length >= 3}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        salesTargets.length >= 3
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-purple-200 text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {salesTargets.map((target, index) => (
                <div key={target.id} className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      Target {index + 1}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="e.g., Restaurants, Law Firms, Medical Clinics"
                      value={target.name}
                      onChange={(e) => updateSalesTarget(target.id, e.target.value)}
                      className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none"
                    />
                    <button
                      onClick={() => removeSalesTarget(target.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {salesTargets.length < 3 && (
              <button
                onClick={addSalesTarget}
                className="w-full p-4 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-medium hover:border-purple-600 hover:bg-purple-50 transition-all"
              >
                + Add Sales Target ({salesTargets.length}/3)
              </button>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead Quantity</h2>
              <p className="text-gray-600">How many business leads do you want to scrape?</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">Number of leads:</span>
                <span className="text-2xl font-bold text-purple-600">{quantity}</span>
              </div>
              
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>10</span>
                <span>1000</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Scraping Summary</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div><strong>Location:</strong> {location}</div>
                <div><strong>Targets:</strong> {salesTargets.map(t => t.name).join(', ')}</div>
                <div><strong>Quantity:</strong> {quantity} leads</div>
                <div><strong>Data Fields:</strong> Business Name, Niche, Website, City, State, Phone Number</div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Scraping Results</h2>
              <p className="text-gray-600">Successfully scraped {scrapedLeads.length} business leads</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 max-h-96 overflow-y-auto">
              {scrapedLeads.length > 0 ? (
                <div className="space-y-4">
                  {scrapedLeads.map((lead, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><strong>Business:</strong> {lead.businessName || 'N/A'}</div>
                        <div><strong>Category:</strong> {lead.category || 'N/A'}</div>
                        <div><strong>Website:</strong> {lead.website || 'N/A'}</div>
                        <div><strong>Phone:</strong> {lead.phone || 'N/A'}</div>
                        <div><strong>Address:</strong> {lead.address || 'N/A'}</div>
                        <div><strong>Rating:</strong> {lead.rating ? `${lead.rating} (${lead.reviewsCount} reviews)` : 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No leads found. Try adjusting your search criteria.
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep(1)
                  setScrapedLeads([])
                  setSalesTargets([])
                  setLocation('')
                  setQuantity(50)
                }}
                className="flex-1 bg-gray-600 text-white py-4 px-6 rounded-full font-medium hover:bg-gray-700 transition-all"
              >
                Start New Scrape
              </button>
              
              <button
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," + 
                    "Business Name,Category,Website,Phone,Address,Rating,Reviews\n" +
                    scrapedLeads.map(lead => 
                      `"${lead.businessName || ''}","${lead.category || ''}","${lead.website || ''}","${lead.phone || ''}","${lead.address || ''}","${lead.rating || ''}","${lead.reviewsCount || ''}"`
                    ).join("\n")
                  
                  const encodedUri = encodeURI(csvContent)
                  const link = document.createElement("a")
                  link.setAttribute("href", encodedUri)
                  link.setAttribute("download", "business_leads.csv")
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="flex-1 bg-green-600 text-white py-4 px-6 rounded-full font-medium hover:bg-green-700 transition-all"
              >
                Export CSV
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
      <div className="bg-purple-300 rounded-3xl mx-4 min-h-[calc(100vh-160px)] p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-medium text-gray-800 mb-2">
              Scrape Business Leads
            </h1>
            <p className="text-gray-600">
              Test our lead scraping engine with Google Maps data
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber === step
                      ? 'bg-purple-600 text-white'
                      : stepNumber < step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {stepNumber < step ? '✓' : stepNumber}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
            {renderStep()}

            {/* Navigation Buttons */}
            {step < 4 && (
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <button
                    onClick={prevStep}
                    className="flex-1 bg-gray-600 text-white py-4 px-6 rounded-full font-medium hover:bg-gray-700 transition-all"
                  >
                    Back
                  </button>
                )}
                
                <button
                  onClick={nextStep}
                  disabled={isLoading}
                  className={`flex-1 py-4 px-6 rounded-full font-medium transition-all ${
                    isLoading
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isLoading 
                    ? `Scraping... (${scrapedLeads.length} leads found)` 
                    : step === 3 ? 'Start Scraping' : 'Continue'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}