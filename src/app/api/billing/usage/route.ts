import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's credit balance
    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    // Get usage statistics
    const { data: transactions } = await supabase
      .from('billing_transactions')
      .select('type, credits_used, credits_added')
      .eq('user_id', user.id)

    // Calculate totals
    let totalCreditsAdded = 0
    let totalCreditsUsed = 0
    let leadsScraped = 0
    let leadsCalled = 0
    let appointmentsBooked = 0

    transactions?.forEach(transaction => {
      if (transaction.type === 'credit_purchase' && transaction.credits_added) {
        totalCreditsAdded += transaction.credits_added
      }
      if (transaction.credits_used) {
        totalCreditsUsed += transaction.credits_used
      }

      // Count activities
      if (transaction.type === 'lead_scraped' && transaction.credits_used) {
        leadsScraped += transaction.credits_used / 4 // $4 per lead
      }
      if (transaction.type === 'lead_called' && transaction.credits_used) {
        leadsCalled += transaction.credits_used / 7 // $7 per call
      }
      if (transaction.type === 'appointment_booked' && transaction.credits_used) {
        appointmentsBooked += transaction.credits_used / 3 // $3 per appointment
      }
    })

    const usage = {
      totalCredits: totalCreditsAdded,
      creditsUsed: totalCreditsUsed,
      creditsRemaining: userData?.credits || 0,
      leadsScraped: Math.floor(leadsScraped),
      leadsCalled: Math.floor(leadsCalled),
      appointmentsBooked: Math.floor(appointmentsBooked)
    }

    return NextResponse.json({ usage })
    
  } catch (error) {
    console.error('Error fetching usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}