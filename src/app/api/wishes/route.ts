import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { wishes } from "@/lib/schema";
import {
  WISH_MESSAGE_MAX,
  WISH_NAME_MAX,
} from "@/lib/wishes-constants";
import {
  getClientIp,
  isRateLimited,
  isValidPassphrase,
  recordPostAttempt,
} from "@/lib/wishes";

export async function GET() {
  const rows = await db
    .select({
      id: wishes.id,
      name: wishes.name,
      message: wishes.message,
    })
    .from(wishes)
    .where(eq(wishes.hidden, false))
    .orderBy(desc(wishes.createdAt));

  return NextResponse.json({ wishes: rows });
}

export async function POST(request: NextRequest) {
  if (!process.env.WISHES_PASSPHRASE) {
    return NextResponse.json(
      { error: "Wishes board is not available yet" },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);
  let body: { passphrase?: string; name?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const passphrase = String(body.passphrase ?? "");
  const name = String(body.name ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!isValidPassphrase(passphrase)) {
    return NextResponse.json({ error: "Invalid passphrase" }, { status: 403 });
  }

  if (!name || name.length > WISH_NAME_MAX) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  if (!message || message.length > WISH_MESSAGE_MAX) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many posts. Please try again later." },
      { status: 429 },
    );
  }

  const [inserted] = await db
    .insert(wishes)
    .values({ name, message })
    .returning({
      id: wishes.id,
      name: wishes.name,
      message: wishes.message,
    });

  await recordPostAttempt(ip);

  return NextResponse.json({ wish: inserted }, { status: 201 });
}
