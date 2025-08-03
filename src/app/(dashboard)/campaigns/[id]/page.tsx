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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-black">Campaign not found</p>
          <Link href="/dashboard" className="text-black hover:text-gray-700 mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const filteredLeads = getFilteredLeads()

  return (
    <div className="min-h-screen p-6">
      <div className="rounded-3xl p-8" style={{ backgroundColor: '#b3cefc' }}>
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="text-black hover:text-gray-700 text-sm">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-black mt-1">{campaign.name}</h1>
              <p className="text-black">{campaign.businesses.business_name}</p>
            </div>
            <div className="flex items-center gap-4">
              {campaign.status === 'draft' && (
                <button
                  onClick={handleStartScraping}
                  disabled={actionLoading}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  Start Scraping
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="border border-black rounded-lg p-4">
            <p className="text-sm text-black">Target Leads</p>
            <p className="text-2xl font-bold text-black">{campaign.search_parameters.numberOfLeads}</p>
          </div>
          <div className="border border-black rounded-lg p-4">
            <p className="text-sm text-black">Leads Scraped</p>
            <p className="text-2xl font-bold text-black">{campaign.leads_scraped}</p>
          </div>
          <div className="border border-black rounded-lg p-4">
            <p className="text-sm text-black">Calls Made</p>
            <p className="text-2xl font-bold text-black">{campaign.leads_called}</p>
          </div>
          <div className="border border-black rounded-lg p-4">
            <p className="text-sm text-black">Appointments</p>
            <p className="text-2xl font-bold text-black">{campaign.appointments_booked}</p>
          </div>
        </div>

        {/* Lead Management */}
        <div className="border border-black rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Leads</h2>
              <div className="flex items-center gap-4">
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white text-black"
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
                    <span className="text-sm text-black">
                      {selectedLeads.length} selected
                    </span>
                    <button
                      onClick={handleEnrichLeads}
                      disabled={actionLoading}
                      className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                    >
                      Enrich Contacts
                    </button>
                    {campaign.search_parameters.serviceOption === 'scraping_calling' && (
                      <button
                        onClick={handleStartCalling}
                        disabled={actionLoading}
                        className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
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
              <thead className="bg-gray-100/50">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-100/30">
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
                      <div className="text-sm font-medium text-black">{lead.business_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-black">{lead.contact_name || '-'}</div>
                      <div className="text-sm text-gray-700">{lead.contact_title || '-'}</div>
                      {lead.contact_phone && (
                        <div className="text-sm text-gray-700">{lead.contact_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-black">{lead.validation_score}/100</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-black hover:text-gray-700 text-sm">
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