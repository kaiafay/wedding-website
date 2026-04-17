import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { guests } from "@/lib/schema";

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

  const { name, email } = await request.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const token = crypto.randomUUID();

  try {
    const [guest] = await db.insert(guests).values({ name, email, token }).returning();
    return NextResponse.json({ guest });
  } catch (err) {
    console.error("Failed to create guest:", err);
    return NextResponse.json({ error: "Failed to create guest" }, { status: 500 });
  }
}
