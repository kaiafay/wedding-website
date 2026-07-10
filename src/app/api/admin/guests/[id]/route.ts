import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests, parties } from "@/lib/schema";
import { validateSession } from "@/lib/auth";
import { serializeGuest } from "@/lib/serializers";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/guests/[id]">,
) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const guestId = Number(id);
  if (!Number.isInteger(guestId)) {
    return NextResponse.json({ error: "Invalid guest id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = "name" in body ? String(body.name ?? "").trim() : "";
  const email = "email" in body ? String(body.email ?? "").trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (name.length > 200) {
    return NextResponse.json({ error: "Name exceeds 200 characters" }, { status: 400 });
  }

  if (email.length > 320) {
    return NextResponse.json({ error: "Email exceeds 320 characters" }, { status: 400 });
  }

  const existing = await db.query.guests.findFirst({
    where: eq(guests.id, guestId),
    with: { party: true, rsvp: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  const guestEmail = email || null;
  await db
    .update(guests)
    .set({ name, email: guestEmail })
    .where(eq(guests.id, guestId));

  const partyGuests = await db.query.guests.findMany({
    where: eq(guests.partyId, existing.partyId),
  });

  if (partyGuests.length === 1) {
    await db
      .update(parties)
      .set({
        displayName: name,
        saveTheDateRecipientGuestId: guestEmail ? guestId : null,
      })
      .where(eq(parties.id, existing.partyId));
  } else if (
    existing.party.saveTheDateRecipientGuestId === guestId &&
    guestEmail === null
  ) {
    await db
      .update(parties)
      .set({ saveTheDateRecipientGuestId: null })
      .where(eq(parties.id, existing.partyId));
  }

  const updated = await db.query.guests.findFirst({
    where: eq(guests.id, guestId),
    with: { party: true, rsvp: true },
  });

  return NextResponse.json({ guest: serializeGuest(updated!) });
}
