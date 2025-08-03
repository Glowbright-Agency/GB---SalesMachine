'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CreditDisplay() {
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCredits()
  }, [])

  const loadCredits = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single()
        
        setCredits(userData?.credits || 0)
      }
    } catch (error) {
      console.error('Error loading credits:', error)
      setCredits(0)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Credits:</span>
          <span className="font-semibold text-gray-900">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Credits:</span>
        <span className="font-semibold text-gray-900">{credits.toLocaleString()}</span>
      </div>
    </div>
  )
}