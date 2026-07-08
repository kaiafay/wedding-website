import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { validateSession } from "@/lib/auth";
import {
  buildInviteEmailHtml,
  buildInviteEmailText,
  buildRsvpUrl,
  getSiteUrl,
} from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const siteUrl = getSiteUrl();
  const rsvpUrl = buildRsvpUrl(siteUrl, guest.token);
  const guestName = guest.name ?? "Friend";

  try {
    const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
    await resend.emails.send({
      from,
      to: guest.email,
      subject: "You're Invited — Kaia & Richard, July 10th 2027",
      html: buildInviteEmailHtml({ guestName, note, rsvpUrl, siteUrl }),
      text: buildInviteEmailText({ guestName, note, rsvpUrl }),
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
