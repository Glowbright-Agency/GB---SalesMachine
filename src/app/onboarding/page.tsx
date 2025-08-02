'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Normalize URL - add https:// if not present
      let normalizedUrl = websiteUrl.trim()
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteUrl: normalizedUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze website')
      }

      // Store analysis data in localStorage for discovery questions
      localStorage.setItem('businessAnalysis', JSON.stringify(data.analysis))

      // Redirect to analysis results page first
      router.push(`/onboarding/analysis?businessId=${data.business.id}`)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle Cmd+Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e as any)
    }
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
              <span className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
              <span className="text-sm font-medium text-gray-900">Website Analysis</span>
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

      {/* Main Purple Container */}
      <main className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="bg-purple-300 rounded-3xl mx-4 min-h-[calc(100vh-140px)] flex items-center justify-center">
          <div className="max-w-2xl w-full text-center px-8">
            <h1 className="text-3xl md:text-4xl font-medium text-gray-800 mb-6 leading-tight">
              Share Your Website To <span className="font-semibold">Build Your Sales Machine</span> Automatically
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              Our AI Will Analyze Your Website And Suggest The Best Sales Strategy
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="www.example.com"
                  className="w-full text-xl text-gray-600 placeholder-gray-500 bg-transparent border-0 border-b-2 border-gray-700 focus:border-gray-900 focus:outline-none py-3 text-center"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Analyzing...' : 'Submit'}
                </button>
                
                <span className="text-gray-600 text-sm">
                  Press <span className="font-semibold">Cmd ⌘ + Enter</span> ↵
                </span>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}