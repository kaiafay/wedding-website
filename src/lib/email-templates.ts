export const EMAIL_COLORS = {
  white: "#f8f8f7",
  ivory: "#F2EDE4",
  charcoal: "#3D3A3A",
  subtle: "#8A8178",
  mauve: "#9B7E97",
  mauveLight: "#C2AFC0",
  mauveDark: "#7A5E75",
  rule: "#DDD5C8",
  card: "#faf7f2",
} as const;

export const EMAIL_EVENT = {
  couple: "Kaia & Richard",
  dateText: "Saturday · July 10th · 2027",
  dateLine: "Saturday &middot; July 10th &middot; 2027",
  venueText: "The Vasak Estate · Bellingham, WA",
  venueLine: "The Vasak Estate &middot; Bellingham, WA",
} as const;

export const DEFAULT_INVITE_NOTE =
  "We'd love to celebrate with you. Click the link below to RSVP.";

export function getSiteUrl(): string {
  return (
    process.env.SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

export function buildRsvpUrl(siteUrl: string, token: string): string {
  const url = new URL(siteUrl);
  url.searchParams.set("token", token);
  url.hash = "rsvp";
  return url.toString();
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeText(str: string): string {
  return str.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildFontFaceCss(siteUrl: string): string {
  const fontBase = `${siteUrl.replace(/\/$/, "")}/fonts`;

  return `@font-face {
  font-family: 'Cormorant Garamond';
  font-style: normal;
  font-weight: 300;
  mso-font-alt: 'Georgia';
  src: url('${fontBase}/cormorant-garamond-latin.woff2') format('woff2');
}
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: normal;
  font-weight: 400;
  mso-font-alt: 'Georgia';
  src: url('${fontBase}/cormorant-garamond-latin.woff2') format('woff2');
}
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: italic;
  font-weight: 300;
  mso-font-alt: 'Georgia';
  src: url('${fontBase}/cormorant-garamond-italic-latin.woff2') format('woff2');
}`;
}

function buildEmailHead(title: string, backgroundColor: string, siteUrl: string): string {
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
${buildFontFaceCss(siteUrl)}
body { margin: 0; padding: 0; background-color: ${backgroundColor}; }
</style>
</head>`;
}

function buildNameLockupImage({
  siteUrl,
  variant,
  width,
  height,
  marginBottom = 0,
}: {
  siteUrl: string;
  variant: "dark" | "light";
  width: number;
  height: number;
  marginBottom?: number;
}): string {
  const imageUrl = `${siteUrl.replace(/\/$/, "")}/email/kaia-richard-${variant}.png`;

  return `<img src="${escapeHtml(imageUrl)}" width="${width}" height="${height}" alt="Kaia &amp; Richard" style="display:block;border:0;outline:none;text-decoration:none;width:${width}px;max-width:100%;height:auto;margin:0 auto ${marginBottom}px;">`;
}

export function buildInviteEmailText({
  guestName,
  note,
  rsvpUrl,
}: {
  guestName: string;
  note: string;
  rsvpUrl: string;
}): string {
  return normalizeText(`Together with their families

${EMAIL_EVENT.couple}

${EMAIL_EVENT.dateText}
${EMAIL_EVENT.venueText}

${note}

RSVP Now: ${rsvpUrl}

This invitation was sent personally to ${guestName}. Please do not share this link.`);
}

export function buildInviteEmailHtml({
  guestName,
  note,
  rsvpUrl,
  siteUrl = getSiteUrl(),
}: {
  guestName: string;
  note: string;
  rsvpUrl: string;
  siteUrl?: string;
}): string {
  const safeName = escapeHtml(guestName);
  const safeNote = escapeHtml(note).replace(/\n/g, "<br>");
  const safeRsvpUrl = escapeHtml(rsvpUrl);
  const c = EMAIL_COLORS;

  return `<!DOCTYPE html>
<html lang="en">
${buildEmailHead("You're Invited — Kaia &amp; Richard", c.mauve, siteUrl)}
<body style="margin:0;padding:0;background-color:${c.mauve};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${c.mauve};">
  <tr>
    <td align="center" style="padding:60px 20px 48px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
        <tr>
          <td align="center" style="padding-bottom:28px;">
            <p style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:${c.mauveLight};margin:0;font-weight:400;">
              Together with their families
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:4px;">
            ${buildNameLockupImage({ siteUrl, variant: "light", width: 360, height: 90 })}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:28px 0 32px;">
            <div style="width:48px;height:1px;background-color:${c.mauveLight};line-height:1px;font-size:1px;">&nbsp;</div>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:12px;">
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:${c.white};margin:0;">
              ${EMAIL_EVENT.dateLine}
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:48px;">
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;color:${c.ivory};margin:0;font-style:italic;">
              ${EMAIL_EVENT.venueLine}
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:48px;border-top:1px solid ${c.mauveLight};border-bottom:1px solid ${c.mauveLight};padding-top:40px;">
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;color:${c.white};line-height:1.75;text-align:center;margin:0;font-weight:300;">
              ${safeNote}
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:44px;padding-bottom:44px;">
            <a href="${safeRsvpUrl}" style="display:inline-block;background-color:${c.white};color:${c.mauveDark};font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;padding:14px 36px;">
              RSVP Now
            </a>
          </td>
        </tr>
        <tr>
          <td align="center">
            <p style="font-family:Arial,sans-serif;font-size:11px;color:${c.ivory};margin:0;line-height:1.6;">
              This invitation was sent personally to ${safeName}. Please do not share this link.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function buildSaveTheDateEmailText({
  guestName,
  link,
}: {
  guestName: string;
  link: string;
}): string {
  return normalizeText(`Save the Date

${EMAIL_EVENT.couple}

${EMAIL_EVENT.dateText}
${EMAIL_EVENT.venueText}

Dear ${guestName},

We hope you'll join us to celebrate our wedding day.

View Save the Date: ${link}

Formal invitation to follow.

This save the date was sent personally to ${guestName}.`);
}

export function buildSaveTheDateEmailHtml({
  guestName,
  link,
  siteUrl = getSiteUrl(),
}: {
  guestName: string;
  link: string;
  siteUrl?: string;
}): string {
  const safeName = escapeHtml(guestName);
  const safeLink = escapeHtml(link);
  const c = EMAIL_COLORS;

  return `<!DOCTYPE html>
<html lang="en">
${buildEmailHead("Save the Date &mdash; Kaia &amp; Richard", c.ivory, siteUrl)}
<body style="margin:0;padding:0;background-color:${c.ivory};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${c.ivory};">
  <tr>
    <td align="center" style="padding:60px 20px 48px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">

        <!-- Floral card -->
        <tr>
          <td align="center" style="padding-bottom:40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${c.card};border:1px solid ${c.rule};">
              <tr>
                <td align="center" style="padding:36px 32px 32px;">
                  <p style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.38em;text-transform:uppercase;color:${c.mauve};margin:0 0 10px;">
                    Save the Date
                  </p>
                  ${buildNameLockupImage({ siteUrl, variant: "dark", width: 320, height: 80, marginBottom: 14 })}
                  <div style="width:40px;height:1px;background-color:${c.mauve};line-height:1px;font-size:1px;margin:0 0 18px;">&nbsp;</div>
                  <p style="font-family:Georgia,serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${c.charcoal};margin:0 0 8px;">
                    ${EMAIL_EVENT.dateLine}
                  </p>
                  <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;color:${c.subtle};margin:0;font-style:italic;">
                    ${EMAIL_EVENT.venueLine}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Personal greeting -->
        <tr>
          <td align="center" style="border-top:1px solid ${c.rule};padding-top:40px;padding-bottom:8px;">
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;color:${c.charcoal};margin:0;font-style:italic;line-height:1.7;">
              Dear ${safeName},
            </p>
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;color:${c.charcoal};margin:8px 0 0;font-style:italic;line-height:1.7;">
              We hope you&rsquo;ll join us to celebrate our wedding day.
            </p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding-top:40px;padding-bottom:40px;">
            <a href="${safeLink}" style="display:inline-block;background-color:transparent;color:${c.mauve};border:1px solid ${c.mauve};font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;padding:14px 36px;">
              View Save the Date
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="border-top:1px solid ${c.rule};padding-top:32px;padding-bottom:8px;">
            <p style="font-family:Georgia,serif;font-size:12px;color:${c.subtle};margin:0;font-style:italic;">
              Formal invitation to follow.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:16px;">
            <p style="font-family:Arial,sans-serif;font-size:11px;color:${c.subtle};margin:0;line-height:1.6;">
              This save the date was sent personally to ${safeName}.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
