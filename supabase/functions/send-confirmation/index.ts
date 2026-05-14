import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? 're_UpAbzN8r_JgjYpDCKWfXZK3fCUtvghQq5'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const OWNER_EMAIL = 'calmaetvince@gmail.com'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev'
const WEBHOOK_SECRET = Deno.env.get('BOOKING_WEBHOOK_SECRET')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

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
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`)
}

const row = (label: string, value: string) =>
  `<tr><td style="padding:11px 0;border-bottom:1px solid #f0f0f0;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#999;white-space:nowrap">${label}</td><td style="padding:11px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111;font-weight:500;text-align:right;padding-left:24px">${value}</td></tr>`

const wrap = (header: string, body: string) =>
  `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f2f2f2;font-family:Helvetica,Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:40px 16px"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff"><tr><td style="background:#0a0a0a;padding:28px 40px 24px;text-align:center"><h1 style="margin:0;font-size:24px;letter-spacing:.18em;color:#fff;font-weight:700;font-family:Georgia,serif;text-transform:uppercase">Street Barbers</h1><p style="margin:8px 0 0;font-size:12px;letter-spacing:.2em;color:#888;text-transform:uppercase">${header}</p></td></tr>${body}<tr><td style="padding:20px 40px;text-align:center;border-top:1px solid #eee"><p style="margin:0;font-size:11px;color:#aaa">&copy; 2026 Street Barbers &middot; Rhodes, Greece</p></td></tr></table></td></tr></table></body></html>`

function confirmHtml(d: any): string {
  return wrap('Booking Confirmed',
    `<tr><td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid #eee"><h2 style="margin:0 0 10px;font-size:20px;color:#111;font-weight:600">Your appointment is confirmed.</h2><p style="margin:0;font-size:14px;color:#666">Hi ${d.customerName}, we look forward to seeing you.</p></td></tr><tr><td style="padding:28px 40px 8px"><table width="100%" cellpadding="0" cellspacing="0">${row('Service',d.serviceName)}${row('Barber',d.barberName)}${row('Date',d.date)}${row('Time',d.time)}${row('Location',d.locationName)}${row('Address',d.locationAddress)}${d.servicePrice!=null?row('Price',`€${d.servicePrice}`):''}${row('Phone',d.locationPhone)}</table></td></tr><tr><td style="padding:20px 40px 28px;background:#fafafa;border-top:1px solid #eee"><p style="margin:0;font-size:13px;color:#777;text-align:center">Need to cancel or reschedule? Call <strong style="color:#111">${d.locationPhone}</strong>.</p></td></tr>`
  )
}

function ownerHtml(d: any): string {
  return wrap('New Booking',
    `<tr><td style="padding:28px 40px 8px"><table width="100%" cellpadding="0" cellspacing="0">${row('Customer',d.customerName)}${row('Email',d.customerEmail)}${row('Service',d.serviceName)}${row('Barber',d.barberName)}${row('Date',d.date)}${row('Time',d.time)}${row('Location',d.locationName)}${d.servicePrice!=null?row('Price',`€${d.servicePrice}`):''}${row('Phone',d.locationPhone)}</table></td></tr><tr><td style="padding:12px 40px 32px"></td></tr>`
  )
}

async function handleSend(d: any, bookingId?: string) {
  const emailData = {
    customerName: d.customer_name ?? d.customerName,
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

  const subject = `Your booking at Street Barbers is confirmed — ${emailData.date} at ${emailData.time}`
  const ownerSubject = `New booking: ${emailData.customerName} — ${emailData.date} at ${emailData.time}`

  const [customerResult, ownerResult] = await Promise.allSettled([
    sendEmail(emailData.customerEmail, subject, confirmHtml(emailData)),
    sendEmail(OWNER_EMAIL, ownerSubject, ownerHtml(emailData)),
  ])

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  if (bookingId) {
    await supabase.from('email_logs').insert([
      { booking_id: bookingId, email_type: 'confirmation', recipient: emailData.customerEmail, status: customerResult.status === 'fulfilled' ? 'sent' : 'failed', error_message: customerResult.status === 'rejected' ? String((customerResult as any).reason) : null },
      { booking_id: bookingId, email_type: 'confirmation', recipient: OWNER_EMAIL, status: ownerResult.status === 'fulfilled' ? 'sent' : 'failed', error_message: ownerResult.status === 'rejected' ? String((ownerResult as any).reason) : null },
    ])
    if (customerResult.status === 'fulfilled') {
      await supabase.from('bookings').update({ confirmation_sent_at: new Date().toISOString() }).eq('id', bookingId)
    }
  }

  return { customer: customerResult.status, owner: ownerResult.status }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const secret = req.headers.get('x-webhook-secret')
  const apiKey = req.headers.get('apikey') ?? req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  const isWebhook = !!WEBHOOK_SECRET && secret === WEBHOOK_SECRET
  const isBrowser = !!SUPABASE_ANON_KEY && (apiKey === SUPABASE_ANON_KEY || apiKey === SUPABASE_SERVICE_ROLE_KEY)

  if (!isWebhook && !isBrowser) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  let payload: any
  try { payload = await req.json() } catch { return new Response('Bad request', { status: 400, headers: corsHeaders }) }

  // DIRECT: called from browser with all data inline
  if (payload.type === 'DIRECT') {
    if (!payload.customer_email) return new Response('No email', { status: 200, headers: corsHeaders })
    const result = await handleSend(payload, payload.booking_id)
    return new Response(JSON.stringify({ ok: true, ...result }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  // WEBHOOK: called by DB trigger on INSERT
  if (payload.type !== 'INSERT' || payload.table !== 'bookings') {
    return new Response('OK', { status: 200, headers: corsHeaders })
  }

  const booking = payload.record
  if (!booking?.customer_email) return new Response('No email', { status: 200, headers: corsHeaders })

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const [{ data: barber }, { data: service }, { data: location }] = await Promise.all([
    supabase.from('barbers').select('name').eq('id', booking.barber_id).single(),
    supabase.from('services').select('name, price').eq('id', booking.service_id).single(),
    supabase.from('locations').select('name, address, phone').eq('id', booking.location_id).single(),
  ])

  const enriched = { ...booking, barber_name: barber?.name, service_name: service?.name, service_price: service?.price, location_name: location?.name, location_address: location?.address, location_phone: location?.phone }
  const result = await handleSend(enriched, booking.id)
  return new Response(JSON.stringify({ ok: true, ...result }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
