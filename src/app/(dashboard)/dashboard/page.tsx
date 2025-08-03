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
  businesses: {
    business_name: string
  }
}

interface Stats {
  totalLeads: number
  totalCalls: number
  totalAppointments: number
  totalSpent: number
}

interface BusinessRecap {
  businessName: string
  industry: string
  description: string
  valueProposition: string
  targetMarkets: any[]
  competitiveAdvantage: string
  discoveryAnswers?: any
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    totalCalls: 0,
    totalAppointments: 0,
    totalSpent: 0
  })
  const [businessRecap, setBusinessRecap] = useState<BusinessRecap | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load business recap from localStorage (from onboarding)
      const analysisData = localStorage.getItem('businessAnalysis')
      const discoveryData = localStorage.getItem('discoveryAnswers')
      
      if (analysisData) {
        try {
          const analysis = JSON.parse(analysisData)
          const discovery = discoveryData ? JSON.parse(discoveryData) : null
          
          setBusinessRecap({
            ...analysis,
            discoveryAnswers: discovery
          })
        } catch (e) {
          console.error('Failed to parse business data:', e)
        }
      }

      // Fetch campaigns
      const response = await fetch('/api/campaigns')
      const data = await response.json()
      
      if (data.campaigns) {
        setCampaigns(data.campaigns)
        
        // Calculate stats
        const totals = data.campaigns.reduce((acc: Stats, campaign: Campaign) => ({
          totalLeads: acc.totalLeads + campaign.leads_scraped,
          totalCalls: acc.totalCalls + campaign.leads_called,
          totalAppointments: acc.totalAppointments + campaign.appointments_booked,
          totalSpent: acc.totalSpent
        }), {
          totalLeads: 0,
          totalCalls: 0,
          totalAppointments: 0,
          totalSpent: 0
        })
        
        setStats(totals)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Main Container like other pages */}
      <main className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="rounded-3xl mx-4 min-h-[calc(100vh-160px)] p-8" style={{ backgroundColor: '#ceb3fc' }}>
          <div className="max-w-7xl mx-auto">
            
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-light text-black mb-2">
                Sales Machine Dashboard
              </h1>
              <p className="text-lg text-black opacity-60">
                Welcome back! Here's your sales performance overview
              </p>
            </div>

            {/* Business Recap Section */}
            {businessRecap && (
              <div className="border border-black rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-black mb-6">Your Business Recap</h2>
                <div className="space-y-4 text-black opacity-80 leading-relaxed">
                  <p>
                    <strong>{businessRecap.businessName || 'Your company'}</strong> is a {businessRecap.industry?.toLowerCase() || 'business'} that provides {businessRecap.description || 'products and services'} to {
                      businessRecap.targetMarkets && businessRecap.targetMarkets.length > 0 
                        ? (typeof businessRecap.targetMarkets[0] === 'object' 
                            ? businessRecap.targetMarkets[0].industry || 'your target audience'
                            : businessRecap.targetMarkets[0])
                        : 'your target audience'
                    }.
                  </p>
                  
                  <p>
                    Your core value proposition is <strong>{businessRecap.valueProposition || 'delivering exceptional value through innovative solutions'}</strong>.
                  </p>
                  
                  <p>
                    <strong>Sales Approach:</strong> Focus on {businessRecap.competitiveAdvantage ? `leveraging your ${businessRecap.competitiveAdvantage.toLowerCase()}` : 'consultative selling'}, emphasizing {businessRecap.valueProposition?.includes('cost') ? 'cost savings' : businessRecap.valueProposition?.includes('fast') ? 'speed' : businessRecap.valueProposition?.includes('innovat') ? 'innovation' : 'value creation'}.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="border border-black rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-black mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link 
                  href="/campaigns/new"
                  className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-all group"
                >
                  <div className="text-lg font-semibold mb-2">🚀 Start Full Campaign</div>
                  <div className="text-sm text-purple-100">Create a complete sales campaign with lead scraping, enrichment, and calling</div>
                </Link>
                
                <Link 
                  href="/scrape-leads"
                  className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-all group"
                >
                  <div className="text-lg font-semibold mb-2">🎯 Test Lead Scraping</div>
                  <div className="text-sm text-blue-100">Test our Google Maps scraping engine - get business names, websites, and phone numbers</div>
                </Link>
                
                <Link 
                  href="/leads"
                  className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-all group"
                >
                  <div className="text-lg font-semibold mb-2">📊 View All Leads</div>
                  <div className="text-sm text-green-100">Manage and review all your scraped and enriched leads</div>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="border border-black rounded-2xl p-6 text-center">
                <p className="text-sm font-medium text-black opacity-60 mb-2">Total Leads</p>
                <p className="text-3xl font-bold text-black">{stats.totalLeads}</p>
              </div>
              <div className="border border-black rounded-2xl p-6 text-center">
                <p className="text-sm font-medium text-black opacity-60 mb-2">Calls Made</p>
                <p className="text-3xl font-bold text-black">{stats.totalCalls}</p>
              </div>
              <div className="border border-black rounded-2xl p-6 text-center">
                <p className="text-sm font-medium text-black opacity-60 mb-2">Appointments</p>
                <p className="text-3xl font-bold text-black">{stats.totalAppointments}</p>
              </div>
              <div className="border border-black rounded-2xl p-6 text-center">
                <p className="text-sm font-medium text-black opacity-60 mb-2">Conversion Rate</p>
                <p className="text-3xl font-bold text-black">
                  {stats.totalCalls > 0 
                    ? `${((stats.totalAppointments / stats.totalCalls) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="border border-black rounded-2xl">
              <div className="px-8 py-6 border-b border-black/20">
                <h2 className="text-2xl font-bold text-black">Your Campaigns</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black opacity-80 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-black opacity-80 uppercase tracking-wider">Business</th>
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
                        <td colSpan={8} className="px-6 py-12 text-center text-black opacity-60">
                          No campaigns yet. 
                          <Link href="/campaigns/new" className="ml-2 text-black font-medium hover:opacity-80">
                            Create your first campaign
                          </Link>
                        </td>
                      </tr>
                    ) : (
                      campaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-black/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-black">{campaign.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-black opacity-80">{campaign.businesses.business_name}</div>
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
                            <Link href={`/campaigns/${campaign.id}`} className="text-black font-medium hover:opacity-80">
                              View Details
                            </Link>
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
      </main>
    </div>
  )
}