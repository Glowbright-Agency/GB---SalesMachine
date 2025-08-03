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
  discoveryAnswers?: any
  targetCustomers?: Array<{
    type?: string
    description?: string
  }>
}

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
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [credits, setCredits] = useState(0)
  
  // Form data
  const [location, setLocation] = useState('')
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([])
  const [quantity, setQuantity] = useState(50)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [scrapedLeads, setScrapedLeads] = useState<any[]>([])

  // Location suggestions for autocomplete
  const locationSuggestions: LocationSuggestion[] = [
    { city: 'New York', state: 'NY', displayName: 'New York, NY' },
    { city: 'Los Angeles', state: 'CA', displayName: 'Los Angeles, CA' },
    { city: 'Chicago', state: 'IL', displayName: 'Chicago, IL' },
    { city: 'Houston', state: 'TX', displayName: 'Houston, TX' },
    { city: 'Phoenix', state: 'AZ', displayName: 'Phoenix, AZ' },
    { city: 'Miami', state: 'FL', displayName: 'Miami, FL' },
    { city: 'Philadelphia', state: 'PA', displayName: 'Philadelphia, PA' },
    { city: 'San Antonio', state: 'TX', displayName: 'San Antonio, TX' },
    { city: 'San Diego', state: 'CA', displayName: 'San Diego, CA' },
    { city: 'Dallas', state: 'TX', displayName: 'Dallas, TX' },
    { city: 'Austin', state: 'TX', displayName: 'Austin, TX' },
    { city: 'Seattle', state: 'WA', displayName: 'Seattle, WA' }
  ]

  useEffect(() => {
    loadBusinessData()
    loadUserCredits()
  }, [])

  const loadBusinessData = async () => {
    try {
      // First try to get from Supabase
      const response = await fetch('/api/knowledge-base')
      if (response.ok) {
        const data = await response.json()
        if (data.business && data.knowledgeBase) {
          const businessData: BusinessData = {
            businessName: data.business.business_name || 'Your Business',
            industry: data.business.industry || 'General',
            description: data.business.description || '',
            valueProposition: data.business.value_proposition || '',
            targetMarkets: data.business.target_markets || [],
            competitiveAdvantage: data.knowledgeBase.competitiveAdvantage || '',
            discoveryAnswers: data.business.discovery_answers || {},
            targetCustomers: data.knowledgeBase.targetCustomers || []
          }
          setBusinessData(businessData)
          await generateAISuggestions(businessData)
          return
        }
      }
      
      // Fallback to localStorage
      const analysisData = localStorage.getItem('businessAnalysis')
      if (analysisData) {
        const analysis = JSON.parse(analysisData)
        setBusinessData(analysis)
        await generateAISuggestions(analysis)
      }
    } catch (error) {
      console.error('Error loading business data:', error)
    }
  }

  const loadUserCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single()
        
        setCredits(userData?.credits || 1000)
      }
    } catch (error) {
      console.error('Error loading credits:', error)
      setCredits(1000) // Default fallback
    }
  }

  const generateAISuggestions = async (businessData: BusinessData | null) => {
    if (!businessData) return
    
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
          businessContext: businessData,
          context: 'business lead scraping based on business analysis'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestions(data.suggestions || [])
        
        // Auto-fill first 3 suggestions if no targets exist
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
      // Smart fallback based on business data
      if (businessData.targetCustomers && businessData.targetCustomers.length > 0) {
        const fallbackSuggestions = businessData.targetCustomers
          .map(customer => customer.type || customer.description)
          .filter((item): item is string => Boolean(item))
          .slice(0, 6)
        setAiSuggestions(fallbackSuggestions)
      }
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const addSalesTarget = () => {
    if (salesTargets.length >= 3) return
    setSalesTargets([...salesTargets, { id: Date.now().toString(), name: '' }])
  }

  const updateSalesTarget = (id: string, name: string) => {
    setSalesTargets(salesTargets.map(target => 
      target.id === id ? { ...target, name } : target
    ))
  }

  const removeSalesTarget = (id: string) => {
    setSalesTargets(salesTargets.filter(target => target.id !== id))
  }

  const useSuggestion = (suggestion: string) => {
    if (salesTargets.length >= 3) return
    setSalesTargets([...salesTargets, { id: Date.now().toString(), name: suggestion }])
  }

  const nextStep = () => {
    if (step === 1 && !location) {
      alert('Please enter a location')
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
    setLoading(true)
    setScrapedLeads([])
    
    try {
      const validTargets = salesTargets.filter(t => t.name.trim()).map(t => t.name.trim())
      
      if (validTargets.length === 0) {
        alert('Please add at least one sales target')
        return
      }

      const response = await fetch('/api/scrape-business-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salesTargets: validTargets,
          location,
          quantity,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to scrape leads')
      }

      const data = await response.json()
      if (data.leads && data.leads.length > 0) {
        setScrapedLeads(data.leads)
        setStep(4) // Results step
      } else {
        alert('No leads found. Try adjusting your search criteria.')
      }
    } catch (error) {
      console.error('Error scraping leads:', error)
      alert(`Failed to scrape leads: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Select Your Target Location
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Choose the city where you want to find business leads
            </p>

            <div className="space-y-8">
              <div>
                <input
                  type="text"
                  placeholder="Enter city (e.g., Miami, FL)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                />
              </div>

              {!location && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {locationSuggestions.slice(0, 12).map((loc) => (
                    <button
                      key={loc.displayName}
                      onClick={() => setLocation(loc.displayName)}
                      className="p-3 text-center border border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all"
                    >
                      {loc.displayName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Define Your Sales Targets
              </h1>
              <p className="text-xl text-gray-600">
                What types of businesses do you want to target in {location}?
              </p>
            </div>

            {/* Business Context Display */}
            {businessData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">✓</span>
                  </div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Business Knowledge Base Active
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
                  <div>
                    <strong>Business:</strong> {businessData.businessName}
                  </div>
                  <div>
                    <strong>Industry:</strong> {businessData.industry}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Value Proposition:</strong> {businessData.valueProposition}
                  </div>
                  {businessData.discoveryAnswers?.target_audience && (
                    <div className="md:col-span-2">
                      <strong>Target Audience:</strong> {businessData.discoveryAnswers.target_audience}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🤖 AI Suggestions</h3>
                <button
                  onClick={() => generateAISuggestions(businessData)}
                  disabled={isGeneratingAI}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm"
                >
                  {isGeneratingAI ? 'Generating...' : 'Refresh'}
                </button>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">
                Based on your business analysis, these are ideal prospects:
              </p>
              
              {aiSuggestions.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {aiSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => useSuggestion(suggestion)}
                      disabled={salesTargets.length >= 3}
                      className={`p-2 text-sm border rounded-lg transition-all ${
                        salesTargets.length >= 3
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:bg-white'
                      }`}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sales Targets Input */}
            <div className="space-y-4 mb-8">
              {salesTargets.map((target, index) => (
                <div key={target.id} className="flex gap-4 items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Restaurants, Law Firms, Medical Clinics"
                    value={target.name}
                    onChange={(e) => updateSalesTarget(target.id, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                  />
                  <button
                    onClick={() => removeSalesTarget(target.id)}
                    className="px-4 py-3 text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {salesTargets.length < 3 && (
              <button
                onClick={addSalesTarget}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-medium hover:border-gray-900 hover:text-gray-900 transition-all"
              >
                + Add Sales Target ({salesTargets.length}/3)
              </button>
            )}
          </div>
        )

      case 3:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Configure Your Scraping
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              How many leads do you want to scrape?
            </p>

            <div className="bg-gray-50 rounded-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold text-gray-900">Number of leads:</span>
                <span className="text-3xl font-bold text-gray-900">{quantity}</span>
              </div>
              
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>10</span>
                <span>500</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Scraping Summary</h3>
              <div className="space-y-2 text-sm text-blue-800 text-left">
                <div><strong>Location:</strong> {location}</div>
                <div><strong>Targets:</strong> {salesTargets.map(t => t.name).join(', ')}</div>
                <div><strong>Quantity:</strong> {quantity} leads</div>
                <div><strong>Cost:</strong> ${(quantity * 0.20).toFixed(2)} ({quantity} × $0.20)</div>
                <div><strong>Data Fields:</strong> Business Name, Category, Website, Phone, Address, Reviews</div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Scraping Results
              </h1>
              <p className="text-xl text-gray-600">
                Successfully scraped {scrapedLeads.length} business leads
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
              <div className="max-h-96 overflow-y-auto">
                {scrapedLeads.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {scrapedLeads.map((lead, index) => (
                      <div key={index} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div><strong>Business:</strong> {lead.businessName || 'N/A'}</div>
                          <div><strong>Category:</strong> {lead.category || 'N/A'}</div>
                          <div><strong>Website:</strong> {lead.website || 'N/A'}</div>
                          <div><strong>Phone:</strong> {lead.phone || 'N/A'}</div>
                          <div className="md:col-span-2"><strong>Address:</strong> {lead.address || 'N/A'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    No leads found. Try adjusting your search criteria.
                  </div>
                )}
              </div>
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
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Start New Scrape
              </button>
              
              {scrapedLeads.length > 0 && (
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
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                >
                  Export CSV
                </button>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Sales Machine" className="h-8 w-auto" />
          </div>
          
          {/* Step Navigation */}
          <nav className="flex items-center gap-8">
            {[
              { step: 1, label: 'Location' },
              { step: 2, label: 'Targets' },
              { step: 3, label: 'Configure' },
              { step: 4, label: 'Results' }
            ].map((navStep) => (
              <div key={navStep.step} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === navStep.step
                    ? 'bg-gray-900 text-white'
                    : step > navStep.step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > navStep.step ? '✓' : navStep.step}
                </span>
                <span className={`text-sm font-medium ${
                  step === navStep.step
                    ? 'text-gray-900'
                    : step > navStep.step
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}>
                  {navStep.label}
                </span>
              </div>
            ))}
          </nav>

          {/* Credits Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Credits:</span>
              <span className="font-semibold text-gray-900">{credits.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-6">
        {renderStepContent()}

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="max-w-2xl mx-auto flex gap-4 mt-12">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Back
              </button>
            )}
            
            <button
              onClick={nextStep}
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                loading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {loading 
                ? `Scraping... (${scrapedLeads.length} leads found)` 
                : step === 3 ? 'Start Scraping' : 'Continue'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}