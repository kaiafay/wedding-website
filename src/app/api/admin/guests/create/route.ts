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

  const { name, email } = await request.json();

  const guestName = String(name ?? "").trim();
  const guestEmail = String(email ?? "").trim() || null;

  if (!guestName) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 },
    );
  }

  if (guestName.length > 200) {
    return NextResponse.json({ error: "Name exceeds 200 characters" }, { status: 400 });
  }

  if (guestEmail !== null && guestEmail.length > 320) {
    return NextResponse.json({ error: "Email exceeds 320 characters" }, { status: 400 });
  }

  const saveTheDateToken = crypto.randomUUID();
  let createdPartyId: number | null = null;

  try {
    const [party] = await db.insert(parties).values({
      displayName: guestName,
      saveTheDateToken,
    }).returning({
      id: parties.id,
      displayName: parties.displayName,
      saveTheDateRecipientGuestId: parties.saveTheDateRecipientGuestId,
      saveTheDateSentAt: parties.saveTheDateSentAt,
      saveTheDateToken: parties.saveTheDateToken,
      createdAt: parties.createdAt,
    });
    createdPartyId = party.id;

    const [guest] = await db.insert(guests).values({
        partyId: party.id,
        name: guestName,
        email: guestEmail,
        token: crypto.randomUUID(),
    }).returning();

    const serializedParty = guestEmail
      ? {
          ...party,
          saveTheDateRecipientGuestId: guest.id,
        }
      : party;

    if (guestEmail) {
      await db
        .update(parties)
        .set({ saveTheDateRecipientGuestId: guest.id })
        .where(eq(parties.id, party.id));
    }

    return NextResponse.json({
      guest: serializeGuest({ ...guest, party: serializedParty, rsvp: null }),
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
