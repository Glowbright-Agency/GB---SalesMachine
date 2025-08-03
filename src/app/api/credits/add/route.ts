import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authentication check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount } = await request.json()
    
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // For testing purposes, allow easy credit top-up
    // In production, this would integrate with Stripe or payment provider
    
    // Add credits to user account
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits: amount 
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user credits:', updateError)
      return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
    }

    // Record billing transaction
    const { error: transactionError } = await supabase
      .from('billing_transactions')
      .insert({
        user_id: user.id,
        type: 'credit_purchase',
        amount: amount * 0.01, // Assume $0.01 per credit for testing
        credits_added: amount,
        description: `Added ${amount} credits for testing`,
        related_id: null
      })

    if (transactionError) {
      console.error('Error recording transaction:', transactionError)
      // Don't fail the request if transaction logging fails
    }

    // Get updated user data
    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ 
      success: true, 
      credits_added: amount,
      total_credits: userData?.credits || 0,
      message: `Successfully added ${amount} credits for testing`
    })
    
  } catch (error) {
    console.error('Add credits error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}