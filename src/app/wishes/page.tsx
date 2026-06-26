import NavBar from "@/components/NavBar";
import Footer from "@/components/sections/Footer";
import { db } from "@/lib/db";
import { wishes } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import WishesBoard from "./WishesBoard";

export const dynamic = "force-dynamic";

export default async function WishesPage() {
  const initialWishes = await db
    .select({
      id: wishes.id,
      name: wishes.name,
      message: wishes.message,
    })
    .from(wishes)
    .where(eq(wishes.hidden, false))
    .orderBy(desc(wishes.createdAt));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <WishesBoard initialWishes={initialWishes} />
      <Footer />
    </div>
  );
}
