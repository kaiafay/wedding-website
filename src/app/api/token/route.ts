import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const guest = await db
    .select()
    .from(guests)
    .where(eq(guests.token, token))
    .limit(1);

  if (!guest.length) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  if (guest[0].usedAt) {
    return NextResponse.json({ valid: false, reason: "used" }, { status: 403 });
  }

  return NextResponse.json({
    valid: true,
    name: guest[0].name,
    guestId: guest[0].id,
  });
}
