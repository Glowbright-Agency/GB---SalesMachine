'use client'

import { useState } from 'react'
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

  const addSalesTarget = () => {
    const newTarget: SalesTarget = {
      id: Date.now().toString(),
      name: ''
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
    try {
      const response = await fetch('/api/scrape-business-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salesTargets: salesTargets.map(t => t.name),
          location,
          quantity
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to scrape leads')
      }

      const data = await response.json()
      setScrapedLeads(data.leads || [])
      setStep(4) // Results step
    } catch (error) {
      console.error('Error scraping leads:', error)
      alert('Failed to scrape leads. Please try again.')
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

            <div className="space-y-3">
              {locationSuggestions.map((loc) => (
                <button
                  key={loc.displayName}
                  onClick={() => setLocation(loc.displayName)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    location === loc.displayName
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{loc.displayName}</div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <input
                type="text"
                placeholder="Or type a custom location (e.g., Miami, FL)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sales Targets</h2>
              <p className="text-gray-600">What types of businesses do you want to target?</p>
            </div>

            <div className="space-y-3">
              {salesTargets.map((target) => (
                <div key={target.id} className="flex gap-3">
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
              ))}
            </div>

            <button
              onClick={addSalesTarget}
              className="w-full p-4 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-medium hover:border-purple-600 hover:bg-purple-50 transition-all"
            >
              + Add Sales Target
            </button>
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
                  {isLoading ? 'Scraping...' : step === 3 ? 'Start Scraping' : 'Continue'}
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