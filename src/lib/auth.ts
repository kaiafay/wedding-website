import { NextRequest } from "next/server";
import { createHmac } from "crypto";

export function validateSession(request: NextRequest): boolean {
  if (!process.env.ADMIN_PASSWORD) return false;
  const validToken = createHmac("sha256", process.env.ADMIN_PASSWORD)
    .update("admin_session")
    .digest("hex");
  const cookie = request.cookies.get("admin_session");
  return cookie?.value === validToken;
}

export function isAuthenticated(sessionValue: string | undefined): boolean {
  if (!sessionValue || !process.env.ADMIN_PASSWORD) return false;
  const validToken = createHmac("sha256", process.env.ADMIN_PASSWORD)
    .update("admin_session")
    .digest("hex");
  return sessionValue === validToken;
}
