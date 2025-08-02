import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContactOutClient } from '@/services/enrichment/contactOut'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadIds, campaignId } = await request.json()

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'Lead IDs are required' }, { status: 400 })
    }

    // Get campaign to verify ownership and get target roles
    const { data: campaign } = await supabase
      .from('campaigns')
      .select(`
        id,
        businesses!inner(
          user_id,
          analysis_data
        )
      `)
      .eq('id', campaignId)
      .eq('businesses.user_id', user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get leads
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds)
      .eq('campaign_id', campaignId)

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No leads found' }, { status: 404 })
    }

    // Extract target roles from campaign analysis
    const targetRoles = campaign.businesses?.[0]?.analysis_data?.decisionMakerRoles?.map(
      (role: any) => role.title
    ) || ['CEO', 'Founder', 'Owner', 'President']

    // Enrich leads with ContactOut
    const contactOut = new ContactOutClient()
    const enrichedLeads = await contactOut.batchEnrichLeads(leads, targetRoles)

    // Update leads in database
    let enrichedCount = 0
    for (const enrichedLead of enrichedLeads) {
      const { error } = await supabase
        .from('leads')
        .update({
          contact_name: enrichedLead.contact_name,
          contact_title: enrichedLead.contact_title,
          contact_email: enrichedLead.contact_email,
          contact_phone: enrichedLead.contact_phone,
          contact_linkedin: enrichedLead.contact_linkedin,
          enrichment_data: enrichedLead.enrichment_data,
          status: enrichedLead.status,
          enriched_at: enrichedLead.status === 'enriched' ? new Date().toISOString() : null
        })
        .eq('id', enrichedLead.id)

      if (!error && enrichedLead.status === 'enriched') {
        enrichedCount++
      }
    }

    // Create billing transaction for enriched leads
    if (enrichedCount > 0) {
      await supabase
        .from('billing_transactions')
        .insert({
          user_id: user.id,
          campaign_id: campaignId,
          type: 'lead_enriched',
          amount: enrichedCount * 2, // Assuming $2 per enrichment
          credits_used: enrichedCount * 2,
          description: `Enriched ${enrichedCount} leads with contact information`
        })
    }

    return NextResponse.json({ 
      success: true,
      enriched_count: enrichedCount,
      total_leads: leads.length
    })
    
  } catch (error) {
    console.error('Enrichment error:', error)
    return NextResponse.json(
      { error: 'Failed to enrich leads' },
      { status: 500 }
    )
  }
}