import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

function isAuthenticated(sessionValue: string | undefined): boolean {
  if (!sessionValue || !process.env.ADMIN_PASSWORD) return false;
  const validToken = createHmac("sha256", process.env.ADMIN_PASSWORD)
    .update("admin_session")
    .digest("hex");
  return sessionValue === validToken;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!isAuthenticated(session?.value)) {
    return <AdminLogin />;
  }

  const allGuests = await db.query.guests.findMany({
    with: { rsvp: true },
    orderBy: (g, { asc }) => [asc(g.createdAt)],
  });

  const guestData = allGuests.map((g) => ({
    id: g.id,
    name: g.name,
    email: g.email,
    usedAt: g.usedAt?.toISOString() ?? null,
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

  return <AdminDashboard guests={guestData} />;
}
