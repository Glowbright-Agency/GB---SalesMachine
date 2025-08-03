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
  targetCustomers?: Array<{
    type?: string
    description?: string
    painPoints?: string[]
    buyingMotivations?: string[]
  }>
  targetDecisionMakers?: Array<{
    title: string
    department?: string
    painPoints?: string[]
    priorities?: string[]
    communicationStyle?: string
  }>
}

interface LocationSuggestion {
  city: string
  state: string
  display: string
}

interface SalesTarget {
  id: string
  name: string
}

interface DecisionMaker {
  id: string
  title: string
}

export default function NewCampaignPage() {
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [location, setLocation] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null)
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([])
  const [decisionMakers, setDecisionMakers] = useState<DecisionMaker[]>([])
  const [numberOfLeads, setNumberOfLeads] = useState(50)
  const [selectedService, setSelectedService] = useState<'scraping' | 'scraping_calling' | null>(null)
  const [salesScripts, setSalesScripts] = useState<{[key: string]: {firstMessage: string, systemPrompt: string}}>({})
  const [expandedScripts, setExpandedScripts] = useState<{[key: string]: boolean}>({})
  const [editingScript, setEditingScript] = useState<{[key: string]: boolean}>({})
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const analysisData = localStorage.getItem('businessAnalysis')
    if (analysisData) {
      try {
        const analysis = JSON.parse(analysisData)
        setBusinessData(analysis)
        
        // Get business ID if available
        if (analysis.id) {
          setBusinessId(analysis.id)
        }
        
        generateAISalesTargets(analysis)
        generateAIDecisionMakers(analysis)
      } catch (e) {
        console.error('Failed to parse business data:', e)
      }
    }
  }, [])

  const generateAISalesTargets = (analysis: BusinessData) => {
    let aiSuggestedTargets: SalesTarget[] = []
    
    // Use knowledge base target customers if available
    if (analysis.targetCustomers && Array.isArray(analysis.targetCustomers) && analysis.targetCustomers.length > 0) {
      aiSuggestedTargets = analysis.targetCustomers.map((customer, index) => ({
        id: (index + 1).toString(),
        name: customer.type || customer.description || `Target Customer ${index + 1}`
      }))
    } else {
      // Fallback to industry-based suggestions
      const industry = analysis.industry?.toLowerCase() || ''
      const businessType = analysis.description?.toLowerCase() || ''
      
      if (industry.includes('health') || industry.includes('medical') || businessType.includes('health') || businessType.includes('medical')) {
        aiSuggestedTargets = [
          { id: '1', name: 'Weight Loss Clinics' },
          { id: '2', name: 'Hormone Therapy Clinics (HRT/TRT)' },
          { id: '3', name: 'MedSpas' },
          { id: '4', name: 'Longevity & Anti-Aging Clinics' },
          { id: '5', name: 'Dermatology Practices' }
        ]
      } else if (industry.includes('tech') || industry.includes('software') || businessType.includes('tech') || businessType.includes('software')) {
        aiSuggestedTargets = [
          { id: '1', name: 'SaaS Companies' },
          { id: '2', name: 'Software Development Agencies' },
          { id: '3', name: 'Tech Startups' },
          { id: '4', name: 'E-commerce Platforms' },
          { id: '5', name: 'Digital Marketing Agencies' }
        ]
      } else if (industry.includes('finance') || industry.includes('financial') || businessType.includes('finance') || businessType.includes('financial')) {
        aiSuggestedTargets = [
          { id: '1', name: 'Accounting Firms' },
          { id: '2', name: 'Financial Advisory Services' },
          { id: '3', name: 'Insurance Agencies' },
          { id: '4', name: 'Investment Management Companies' },
          { id: '5', name: 'Credit Unions' }
        ]
      } else {
        aiSuggestedTargets = [
          { id: '1', name: 'Small Businesses' },
          { id: '2', name: 'Mid-Market Companies' },
          { id: '3', name: 'Professional Services' },
          { id: '4', name: 'Retail Businesses' },
          { id: '5', name: 'Manufacturing Companies' }
        ]
      }
    }
    
    setSalesTargets(aiSuggestedTargets)
  }

  const generateAIDecisionMakers = (analysis: BusinessData) => {
    let aiSuggestedDecisionMakers: DecisionMaker[] = []
    
    // Use knowledge base target decision makers if available
    if (analysis.targetDecisionMakers && Array.isArray(analysis.targetDecisionMakers) && analysis.targetDecisionMakers.length > 0) {
      aiSuggestedDecisionMakers = analysis.targetDecisionMakers.map((dm, index) => ({
        id: (index + 1).toString(),
        title: dm.title
      }))
    } else {
      // Fallback to industry-based suggestions
      const industry = analysis.industry?.toLowerCase() || ''
      const businessType = analysis.description?.toLowerCase() || ''
      
      if (industry.includes('health') || industry.includes('medical') || businessType.includes('health') || businessType.includes('medical')) {
        aiSuggestedDecisionMakers = [
          { id: '1', title: 'Founder' },
          { id: '2', title: 'Chief Executive Officer (CEO)' },
          { id: '3', title: 'Managing Partner' },
          { id: '4', title: 'Chief Operating Officer (COO)' },
          { id: '5', title: 'Chief Medical Officer (CMO)' },
          { id: '6', title: 'Chief Financial Officer (CFO)' },
          { id: '7', title: 'Medical Director' },
          { id: '8', title: 'Clinical Director' },
          { id: '9', title: 'Practice Manager' },
          { id: '10', title: 'Clinic Administrator' },
          { id: '11', title: 'Clinic Coordinator' },
          { id: '12', title: 'Managing Director' }
        ]
      } else if (industry.includes('tech') || industry.includes('software') || businessType.includes('tech') || businessType.includes('software')) {
        aiSuggestedDecisionMakers = [
          { id: '1', title: 'Chief Technology Officer (CTO)' },
          { id: '2', title: 'Chief Executive Officer (CEO)' },
          { id: '3', title: 'Founder' },
          { id: '4', title: 'Head of Engineering' },
          { id: '5', title: 'VP of Product' },
          { id: '6', title: 'Chief Product Officer (CPO)' },
          { id: '7', title: 'Head of Operations' },
          { id: '8', title: 'Chief Operating Officer (COO)' }
        ]
      } else {
        aiSuggestedDecisionMakers = [
          { id: '1', title: 'Chief Executive Officer (CEO)' },
          { id: '2', title: 'Founder' },
          { id: '3', title: 'Chief Operating Officer (COO)' },
          { id: '4', title: 'Chief Financial Officer (CFO)' },
          { id: '5', title: 'Managing Director' },
          { id: '6', title: 'General Manager' },
          { id: '7', title: 'Operations Manager' },
          { id: '8', title: 'Business Development Manager' }
        ]
      }
    }
    
    setDecisionMakers(aiSuggestedDecisionMakers)
  }

  const addSalesTarget = () => {
    const newTarget: SalesTarget = {
      id: Date.now().toString(),
      name: 'New Target'
    }
    setSalesTargets([...salesTargets, newTarget])
  }

  const removeSalesTarget = (id: string) => {
    setSalesTargets(salesTargets.filter(target => target.id !== id))
  }

  const updateSalesTarget = (id: string, name: string) => {
    setSalesTargets(salesTargets.map(target => 
      target.id === id ? { ...target, name } : target
    ))
  }

  const addDecisionMaker = () => {
    const newDecisionMaker: DecisionMaker = {
      id: Date.now().toString(),
      title: 'New Role'
    }
    setDecisionMakers([...decisionMakers, newDecisionMaker])
  }

  const removeDecisionMaker = (id: string) => {
    setDecisionMakers(decisionMakers.filter(dm => dm.id !== id))
  }

  const updateDecisionMaker = (id: string, title: string) => {
    setDecisionMakers(decisionMakers.map(dm => 
      dm.id === id ? { ...dm, title } : dm
    ))
  }

  const resetSalesTargets = () => {
    setSalesTargets([])
  }

  const resetDecisionMakers = () => {
    setDecisionMakers([])
  }

  const regenerateAISalesTargets = () => {
    if (businessData) {
      generateAISalesTargets(businessData)
    }
  }

  const regenerateAIDecisionMakers = () => {
    if (businessData) {
      generateAIDecisionMakers(businessData)
    }
  }

  const searchLocations = (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([])
      return
    }

    const mockSuggestions = [
      { city: 'Miami', state: 'FL', display: 'Miami, FL' },
      { city: 'New York', state: 'NY', display: 'New York, NY' },
      { city: 'Los Angeles', state: 'CA', display: 'Los Angeles, CA' },
      { city: 'Chicago', state: 'IL', display: 'Chicago, IL' },
      { city: 'Houston', state: 'TX', display: 'Houston, TX' },
      { city: 'Boston', state: 'MA', display: 'Boston, MA' },
      { city: 'Seattle', state: 'WA', display: 'Seattle, WA' },
      { city: 'Denver', state: 'CO', display: 'Denver, CO' },
      { city: 'Atlanta', state: 'GA', display: 'Atlanta, GA' },
      { city: 'Dallas', state: 'TX', display: 'Dallas, TX' }
    ]

    const filtered = mockSuggestions.filter(loc => 
      loc.display.toLowerCase().includes(query.toLowerCase())
    )
    
    setLocationSuggestions(filtered)
  }

  const handleCreateCampaign = async () => {
    if (!selectedLocation || !selectedService) {
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

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${businessData?.businessName || 'Campaign'} - ${selectedLocation.display}`,
          location: selectedLocation,
          numberOfLeads,
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

  const nextStep = async () => {
    if (step === 1 && !selectedLocation) {
      alert('Please select a location')
      return
    }
    if (step === 2 && (salesTargets.length === 0 || decisionMakers.length === 0)) {
      alert('Please add at least one sales target and one decision maker')
      return
    }
    if (step === 3 && !selectedService) {
      alert('Please select a service')
      return
    }
    
    // Generate scripts when moving to step 4 if calling service is selected
    if (step === 3 && selectedService === 'scraping_calling') {
      setStep(step + 1) // Move to step 4 first
      await generateSalesScripts() // Then generate scripts
      return
    }
    
    if (step === 4 && selectedService === 'scraping_calling' && Object.keys(salesScripts).length === 0) {
      alert('Scripts are still being generated. Please wait...')
      return
    }
    
    const maxStep = selectedService === 'scraping_calling' ? 5 : 4
    if (step < maxStep) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const generateSalesScripts = async () => {
    if (selectedService !== 'scraping_calling' || !businessData) return
    
    setLoading(true)
    const scripts: {[key: string]: {firstMessage: string, systemPrompt: string}} = {}
    
    try {
      for (const decisionMaker of decisionMakers) {
        const response = await fetch('/api/generate-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessData,
            businessId,
            decisionMaker: decisionMaker.title,
            salesTargets: salesTargets.map(t => t.name),
            location: selectedLocation?.display
          })
        })
        
        if (response.ok) {
          const scriptData = await response.json()
          scripts[decisionMaker.id] = {
            firstMessage: scriptData.firstMessage,
            systemPrompt: scriptData.systemPrompt
          }
        }
      }
      
      setSalesScripts(scripts)
    } catch (error) {
      console.error('Error generating sales scripts:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleScriptExpansion = (scriptId: string) => {
    setExpandedScripts(prev => ({
      ...prev,
      [scriptId]: !prev[scriptId]
    }))
  }

  const toggleScriptEditing = (scriptId: string) => {
    setEditingScript(prev => ({
      ...prev,
      [scriptId]: !prev[scriptId]
    }))
  }

  const updateScript = (scriptId: string, field: 'firstMessage' | 'systemPrompt', value: string) => {
    setSalesScripts(prev => ({
      ...prev,
      [scriptId]: {
        ...prev[scriptId],
        [field]: value
      }
    }))
  }

  const saveDraft = async () => {
    if (!businessData || !selectedLocation) {
      alert('Please complete at least location and targets before saving draft')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${businessData?.businessName || 'Campaign'} - ${selectedLocation.display} (Draft)`,
          location: selectedLocation,
          numberOfLeads,
          service: selectedService,
          businessData,
          salesTargets: salesTargets.map(t => t.name),
          decisionMakers: decisionMakers.map(dm => dm.title),
          salesScripts,
          status: 'draft'
        }),
      })

      if (response.ok) {
        alert('Campaign saved as draft!')
        router.push('/campaigns')
      } else {
        alert('Failed to save draft')
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('An error occurred while saving the draft')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-2 sm:px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
      <div className="rounded-3xl mx-2 sm:mx-4 min-h-[calc(100vh-160px)] relative" style={{ backgroundColor: '#fcce3b' }}>
        {/* Step Progress Indicator */}
        <div className="absolute top-4 sm:top-8 left-1/2 transform -translate-x-1/2 w-full px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className={`rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-medium ${step >= 1 ? 'bg-black text-white' : 'bg-white/50 text-black opacity-70'}`}>1</span>
              <span className={`text-xs sm:text-sm font-medium ${step >= 1 ? 'text-black' : 'text-gray-400'} hidden sm:inline`}>Location</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className={`rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-medium ${step >= 2 ? 'bg-black text-white' : 'bg-white/50 text-black opacity-70'}`}>2</span>
              <span className={`text-xs sm:text-sm font-medium ${step >= 2 ? 'text-black' : 'text-gray-400'} hidden sm:inline`}>Targets</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className={`rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-medium ${step >= 3 ? 'bg-black text-white' : 'bg-white/50 text-black opacity-70'}`}>3</span>
              <span className={`text-xs sm:text-sm font-medium ${step >= 3 ? 'text-black' : 'text-gray-400'} hidden sm:inline`}>Service</span>
            </div>
            {selectedService === 'scraping_calling' && (
              <div className="flex items-center gap-1 sm:gap-2">
                <span className={`rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-medium ${step >= 4 ? 'bg-black text-white' : 'bg-white/50 text-black opacity-70'}`}>4</span>
                <span className={`text-xs sm:text-sm font-medium ${step >= 4 ? 'text-black' : 'text-gray-400'} hidden sm:inline`}>Scripts</span>
              </div>
            )}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className={`rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-medium ${step >= (selectedService === 'scraping_calling' ? 5 : 4) ? 'bg-black text-white' : 'bg-white/50 text-black opacity-70'}`}>{selectedService === 'scraping_calling' ? '5' : '4'}</span>
              <span className={`text-xs sm:text-sm font-medium ${step >= (selectedService === 'scraping_calling' ? 5 : 4) ? 'text-black' : 'text-gray-400'} hidden sm:inline`}>Launch</span>
            </div>
          </div>
        </div>

        {/* Main Content - Centered */}
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)] pt-16 sm:pt-20">
          <div className="max-w-4xl w-full text-center px-4 sm:px-8">
            
            {/* Step 1: Location */}
            {step === 1 && (
              <>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-black mb-4 sm:mb-6 leading-tight">
                  Where Do You Want To <span className="font-semibold">Find Leads</span>?
                </h1>
                <p className="text-base sm:text-lg text-black opacity-70 mb-8 sm:mb-12">
                  Choose your target location (USA only)
                </p>

                <div className="space-y-8">
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value)
                        searchLocations(e.target.value)
                      }}
                      placeholder="Miami, FL"
                      className="w-full text-xl text-black opacity-70 placeholder-gray-500 bg-transparent border-0 border-b-2 border-gray-700 focus:border-gray-900 focus:outline-none py-3 text-center"
                      required
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
                    <div className="flex items-center justify-center gap-8">
                      <button
                        onClick={nextStep}
                        className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-black/80 transition-all"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Sales Targets & Decision Makers */}
            {step === 2 && (
              <>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-black mb-4 sm:mb-6 leading-tight">
                  {businessData?.businessName || "Your Business"}'s <span className="font-semibold">Sales Targets</span>
                </h1>
                <p className="text-base sm:text-lg text-black opacity-70 mb-8 sm:mb-12">
                  Define your target industries and key decision-making roles
                </p>

                <div className="space-y-6 sm:space-y-8">
                  {/* Target Industries Section */}
                  <div className="border border-black p-4 sm:p-6 rounded-2xl text-left">
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-black">Target Industries</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={regenerateAISalesTargets}
                          className="bg-blue-600 text-white px-3 py-2 rounded-full text-xs font-medium hover:bg-blue-700 transition-all"
                          title="Regenerate with AI"
                        >
                          🤖 AI
                        </button>
                        <button
                          onClick={resetSalesTargets}
                          className="bg-red-600 text-white px-3 py-2 rounded-full text-xs font-medium hover:bg-red-700 transition-all"
                          title="Reset all"
                        >
                          Reset
                        </button>
                        <button
                          onClick={addSalesTarget}
                          className="bg-black text-white px-3 py-2 rounded-full text-xs font-medium hover:bg-black/80 transition-all"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {salesTargets.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="mb-4">No sales targets defined yet</p>
                          <button
                            onClick={regenerateAISalesTargets}
                            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all"
                          >
                            🤖 Generate with AI
                          </button>
                        </div>
                      ) : (
                        salesTargets.map((target) => (
                          <div key={target.id} className="flex items-center gap-2 sm:gap-3">
                            <input
                              type="text"
                              value={target.name}
                              onChange={(e) => updateSalesTarget(target.id, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm sm:text-base"
                            />
                            <button
                              onClick={() => removeSalesTarget(target.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-xs sm:text-sm px-1 sm:px-2 flex-shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Key Decision-Making Roles Section */}
                  <div className="border border-black p-4 sm:p-6 rounded-2xl text-left">
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-black">Key Decision-Making Roles</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={regenerateAIDecisionMakers}
                          className="bg-blue-600 text-white px-3 py-2 rounded-full text-xs font-medium hover:bg-blue-700 transition-all"
                          title="Regenerate with AI"
                        >
                          🤖 AI
                        </button>
                        <button
                          onClick={resetDecisionMakers}
                          className="bg-red-600 text-white px-3 py-2 rounded-full text-xs font-medium hover:bg-red-700 transition-all"
                          title="Reset all"
                        >
                          Reset
                        </button>
                        <button
                          onClick={addDecisionMaker}
                          className="bg-black text-white px-3 py-2 rounded-full text-xs font-medium hover:bg-black/80 transition-all"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {decisionMakers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="mb-4">No decision makers defined yet</p>
                          <button
                            onClick={regenerateAIDecisionMakers}
                            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all"
                          >
                            🤖 Generate with AI
                          </button>
                        </div>
                      ) : (
                        decisionMakers.map((dm) => (
                          <div key={dm.id} className="flex items-center gap-2 sm:gap-3">
                            <input
                              type="text"
                              value={dm.title}
                              onChange={(e) => updateDecisionMaker(dm.id, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm sm:text-base"
                            />
                            <button
                              onClick={() => removeDecisionMaker(dm.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-xs sm:text-sm px-1 sm:px-2 flex-shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {(salesTargets.length > 0 && decisionMakers.length > 0) && (
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={prevStep}
                        className="bg-white/50 text-black px-6 py-3 rounded-full font-medium hover:bg-white/70 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={saveDraft}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
                      >
                        Save Draft
                      </button>
                      <button
                        onClick={nextStep}
                        className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-black/80 transition-all"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Service Selection */}
            {step === 3 && (
              <>
                <h1 className="text-3xl md:text-4xl font-medium text-black mb-6 leading-tight">
                  Choose Your <span className="font-semibold">Service</span>
                </h1>
                <p className="text-lg text-black opacity-70 mb-12">
                  What would you like us to do with the leads?
                </p>

                <div className="space-y-6 mb-12">
                  <div 
                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all text-left ${
                      selectedService === 'scraping' 
                        ? 'border-gray-900 bg-white/80' 
                        : 'border-gray-300 border border-black hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedService('scraping')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-black">Just Find Leads</h3>
                      <span className="text-2xl font-bold text-black">${(numberOfLeads * 4).toLocaleString()}</span>
                    </div>
                    <p className="text-black opacity-70">Get {numberOfLeads} leads with contact information to download</p>
                  </div>
                  
                  <div 
                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all text-left ${
                      selectedService === 'scraping_calling' 
                        ? 'border-gray-900 bg-white/80' 
                        : 'border-gray-300 border border-black hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedService('scraping_calling')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-black">Find + Call Leads</h3>
                      <span className="text-2xl font-bold text-black">$7/call + $3/meeting</span>
                    </div>
                    <p className="text-black opacity-70">AI will find leads AND call them to book appointments for you</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="text-xl font-medium text-black mb-4">How many leads? ({numberOfLeads})</p>
                    <input
                      type="range"
                      min="5"
                      max="1000"
                      step="5"
                      value={numberOfLeads}
                      onChange={(e) => setNumberOfLeads(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/50 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>5</span>
                      <span>1000</span>
                    </div>
                  </div>

                  {selectedService && (
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={prevStep}
                        className="bg-white/50 text-black px-6 py-3 rounded-full font-medium hover:bg-white/70 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={saveDraft}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
                      >
                        Save Draft
                      </button>
                      <button
                        onClick={nextStep}
                        className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-black/80 transition-all"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 4: Scripts (only for calling service) */}
            {step === 4 && selectedService === 'scraping_calling' && (
              <>
                <h1 className="text-3xl md:text-4xl font-medium text-black mb-6 leading-tight">
                  Sales <span className="font-semibold">Scripts</span>
                </h1>
                <p className="text-lg text-black opacity-70 mb-12">
                  AI-generated scripts for each decision maker role
                </p>

                <div className="space-y-6 mb-12">
                  {loading && Object.keys(salesScripts).length === 0 ? (
                    <div className="border border-black p-8 rounded-2xl text-center">
                      <div className="animate-pulse">
                        <div className="h-4 bg-white/50 rounded w-3/4 mx-auto mb-4"></div>
                        <div className="h-4 bg-white/50 rounded w-1/2 mx-auto"></div>
                      </div>
                      <p className="text-black opacity-70 mt-4">Generating personalized sales scripts...</p>
                    </div>
                  ) : (
                    decisionMakers.map((dm) => {
                      const script = salesScripts[dm.id]
                      const isExpanded = expandedScripts[dm.id]
                      const isEditing = editingScript[dm.id]
                      
                      return (
                        <div key={dm.id} className="border border-black p-6 rounded-2xl text-left">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-black">{dm.title}</h3>
                            {script && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => toggleScriptExpansion(dm.id)}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  {isExpanded ? 'Collapse' : 'Expand'}
                                </button>
                                <button
                                  onClick={() => toggleScriptEditing(dm.id)}
                                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                                >
                                  {isEditing ? 'Save' : 'Edit'}
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {script ? (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-black mb-2">Opening Message:</h4>
                                {isEditing ? (
                                  <textarea
                                    value={script.firstMessage}
                                    onChange={(e) => updateScript(dm.id, 'firstMessage', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    rows={3}
                                  />
                                ) : (
                                  <p className="text-black bg-gray-50 p-3 rounded-lg italic">
                                    "{script.firstMessage}"
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-black mb-2">System Instructions:</h4>
                                {isEditing ? (
                                  <textarea
                                    value={script.systemPrompt}
                                    onChange={(e) => updateScript(dm.id, 'systemPrompt', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    rows={8}
                                  />
                                ) : (
                                  <div className="text-black bg-gray-50 p-3 rounded-lg text-sm">
                                    {isExpanded 
                                      ? script.systemPrompt
                                      : `${script.systemPrompt.substring(0, 200)}...`
                                    }
                                    {!isExpanded && script.systemPrompt.length > 200 && (
                                      <button
                                        onClick={() => toggleScriptExpansion(dm.id)}
                                        className="text-blue-600 hover:text-blue-800 ml-2 font-medium"
                                      >
                                        Read more
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="animate-pulse">
                              <div className="h-3 bg-white/50 rounded w-full mb-2"></div>
                              <div className="h-3 bg-white/50 rounded w-3/4"></div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                {Object.keys(salesScripts).length === decisionMakers.length && (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={prevStep}
                      className="bg-white/50 text-black px-6 py-3 rounded-full font-medium hover:bg-white/70 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={saveDraft}
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={nextStep}
                      className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-black/80 transition-all"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Step 4/5: Launch */}
            {((step === 4 && selectedService === 'scraping') || (step === 5 && selectedService === 'scraping_calling')) && (
              <>
                <h1 className="text-3xl md:text-4xl font-medium text-black mb-6 leading-tight">
                  Ready To <span className="font-semibold">Launch</span>?
                </h1>
                <p className="text-lg text-black opacity-70 mb-12">
                  Review your campaign settings
                </p>

                <div className="space-y-6 mb-12 text-left border border-black p-8 rounded-2xl">
                  <div className="flex justify-between">
                    <span className="text-black opacity-70">Location:</span>
                    <span className="font-medium">{selectedLocation?.display}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black opacity-70">Target Industries:</span>
                    <span className="font-medium">{salesTargets.length} defined</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black opacity-70">Decision Makers:</span>
                    <span className="font-medium">{decisionMakers.length} roles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black opacity-70">Leads:</span>
                    <span className="font-medium">{numberOfLeads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black opacity-70">Service:</span>
                    <span className="font-medium">
                      {selectedService === 'scraping' ? 'Lead Scraping' : 'Scraping + Calling'}
                    </span>
                  </div>
                  {selectedService === 'scraping_calling' && (
                    <div className="flex justify-between">
                      <span className="text-black opacity-70">Scripts Generated:</span>
                      <span className="font-medium">{Object.keys(salesScripts).length} scripts</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-4">
                    <span className="text-black opacity-70">Estimated Cost:</span>
                    <span className="font-bold text-xl">
                      {selectedService === 'scraping' 
                        ? `$${(numberOfLeads * 4).toLocaleString()}`
                        : '$7/call + $3/meeting'
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={prevStep}
                    className="bg-white/50 text-black px-6 py-3 rounded-full font-medium hover:bg-white/70 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={saveDraft}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={handleCreateCampaign}
                    disabled={loading}
                    className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Creating...' : 'Launch Campaign'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}