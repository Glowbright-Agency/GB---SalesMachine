'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Campaign {
  id: string
  name: string
  status: string
  leads_scraped: number
  leads_called: number
  appointments_booked: number
  created_at: string
  search_parameters?: {
    location?: {
      city: string
      state: string
      display: string
    } | string
    service?: string
    numberOfLeads?: number
    salesTargets?: string[]
    decisionMakers?: string[]
    scripts?: any
    businessData?: any
  }
  location?: {
    city: string
    state: string
    display: string
  }
  service?: string
  businesses: {
    business_name: string
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/campaigns')
      const data = await response.json()
      
      if (data.campaigns) {
        setCampaigns(data.campaigns)
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getServiceIcon = (service?: string) => {
    switch (service) {
      case 'scraping':
        return '🔍'
      case 'scraping_calling':
        return '📞'
      default:
        return '📝'
    }
  }

  if (loading) {
    return (
      <div className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="rounded-3xl mx-4 min-h-[calc(100vh-160px)] flex items-center justify-center" style={{ backgroundColor: '#b3cefc' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-black opacity-70">Loading campaigns...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
      <div className="rounded-3xl mx-4 min-h-[calc(100vh-160px)] p-8" style={{ backgroundColor: '#b3cefc' }}>
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-medium text-black mb-2">
              Your Campaigns
            </h1>
            <p className="text-lg text-black opacity-70">
              Manage your lead generation campaigns and track performance
            </p>
          </div>

          {/* Campaigns List */}
          <div className="border border-black rounded-2xl">
            <div className="px-8 py-6 border-b border-black/20">
              <h2 className="text-2xl font-bold text-black">Active Campaigns</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black opacity-80 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black opacity-80 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black opacity-80 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black opacity-80 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black opacity-80 uppercase tracking-wider">Leads</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black opacity-80 uppercase tracking-wider">Calls</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black opacity-80 uppercase tracking-wider">Appointments</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black opacity-80 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black opacity-80 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/20">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="text-black opacity-70">
                          <div className="text-6xl mb-4">🚀</div>
                          <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
                          <p className="text-black opacity-60 mb-4">Create your first campaign to start generating leads</p>
                          <Link 
                            href="/campaigns/new"
                            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-black/80 transition-all"
                          >
                            Create Campaign
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-black/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-black">{campaign.name}</div>
                          <div className="text-sm text-black opacity-80">{campaign.businesses?.business_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-black">
                            {(typeof campaign.search_parameters?.location === 'object' 
                              ? campaign.search_parameters.location.display 
                              : campaign.search_parameters?.location) || 
                             campaign.location?.display || 
                             'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getServiceIcon(campaign.search_parameters?.service || campaign.service)}</span>
                            <span className="text-sm text-black capitalize">
                              {(campaign.search_parameters?.service || campaign.service) === 'scraping_calling' ? 'Scraping + Calling' : 'Scraping Only'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{campaign.leads_scraped}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{campaign.leads_called}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{campaign.appointments_booked}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black opacity-80">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/campaigns/${campaign.id}`} 
                              className="text-black font-medium hover:opacity-80"
                            >
                              View
                            </Link>
                            <span className="text-black opacity-30">|</span>
                            <button className="text-black opacity-60 hover:opacity-80">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}