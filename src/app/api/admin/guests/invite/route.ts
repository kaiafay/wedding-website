import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { validateSession } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailHtml(guestName: string, note: string, rsvpUrl: string): string {
  const safeName = escapeHtml(guestName);
  const safeNote = escapeHtml(note).replace(/\n/g, "<br>");
  const safeRsvpUrl = escapeHtml(rsvpUrl);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>You're Invited — Kaia &amp; Richard</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');
body { margin: 0; padding: 0; background-color: #9B7E97; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#9B7E97;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#9B7E97;">
  <tr>
    <td align="center" style="padding:60px 20px 48px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
        <tr>
          <td align="center" style="padding-bottom:28px;">
            <p style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#C2AFC0;margin:0;font-weight:400;">
              Together with their families
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:4px;">
            <h1 style="font-family:'Great Vibes',Georgia,cursive;font-size:62px;color:#f8f8f7;margin:0;font-weight:400;line-height:1.1;mso-line-height-rule:exactly;">
              Kaia <span style="color:#F2EDE4;">&amp;</span> Richard
            </h1>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:28px 0 32px;">
            <div style="width:48px;height:1px;background-color:#C2AFC0;line-height:1px;font-size:1px;">&nbsp;</div>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:12px;">
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#f8f8f7;margin:0;">
              Saturday &middot; July 10th &middot; 2027
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:48px;">
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;color:#F2EDE4;margin:0;font-style:italic;">
              The Vasak Estate &middot; Bellingham, WA
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:48px;border-top:1px solid #C2AFC0;border-bottom:1px solid #C2AFC0;padding-top:40px;">
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;color:#f8f8f7;line-height:1.75;text-align:center;margin:0;font-weight:300;">
              ${safeNote}
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:44px;padding-bottom:44px;">
            <a href="${safeRsvpUrl}" style="display:inline-block;background-color:#f8f8f7;color:#7A5E75;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;padding:14px 36px;">
              RSVP Now
            </a>
          </td>
        </tr>
        <tr>
          <td align="center">
            <p style="font-family:Arial,sans-serif;font-size:11px;color:#F2EDE4;margin:0;line-height:1.6;">
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

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { guestId, note } = await request.json();

  if (!guestId || !note) {
    return NextResponse.json({ error: "Missing guestId or note" }, { status: 400 });
  }

  if (note.length > 2000) {
    return NextResponse.json({ error: "Note exceeds 2000 characters" }, { status: 400 });
  }

  const [guest] = await db.select().from(guests).where(eq(guests.id, guestId));

  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }
  if (!guest.email) {
    return NextResponse.json({ error: "Guest has no email address" }, { status: 400 });
  }

  const siteUrl =
    process.env.SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const rsvpUrl = `${siteUrl}/?token=${guest.token}`;
  const guestName = guest.name ?? "Friend";

  try {
    const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
    await resend.emails.send({
      from,
      to: guest.email,
      subject: "You're Invited — Kaia & Richard, July 10th 2027",
      html: buildEmailHtml(guestName, note, rsvpUrl),
    });
  } catch (err) {
    console.error("Failed to send email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  try {
    await db.update(guests).set({ sentAt: new Date() }).where(eq(guests.id, guestId));
  } catch (err) {
    console.error("Failed to update sentAt:", err);
  }

  return NextResponse.json({ success: true });
}
