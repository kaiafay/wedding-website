import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parties } from "@/lib/schema";
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
  const partyId =
    typeof body.partyId === "number" && Number.isInteger(body.partyId)
      ? body.partyId
      : null;
  const siteUrl = getEmailSiteUrl();
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  const pending = await db
    .select()
    .from(parties)
    .where(
      partyId === null
        ? isNull(parties.saveTheDateSentAt)
        : and(eq(parties.id, partyId), isNull(parties.saveTheDateSentAt)),
    );

  const sendable = pending.filter((party) => party.email && party.saveTheDateToken);
  const skipped = pending.length - sendable.length;

  if (dry) {
    return NextResponse.json({
      would_send: sendable.map((party) => ({
        id: party.id,
        displayName: party.displayName,
        email: party.email,
      })),
      skipped,
    });
  }

  const results: { id: number; status: "sent" | "failed" }[] = [];

  for (const party of sendable) {
    try {
      const link = buildSaveTheDateUrl(siteUrl, party.saveTheDateToken);
      const guestName = party.displayName;

      await resend.emails.send({
        from,
        to: party.email,
        subject: "Save the Date — Kaia & Richard, July 10, 2027",
        html: buildSaveTheDateEmailHtml({
          guestName,
          link,
          siteUrl,
        }),
        text: buildSaveTheDateEmailText({ guestName, link }),
      });

      await db
        .update(parties)
        .set({ saveTheDateSentAt: new Date() })
        .where(eq(parties.id, party.id));

      results.push({ id: party.id, status: "sent" });
    } catch (err) {
      console.error("save-the-date send failed for party", party.id, err);
      results.push({ id: party.id, status: "failed" });
    }
  }

  return NextResponse.json({ results, skipped });
}
