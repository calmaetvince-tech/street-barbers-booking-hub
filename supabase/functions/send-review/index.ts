import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  reviewEmailHtml,
  type BookingEmailData,
} from '../_shared/email-templates.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? 're_UpAbzN8r_JgjYpDCKWfXZK3fCUtvghQq5'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev'
const CRON_SECRET = Deno.env.get('CRON_SECRET')
const GOOGLE_REVIEW_URL = Deno.env.get('GOOGLE_REVIEW_URL') ?? 'https://g.page/r/streetbarbers/review'

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Europe/Athens',
  })
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `Street Barbers <${FROM_EMAIL}>`, to, subject, html }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status} → ${await res.text()}`)
}

Deno.serve(async (req) => {
  if (CRON_SECRET) {
    const auth = req.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const { data: bookings, error } = await supabase.rpc('get_review_bookings')

  if (error) {
    console.error('get_review_bookings error:', error)
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!bookings || bookings.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  }

  let sent = 0
  let failed = 0

  for (const booking of bookings) {
    if (!booking.customer_email) continue

    const emailData: BookingEmailData = {
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      barberName: booking.barber_name ?? 'Your barber',
      serviceName: booking.service_name ?? 'Service',
      servicePrice: booking.price_at_booking ?? null,
      locationName: booking.location_name ?? 'Street Barbers',
      locationAddress: booking.location_address ?? 'Rhodes, Greece',
      locationPhone: booking.location_phone ?? '',
      date: formatDate(booking.booking_date),
      time: booking.booking_time.slice(0, 5),
    }

    // Mark as sent FIRST to prevent double-sending
    await supabase
      .from('bookings')
      .update({ review_sent_at: new Date().toISOString() })
      .eq('id', booking.id)

    try {
      await sendEmail(
        booking.customer_email,
        `How was your visit at Street Barbers?`,
        reviewEmailHtml(emailData, GOOGLE_REVIEW_URL),
      )

      await supabase.from('email_logs').insert({
        booking_id: booking.id,
        email_type: 'review',
        recipient: booking.customer_email,
        status: 'sent',
      })

      sent++
    } catch (err) {
      console.error(`Review email failed for booking ${booking.id}:`, err)

      await supabase.from('email_logs').insert({
        booking_id: booking.id,
        email_type: 'review',
        recipient: booking.customer_email,
        status: 'failed',
        error_message: String(err instanceof Error ? err.message : err),
      })

      failed++
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, failed }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
})
