'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <header className="bg-white px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Sales Machine" className="h-8 w-auto" />
          </div>
          
          <div className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-gray-900 hover:text-gray-700">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Purple Container */}
      <main className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="bg-purple-300 rounded-3xl mx-4 min-h-[calc(100vh-140px)] flex items-center justify-center">
          <div className="max-w-md w-full text-center px-8">
            <h1 className="text-3xl md:text-4xl font-medium text-gray-800 mb-6 leading-tight">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Sign in to continue building your sales machine
            </p>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 text-left space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full text-lg text-gray-600 placeholder-gray-500 bg-transparent border-0 border-b-2 border-gray-700 focus:border-gray-900 focus:outline-none py-3"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full text-lg text-gray-600 placeholder-gray-500 bg-transparent border-0 border-b-2 border-gray-700 focus:border-gray-900 focus:outline-none py-3"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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