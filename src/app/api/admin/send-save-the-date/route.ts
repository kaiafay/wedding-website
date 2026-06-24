import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests } from "@/lib/schema";
import { eq, isNull } from "drizzle-orm";
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


function buildEmailHtml(guestName: string, link: string): string {
  const safeName = escapeHtml(guestName);
  const safeLink = escapeHtml(link);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Save the Date &mdash; Kaia &amp; Richard</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');
body { margin: 0; padding: 0; background-color: #f2ede4; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f2ede4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2ede4;">
  <tr>
    <td align="center" style="padding:60px 20px 48px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">

        <!-- Floral card -->
        <tr>
          <td align="center" style="padding-bottom:40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#faf7f2;border:1px solid #ddd5c8;">
              <tr>
                <td align="center" style="padding:36px 32px 32px;">
                  <p style="font-family:Georgia,serif;font-size:9px;letter-spacing:0.38em;text-transform:uppercase;color:#8a8178;margin:0 0 10px;">
                    Save the Date
                  </p>
                  <p style="font-family:'Great Vibes',Georgia,cursive;font-size:48px;color:#3d3a3a;margin:0 0 14px;line-height:1.1;mso-line-height-rule:exactly;">
                    Kaia &amp; Richard
                  </p>
                  <p style="font-family:Georgia,serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8a8178;margin:0 0 4px;">
                    Saturday &middot; July 10, 2027
                  </p>
                  <p style="font-family:Georgia,serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8a8178;margin:0;">
                    Bellingham, Washington
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Personal greeting -->
        <tr>
          <td align="center" style="border-top:1px solid #ddd5c8;padding-top:40px;padding-bottom:8px;">
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;color:#3d3a3a;margin:0;font-style:italic;line-height:1.7;">
              Dear ${safeName},
            </p>
            <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;color:#3d3a3a;margin:8px 0 0;font-style:italic;line-height:1.7;">
              We hope you&rsquo;ll join us to celebrate our wedding day.
            </p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding-top:40px;padding-bottom:40px;">
            <a href="${safeLink}" style="display:inline-block;background-color:#3d3a3a;color:#f8f8f7;font-family:Georgia,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;padding:14px 36px;">
              View Save the Date
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="border-top:1px solid #ddd5c8;padding-top:32px;padding-bottom:8px;">
            <p style="font-family:Georgia,serif;font-size:12px;color:#8a8178;margin:0;font-style:italic;">
              Formal invitation to follow.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:16px;">
            <p style="font-family:Georgia,sans-serif;font-size:11px;color:#8a8178;margin:0;line-height:1.6;">
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

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dry = request.nextUrl.searchParams.get("dry") === "true";
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  const pending = await db
    .select()
    .from(guests)
    .where(isNull(guests.saveTheDateSentAt));

  const sendable = pending.filter((g) => g.email && g.saveTheDateToken);
  const skipped = pending.length - sendable.length;

  if (dry) {
    return NextResponse.json({
      would_send: sendable.map((g) => ({
        id: g.id,
        name: g.name,
        email: g.email,
      })),
      skipped,
    });
  }

  const results: { id: number; status: "sent" | "failed" }[] = [];

  for (const guest of sendable) {
    try {
      const link = `${siteUrl}/save-the-date?token=${guest.saveTheDateToken}`;

      await resend.emails.send({
        from,
        to: guest.email!,
        subject: "Save the Date — Kaia & Richard, July 10, 2027",
        html: buildEmailHtml(guest.name ?? "Friend", link),
      });

      await db
        .update(guests)
        .set({ saveTheDateSentAt: new Date() })
        .where(eq(guests.id, guest.id));

      results.push({ id: guest.id, status: "sent" });
    } catch (err) {
      console.error("save-the-date send failed for guest", guest.id, err);
      results.push({ id: guest.id, status: "failed" });
    }
  }

  return NextResponse.json({ results, skipped });
}
