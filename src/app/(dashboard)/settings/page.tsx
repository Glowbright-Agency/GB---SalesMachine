'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  full_name: string
  company_name: string
  created_at: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: ''
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setFormData({
          full_name: data.full_name || '',
          company_name: data.company_name || '',
          email: data.email || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          company_name: formData.company_name,
        })
        .eq('id', user.id)

      if (error) {
        alert('Failed to update profile')
      } else {
        alert('Profile updated successfully!')
        loadProfile()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="bg-purple-300 rounded-3xl mx-4 min-h-[calc(100vh-160px)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
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
              Account Settings
            </h1>
            <p className="text-lg text-gray-600">
              Manage your account information and preferences
            </p>
          </div>

          <div className="space-y-8">
            
            {/* Profile Settings */}
            <div className="border border-black rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full text-lg text-gray-600 placeholder-gray-500 bg-transparent border-0 border-b-2 border-gray-700 focus:border-gray-900 focus:outline-none py-3"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    className="w-full text-lg text-gray-600 placeholder-gray-500 bg-transparent border-0 border-b-2 border-gray-700 focus:border-gray-900 focus:outline-none py-3"
                    placeholder="Enter your company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full text-lg text-gray-400 bg-gray-50 border-0 border-b-2 border-gray-300 py-3 cursor-not-allowed"
                    placeholder="Email cannot be changed"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email address cannot be changed</p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Account Information */}
            <div className="border border-black rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700">Account Created</span>
                  <span className="text-gray-900 font-medium">
                    {profile ? new Date(profile.created_at).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700">Account ID</span>
                  <span className="text-gray-900 font-mono text-sm">
                    {profile?.id?.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-700">Account Status</span>
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-black rounded-2xl shadow-xl p-8 border-l-4 border-red-500">
              <h2 className="text-2xl font-bold text-red-900 mb-6">Danger Zone</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h3>
                  <p className="text-gray-600 mb-4">
                    Sign out of your account. You'll need to sign in again to access your dashboard.
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
                
                <hr className="my-6" />
                
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Delete Account</h3>
                  <p className="text-gray-600 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => alert('Account deletion is not yet implemented. Please contact support.')}
                    className="bg-red-700 text-white px-6 py-2 rounded-full font-medium hover:bg-red-800 transition-all"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}