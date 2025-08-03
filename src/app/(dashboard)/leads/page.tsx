'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  campaign: {
    name: string
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadLeads()
  }, [filter])

  const loadLeads = async () => {
    try {
      const response = await fetch(`/api/leads${filter !== 'all' ? `?status=${filter}` : ''}`)
      const data = await response.json()
      
      if (data.leads) {
        setLeads(data.leads)
      }
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
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
      <div className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="rounded-3xl mx-4 min-h-[calc(100vh-160px)] flex items-center justify-center" style={{ backgroundColor: '#b3fcce' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-black opacity-70">Loading leads...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
      <div className="rounded-3xl mx-4 min-h-[calc(100vh-160px)] p-8" style={{ backgroundColor: '#b3fcce' }}>
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-medium text-black mb-2">All Leads</h1>
            <p className="text-lg text-black opacity-70">Manage and track all your leads across campaigns</p>
          </div>

          <div className="space-y-8">
            
            <div className="border border-black rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-black">Filter by status:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1 border border-black/50 rounded-lg text-sm bg-white text-black"
                >
                  <option value="all">All Leads</option>
                  <option value="validated">Validated</option>
                  <option value="enriched">Enriched</option>
                  <option value="called">Called</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
            </div>

            <div className="border border-black rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black opacity-80 uppercase">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black opacity-80 uppercase">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black opacity-80 uppercase">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black opacity-80 uppercase">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black opacity-80 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black opacity-80 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/20">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-black opacity-80">
                          No leads found. Start a campaign to generate leads.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-black/5">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-black">{lead.business_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-black">{lead.contact_name || '-'}</div>
                            <div className="text-sm text-black opacity-70">{lead.contact_title || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-black opacity-70">{lead.campaign?.name || '-'}</div>
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
                            <button className="text-black font-medium hover:opacity-80 text-sm">
                              View Details
                            </button>
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
    </div>
  )
}