import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Admin password not configured" },
      { status: 500 },
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const sessionToken = createHmac("sha256", process.env.ADMIN_PASSWORD)
    .update("admin_session")
    .digest("hex");

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
