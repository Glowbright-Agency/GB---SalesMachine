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
    <div className="min-h-screen bg-black">
      {/* Header with Logo and Navigation */}
      <header className="bg-black px-8 py-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer">
              <img src="/logo.svg" alt="Sales Machine" className="h-8 w-auto" />
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium ${
                  pathname === '/dashboard' 
                    ? 'text-white border-b-2 border-white pb-1' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/campaigns" 
                className={`text-sm font-medium ${
                  pathname === '/campaigns' 
                    ? 'text-white border-b-2 border-white pb-1' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Campaigns
              </Link>
              <Link 
                href="/leads" 
                className={`text-sm font-medium ${
                  pathname === '/leads' 
                    ? 'text-white border-b-2 border-white pb-1' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Leads
              </Link>
              <Link 
                href="/scrape-leads" 
                className={`text-sm font-medium ${
                  pathname === '/scrape-leads' 
                    ? 'text-white border-b-2 border-white pb-1' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Scrape Leads
              </Link>
              <Link 
                href="/business-profile" 
                className={`text-sm font-medium ${
                  pathname === '/business-profile' 
                    ? 'text-white border-b-2 border-white pb-1' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Business Profile
              </Link>
              <Link 
                href="/billing" 
                className={`text-sm font-medium ${
                  pathname === '/billing' 
                    ? 'text-white border-b-2 border-white pb-1' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Billing
              </Link>
            </nav>
          </div>

          {/* Right side - New Campaign, Settings and Logout */}
          <div className="flex items-center gap-4">
            <Link href="/campaigns/new" className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-all">
              New Campaign
            </Link>
            <Link href="/settings" className="text-sm font-medium text-gray-300 hover:text-white">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-300 hover:text-white"
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