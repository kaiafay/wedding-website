import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests, parties } from "@/lib/schema";
import { validateSession } from "@/lib/auth";
import { serializeGuest } from "@/lib/serializers";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { partyDisplayName, partyEmail, guestNames, name, email } = await request.json();

  const displayName = String(partyDisplayName ?? name ?? "").trim();
  const partyEmailValue = String(partyEmail ?? email ?? "").trim();
  const names = Array.isArray(guestNames)
    ? guestNames.map((guestName) => String(guestName).trim()).filter(Boolean)
    : [String(name ?? "").trim()].filter(Boolean);

  if (!displayName || !partyEmailValue || names.length === 0) {
    return NextResponse.json(
      { error: "Party name, email, and at least one guest are required" },
      { status: 400 },
    );
  }

  if (displayName.length > 200 || partyEmailValue.length > 320) {
    return NextResponse.json({ error: "Party name or email is too long" }, { status: 400 });
  }

  if (names.some((guestName) => guestName.length > 200)) {
    return NextResponse.json({ error: "Guest names must be 200 characters or less" }, { status: 400 });
  }

  const saveTheDateToken = crypto.randomUUID();
  let createdPartyId: number | null = null;

  try {
    const [party] = await db.insert(parties).values({
      displayName,
      email: partyEmailValue,
      saveTheDateToken,
    }).returning({
      id: parties.id,
      displayName: parties.displayName,
      email: parties.email,
      saveTheDateSentAt: parties.saveTheDateSentAt,
      saveTheDateToken: parties.saveTheDateToken,
      createdAt: parties.createdAt,
    });
    createdPartyId = party.id;

    const createdGuests = await db.insert(guests).values(
      names.map((guestName) => ({
        partyId: party.id,
        name: guestName,
        email: partyEmailValue,
        token: crypto.randomUUID(),
      })),
    ).returning();

    return NextResponse.json({
      guests: createdGuests.map((guest) =>
        serializeGuest({ ...guest, party, rsvp: null }),
      ),
    });
  } catch (err) {
    if (createdPartyId !== null) {
      try {
        await db.delete(parties).where(eq(parties.id, createdPartyId));
      } catch (deleteErr) {
        console.error("Failed to remove orphaned party:", deleteErr);
      }
    }
    console.error("Failed to create party:", err);
    return NextResponse.json({ error: "Failed to create party" }, { status: 500 });
  }
}
