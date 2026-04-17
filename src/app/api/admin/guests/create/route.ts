import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests } from "@/lib/schema";
import { validateSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email } = await request.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const token = crypto.randomUUID();

  try {
    const [guest] = await db.insert(guests).values({ name, email, token }).returning({
      id: guests.id,
      name: guests.name,
      email: guests.email,
      createdAt: guests.createdAt,
    });
    return NextResponse.json({ guest });
  } catch (err) {
    console.error("Failed to create guest:", err);
    return NextResponse.json({ error: "Failed to create guest" }, { status: 500 });
  }
}
