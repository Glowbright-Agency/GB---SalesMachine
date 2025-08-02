'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UsageStats {
  totalCredits: number
  creditsUsed: number
  creditsRemaining: number
  leadsScraped: number
  leadsCalled: number
  appointmentsBooked: number
}

export default function BillingPage() {
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalCredits: 100,
    creditsUsed: 15,
    creditsRemaining: 85,
    leadsScraped: 0,
    leadsCalled: 0,
    appointmentsBooked: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Mock data for now since API has issues
      setTimeout(() => {
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error loading billing data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="bg-purple-300 rounded-3xl mx-4 min-h-[calc(100vh-160px)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading billing information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
      <div className="bg-purple-300 rounded-3xl mx-4 min-h-[calc(100vh-160px)] p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-medium text-gray-800 mb-2">
              Billing & Credits
            </h1>
            <p className="text-lg text-gray-600">
              Track your usage and manage your account
            </p>
          </div>

          <div className="space-y-8">
            
            {/* Credit Balance - Simple */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Credits</h2>
              <div className="mb-6">
                <p className="text-5xl font-bold text-gray-900 mb-2">{usageStats.creditsRemaining}</p>
                <p className="text-gray-600">of {usageStats.totalCredits} credits remaining</p>
              </div>
              <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all">
                Buy More Credits
              </button>
            </div>

            {/* Simple Pricing */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Simple Pricing</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔍</span>
                    <span className="font-medium">Lead Scraping</span>
                  </div>
                  <span className="text-xl font-bold">$4</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📞</span>
                    <span className="font-medium">AI Calling</span>
                  </div>
                  <span className="text-xl font-bold">$7</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <span className="font-medium">Appointment Booking</span>
                  </div>
                  <span className="text-xl font-bold">$3</span>
                </div>
              </div>
            </div>

            {/* Usage Summary - Simple */}
            {(usageStats.leadsScraped > 0 || usageStats.leadsCalled > 0 || usageStats.appointmentsBooked > 0) && (
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">This Month</h2>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{usageStats.leadsScraped}</p>
                    <p className="text-sm text-gray-600">Leads Found</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{usageStats.leadsCalled}</p>
                    <p className="text-sm text-gray-600">Calls Made</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{usageStats.appointmentsBooked}</p>
                    <p className="text-sm text-gray-600">Appointments</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}