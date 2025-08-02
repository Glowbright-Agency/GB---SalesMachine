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
  location: {
    city: string
    state: string
    display: string
  }
  service: string
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

  const getServiceIcon = (service: string) => {
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
        <div className="bg-purple-300 rounded-3xl mx-4 min-h-[calc(100vh-160px)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading campaigns...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
      <div className="bg-purple-300 rounded-3xl mx-4 min-h-[calc(100vh-160px)] p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-medium text-gray-800 mb-2">
              Your Campaigns
            </h1>
            <p className="text-lg text-gray-600">
              Manage your lead generation campaigns and track performance
            </p>
          </div>

          {/* Campaigns List */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Active Campaigns</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Leads</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Calls</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Appointments</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <div className="text-6xl mb-4">🚀</div>
                          <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
                          <p className="text-gray-400 mb-4">Create your first campaign to start generating leads</p>
                          <Link 
                            href="/campaigns/new"
                            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all"
                          >
                            Create Campaign
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-600">{campaign.businesses?.business_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{campaign.location?.display || 'Not specified'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getServiceIcon(campaign.service)}</span>
                            <span className="text-sm text-gray-900 capitalize">
                              {campaign.service === 'scraping_calling' ? 'Scraping + Calling' : 'Scraping Only'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.leads_scraped}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.leads_called}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.appointments_booked}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/campaigns/${campaign.id}`} 
                              className="text-gray-900 font-medium hover:text-gray-700"
                            >
                              View
                            </Link>
                            <span className="text-gray-300">|</span>
                            <button className="text-gray-600 hover:text-gray-800">
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