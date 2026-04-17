import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests, rsvps } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { validateSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { guestId } = await request.json();

  if (!guestId) {
    return NextResponse.json({ error: "Missing guestId" }, { status: 400 });
  }

  try {
    await db.delete(rsvps).where(eq(rsvps.guestId, guestId));
    await db.update(guests).set({ usedAt: null, sentAt: null }).where(eq(guests.id, guestId));
  } catch (err) {
    console.error("Failed to reset guest:", err);
    return NextResponse.json({ error: "Failed to reset guest" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
