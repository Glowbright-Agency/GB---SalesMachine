import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { VAPIClient } from '@/services/voice/vapiClient'

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

    // Get campaign with business info
    const { data: campaign } = await supabase
      .from('campaigns')
      .select(`
        *,
        businesses!inner(
          id,
          user_id,
          business_name,
          value_proposition,
          analysis_data
        )
      `)
      .eq('id', campaignId)
      .eq('businesses.user_id', user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Check if campaign has calling enabled
    if (campaign.search_parameters.serviceOption !== 'scraping_calling') {
      return NextResponse.json({ error: 'Campaign does not have calling enabled' }, { status: 400 })
    }

    // Get leads with contact info
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds)
      .eq('campaign_id', campaignId)
      .eq('status', 'enriched')
      .not('contact_phone', 'is', null)

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No enriched leads with phone numbers found' }, { status: 404 })
    }

    // Initialize VAPI client
    const vapiClient = new VAPIClient()

    // Create or get campaign assistant
    let assistantId = campaign.vapi_assistant_id
    if (!assistantId) {
      assistantId = await vapiClient.createCampaignAssistant(campaign, campaign.businesses)
      
      // Save assistant ID to campaign
      await supabase
        .from('campaigns')
        .update({ vapi_assistant_id: assistantId })
        .eq('id', campaignId)
    }

    // Initiate calls for each lead
    const callPromises = leads.map(async (lead) => {
      try {
        // Generate personalized script
        const { systemPrompt, firstMessage } = await vapiClient.generateSalesScript(
          campaign.businesses,
          lead.contact_title,
          lead
        )

        // Update assistant with personalized script
        await vapiClient.updateAssistant(assistantId, {
          systemPrompt,
          firstMessage
        })

        // Make the call
        const call = await vapiClient.makeCall({
          assistantId,
          phoneNumber: lead.contact_phone,
          customer: {
            name: lead.contact_name || lead.business_name,
            email: lead.contact_email,
            number: lead.contact_phone
          },
          metadata: {
            leadId: lead.id,
            campaignId: campaign.id,
            businessName: lead.business_name
          }
        })

        // Create call log
        await supabase
          .from('call_logs')
          .insert({
            lead_id: lead.id,
            campaign_id: campaignId,
            vapi_call_id: call.id,
            phone_number_from: 'VAPI',
            phone_number_to: lead.contact_phone,
            outcome: 'initiated',
            vapi_data: call,
            created_at: new Date().toISOString()
          })

        // Update lead status
        await supabase
          .from('leads')
          .update({
            status: 'calling',
            called_at: new Date().toISOString()
          })
          .eq('id', lead.id)

        return { leadId: lead.id, callId: call.id, status: 'initiated' }
      } catch (error) {
        console.error(`Failed to call lead ${lead.id}:`, error)
        return { leadId: lead.id, error: (error as Error).message, status: 'failed' }
      }
    })

    const results = await Promise.all(callPromises)

    // Create billing transactions for successful calls
    const successfulCalls = results.filter(r => r.status === 'initiated')
    if (successfulCalls.length > 0) {
      await supabase
        .from('billing_transactions')
        .insert({
          user_id: user.id,
          campaign_id: campaignId,
          type: 'lead_called',
          amount: successfulCalls.length * 7,
          credits_used: successfulCalls.length * 7,
          description: `Initiated ${successfulCalls.length} calls`
        })
    }

    return NextResponse.json({ 
      success: true,
      results,
      calls_initiated: successfulCalls.length,
      calls_failed: results.filter(r => r.status === 'failed').length
    })
    
  } catch (error) {
    console.error('Call initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate calls' },
      { status: 500 }
    )
  }
}