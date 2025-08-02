'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo and Navigation */}
      <header className="bg-white px-8 py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Sales Machine" className="h-8 w-auto" />
            </div>
            
            <nav className="flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium ${
                  pathname === '/dashboard' 
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/campaigns" 
                className={`text-sm font-medium ${
                  pathname === '/campaigns' 
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Campaigns
              </Link>
              <Link 
                href="/leads" 
                className={`text-sm font-medium ${
                  pathname === '/leads' 
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Leads
              </Link>
              <Link 
                href="/scrape-leads" 
                className={`text-sm font-medium ${
                  pathname === '/scrape-leads' 
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Scrape Leads
              </Link>
              <Link 
                href="/business-profile" 
                className={`text-sm font-medium ${
                  pathname === '/business-profile' 
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Business Profile
              </Link>
              <Link 
                href="/billing" 
                className={`text-sm font-medium ${
                  pathname === '/billing' 
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Billing
              </Link>
            </nav>
          </div>

          {/* Right side - New Campaign, Settings and Logout */}
          <div className="flex items-center gap-4">
            <Link href="/campaigns/new" className="bg-gray-900 text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-all">
              New Campaign
            </Link>
            <Link href="/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}