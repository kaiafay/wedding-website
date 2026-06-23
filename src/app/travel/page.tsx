import NavBar from "@/components/NavBar";
import Footer from "@/components/sections/Footer";
import SectionHeader from "@/components/ui/SectionHeader";

const hotels = [
  {
    name: "Super 8 by Wyndham Bellingham Airport",
    distance: "In Ferndale — closest to the venue",
    note: "Free breakfast, parking, and an indoor pool.",
    website: "https://www.wyndhamhotels.com/super-8/ferndale-washington/super-8-bellingham-airport-ferndale/overview",
    phone: "(360) 384-8881",
    tel: "tel:+13603848881",
  },
  {
    name: "La Quinta Inn & Suites Bellingham",
    distance: "~5 miles from the venue",
    note: "Free breakfast, pet-friendly, comfortable and reliable.",
    website: "https://www.wyndhamhotels.com/laquinta/bellingham-washington/la-quinta-bellingham/overview",
    phone: "(360) 738-7088",
    tel: "tel:+13607387088",
  },
  {
    name: "Hotel Bellwether",
    distance: "~10 miles — Bellingham waterfront",
    note: "Boutique hotel on the bay with water views.",
    website: "https://www.hotelbellwether.com",
    phone: "(360) 392-3100",
    tel: "tel:+13603923100",
  },
];

const restaurants = [
  {
    name: "Carnal",
    desc: "Wood-fired cooking with a seasonal menu. The move for a nicer dinner out.",
  },
  {
    name: "Rock and Rye Oyster House",
    desc: "Local seafood in a historic downtown building. Great cocktails.",
  },
  {
    name: "The Black Cat",
    desc: "Eclectic menu in a restored Victorian house. A true local institution.",
  },
  {
    name: "Boundary Bay Brewery",
    desc: "Casual and reliable, with a beer garden that's hard to beat on a warm evening.",
  },
];

const activities = [
  {
    name: "Whatcom Falls Park",
    desc: "Easy trails to a 40-foot waterfall. A quick and rewarding walk.",
  },
  {
    name: "Larrabee State Park",
    desc: "Washington's oldest state park — forest meets saltwater with views of the San Juans.",
  },
  {
    name: "Fairhaven Historic District",
    desc: "Walkable Victorian neighborhood with good coffee, independent shops, and waterfront views.",
  },
  {
    name: "Mount Baker",
    desc: "A day trip worth taking for alpine scenery. About an hour's drive east.",
  },
];

export default function TravelPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <style>{`
        .hotel-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .rec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1px; background: var(--rule); border: 1px solid var(--rule); }
        @media (max-width: 768px) {
          .hotel-grid { grid-template-columns: 1fr !important; }
          .rec-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .travel-inner { padding: 0 24px !important; }
        }
      `}</style>

      <NavBar />

      {/* Page header */}
      <section style={{ background: "var(--white)", padding: "120px 0 72px" }}>
        <div className="travel-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
          <p
            className="font-sans"
            style={{
              fontSize: 10,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--mauve)",
              marginBottom: 20,
            }}
          >
            July 10, 2027 · Bellingham, WA
          </p>
          <h1
            className="font-script"
            style={{ fontSize: 56, color: "var(--charcoal)", lineHeight: 1, marginBottom: 24 }}
          >
            Plan Your Visit
          </h1>
          <p
            className="font-sans"
            style={{
              fontSize: 15,
              fontWeight: 300,
              color: "var(--subtle)",
              lineHeight: 1.8,
              maxWidth: 560,
            }}
          >
            Bellingham is a beautiful corner of the Pacific Northwest — mountain views, easy waterfront walks, and some genuinely good restaurants. Here&apos;s everything you need to plan your trip.
          </p>
        </div>
      </section>

      {/* Getting Here */}
      <section style={{ background: "var(--white)", padding: "72px 0", borderTop: "1px solid var(--rule)" }}>
        <div className="travel-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
          <SectionHeader label="Logistics" title="Getting Here" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
            {/* Airports */}
            <div>
              <p
                className="font-sans"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--mauve)",
                  marginBottom: 16,
                }}
              >
                Flying In
              </p>
              <div style={{ marginBottom: 24 }}>
                <p className="font-serif italic" style={{ fontSize: 18, color: "var(--charcoal)", marginBottom: 6 }}>
                  Bellingham International (BLI)
                </p>
                <p className="font-sans" style={{ fontSize: 13, fontWeight: 300, color: "var(--subtle)", lineHeight: 1.7 }}>
                  Our closest airport — about 10 minutes from the venue. Fewer flight options, but the most convenient.
                </p>
              </div>
              <div>
                <p className="font-serif italic" style={{ fontSize: 18, color: "var(--charcoal)", marginBottom: 6 }}>
                  Seattle–Tacoma (SEA)
                </p>
                <p className="font-sans" style={{ fontSize: 13, fontWeight: 300, color: "var(--subtle)", lineHeight: 1.7 }}>
                  About 1.5–2 hours south via I-5. Worth considering if you need more flight options or a better fare.
                </p>
              </div>
            </div>

            {/* Parking */}
            <div>
              <p
                className="font-sans"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--mauve)",
                  marginBottom: 16,
                }}
              >
                Parking
              </p>
              <p className="font-serif italic" style={{ fontSize: 18, color: "var(--charcoal)", marginBottom: 6 }}>
                The Vasak Estate
              </p>
              <p className="font-sans" style={{ fontSize: 13, fontWeight: 300, color: "var(--subtle)", lineHeight: 1.7 }}>
                Ample parking on-site in the driveway and lawn — no need to stress about a spot. We&apos;ll share the full address closer to the date.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where to Stay */}
      <section style={{ background: "var(--white)", padding: "72px 0", borderTop: "1px solid var(--rule)" }}>
        <div className="travel-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
          <SectionHeader label="Accommodations" title="Where to Stay" />

          <div
            className="hotel-grid"
            style={{ gap: 1, background: "var(--rule)", border: "1px solid var(--rule)" }}
          >
            {hotels.map((hotel) => (
              <div key={hotel.name} style={{ background: "var(--white)", padding: "32px 28px" }}>
                <p className="font-serif italic" style={{ fontSize: 18, color: "var(--charcoal)", marginBottom: 6, lineHeight: 1.3 }}>
                  {hotel.name}
                </p>
                <p className="font-sans" style={{ fontSize: 11, color: "var(--mauve)", marginBottom: 14, fontWeight: 300 }}>
                  {hotel.distance}
                </p>
                <div style={{ height: 1, background: "var(--rule)", marginBottom: 14 }} />
                <p className="font-sans" style={{ fontSize: 12, fontWeight: 300, color: "var(--subtle)", lineHeight: 1.6, marginBottom: 16 }}>
                  {hotel.note}
                </p>
                <a
                  href={hotel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans"
                  style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--mauve)", textDecoration: "none", display: "block", marginBottom: 6 }}
                >
                  Visit Website →
                </a>
                <a
                  href={hotel.tel}
                  className="font-sans"
                  style={{ fontSize: 11, fontWeight: 300, color: "var(--subtle)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.1 6.1l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {hotel.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* While You're Here */}
      <section style={{ background: "var(--white)", padding: "72px 0 96px", borderTop: "1px solid var(--rule)" }}>
        <div className="travel-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
          <SectionHeader label="Explore" title="While You're Here" />

          {/* Eat */}
          <p
            className="font-sans"
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--mauve)",
              marginBottom: 16,
            }}
          >
            Eat
          </p>
          <div className="rec-grid" style={{ marginBottom: 48 }}>
            {restaurants.map((r) => (
              <div key={r.name} style={{ background: "var(--white)", padding: "24px 28px" }}>
                <p className="font-serif italic" style={{ fontSize: 17, color: "var(--charcoal)", marginBottom: 6 }}>
                  {r.name}
                </p>
                <p className="font-sans" style={{ fontSize: 12, fontWeight: 300, color: "var(--subtle)", lineHeight: 1.6 }}>
                  {r.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Do */}
          <p
            className="font-sans"
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--mauve)",
              marginBottom: 16,
            }}
          >
            Do
          </p>
          <div className="rec-grid">
            {activities.map((a) => (
              <div key={a.name} style={{ background: "var(--white)", padding: "24px 28px" }}>
                <p className="font-serif italic" style={{ fontSize: 17, color: "var(--charcoal)", marginBottom: 6 }}>
                  {a.name}
                </p>
                <p className="font-sans" style={{ fontSize: 12, fontWeight: 300, color: "var(--subtle)", lineHeight: 1.6 }}>
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
