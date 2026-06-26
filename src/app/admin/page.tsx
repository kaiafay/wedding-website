import { cookies } from "next/headers";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { wishes } from "@/lib/schema";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { isAuthenticated } from "@/lib/auth";
import { serializeGuest } from "@/lib/serializers";

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

  const guestData = allGuests.map(serializeGuest);

  const wishRows = await db
    .select({
      id: wishes.id,
      name: wishes.name,
      message: wishes.message,
      hidden: wishes.hidden,
      createdAt: wishes.createdAt,
    })
    .from(wishes)
    .orderBy(desc(wishes.createdAt));
  const wishData = wishRows.map((wish) => ({
    ...wish,
    createdAt: wish.createdAt.toISOString(),
  }));

  return <AdminDashboard guests={guestData} wishes={wishData} />;
}
