import NavBar from "@/components/NavBar";
import Footer from "@/components/sections/Footer";
import { db } from "@/lib/db";
import { guests } from "@/lib/schema";
import { eq } from "drizzle-orm";
import SaveTheDateCard from "./SaveTheDateCard";

export default async function SaveTheDatePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = (await searchParams).token;
  const token = Array.isArray(raw) ? raw[0] : raw;

  let guest: { name: string | null } | null = null;
  if (token) {
    const rows = await db
      .select({ name: guests.name })
      .from(guests)
      .where(eq(guests.saveTheDateToken, token))
      .limit(1);
    if (rows.length > 0) guest = rows[0];
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />

      {guest === null ? (
        <section
          style={{
            flex: 1,
            background: "var(--white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "120px 24px 80px",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <p
              className="font-sans"
              style={{
                fontSize: 10,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "var(--mauve-light)",
                marginBottom: 24,
              }}
            >
              Kaia &amp; Richard
            </p>
            <h1
              className="font-script"
              style={{
                fontSize: 52,
                color: "var(--charcoal)",
                lineHeight: 1,
                marginBottom: 24,
              }}
            >
              Save the Date
            </h1>
            <p
              className="font-serif italic"
              style={{ fontSize: 16, color: "var(--subtle)", lineHeight: 1.7 }}
            >
              This page is personal to each guest. Check your email for your
              invitation link.
            </p>
          </div>
        </section>
      ) : (
        <SaveTheDateCard guestName={guest.name} />
      )}

      <Footer />
    </div>
  );
}
