import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests, rsvps } from "@/lib/schema";
import { eq } from "drizzle-orm";

const VALID_MEALS = ["Chicken", "Salmon", "Vegetarian"] as const;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, attending, mealPreference, message, name } = body;

  if (!token || attending === undefined || attending === null) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (name !== undefined && name !== null && String(name).length > 200) {
    return NextResponse.json({ error: "Name exceeds 200 characters" }, { status: 400 });
  }

  if (message !== undefined && message !== null && String(message).length > 1000) {
    return NextResponse.json({ error: "Message exceeds 1000 characters" }, { status: 400 });
  }

  if (attending && !VALID_MEALS.includes(mealPreference)) {
    return NextResponse.json({ error: "Meal preference is required when attending" }, { status: 400 });
  }

  const guest = await db
    .select()
    .from(guests)
    .where(eq(guests.token, token))
    .limit(1);

  if (!guest.length) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  if (guest[0].usedAt) {
    return NextResponse.json({ error: "Already responded" }, { status: 403 });
  }

  let insertedRsvpId: number | null = null;

  try {
    const [inserted] = await db.insert(rsvps).values({
      guestId: guest[0].id,
      attending,
      mealPreference: attending ? (mealPreference || null) : null,
      message: message || null,
    }).returning({ id: rsvps.id });
    insertedRsvpId = inserted.id;
  } catch (err) {
    console.error("rsvp insert failed for guestId", guest[0].id, ":", err);
    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }

  try {
    await db
      .update(guests)
      .set({
        usedAt: new Date(),
        ...(name?.trim() ? { name: name.trim() } : {}),
      })
      .where(eq(guests.id, guest[0].id));
  } catch (err) {
    console.error("guest usedAt update failed for guestId", guest[0].id, "— attempting to remove orphaned rsvp id", insertedRsvpId, ":", err);
    try {
      await db.delete(rsvps).where(eq(rsvps.id, insertedRsvpId!));
      console.error("orphaned rsvp", insertedRsvpId, "removed successfully");
    } catch (deleteErr) {
      console.error("failed to remove orphaned rsvp id", insertedRsvpId, "— manual cleanup required:", deleteErr);
    }
    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
