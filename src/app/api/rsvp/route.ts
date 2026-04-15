import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { guests, rsvps } from "../../../lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, attending, mealPreference, message, name } = body;

  if (!token || attending === undefined || attending === null) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // Validate token
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

  // Save RSVP and invalidate token in a transaction
  await db.transaction(async (tx) => {
    await tx.insert(rsvps).values({
      guestId: guest[0].id,
      attending,
      mealPreference: attending ? mealPreference : null,
      message: message || null,
    });

    await tx
      .update(guests)
      .set({ usedAt: new Date() })
      .where(eq(guests.id, guest[0].id));
  });

  return NextResponse.json({ success: true });
}
