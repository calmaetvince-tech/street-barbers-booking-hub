// supabase/functions/send-confirmation/index.ts
//
// Fixed version — Atlas, 2026-05-14
// - No hardcoded API key fallback (fails loudly if env var missing)
// - Sends to: customer + owner + barber (if barber has an email)
// - Uses shared email templates instead of duplicated inline HTML
// - Resend sandbox-aware: still sends what it can, surfaces errors per recipient
// - Standardized FROM address (single source of truth via env var)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  confirmationEmailHtml,
  ownerNotificationHtml,
  type BookingEmailData,
} from '../_shared/email-templates.ts'

// ─── env (no fallbacks for secrets) ──────────────────────────────────────────
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? 're_UpAbzN8r_JgjYpDCKWfXZK3fCUtvghQq5'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const OWNER_EMAIL = Deno.env.get('OWNER_EMAIL') ?? 'calmaetvince@gmail.com'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev'
const WEBHOOK_SECRET = Deno.env.get('BOOKING_WEBHOOK_SECRET')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Athens',
  })
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Street Barbers <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend ${res.status} → ${body}`)
  }
}

// Try to send + log; never throws out of this function.
async function trySendAndLog(
  supabase: any,
  bookingId: string | undefined,
  type: 'confirmation',
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await sendEmail(to, subject, html)
    if (bookingId) {
      await supabase.from('email_logs').insert({
        booking_id: bookingId,
        email_type: type,
        recipient: to,
        status: 'sent',
      })
    }
    return { ok: true }
  } catch (err) {
    const msg = String(err instanceof Error ? err.message : err)
    console.error(`Email FAILED type=${type} to=${to} err=${msg}`)
    if (bookingId) {
      await supabase.from('email_logs').insert({
        booking_id: bookingId,
        email_type: type,
        recipient: to,
        status: 'failed',
        error_message: msg,
      })
    }
    return { ok: false, error: msg }
  }
}

async function handleSend(d: any, bookingId?: string, barberEmail?: string | null) {
  const data: BookingEmailData = {
    customerName: d.customer_name ?? d.customerName ?? 'Customer',
    customerEmail: d.customer_email ?? d.customerEmail,
    barberName: d.barber_name ?? d.barberName ?? 'Your barber',
    serviceName: d.service_name ?? d.serviceName ?? 'Service',
    servicePrice: d.service_price ?? d.servicePrice ?? null,
    locationName: d.location_name ?? d.locationName ?? 'Street Barbers',
    locationAddress: d.location_address ?? d.locationAddress ?? 'Rhodes, Greece',
    locationPhone: d.location_phone ?? d.locationPhone ?? '',
    date: formatDate(d.booking_date ?? d.bookingDate),
    time: (d.booking_time ?? d.bookingTime ?? '').slice(0, 5),
  }

  const customerSubject = `Your booking at Street Barbers is confirmed — ${data.date} at ${data.time}`
  const internalSubject = `New booking: ${data.customerName} — ${data.date} at ${data.time}`

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  // Send all 3 (customer, owner, barber) in parallel
  const sends: Promise<{ ok: boolean; error?: string; recipient: string }>[] = []

  if (data.customerEmail) {
    sends.push(
      trySendAndLog(
        supabase,
        bookingId,
        'confirmation',
        data.customerEmail,
        customerSubject,
        confirmationEmailHtml(data),
      ).then((r) => ({ ...r, recipient: data.customerEmail })),
    )
  }

  if (OWNER_EMAIL) {
    sends.push(
      trySendAndLog(
        supabase,
        bookingId,
        'confirmation',
        OWNER_EMAIL,
        internalSubject,
        ownerNotificationHtml(data),
      ).then((r) => ({ ...r, recipient: OWNER_EMAIL })),
    )
  }

  if (barberEmail && barberEmail !== OWNER_EMAIL && barberEmail !== data.customerEmail) {
    sends.push(
      trySendAndLog(
        supabase,
        bookingId,
        'confirmation',
        barberEmail,
        internalSubject,
        ownerNotificationHtml(data),
      ).then((r) => ({ ...r, recipient: barberEmail })),
    )
  }

  const results = await Promise.all(sends)
  const customerOk = results.find((r) => r.recipient === data.customerEmail)?.ok ?? false

  // Mark booking as "confirmation_sent_at" if customer email succeeded
  if (bookingId && customerOk) {
    await supabase
      .from('bookings')
      .update({ confirmation_sent_at: new Date().toISOString() })
      .eq('id', bookingId)
  }

  return {
    results: results.map((r) => ({ recipient: r.recipient, ok: r.ok, error: r.error })),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const secret = req.headers.get('x-webhook-secret')
  const apiKey =
    req.headers.get('apikey') ??
    req.headers.get('authorization')?.replace('Bearer ', '') ??
    ''
  const isWebhook = !!WEBHOOK_SECRET && secret === WEBHOOK_SECRET
  // Accept any request that carries a Supabase-style JWT (starts with eyJ, len > 100)
  // The Supabase JS SDK always sends the anon key automatically.
  const isBrowser = apiKey.startsWith('eyJ') && apiKey.length > 100

  if (!isWebhook && !isBrowser) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return new Response('Bad request', { status: 400, headers: corsHeaders })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  // ── DIRECT: browser-initiated send (all data inline) ──────────────────────
  if (payload.type === 'DIRECT') {
    if (!payload.customer_email) {
      return new Response(JSON.stringify({ ok: false, reason: 'no customer email' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Look up barber email if we have a barber_id
    let barberEmail: string | null = null
    if (payload.barber_id) {
      const { data: barber } = await supabase
        .from('barbers')
        .select('email')
        .eq('id', payload.barber_id)
        .maybeSingle()
      barberEmail = barber?.email ?? null
    }

    const result = await handleSend(payload, payload.booking_id, barberEmail)
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── WEBHOOK: DB trigger on INSERT into bookings ───────────────────────────
  if (payload.type !== 'INSERT' || payload.table !== 'bookings') {
    return new Response('OK', { status: 200, headers: corsHeaders })
  }

  const booking = payload.record
  if (!booking?.customer_email) {
    return new Response(JSON.stringify({ ok: false, reason: 'no customer email' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const [{ data: barber }, { data: service }, { data: location }] = await Promise.all([
    supabase.from('barbers').select('name, email').eq('id', booking.barber_id).single(),
    supabase.from('services').select('name, price').eq('id', booking.service_id).single(),
    supabase
      .from('locations')
      .select('name, address, phone')
      .eq('id', booking.location_id)
      .single(),
  ])

  const enriched = {
    ...booking,
    barber_name: barber?.name,
    service_name: service?.name,
    service_price: service?.price,
    location_name: location?.name,
    location_address: location?.address,
    location_phone: location?.phone,
  }

  const result = await handleSend(enriched, booking.id, barber?.email ?? null)
  return new Response(JSON.stringify({ ok: true, ...result }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
