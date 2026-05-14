import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { confirmationEmailHtml, ownerNotificationHtml, type BookingEmailData } from '../_shared/email-templates.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const OWNER_EMAIL = 'calmaetvince@gmail.com'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'bookings@streetbarbers.gr'
const WEBHOOK_SECRET = Deno.env.get('BOOKING_WEBHOOK_SECRET')

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Europe/Athens',
  })
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `Street Barbers <${FROM_EMAIL}>`, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error ${res.status}: ${err}`)
  }
}

Deno.serve(async (req) => {
  // Verify webhook secret if configured
  if (WEBHOOK_SECRET) {
    const secret = req.headers.get('x-webhook-secret')
    if (secret !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  // Only handle INSERT on bookings
  if (payload.type !== 'INSERT' || payload.table !== 'bookings') {
    return new Response('OK', { status: 200 })
  }

  const booking = payload.record

  // Nothing to do without an email
  if (!booking?.customer_email) {
    return new Response('No email address', { status: 200 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  try {
    // Fetch related details in parallel
    const [{ data: barber }, { data: service }, { data: location }] = await Promise.all([
      supabase.from('barbers').select('name').eq('id', booking.barber_id).single(),
      supabase.from('services').select('name, price').eq('id', booking.service_id).single(),
      supabase.from('locations').select('name, address, phone').eq('id', booking.location_id).single(),
    ])

    const emailData: BookingEmailData = {
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      barberName: barber?.name ?? 'Your barber',
      serviceName: service?.name ?? 'Service',
      servicePrice: service?.price ?? null,
      locationName: location?.name ?? 'Street Barbers',
      locationAddress: location?.address ?? 'Rhodes, Greece',
      locationPhone: location?.phone ?? '',
      date: formatDate(booking.booking_date),
      time: booking.booking_time.slice(0, 5),
    }

    const subject = `Your booking at Street Barbers is confirmed — ${emailData.date} at ${emailData.time}`
    const ownerSubject = `New booking: ${booking.customer_name} — ${emailData.date} at ${emailData.time}`

    // Send both emails, capture results independently (never throw)
    const [customerResult, ownerResult] = await Promise.allSettled([
      sendEmail(booking.customer_email, subject, confirmationEmailHtml(emailData)),
      sendEmail(OWNER_EMAIL, ownerSubject, ownerNotificationHtml(emailData)),
    ])

    // Log both results
    await supabase.from('email_logs').insert([
      {
        booking_id: booking.id,
        email_type: 'confirmation',
        recipient: booking.customer_email,
        status: customerResult.status === 'fulfilled' ? 'sent' : 'failed',
        error_message: customerResult.status === 'rejected' ? String(customerResult.reason) : null,
      },
      {
        booking_id: booking.id,
        email_type: 'confirmation',
        recipient: OWNER_EMAIL,
        status: ownerResult.status === 'fulfilled' ? 'sent' : 'failed',
        error_message: ownerResult.status === 'rejected' ? String(ownerResult.reason) : null,
      },
    ])

    // Mark confirmation sent if at least the customer email went out
    if (customerResult.status === 'fulfilled') {
      await supabase.from('bookings')
        .update({ confirmation_sent_at: new Date().toISOString() })
        .eq('id', booking.id)
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    // Log unexpected errors but never return 5xx to Supabase (it would retry)
    console.error('send-confirmation unexpected error:', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
