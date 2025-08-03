'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BusinessData {
  id: string
  user_id: string
  website_url: string
  business_name: string
  description: string
  value_proposition: string
  industry: string
  target_markets: any[]
  decision_maker_roles: any[]
  analysis_data: any
  discovery_answers: any
  created_at: string
  updated_at: string
}

const discoveryQuestions = [
  {
    id: 'measurable_outcome',
    question: 'What specific measurable outcome does your solution deliver?',
    hint: 'Include numbers, percentages, or timeframes'
  },
  {
    id: 'target_audience',
    question: 'Who exactly struggles with this problem most?',
    hint: 'Include title, company type, company size, and growth stage'
  },
  {
    id: 'key_differentiator',
    question: 'What\'s your key differentiator from current alternatives?',
    hint: 'Focus on unique approach, not just features'
  },
  {
    id: 'top_objections',
    question: 'What are your top 5 objections and proven responses?',
    hint: 'Include objections and your best responses',
    multiline: true
  },
  {
    id: 'urgency_factors',
    question: 'What creates urgency for prospects to act now?',
    hint: 'Cost of inaction, upcoming deadlines, competitive pressure'
  },
  {
    id: 'success_story',
    question: 'What\'s your most powerful customer success story?',
    hint: 'Be specific with measurable results',
    multiline: true
  },
  {
    id: 'qualification_criteria',
    question: 'What 3 things MUST be true for someone to buy?',
    hint: 'Your must-have qualification criteria',
    multiline: true
  }
]

export default function BusinessProfilePage() {
  const [business, setBusiness] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'discovery' | 'analysis'>('overview')
  
  const supabase = createClient()

  useEffect(() => {
    loadBusinessProfile()
  }, [])

  const loadBusinessProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please log in to view your business profile')
        return
      }

      // Get user's business profile from database
      const { data: businessData, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No business profile found - create a default one
          console.log('No business profile found, creating default profile...')
          const defaultBusiness = {
            user_id: user.id,
            website_url: '',
            business_name: 'My Business',
            description: 'Business description',
            value_proposition: 'Value proposition',
            industry: 'General',
            target_markets: [],
            decision_maker_roles: [],
            analysis_data: {},
            discovery_answers: {}
          }

          const { data: newBusiness, error: createError } = await supabase
            .from('businesses')
            .insert(defaultBusiness)
            .select()
            .single()

          if (createError) {
            console.error('Failed to create default business:', createError)
            setError('Failed to create business profile. Please try again.')
            return
          }

          setBusiness(newBusiness)
          setEditMode(true) // Start in edit mode for new profiles
        } else {
          console.error('Database fetch error:', fetchError)
          setError('Failed to load business profile')
        }
        return
      }

      setBusiness(businessData)
    } catch (err) {
      console.error('Load error:', err)
      setError('Failed to load business profile')
    } finally {
      setLoading(false)
    }
  }

  const updateDiscoveryAnswer = (questionId: string, value: string) => {
    if (!business) return
    
    const updatedAnswers = {
      ...business.discovery_answers,
      [questionId]: value
    }
    
    setBusiness(prev => prev ? {
      ...prev,
      discovery_answers: updatedAnswers
    } : null)
  }

  const saveChanges = async () => {
    if (!business) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          discovery_answers: business.discovery_answers,
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id)

      if (updateError) {
        throw updateError
      }

      setSuccess('Changes saved successfully!')
      setEditMode(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black">Loading your business profile...</p>
        </div>
      </div>
    )
  }

  if (error && !business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="border border-black rounded-lg p-6">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-black mb-2">Profile Not Found</h2>
            <p className="text-black mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/onboarding'}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
            >
              Complete Onboarding
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#fcb3ce] rounded-3xl p-8 min-h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-black">Business Profile</h1>
                <p className="text-black">Manage your business knowledge base and analysis</p>
              </div>
              <div className="flex gap-3">
                {editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      disabled={saving}
                      className="px-4 py-2 text-black border border-black rounded-lg hover:bg-white/10 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveChanges}
                      disabled={saving}
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 border border-red-500 rounded-lg p-4">
              <p className="text-black">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 border border-green-500 rounded-lg p-4">
              <p className="text-black">{success}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-black/20">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'Business Overview', icon: '📊' },
                  { id: 'discovery', name: '7 Discovery Questions', icon: '❓' },
                  { id: 'analysis', name: 'Website Analysis', icon: '🔍' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-black text-black'
                        : 'border-transparent text-black/70 hover:text-black hover:border-black/30'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && business && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Business Summary */}
              <div className="border border-black rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Business Summary</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Business Name</label>
                    <p className="text-black font-medium">{business.business_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Industry</label>
                    <p className="text-black">{business.industry}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Website</label>
                    <a 
                      href={business.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-black hover:text-gray-700 underline"
                    >
                      {business.website_url}
                    </a>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Description</label>
                    <p className="text-black">{business.description}</p>
                  </div>
                </div>
              </div>

              {/* Value Proposition */}
              <div className="border border-black rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Value Proposition</h3>
                <p className="text-black mb-4">{business.value_proposition}</p>
                
                <div className="pt-4 border-t border-black/20">
                  <h4 className="font-medium text-black mb-2">Target Markets</h4>
                  {business.target_markets?.length > 0 ? (
                    <ul className="list-disc list-inside text-black space-y-1">
                      {business.target_markets.map((market, idx) => (
                        <li key={idx}>{typeof market === 'string' ? market : market.name || market.type}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-black/70 italic">No target markets defined</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discovery' && business && (
            <div className="border border-black rounded-lg">
              <div className="p-6 border-b border-black/20">
                <h3 className="text-lg font-semibold text-black">The 7 Essential Discovery Questions</h3>
                <p className="text-black mt-1">Your answers to these questions power all AI suggestions and lead targeting</p>
              </div>
            
              <div className="p-6 space-y-8">
                {discoveryQuestions.map((q, index) => (
                  <div key={q.id} className="border-b border-black/10 pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-black mb-2">{q.question}</h4>
                        <p className="text-sm text-black mb-3">{q.hint}</p>
                      
                        {editMode ? (
                          q.multiline ? (
                            <textarea
                              value={business.discovery_answers?.[q.id] || ''}
                              onChange={(e) => updateDiscoveryAnswer(q.id, e.target.value)}
                              rows={4}
                              className="w-full p-3 border border-black rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black"
                              placeholder="Enter your answer..."
                            />
                          ) : (
                            <input
                              type="text"
                              value={business.discovery_answers?.[q.id] || ''}
                              onChange={(e) => updateDiscoveryAnswer(q.id, e.target.value)}
                              className="w-full p-3 border border-black rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black"
                              placeholder="Enter your answer..."
                            />
                          )
                        ) : (
                          <div className="border border-black rounded-lg p-4">
                            {business.discovery_answers?.[q.id] ? (
                              <p className="text-black whitespace-pre-wrap">{business.discovery_answers[q.id]}</p>
                            ) : (
                              <p className="text-black/70 italic">No answer provided</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && business && (
            <div className="border border-black rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-black">Website Analysis</h3>
                <div className="text-sm text-black">
                  Last updated: {new Date(business.updated_at).toLocaleDateString()}
                </div>
              </div>
            
              {business.analysis_data ? (
                <div className="space-y-6">
                  {/* Competitive Advantage */}
                  {business.analysis_data.competitiveAdvantage && (
                    <div>
                      <h4 className="font-medium text-black mb-2">Competitive Advantage</h4>
                      <p className="text-black">{business.analysis_data.competitiveAdvantage}</p>
                    </div>
                  )}

                  {/* Raw Analysis Data */}
                  <div>
                    <h4 className="font-medium text-black mb-3">Complete Analysis</h4>
                    <div className="border border-black rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-xs text-black whitespace-pre-wrap">
                        {JSON.stringify(business.analysis_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-black/40 text-6xl mb-4">📄</div>
                  <h4 className="text-lg font-medium text-black mb-2">No Analysis Data</h4>
                  <p className="text-black mb-4">Website analysis data is not available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}