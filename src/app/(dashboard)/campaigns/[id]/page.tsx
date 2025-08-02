'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Lead {
  id: string
  business_name: string
  contact_name: string
  contact_title: string
  contact_phone: string
  contact_email: string
  validation_score: number
  status: string
  created_at: string
}

interface Campaign {
  id: string
  name: string
  status: string
  leads_scraped: number
  leads_called: number
  appointments_booked: number
  search_parameters: any
  businesses: {
    business_name: string
  }
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  
  const supabase = createClient()

  useEffect(() => {
    loadCampaignData()
  }, [campaignId])

  const loadCampaignData = async () => {
    try {
      // Load campaign details
      const campaignResponse = await fetch(`/api/campaigns?campaignId=${campaignId}`)
      const campaignData = await campaignResponse.json()
      
      if (campaignData.campaigns?.[0]) {
        setCampaign(campaignData.campaigns[0])
      }

      // Load leads
      const leadsResponse = await fetch(`/api/leads?campaignId=${campaignId}`)
      const leadsData = await leadsResponse.json()
      
      if (leadsData.leads) {
        setLeads(leadsData.leads)
      }
    } catch (error) {
      console.error('Error loading campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartScraping = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/scrape`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // Reload data
        await loadCampaignData()
      }
    } catch (error) {
      console.error('Error starting scraping:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEnrichLeads = async () => {
    if (selectedLeads.length === 0) return
    
    setActionLoading(true)
    try {
      const response = await fetch('/api/leads/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadIds: selectedLeads,
          campaignId
        })
      })
      
      if (response.ok) {
        await loadCampaignData()
        setSelectedLeads([])
      }
    } catch (error) {
      console.error('Error enriching leads:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStartCalling = async () => {
    if (selectedLeads.length === 0) return
    
    setActionLoading(true)
    try {
      const response = await fetch('/api/calls/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadIds: selectedLeads,
          campaignId
        })
      })
      
      if (response.ok) {
        await loadCampaignData()
        setSelectedLeads([])
      }
    } catch (error) {
      console.error('Error starting calls:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getFilteredLeads = () => {
    switch (filter) {
      case 'validated':
        return leads.filter(l => l.status === 'validated')
      case 'enriched':
        return leads.filter(l => l.status === 'enriched')
      case 'called':
        return leads.filter(l => l.status === 'called')
      case 'converted':
        return leads.filter(l => l.status === 'converted')
      default:
        return leads
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-blue-100 text-blue-800'
      case 'enriched':
        return 'bg-purple-100 text-purple-800'
      case 'calling':
        return 'bg-yellow-100 text-yellow-800'
      case 'called':
        return 'bg-green-100 text-green-800'
      case 'converted':
        return 'bg-emerald-100 text-emerald-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Campaign not found</p>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const filteredLeads = getFilteredLeads()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 text-sm">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{campaign.name}</h1>
              <p className="text-gray-600">{campaign.businesses.business_name}</p>
            </div>
            <div className="flex items-center gap-4">
              {campaign.status === 'draft' && (
                <button
                  onClick={handleStartScraping}
                  disabled={actionLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Start Scraping
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Campaign Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Target Leads</p>
            <p className="text-2xl font-bold">{campaign.search_parameters.numberOfLeads}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Leads Scraped</p>
            <p className="text-2xl font-bold">{campaign.leads_scraped}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Calls Made</p>
            <p className="text-2xl font-bold">{campaign.leads_called}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Appointments</p>
            <p className="text-2xl font-bold">{campaign.appointments_booked}</p>
          </div>
        </div>

        {/* Lead Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Leads</h2>
              <div className="flex items-center gap-4">
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Leads</option>
                  <option value="validated">Validated</option>
                  <option value="enriched">Enriched</option>
                  <option value="called">Called</option>
                  <option value="converted">Converted</option>
                </select>

                {/* Actions */}
                {selectedLeads.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedLeads.length} selected
                    </span>
                    <button
                      onClick={handleEnrichLeads}
                      disabled={actionLoading}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      Enrich Contacts
                    </button>
                    {campaign.search_parameters.serviceOption === 'scraping_calling' && (
                      <button
                        onClick={handleStartCalling}
                        disabled={actionLoading}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Start Calling
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lead Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads(filteredLeads.map(l => l.id))
                        } else {
                          setSelectedLeads([])
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads([...selectedLeads, lead.id])
                          } else {
                            setSelectedLeads(selectedLeads.filter(id => id !== lead.id))
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{lead.business_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{lead.contact_name || '-'}</div>
                      <div className="text-sm text-gray-600">{lead.contact_title || '-'}</div>
                      {lead.contact_phone && (
                        <div className="text-sm text-gray-600">{lead.contact_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{lead.validation_score}/100</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}