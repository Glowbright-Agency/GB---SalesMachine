'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KnowledgeBaseStorage } from '@/lib/knowledge-base-storage'

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
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please log in to view your business profile')
        return
      }

      // Check if we need to migrate from session storage
      const sessionKB = KnowledgeBaseStorage.loadSession()
      if (sessionKB && sessionKB.isTemporary) {
        await migrateSessionToDatabase(user.id, sessionKB)
        KnowledgeBaseStorage.clearSession()
      }

      // Load from database
      const { data: businessData, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('No business profile found. Please complete the onboarding process.')
        } else {
          setError('Failed to load business profile')
        }
        return
      }

      setBusiness(businessData)
    } catch (err: any) {
      setError(err.message || 'Failed to load business profile')
    } finally {
      setLoading(false)
    }
  }

  const migrateSessionToDatabase = async (userId: string, sessionKB: any) => {
    try {
      console.log('🔄 Migrating session knowledge base to database...')
      
      const businessData = {
        user_id: userId,
        website_url: sessionKB.websiteUrl || '',
        business_name: sessionKB.businessName,
        description: sessionKB.description || '',
        value_proposition: sessionKB.valueProposition || '',
        industry: sessionKB.industry || '',
        target_markets: sessionKB.targetMarkets || [],
        decision_maker_roles: sessionKB.targetDecisionMakers || [],
        analysis_data: {
          businessName: sessionKB.businessName,
          industry: sessionKB.industry,
          description: sessionKB.description,
          valueProposition: sessionKB.valueProposition,
          competitiveAdvantage: sessionKB.competitiveAdvantage,
          targetCustomers: sessionKB.targetCustomers || [],
          targetDecisionMakers: sessionKB.targetDecisionMakers || [],
          ...sessionKB
        },
        discovery_answers: sessionKB.discoveryAnswers || {}
      }

      const { error: insertError } = await supabase
        .from('businesses')
        .insert(businessData)

      if (insertError) {
        console.error('Migration error:', insertError)
        throw insertError
      }

      console.log('✅ Knowledge base successfully migrated to database')
    } catch (error) {
      console.error('Failed to migrate session data:', error)
      throw error
    }
  }

  const updateBusinessProfile = async (updates: Partial<BusinessData>) => {
    if (!business) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id)

      if (updateError) throw updateError

      // Update local state
      setBusiness(prev => prev ? { ...prev, ...updates } : null)
      setSuccess('Business profile updated successfully!')
      setEditMode(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update business profile')
    } finally {
      setSaving(false)
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

  const saveDiscoveryAnswers = async () => {
    if (!business) return
    await updateBusinessProfile({ discovery_answers: business.discovery_answers })
  }

  const reanalyzeWebsite = async () => {
    if (!business?.website_url) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl: business.website_url
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reanalyze website')
      }

      const data = await response.json()
      
      await updateBusinessProfile({
        analysis_data: data.analysis,
        business_name: data.analysis.businessName,
        description: data.analysis.description,
        value_proposition: data.analysis.valueProposition,
        industry: data.analysis.industry,
        target_markets: data.analysis.targetMarkets || [],
        decision_maker_roles: data.analysis.targetDecisionMakers || []
      })

      setSuccess('Website analysis updated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to reanalyze website')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your business profile...</p>
        </div>
      </div>
    )
  }

  if (error && !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 rounded-lg p-6">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Profile Not Found</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/onboarding'}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Complete Onboarding
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
                <p className="text-gray-600">Manage your business knowledge base and analysis</p>
              </div>
              <div className="flex gap-3">
                {editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => activeTab === 'discovery' ? saveDiscoveryAnswers() : setEditMode(false)}
                      disabled={saving}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'discovery', name: 'Discovery Questions', icon: '❓' },
                { id: 'analysis', name: 'Website Analysis', icon: '🔍' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Summary</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <p className="text-gray-900 font-medium">{business.business_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <p className="text-gray-900">{business.industry}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <a 
                    href={business.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800"
                  >
                    {business.website_url}
                  </a>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{business.description}</p>
                </div>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Value Proposition</h3>
              <p className="text-gray-900 mb-4">{business.value_proposition}</p>
              
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Target Markets</h4>
                {business.target_markets?.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {business.target_markets.map((market, idx) => (
                      <li key={idx}>{typeof market === 'string' ? market : market.name || market.type}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No target markets defined</p>
                )}
              </div>
            </div>

            {/* Knowledge Base Status */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">🧠 Knowledge Base Status</h3>
                  <button
                    onClick={reanalyzeWebsite}
                    disabled={saving}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                  >
                    {saving ? 'Updating...' : 'Re-analyze Website'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">
                      {business.website_url ? '✅' : '❌'}
                    </div>
                    <div className="text-sm font-medium text-gray-900">Website Analysis</div>
                    <div className="text-xs text-gray-600">
                      {business.website_url ? 'Complete' : 'Missing'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl mb-1">
                      {business.discovery_answers && Object.keys(business.discovery_answers).length > 0 ? '✅' : '❌'}
                    </div>
                    <div className="text-sm font-medium text-gray-900">Discovery Questions</div>
                    <div className="text-xs text-gray-600">
                      {business.discovery_answers && Object.keys(business.discovery_answers).length > 0 
                        ? `${Object.keys(business.discovery_answers).length}/7 answered`
                        : 'Incomplete'
                      }
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl mb-1">
                      {business.target_markets?.length > 0 ? '✅' : '⚠️'}
                    </div>
                    <div className="text-sm font-medium text-gray-900">Target Markets</div>
                    <div className="text-xs text-gray-600">
                      {business.target_markets?.length || 0} identified
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl mb-1">
                      {business.decision_maker_roles?.length > 0 ? '✅' : '⚠️'}
                    </div>
                    <div className="text-sm font-medium text-gray-900">Decision Makers</div>
                    <div className="text-xs text-gray-600">
                      {business.decision_maker_roles?.length || 0} roles defined
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'discovery' && business && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Discovery Questions</h3>
              <p className="text-gray-600 mt-1">Your answers to these questions power all AI suggestions and lead targeting</p>
            </div>
            
            <div className="p-6 space-y-8">
              {discoveryQuestions.map((q, index) => (
                <div key={q.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{q.question}</h4>
                      <p className="text-sm text-gray-600 mb-3">{q.hint}</p>
                      
                      {editMode ? (
                        q.multiline ? (
                          <textarea
                            value={business.discovery_answers?.[q.id] || ''}
                            onChange={(e) => updateDiscoveryAnswer(q.id, e.target.value)}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter your answer..."
                          />
                        ) : (
                          <input
                            type="text"
                            value={business.discovery_answers?.[q.id] || ''}
                            onChange={(e) => updateDiscoveryAnswer(q.id, e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter your answer..."
                          />
                        )
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4">
                          {business.discovery_answers?.[q.id] ? (
                            <p className="text-gray-900 whitespace-pre-wrap">{business.discovery_answers[q.id]}</p>
                          ) : (
                            <p className="text-gray-500 italic">No answer provided</p>
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Website Analysis</h3>
              <div className="text-sm text-gray-500">
                Last updated: {new Date(business.updated_at).toLocaleDateString()}
              </div>
            </div>
            
            {business.analysis_data ? (
              <div className="space-y-6">
                {/* Competitive Advantage */}
                {business.analysis_data.competitiveAdvantage && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Competitive Advantage</h4>
                    <p className="text-gray-700">{business.analysis_data.competitiveAdvantage}</p>
                  </div>
                )}

                {/* Target Customers */}
                {business.analysis_data.targetCustomers?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Target Customers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {business.analysis_data.targetCustomers.map((customer: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">{customer.type}</h5>
                          <p className="text-sm text-gray-700 mb-2">{customer.description}</p>
                          {customer.painPoints?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Pain Points:</p>
                              <ul className="text-xs text-gray-600 list-disc list-inside">
                                {customer.painPoints.map((pain: string, idx: number) => (
                                  <li key={idx}>{pain}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision Makers */}
                {business.analysis_data.targetDecisionMakers?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Target Decision Makers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {business.analysis_data.targetDecisionMakers.map((dm: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900">{dm.title}</h5>
                          {dm.department && (
                            <p className="text-sm text-gray-600 mb-2">{dm.department}</p>
                          )}
                          {dm.priorities?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Priorities:</p>
                              <ul className="text-xs text-gray-600 list-disc list-inside">
                                {dm.priorities.map((priority: string, idx: number) => (
                                  <li key={idx}>{priority}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Analysis Data */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Full Analysis Data</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(business.analysis_data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Analysis Data</h4>
                <p className="text-gray-600 mb-4">Website analysis data is not available</p>
                <button
                  onClick={reanalyzeWebsite}
                  disabled={saving}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? 'Analyzing...' : 'Analyze Website'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}