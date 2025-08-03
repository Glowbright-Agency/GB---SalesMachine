'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AnimatedBackgroundColors from '@/components/AnimatedBackgroundColors'
import TypingAnimation from '@/components/TypingAnimation'

export default function OnboardingPage() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Ensure VAPI widget loads after component mounts
    const loadVapiWidget = () => {
      if (typeof window !== 'undefined' && window.customElements) {
        // Widget should auto-load with the script
        console.log('VAPI widget should be available')
      }
    }
    
    // Small delay to ensure script has loaded
    const timer = setTimeout(loadVapiWidget, 1000)
    return () => clearTimeout(timer)
  }, [])

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
    <div className="min-h-screen bg-black">
      {/* Header with Logo and Navigation */}
      <header className="bg-black px-8 py-6">
        <div className="w-[96vw] mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/onboarding" className="flex items-center gap-3 cursor-pointer">
            <img src="/logo.svg" alt="Sales Machine" className="h-8 w-auto" />
          </Link>
          
          {/* Navigation Steps */}
          <nav className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
              <span className="text-sm font-medium text-white">Website Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-gray-600 text-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
              <span className="text-sm font-medium text-gray-400">Sales Targets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-gray-600 text-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
              <span className="text-sm font-medium text-gray-400">Sign Up</span>
            </div>
          </nav>

          {/* Log in Link */}
          <button
            onClick={() => router.push('/login')}
            className="text-white hover:text-gray-300 text-sm font-medium"
          >
            Log in
          </button>
        </div>
      </header>

      {/* Main Animated Container */}
      <main className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <AnimatedBackgroundColors className="rounded-3xl mx-4 min-h-[calc(100vh-140px)] flex items-center justify-center relative">
          {/* Don't have a website button - positioned top-right */}
          <button
            onClick={() => router.push('/manual-setup')}
            className="absolute top-6 right-6 bg-transparent text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-white hover:bg-opacity-10 transition-all"
          >
            Don't have a website?
          </button>
          
          <div className="max-w-2xl w-full text-center px-8">
            <h1 className="text-3xl md:text-4xl font-light text-black mb-6 leading-tight">
              Share your website to Build<br />
              Your Sales Machine Automatically
            </h1>
            <p className="text-lg text-black mb-12 opacity-60">
              Our AI will analyze your website and suggest the best sales strategy
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder=""
                  className="w-full text-xl text-black bg-transparent border-0 border-b-2 border-black focus:border-black focus:outline-none py-3 text-center"
                  required
                  disabled={loading}
                />
                {!websiteUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <TypingAnimation className="text-xl text-black opacity-60" />
                  </div>
                )}
              </div>

              {error && (
                <div className="text-red-700 text-sm bg-red-100 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-black border-2 border-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Analyzing...' : 'Submit'}
                </button>
                
                <span className="text-black text-sm opacity-60">
                  press <span className="font-semibold">Cmd ⌘ + Enter ↵</span>
                </span>
              </div>
            </form>
          </div>
        </AnimatedBackgroundColors>
      </main>
    </div>
  )
}