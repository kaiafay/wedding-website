import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests } from "@/lib/schema";
import { and, eq, isNull } from "drizzle-orm";
import { Resend } from "resend";
import { validateSession } from "@/lib/auth";
import {
  buildInviteEmailHtml,
  buildInviteEmailText,
  buildRsvpUrl,
  getEmailSiteUrl,
} from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const guestId =
    "guestId" in body &&
    typeof body.guestId === "number" &&
    Number.isInteger(body.guestId)
      ? body.guestId
      : null;
  const note = "note" in body && typeof body.note === "string" ? body.note : "";

  if (!note) {
    return NextResponse.json({ error: "Missing note" }, { status: 400 });
  }

  if (note.length > 2000) {
    return NextResponse.json({ error: "Note exceeds 2000 characters" }, { status: 400 });
  }

  const siteUrl = getEmailSiteUrl();
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const pending = await db
    .select()
    .from(guests)
    .where(
      guestId === null
        ? isNull(guests.sentAt)
        : and(eq(guests.id, guestId), isNull(guests.sentAt)),
    );

  if (guestId !== null && pending.length === 0) {
    return NextResponse.json({ error: "Guest not found or already sent" }, { status: 404 });
  }

  const sendable = pending.filter((guest) => guest.email);
  const skipped = pending.length - sendable.length;
  const results: { id: number; status: "sent" | "failed" }[] = [];

  for (const guest of sendable) {
    const rsvpUrl = buildRsvpUrl(siteUrl, guest.token);
    const guestName = guest.name ?? "Friend";

    try {
      await resend.emails.send({
        from,
        to: guest.email!,
        subject: "You're Invited — Kaia & Richard, July 10th 2027",
        html: buildInviteEmailHtml({ guestName, note, rsvpUrl, siteUrl }),
        text: buildInviteEmailText({ guestName, note, rsvpUrl }),
      });

      await db.update(guests).set({ sentAt: new Date() }).where(eq(guests.id, guest.id));
      results.push({ id: guest.id, status: "sent" });
    } catch (err) {
      console.error("Failed to send RSVP invite:", err);
      results.push({ id: guest.id, status: "failed" });
    }
  }

  if (guestId !== null && results.some((result) => result.status === "failed")) {
    return NextResponse.json({ error: "Failed to send email", results, skipped }, { status: 500 });
  }

  return NextResponse.json({ success: true, results, skipped });
}
