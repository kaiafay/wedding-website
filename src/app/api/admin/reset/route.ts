import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { guests, rsvps } from "@/lib/schema";
import { eq } from "drizzle-orm";

function validateSession(request: NextRequest): boolean {
  if (!process.env.ADMIN_PASSWORD) return false;
  const validToken = createHmac("sha256", process.env.ADMIN_PASSWORD)
    .update("admin_session")
    .digest("hex");
  const cookie = request.cookies.get("admin_session");
  return cookie?.value === validToken;
}

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
    await db.update(guests).set({ usedAt: null }).where(eq(guests.id, guestId));
  } catch (err) {
    console.error("Failed to reset guest:", err);
    return NextResponse.json({ error: "Failed to reset guest" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
