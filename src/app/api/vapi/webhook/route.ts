import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { VAPIClient } from '@/services/voice/vapiClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, call, message } = body

    // Initialize Supabase with service role for webhook handling
    const supabase = await createClient()
    const vapiClient = new VAPIClient()

    console.log(`VAPI Webhook: ${type}`, { callId: call?.id })

    switch (type) {
      case 'call-started':
        await handleCallStarted(supabase, call)
        break

      case 'call-ended':
        await handleCallEnded(supabase, call)
        break

      case 'transcript':
        await handleTranscript(supabase, call, message)
        break

      case 'function-call':
        if (body.function?.name === 'bookAppointment') {
          await handleAppointmentBooking(supabase, call, body.function.arguments)
        }
        break

      case 'end-of-call-report':
        await handleEndOfCallReport(supabase, call, body.report)
        break

      default:
        console.log(`Unhandled webhook type: ${type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('VAPI webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCallStarted(supabase: any, call: any) {
  // Update call log
  await supabase
    .from('call_logs')
    .update({
      started_at: new Date().toISOString(),
      outcome: 'in_progress'
    })
    .eq('vapi_call_id', call.id)
}

async function handleCallEnded(supabase: any, call: any) {
  // Determine outcome based on call data
  let outcome = 'completed'
  if (call.endedReason === 'no-answer') {
    outcome = 'no_answer'
  } else if (call.endedReason === 'voicemail') {
    outcome = 'voicemail'
  } else if (call.endedReason === 'busy') {
    outcome = 'busy'
  } else if (call.endedReason === 'failed') {
    outcome = 'failed'
  }

  // Update call log
  const { data: callLog } = await supabase
    .from('call_logs')
    .update({
      ended_at: new Date().toISOString(),
      duration_seconds: call.duration || 0,
      outcome,
      cost: call.cost || 0,
      recording_url: call.recordingUrl,
      vapi_data: call
    })
    .eq('vapi_call_id', call.id)
    .select('lead_id')
    .single()

  if (callLog) {
    // Update lead status
    await supabase
      .from('leads')
      .update({
        status: 'called'
      })
      .eq('id', callLog.lead_id)
  }
}

async function handleTranscript(supabase: any, call: any, message: any) {
  // Append to transcript
  const { data: callLog } = await supabase
    .from('call_logs')
    .select('transcript')
    .eq('vapi_call_id', call.id)
    .single()

  const currentTranscript = callLog?.transcript || ''
  const newLine = `${message.role}: ${message.content}\n`

  await supabase
    .from('call_logs')
    .update({
      transcript: currentTranscript + newLine
    })
    .eq('vapi_call_id', call.id)
}

async function handleAppointmentBooking(supabase: any, call: any, appointmentData: any) {
  // Get call log with lead info
  const { data: callLog } = await supabase
    .from('call_logs')
    .select('lead_id, campaign_id')
    .eq('vapi_call_id', call.id)
    .single()

  if (!callLog) return

  // Get lead details
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', callLog.lead_id)
    .single()

  if (!lead) return

  // Create appointment
  const { data: appointment } = await supabase
    .from('appointments')
    .insert({
      lead_id: callLog.lead_id,
      call_log_id: call.id,
      campaign_id: callLog.campaign_id,
      scheduled_time: appointmentData.scheduledTime,
      duration_minutes: appointmentData.duration || 30,
      meeting_type: appointmentData.meetingType || 'phone',
      attendee_name: lead.contact_name || lead.business_name,
      attendee_email: lead.contact_email,
      attendee_phone: lead.contact_phone,
      notes: appointmentData.notes || 'Appointment booked via automated call',
      status: 'scheduled'
    })
    .select()
    .single()

  if (appointment) {
    // Update call log
    await supabase
      .from('call_logs')
      .update({
        outcome: 'appointment_booked'
      })
      .eq('vapi_call_id', call.id)

    // Update lead status
    await supabase
      .from('leads')
      .update({
        status: 'converted'
      })
      .eq('id', callLog.lead_id)

    // Get user for billing
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('businesses(user_id)')
      .eq('id', callLog.campaign_id)
      .single()

    if (campaign?.businesses?.user_id) {
      // Create billing transaction for appointment
      await supabase
        .from('billing_transactions')
        .insert({
          user_id: campaign.businesses.user_id,
          campaign_id: callLog.campaign_id,
          type: 'appointment_booked',
          amount: 3,
          credits_used: 3,
          related_id: appointment.id,
          description: `Appointment booked with ${lead.business_name}`
        })
    }
  }
}

async function handleEndOfCallReport(supabase: any, call: any, report: any) {
  // Store the full report for analysis
  await supabase
    .from('call_logs')
    .update({
      vapi_data: {
        ...call,
        endOfCallReport: report
      }
    })
    .eq('vapi_call_id', call.id)

  // Extract key metrics
  const sentiment = report.sentiment || 'neutral'
  const appointmentBooked = report.appointmentBooked || false
  const followUpNeeded = report.followUpNeeded || false

  // You can add more sophisticated analysis here
  console.log(`Call ${call.id} completed:`, {
    sentiment,
    appointmentBooked,
    followUpNeeded
  })
}