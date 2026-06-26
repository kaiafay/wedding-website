import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { wishes } from "@/lib/schema";
import { validateSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { hidden?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof body.hidden !== "boolean") {
    return NextResponse.json({ error: "Missing hidden field" }, { status: 400 });
  }

  const [updated] = await db
    .update(wishes)
    .set({ hidden: body.hidden })
    .where(eq(wishes.id, id))
    .returning({
      id: wishes.id,
      name: wishes.name,
      message: wishes.message,
      hidden: wishes.hidden,
      createdAt: wishes.createdAt,
    });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ wish: updated });
}
