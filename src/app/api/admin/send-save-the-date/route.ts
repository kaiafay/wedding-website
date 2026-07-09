import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests } from "@/lib/schema";
import { and, eq, isNull } from "drizzle-orm";
import { Resend } from "resend";
import { validateSession } from "@/lib/auth";
import {
  buildSaveTheDateEmailHtml,
  buildSaveTheDateEmailText,
  buildSaveTheDateUrl,
  getEmailSiteUrl,
} from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dry = request.nextUrl.searchParams.get("dry") === "true";
  const body = await request.json().catch(() => ({}));
  const guestId =
    typeof body.guestId === "number" && Number.isInteger(body.guestId)
      ? body.guestId
      : null;
  const siteUrl = getEmailSiteUrl();
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  const pending = await db
    .select()
    .from(guests)
    .where(
      guestId === null
        ? isNull(guests.saveTheDateSentAt)
        : and(eq(guests.id, guestId), isNull(guests.saveTheDateSentAt)),
    );

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
      const link = buildSaveTheDateUrl(siteUrl, guest.saveTheDateToken!);
      const guestName = guest.name ?? "Friend";

      await resend.emails.send({
        from,
        to: guest.email!,
        subject: "Save the Date — Kaia & Richard, July 10, 2027",
        html: buildSaveTheDateEmailHtml({
          guestName,
          link,
          siteUrl,
        }),
        text: buildSaveTheDateEmailText({ guestName, link }),
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
