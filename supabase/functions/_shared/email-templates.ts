export type BookingEmailData = {
  customerName: string
  customerEmail: string
  barberName: string
  serviceName: string
  servicePrice: number | null
  locationName: string
  locationAddress: string
  locationPhone: string
  date: string
  time: string
}

const row = (label: string, value: string) => `
  <tr>
    <td style="padding:11px 0;border-bottom:1px solid #f0f0f0;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#999;white-space:nowrap;">${label}</td>
    <td style="padding:11px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111;font-weight:500;text-align:right;padding-left:24px;">${value}</td>
  </tr>`

const mapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Rhodes, Greece')}`

const base = (headerLine: string, body: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Street Barbers</title>
</head>
<body style="margin:0;padding:0;background:#f2f2f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:40px 16px;">
  <tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;">

    <!-- Header -->
    <tr>
      <td style="background:#0a0a0a;padding:28px 40px 24px;text-align:center;">
        <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.45em;color:#555;text-transform:uppercase;">Rhodes, Greece</p>
        <h1 style="margin:0;font-size:24px;letter-spacing:0.18em;color:#fff;font-weight:700;font-family:Georgia,'Times New Roman',serif;text-transform:uppercase;">Street Barbers</h1>
        <p style="margin:8px 0 0;font-size:12px;letter-spacing:0.2em;color:#888;text-transform:uppercase;">${headerLine}</p>
      </td>
    </tr>

    ${body}

    <!-- Footer -->
    <tr>
      <td style="padding:20px 40px;text-align:center;border-top:1px solid #eee;">
        <p style="margin:0;font-size:11px;color:#aaa;letter-spacing:0.08em;">© 2026 Street Barbers · Rhodes, Greece</p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`

export const confirmationEmailHtml = (d: BookingEmailData): string =>
  base('Booking Confirmed', `
    <!-- Greeting -->
    <tr>
      <td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid #eee;">
        <h2 style="margin:0 0 10px;font-size:20px;color:#111;font-weight:600;letter-spacing:-0.01em;">Your appointment is confirmed.</h2>
        <p style="margin:0;font-size:14px;color:#666;line-height:1.65;">Hi ${d.customerName}, we look forward to seeing you.</p>
      </td>
    </tr>

    <!-- Details -->
    <tr>
      <td style="padding:28px 40px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${row('Service', d.serviceName)}
          ${row('Barber', d.barberName)}
          ${row('Date', d.date)}
          ${row('Time', d.time)}
          ${row('Location', d.locationName)}
          ${row('Address', d.locationAddress)}
          ${d.servicePrice != null ? row('Price', `€${d.servicePrice}`) : ''}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:32px 40px;text-align:center;">
        <a href="${mapsUrl(d.locationAddress)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 36px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;">Get Directions</a>
      </td>
    </tr>

    <!-- Cancel note -->
    <tr>
      <td style="padding:20px 40px 28px;background:#fafafa;border-top:1px solid #eee;border-bottom:1px solid #eee;">
        <p style="margin:0;font-size:13px;color:#777;text-align:center;line-height:1.65;">
          Need to cancel or reschedule? Reply to this email or call <strong style="color:#111;">${d.locationPhone}</strong>.
        </p>
      </td>
    </tr>
  `)

export const reminderEmailHtml = (d: BookingEmailData): string =>
  base('Appointment Reminder', `
    <!-- Greeting -->
    <tr>
      <td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid #eee;">
        <h2 style="margin:0 0 10px;font-size:20px;color:#111;font-weight:600;letter-spacing:-0.01em;">See you in about an hour.</h2>
        <p style="margin:0;font-size:14px;color:#666;line-height:1.65;">Hi ${d.customerName}, just a reminder about your appointment today.</p>
      </td>
    </tr>

    <!-- Details -->
    <tr>
      <td style="padding:28px 40px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${row('Service', d.serviceName)}
          ${row('Barber', d.barberName)}
          ${row('Date', d.date)}
          ${row('Time', d.time)}
          ${row('Location', d.locationName)}
          ${row('Address', d.locationAddress)}
          ${d.servicePrice != null ? row('Price', `€${d.servicePrice}`) : ''}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:32px 40px;text-align:center;">
        <a href="${mapsUrl(d.locationAddress)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 36px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;">Get Directions</a>
      </td>
    </tr>

    <!-- Running late note -->
    <tr>
      <td style="padding:20px 40px 28px;background:#fafafa;border-top:1px solid #eee;border-bottom:1px solid #eee;">
        <p style="margin:0;font-size:13px;color:#777;text-align:center;line-height:1.65;">
          Running late? Reply to this email or call <strong style="color:#111;">${d.locationPhone}</strong>.
        </p>
      </td>
    </tr>
  `)

export const ownerNotificationHtml = (d: BookingEmailData): string =>
  base('New Booking', `
    <tr>
      <td style="padding:28px 40px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${row('Customer', d.customerName)}
          ${row('Email', d.customerEmail)}
          ${row('Service', d.serviceName)}
          ${row('Barber', d.barberName)}
          ${row('Date', d.date)}
          ${row('Time', d.time)}
          ${row('Location', d.locationName)}
          ${d.servicePrice != null ? row('Price', `€${d.servicePrice}`) : ''}
        </table>
      </td>
    </tr>
    <tr><td style="padding:12px 40px 32px;"></td></tr>
  `)
