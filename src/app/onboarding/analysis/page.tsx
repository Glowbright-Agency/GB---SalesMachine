'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AnalysisResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const businessId = searchParams.get('businessId')
  
  const [businessAnalysis, setBusinessAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) {
      router.push('/onboarding')
      return
    }

    // Load business analysis data from localStorage
    const analysisData = localStorage.getItem('businessAnalysis')
    if (analysisData) {
      try {
        setBusinessAnalysis(JSON.parse(analysisData))
      } catch (e) {
        console.error('Failed to parse business analysis:', e)
      }
    }
    setLoading(false)
  }, [businessId, router])

  const handleContinue = () => {
    router.push(`/onboarding/discovery?businessId=${businessId}`)
  }

  const handleEditAnalysis = () => {
    router.push('/onboarding')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your website...</p>
        </div>
      </div>
    )
  }

  if (!businessAnalysis) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No analysis data found</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="bg-gray-900 text-white px-6 py-2 rounded-full"
          >
            Start Over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo and Navigation */}
      <header className="bg-white px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Sales Machine" className="h-8 w-auto" />
          </div>
          
          {/* Navigation Steps */}
          <nav className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">✓</span>
              <span className="text-sm font-medium text-green-600">Website Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-gray-300 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
              <span className="text-sm font-medium text-gray-400">Sales Targets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-gray-300 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
              <span className="text-sm font-medium text-gray-400">Sign Up</span>
            </div>
          </nav>

          {/* Don't Have Website Link */}
          <button
            onClick={() => router.push('/manual-setup')}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Don't Have A Website?
          </button>
        </div>
      </header>

      {/* Main Analysis Results */}
      <main className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="bg-purple-300 rounded-3xl mx-4 min-h-[calc(100vh-140px)] flex items-center justify-center">
          <div className="max-w-4xl w-full text-center px-8">
            <h1 className="text-3xl md:text-4xl font-medium text-gray-800 mb-8 leading-tight">
              Website Analysis Complete
            </h1>
            
            {/* Analysis Results Card */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 mb-8 text-left">
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  <strong>{businessAnalysis.businessName || 'This company'}</strong> is a {businessAnalysis.industry?.toLowerCase() || 'business'} that provides {businessAnalysis.description || 'products and services'} to {
                    businessAnalysis.targetMarkets && businessAnalysis.targetMarkets.length > 0 
                      ? (typeof businessAnalysis.targetMarkets[0] === 'object' 
                          ? businessAnalysis.targetMarkets[0].industry || 'their target audience'
                          : businessAnalysis.targetMarkets[0])
                      : 'their target audience'
                  }.
                </p>
                
                <p>
                  They offer {businessAnalysis.description || 'innovative solutions and services tailored to their clients\' needs'}.
                </p>
                
                <p>
                  Their core value proposition is <strong>{businessAnalysis.valueProposition || 'delivering exceptional value through innovative solutions'}</strong>.
                </p>
                
                <p>
                  <strong>Sales Approach:</strong> Focus on {businessAnalysis.competitiveAdvantage ? `leveraging their ${businessAnalysis.competitiveAdvantage.toLowerCase()}` : 'consultative selling'}, emphasizing {businessAnalysis.valueProposition?.includes('cost') ? 'cost savings' : businessAnalysis.valueProposition?.includes('fast') ? 'speed' : businessAnalysis.valueProposition?.includes('innovat') ? 'innovation' : 'value creation'}.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handleEditAnalysis}
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition-all"
              >
                Re-analyze Website
              </button>
              
              <button
                onClick={handleContinue}
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all"
              >
                Continue to Sales Targets →
              </button>
            </div>

            <p className="text-gray-600 text-sm mt-4">
              Review the analysis above. If it looks accurate, continue to define your sales targets.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}