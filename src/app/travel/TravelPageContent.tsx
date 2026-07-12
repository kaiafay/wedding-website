"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";

const EASE: [number, number, number, number] = [0.25, 0, 0.2, 1];

const hotels = [
  {
    name: "Super 8",
    distance: "In Ferndale — closest to the venue",
    note: "Free breakfast and an indoor pool.",
    website: "https://www.wyndhamhotels.com/super-8/ferndale-washington/super-8-bellingham-airport-ferndale/overview",
    phone: "(360) 384-8881",
    tel: "tel:+13603848881",
  },
  {
    name: "La Quinta Inn & Suites",
    distance: "~5 miles from the venue",
    note: "Pet-friendly with free parking.",
    website: "https://www.wyndhamhotels.com/laquinta/bellingham-washington/la-quinta-bellingham/overview",
    phone: "(360) 747-7685",
    tel: "tel:+13607477685",
  },
  {
    name: "Hotel Bellwether",
    distance: "~10 miles — Bellingham waterfront",
    note: "Boutique accommodations with waterfront views.",
    website: "https://www.hotelbellwether.com",
    phone: "(360) 392-3100",
    tel: "tel:+13603923100",
  },
];

const restaurants = [
  {
    name: "Mallard Ice Cream",
    desc: "A local ice cream shop known for inventive flavors made in small batches. Don't skip it.",
  },
  {
    name: "Fiamma Pizza",
    desc: "Downtown pizza with creative specials and plenty of reliable favorites. Our go-to for a casual dinner out.",
  },
  {
    name: "Chihuahua Mexican Restaurant",
    desc: "Our favorite Mexican spot, right in Ferndale. Casual and consistently good — worth a stop while you're in town.",
  },
];

const activities = [
  {
    name: "Fairhaven Historic District",
    desc: "A charming historic neighborhood south of downtown. Stop at Fairhaven Poke for lunch and Village Books for a leisurely browse.",
  },
  {
    name: "Larrabee State Park",
    desc: "Washington's first state park, where forest meets saltwater. Short trails with views out to the San Juan Islands.",
  },
  {
    name: "Mount Baker",
    desc: "A couple of hours east into the Cascades, where Kaia grew up skiing. The drive to Artist Point is worth it even if you never leave the car.",
  },
];

function fadeUp(delay: number, duration = 0.6, reduced = false) {
  if (reduced) return { initial: false as const };
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration, ease: EASE, delay },
  };
}

function reveal(
  reduced: boolean,
  delay = 0,
  duration = 0.55,
) {
  if (reduced) return { initial: false as const };
  return {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-48px" },
    transition: { duration, ease: EASE, delay },
  };
}

export default function TravelPageContent() {
  const reduced = useReducedMotion() ?? false;

  return (
    <>
      <style>{`
        .hotel-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .rec-row { display: flex; gap: 40px; padding: 20px 0; }
        .rec-row-name { flex-shrink: 0; width: 200px; }
        @media (max-width: 768px) {
          .hotel-grid { grid-template-columns: 1fr !important; }
          .rec-row { flex-direction: column; gap: 8px; }
          .rec-row-name { width: auto !important; }
        }
        @media (max-width: 600px) {
          .travel-inner { padding: 0 24px !important; }
          .travel-h1 { font-size: 42px !important; }
          .travel-section-title { font-size: 34px !important; }
        }
      `}</style>

      {/* Page header */}
      <section style={{ background: "var(--white)", padding: "120px 0 72px" }}>
        <div className="travel-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
          <motion.p
            {...fadeUp(0.1, 0.55, reduced)}
            className="font-sans"
            style={{
              fontSize: 10,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--mauve)",
              marginBottom: 20,
            }}
          >
            Getting Here · Bellingham, WA
          </motion.p>
          <motion.h1
            {...fadeUp(0.18, 0.55, reduced)}
            className="font-script travel-h1"
            style={{ fontSize: 56, color: "var(--charcoal)", lineHeight: 1, marginBottom: 24 }}
          >
            Plan Your Visit
          </motion.h1>
          <motion.p
            {...fadeUp(0.26, 0.55, reduced)}
            className="font-sans"
            style={{
              fontSize: 15,
              fontWeight: 300,
              color: "var(--subtle)",
              lineHeight: 1.8,
              maxWidth: 560,
            }}
          >
            Bellingham sits between the mountains and the bay, with waterfront walks, plenty of good food, and no shortage of ways to spend a free afternoon. Here are a few places worth knowing about while you&apos;re in town.
          </motion.p>
        </div>
      </section>

      {/* Getting Here */}
      <section style={{ background: "var(--white)", padding: "72px 0", borderTop: "1px solid var(--rule)" }}>
        <motion.div
          {...reveal(reduced)}
          className="travel-inner"
          style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}
        >
          <SectionHeader label="Logistics" title="Getting Here" titleClassName="travel-section-title" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
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
                  About 1.5–2 hours south via I-5, depending on traffic. Worth considering if you need more flight options or a better fare.
                </p>
              </div>
            </div>

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
        </motion.div>
      </section>

      {/* Where to Stay */}
      <section style={{ background: "var(--white)", padding: "72px 0", borderTop: "1px solid var(--rule)" }}>
        <div className="travel-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
          <motion.div {...reveal(reduced)}>
            <SectionHeader label="Accommodations" title="Where to Stay" titleClassName="travel-section-title" />
          </motion.div>

          <div className="hotel-grid" style={{ gap: 20 }}>
            {hotels.map((hotel, i) => (
              <motion.div
                key={hotel.name}
                {...reveal(reduced, i * 0.06)}
                style={{
                  background: "var(--white)",
                  padding: "32px 28px",
                  border: "1px solid var(--rule)",
                }}
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* While You're Here */}
      <section style={{ background: "var(--white)", padding: "72px 0 96px", borderTop: "1px solid var(--rule)" }}>
        <div
          className="travel-inner"
          style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}
        >
          <motion.div {...reveal(reduced)}>
            <SectionHeader label="Explore" title="While You're Here" titleClassName="travel-section-title" />
          </motion.div>

          <motion.div {...reveal(reduced, 0.07)}>
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
            <div style={{ marginBottom: 48 }}>
              {restaurants.map((r) => (
                <div key={r.name} className="rec-row">
                  <p className="font-serif italic rec-row-name" style={{ fontSize: 17, color: "var(--charcoal)", margin: 0 }}>
                    {r.name}
                  </p>
                  <p className="font-sans" style={{ fontSize: 13, fontWeight: 300, color: "var(--subtle)", lineHeight: 1.7, margin: 0 }}>
                    {r.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...reveal(reduced, 0.14)}>
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
            <div>
              {activities.map((a) => (
                <div key={a.name} className="rec-row">
                  <p className="font-serif italic rec-row-name" style={{ fontSize: 17, color: "var(--charcoal)", margin: 0 }}>
                    {a.name}
                  </p>
                  <p className="font-sans" style={{ fontSize: 13, fontWeight: 300, color: "var(--subtle)", lineHeight: 1.7, margin: 0 }}>
                    {a.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
