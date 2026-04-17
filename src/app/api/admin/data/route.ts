import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";

function validateSession(request: NextRequest): boolean {
  if (!process.env.ADMIN_PASSWORD) return false;
  const validToken = createHmac("sha256", process.env.ADMIN_PASSWORD)
    .update("admin_session")
    .digest("hex");
  const cookie = request.cookies.get("admin_session");
  return cookie?.value === validToken;
}

export async function GET(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allGuests = await db.query.guests.findMany({
    with: { rsvp: true },
    orderBy: (g, { asc }) => [asc(g.createdAt)],
  });

  const guests = allGuests.map((g) => ({
    id: g.id,
    name: g.name,
    email: g.email,
    usedAt: g.usedAt?.toISOString() ?? null,
    sentAt: g.sentAt?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
    rsvp: g.rsvp
      ? {
          id: g.rsvp.id,
          attending: g.rsvp.attending,
          mealPreference: g.rsvp.mealPreference,
          message: g.rsvp.message,
        }
      : null,
  }));

  return NextResponse.json({ guests });
}
