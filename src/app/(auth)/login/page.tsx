'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Check for confirmation success or error messages
    const confirmed = searchParams.get('confirmed')
    const errorParam = searchParams.get('error')

    if (confirmed === 'true') {
      setSuccess('🎉 Email confirmed successfully! You can now log in with your credentials. You\'ve been credited with 1000 free credits to get started.')
    } else if (errorParam) {
      switch (errorParam) {
        case 'confirmation_failed':
          setError('Email confirmation failed. Please try registering again or contact support.')
          break
        case 'invalid_code':
          setError('Invalid confirmation code. The link may have expired.')
          break
        case 'no_code':
          setError('No confirmation code provided.')
          break
        default:
          setError('An error occurred during confirmation.')
      }
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header with Logo */}
      <header className="bg-black px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/onboarding" className="flex items-center gap-3 cursor-pointer">
            <img src="/logo.svg" alt="Sales Machine" className="h-8 w-auto" />
          </Link>
          
          <div className="text-sm text-gray-300">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-white hover:text-gray-300">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Green Container */}
      <main className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="rounded-3xl mx-4 min-h-[calc(100vh-140px)] flex items-center justify-center" style={{ backgroundColor: '#b3fcce' }}>
          <div className="max-w-md w-full text-center px-8">
            <h1 className="text-3xl md:text-4xl font-medium text-black mb-6 leading-tight">
              Welcome Back
            </h1>
            <p className="text-lg text-black opacity-70 mb-8">
              Sign in to continue building your sales machine
            </p>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 text-left space-y-6">
                {error && (
                  <div className="rounded-md bg-red-100 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="rounded-md bg-green-100 p-4">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-black mb-2">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full text-lg text-black placeholder-black/50 bg-transparent border-0 border-b-2 border-black/50 focus:border-black focus:outline-none py-3"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full text-lg text-black placeholder-black/50 bg-transparent border-0 border-b-2 border-black/50 focus:border-black focus:outline-none py-3"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}