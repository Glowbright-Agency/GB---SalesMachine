import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's active business knowledge base
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !business) {
      return NextResponse.json({ error: 'No business knowledge base found' }, { status: 404 })
    }

    // Create comprehensive knowledge base from both website analysis AND discovery answers
    const comprehensiveKnowledgeBase = {
      // Website Analysis Data
      ...(business.analysis_data || {}),
      
      // Discovery Questions & Answers (the 7 critical questions)
      discoveryAnswers: business.discovery_answers || {},
      
      // Additional business metadata
      businessMetadata: {
        businessId: business.id,
        userId: business.user_id,
        websiteUrl: business.website_url,
        createdAt: business.created_at,
        updatedAt: business.updated_at,
        isActive: business.is_active
      }
    }

    return NextResponse.json({ 
      success: true,
      business: business,
      knowledgeBase: comprehensiveKnowledgeBase 
    })

  } catch (error) {
    console.error('Error fetching knowledge base:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch knowledge base' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId, knowledgeBase, discoveryAnswers } = await request.json()

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    // Update the business knowledge base
    const updateData: any = {}
    if (knowledgeBase) updateData.analysis_data = knowledgeBase
    if (discoveryAnswers) updateData.discovery_answers = discoveryAnswers
    updateData.updated_at = new Date().toISOString()

    const { data: business, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', businessId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating knowledge base:', error)
      return NextResponse.json({ error: 'Failed to update knowledge base' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      business: business
    })

  } catch (error) {
    console.error('Error updating knowledge base:', error)
    return NextResponse.json({ 
      error: 'Failed to update knowledge base' 
    }, { status: 500 })
  }
}