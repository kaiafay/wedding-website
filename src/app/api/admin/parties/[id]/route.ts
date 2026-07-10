import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests, parties } from "@/lib/schema";
import { validateSession } from "@/lib/auth";
import { serializeGuest } from "@/lib/serializers";
import { eq, inArray } from "drizzle-orm";

async function createSoloPartyForGuest(guest: typeof guests.$inferSelect) {
  const [party] = await db
    .insert(parties)
    .values({
      displayName: guest.name ?? "Guest",
      saveTheDateRecipientGuestId: guest.email ? guest.id : null,
      saveTheDateToken: crypto.randomUUID(),
    })
    .returning({ id: parties.id });

  await db
    .update(guests)
    .set({ partyId: party.id })
    .where(eq(guests.id, guest.id));
}

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

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/parties/[id]">,
) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const partyId = Number(id);
  if (!Number.isInteger(partyId)) {
    return NextResponse.json({ error: "Invalid party id" }, { status: 400 });
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
        .map((guestId) => Number(guestId))
        .filter((guestId) => Number.isInteger(guestId))
    : [];
  const rawRecipient =
    "saveTheDateRecipientGuestId" in body
      ? body.saveTheDateRecipientGuestId
      : null;
  const recipientId = rawRecipient === null ? null : Number(rawRecipient);

  if (!displayName) {
    return NextResponse.json({ error: "Party name is required" }, { status: 400 });
  }

  if (displayName.length > 200) {
    return NextResponse.json({ error: "Party name exceeds 200 characters" }, { status: 400 });
  }

  if (guestIds.length === 0) {
    return NextResponse.json({ error: "Select at least one guest" }, { status: 400 });
  }

  const existingParty = await db.query.parties.findFirst({
    where: eq(parties.id, partyId),
    with: { guests: true },
  });

  if (!existingParty) {
    return NextResponse.json({ error: "Party not found" }, { status: 404 });
  }

  if (recipientId !== null && !guestIds.includes(recipientId)) {
    return NextResponse.json({ error: "Recipient must be in the party" }, { status: 400 });
  }

  const selectedGuests = await db.query.guests.findMany({
    where: inArray(guests.id, guestIds),
  });

  if (selectedGuests.length !== guestIds.length) {
    return NextResponse.json({ error: "One or more guests were not found" }, { status: 404 });
  }

  const recipient =
    recipientId === null
      ? null
      : selectedGuests.find((guest) => guest.id === recipientId);

  if (recipientId !== null && !recipient?.email) {
    return NextResponse.json({ error: "Recipient must have an email" }, { status: 400 });
  }

  const currentGuestIds = new Set(existingParty.guests.map((guest) => guest.id));
  const nextGuestIds = new Set(guestIds);
  const removedGuests = existingParty.guests.filter(
    (guest) => !nextGuestIds.has(guest.id),
  );
  const oldPartyIds = Array.from(
    new Set(
      selectedGuests
        .filter((guest) => guest.partyId !== partyId)
        .map((guest) => guest.partyId),
    ),
  );
  const sentRecipient =
    existingParty.saveTheDateSentAt === null
      ? null
      : existingParty.guests.find(
          (guest) =>
            guest.id === existingParty.saveTheDateRecipientGuestId &&
            guest.email,
        );
  const removedSentRecipient =
    sentRecipient && !nextGuestIds.has(sentRecipient.id) ? sentRecipient : null;
  const hasInvalidSentState =
    existingParty.saveTheDateSentAt !== null && !sentRecipient;

  if (removedSentRecipient) {
    for (const guest of removedGuests) {
      if (guest.id !== removedSentRecipient.id) {
        await createSoloPartyForGuest(guest);
      }
    }

    const shouldBeSolo = guestIds.length === 1;
    const [onlyGuest] = selectedGuests;
    const [newParty] = await db
      .insert(parties)
      .values({
        displayName: shouldBeSolo ? (onlyGuest.name ?? "Guest") : displayName,
        saveTheDateRecipientGuestId: shouldBeSolo
          ? onlyGuest.email
            ? onlyGuest.id
            : null
          : recipientId,
        saveTheDateToken: crypto.randomUUID(),
      })
      .returning({ id: parties.id });

    await db
      .update(guests)
      .set({ partyId: newParty.id })
      .where(inArray(guests.id, guestIds));

    await db
      .update(parties)
      .set({
        displayName: removedSentRecipient.name ?? "Guest",
        saveTheDateRecipientGuestId: removedSentRecipient.id,
      })
      .where(eq(parties.id, partyId));
  } else {
    for (const guest of removedGuests) {
      await createSoloPartyForGuest(guest);
    }

    await db
      .update(guests)
      .set({ partyId })
      .where(inArray(guests.id, guestIds));

    const shouldBeSolo = guestIds.length === 1;
    const [onlyGuest] = selectedGuests;
    await db
      .update(parties)
      .set({
        displayName: shouldBeSolo ? (onlyGuest.name ?? "Guest") : displayName,
        saveTheDateRecipientGuestId: shouldBeSolo
          ? onlyGuest.email
            ? onlyGuest.id
            : null
          : recipientId,
        saveTheDateSentAt: hasInvalidSentState
          ? null
          : existingParty.saveTheDateSentAt,
      })
      .where(eq(parties.id, partyId));
  }

  await normalizeOldParties(oldPartyIds);

  const affectedIds = Array.from(
    new Set([
      ...Array.from(currentGuestIds),
      ...guestIds,
      ...removedGuests.map((guest) => guest.id),
    ]),
  );
  const updatedGuests = await db.query.guests.findMany({
    where: inArray(guests.id, affectedIds),
    with: { party: true, rsvp: true },
  });

  return NextResponse.json({
    guests: updatedGuests.map(serializeGuest),
  });
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/admin/parties/[id]">,
) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const partyId = Number(id);
  if (!Number.isInteger(partyId)) {
    return NextResponse.json({ error: "Invalid party id" }, { status: 400 });
  }

  const existingParty = await db.query.parties.findFirst({
    where: eq(parties.id, partyId),
    with: { guests: true },
  });

  if (!existingParty) {
    return NextResponse.json({ error: "Party not found" }, { status: 404 });
  }

  if (existingParty.guests.length <= 1) {
    return NextResponse.json(
      { error: "Only grouped parties can be dissolved" },
      { status: 400 },
    );
  }

  const sentRecipient = existingParty.guests.find(
    (guest) =>
      guest.id === existingParty.saveTheDateRecipientGuestId && guest.email,
  );
  const retainedGuest = sentRecipient ?? existingParty.guests[0];
  const guestsToSplit = existingParty.guests.filter(
    (guest) => guest.id !== retainedGuest.id,
  );

  for (const guest of guestsToSplit) {
    await createSoloPartyForGuest(guest);
  }

  await db
    .update(parties)
    .set({
      displayName: retainedGuest.name ?? "Guest",
      saveTheDateRecipientGuestId: retainedGuest.email ? retainedGuest.id : null,
      saveTheDateSentAt: sentRecipient ? existingParty.saveTheDateSentAt : null,
    })
    .where(eq(parties.id, partyId));

  const updatedGuests = await db.query.guests.findMany({
    where: inArray(
      guests.id,
      existingParty.guests.map((guest) => guest.id),
    ),
    with: { party: true, rsvp: true },
  });

  return NextResponse.json({
    guests: updatedGuests.map(serializeGuest),
  });
}
