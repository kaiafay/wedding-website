import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests, parties } from "@/lib/schema";
import { validateSession } from "@/lib/auth";
import { serializeGuest } from "@/lib/serializers";
import { eq, inArray } from "drizzle-orm";

async function normalizeOldParties(partyIds: number[]) {
  for (const partyId of partyIds) {
    const partyGuests = await db.query.guests.findMany({
      where: eq(guests.partyId, partyId),
    });

    if (partyGuests.length === 0) {
      await db.delete(parties).where(eq(parties.id, partyId));
    } else if (partyGuests.length === 1) {
      const [guest] = partyGuests;
      await db
        .update(parties)
        .set({
          displayName: guest.name ?? "Guest",
          saveTheDateRecipientGuestId: guest.email ? guest.id : null,
        })
        .where(eq(parties.id, partyId));
    }
  }
}

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const displayName = String(
    "displayName" in body ? body.displayName : "",
  ).trim();
  const guestIds = Array.isArray("guestIds" in body ? body.guestIds : null)
    ? (body.guestIds as unknown[])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id))
    : [];
  const recipientId = Number(
    "saveTheDateRecipientGuestId" in body
      ? body.saveTheDateRecipientGuestId
      : NaN,
  );

  if (!displayName) {
    return NextResponse.json({ error: "Party name is required" }, { status: 400 });
  }

  if (displayName.length > 200) {
    return NextResponse.json({ error: "Party name exceeds 200 characters" }, { status: 400 });
  }

  if (guestIds.length < 2) {
    return NextResponse.json({ error: "Select at least two guests" }, { status: 400 });
  }

  if (!guestIds.includes(recipientId)) {
    return NextResponse.json({ error: "Select a save-the-date recipient" }, { status: 400 });
  }

  const selectedGuests = await db.query.guests.findMany({
    where: inArray(guests.id, guestIds),
  });

  if (selectedGuests.length !== guestIds.length) {
    return NextResponse.json({ error: "One or more guests were not found" }, { status: 404 });
  }

  const recipient = selectedGuests.find((guest) => guest.id === recipientId);
  if (!recipient?.email) {
    return NextResponse.json({ error: "Recipient must have an email" }, { status: 400 });
  }

  const oldPartyIds = Array.from(
    new Set(selectedGuests.map((guest) => guest.partyId)),
  );
  const [party] = await db
    .insert(parties)
    .values({
      displayName,
      saveTheDateRecipientGuestId: recipientId,
      saveTheDateToken: crypto.randomUUID(),
    })
    .returning();

  await db
    .update(guests)
    .set({ partyId: party.id })
    .where(inArray(guests.id, guestIds));

  await normalizeOldParties(oldPartyIds);

  const updatedGuests = await db.query.guests.findMany({
    where: inArray(guests.id, guestIds),
    with: { party: true, rsvp: true },
  });

  return NextResponse.json({
    guests: updatedGuests.map(serializeGuest),
  });
}
