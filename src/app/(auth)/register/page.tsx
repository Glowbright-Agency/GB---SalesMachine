'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { KnowledgeBaseStorage } from '@/lib/knowledge-base-storage'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const migrateKnowledgeBaseToDatabase = async (userId: string) => {
    try {
      // Check if there's session knowledge base to migrate
      const sessionKB = KnowledgeBaseStorage.loadSession()
      if (!sessionKB || !sessionKB.isTemporary) {
        console.log('No session knowledge base found to migrate')
        return
      }

      console.log('🔄 Migrating session knowledge base to database...')

      // Prepare business data for database
      const businessData = {
        user_id: userId,
        website_url: sessionKB.websiteUrl || '',
        business_name: sessionKB.businessName,
        description: sessionKB.description || '',
        value_proposition: sessionKB.valueProposition || '',
        industry: sessionKB.industry || '',
        target_markets: sessionKB.targetMarkets || [],
        decision_maker_roles: sessionKB.targetDecisionMakers || [],
        analysis_data: {
          ...sessionKB,
          businessName: sessionKB.businessName,
          industry: sessionKB.industry,
          description: sessionKB.description,
          valueProposition: sessionKB.valueProposition,
          competitiveAdvantage: sessionKB.competitiveAdvantage,
          targetCustomers: sessionKB.targetCustomers || [],
          targetDecisionMakers: sessionKB.targetDecisionMakers || []
        },
        discovery_answers: sessionKB.discoveryAnswers || {}
      }

      // Insert business profile into database
      const { error: businessError } = await supabase
        .from('businesses')
        .insert(businessData)

      if (businessError) {
        console.error('Failed to migrate business data:', businessError)
        // Don't throw error - let user continue to dashboard
        return
      }

      // Clear session storage after successful migration
      KnowledgeBaseStorage.clearSession()
      console.log('✅ Knowledge base successfully migrated to database and session cleared')

    } catch (error) {
      console.error('Knowledge base migration error:', error)
      // Don't throw error - let user continue to dashboard
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (authData.user) {
        // Create user profile with 1000 initial credits
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            company_name: formData.companyName,
            credits: 1000
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // Migrate knowledge base from session storage to Supabase
        await migrateKnowledgeBaseToDatabase(authData.user.id)

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
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-white hover:text-gray-300">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Pink Container */}
      <main className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="rounded-3xl mx-4 min-h-[calc(100vh-140px)] flex items-center justify-center" style={{ backgroundColor: '#fcb3ce' }}>
          <div className="max-w-md w-full text-center px-8">
            <h1 className="text-3xl md:text-4xl font-medium text-black mb-6 leading-tight">
              Create Your Account
            </h1>
            <p className="text-lg text-black opacity-70 mb-8">
              Join thousands building their sales machines
            </p>

            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 text-left space-y-6">
          {error && (
            <div className="rounded-md bg-red-100 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-black mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    className="w-full text-lg text-black placeholder-black/50 bg-transparent border-0 border-b-2 border-black/50 focus:border-black focus:outline-none py-3"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-black mb-2">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    required
                    className="w-full text-lg text-black placeholder-black/50 bg-transparent border-0 border-b-2 border-black/50 focus:border-black focus:outline-none py-3"
                    placeholder="Acme Inc."
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full text-lg text-black placeholder-black/50 bg-transparent border-0 border-b-2 border-black/50 focus:border-black focus:outline-none py-3"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
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
                    autoComplete="new-password"
                    required
                    className="w-full text-lg text-black placeholder-black/50 bg-transparent border-0 border-b-2 border-black/50 focus:border-black focus:outline-none py-3"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}