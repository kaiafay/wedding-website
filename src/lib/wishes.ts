import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { wishPostAttempts } from "@/lib/schema";
import {
  WISH_POST_LIMIT,
  WISH_POST_WINDOW_MS,
} from "@/lib/wishes-constants";

export { WISH_NAME_MAX, WISH_MESSAGE_MAX } from "@/lib/wishes-constants";

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function hashIp(ip: string): string {
  const secret = process.env.WISHES_PASSPHRASE ?? "wishes-rate-limit";
  return createHmac("sha256", secret).update(ip).digest("hex");
}

export function isValidPassphrase(passphrase: string): boolean {
  const expected = process.env.WISHES_PASSPHRASE;
  if (!expected) return false;

  const provided = Buffer.from(passphrase);
  const target = Buffer.from(expected);
  if (provided.length !== target.length) return false;

  return timingSafeEqual(provided, target);
}

export async function isRateLimited(ip: string): Promise<boolean> {
  const ipHash = hashIp(ip);
  const windowStart = new Date(Date.now() - WISH_POST_WINDOW_MS);

  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(wishPostAttempts)
    .where(
      and(
        eq(wishPostAttempts.ipHash, ipHash),
        gte(wishPostAttempts.createdAt, windowStart),
      ),
    );

  return (rows[0]?.count ?? 0) >= WISH_POST_LIMIT;
}

export async function recordPostAttempt(ip: string): Promise<void> {
  const ipHash = hashIp(ip);
  await db.insert(wishPostAttempts).values({ ipHash });

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await db
    .delete(wishPostAttempts)
    .where(lt(wishPostAttempts.createdAt, cutoff));
}
