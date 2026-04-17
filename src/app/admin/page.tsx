import { cookies } from "next/headers";
import { db } from "@/lib/db";
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

  return <AdminDashboard guests={guestData} />;
}
