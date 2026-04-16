import Image from "next/image";

export default function HeroSection() {
  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .hero-section { grid-template-columns: 1fr !important; gap: 0.5rem !important; }
          .hero-photo { height: 45vh; }
          .hero-photo img { object-position: 50% 55% !important; }
          .hero-content { padding: 1rem 2rem !important; }
          .hero-tagline { margin-bottom: 1.25rem !important; }
          .hero-divider { margin-top: 1.25rem !important; margin-bottom: 1.25rem !important; }
          .hero-rsvp-btn { margin-top: 1.5rem !important; }
        }
      `}</style>
      <section
        className="min-h-screen grid hero-section"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          background: "var(--dark)",
        }}
      >
        {/* Photo column */}
        <div className="relative overflow-hidden hero-photo">
          <Image
            src="/0G5A5201.webp"
            alt="Couple"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover", filter: "saturate(0.7) contrast(1.05)" }}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, transparent 55%, var(--dark) 100%)",
            }}
          />
        </div>

        {/* Content column */}
        <div className="flex flex-col justify-center hero-content px-16 py-20">
          <p
            className="font-sans hero-tagline mb-8"
            style={{
              fontSize: 10,
              fontWeight: 300,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "var(--mauve-light)",
            }}
          >
            Together with their families
          </p>

          <div
            className="font-script"
            style={{
              fontSize: "clamp(52px, 5.5vw, 80px)",
              color: "var(--white)",
              lineHeight: 1.05,
            }}
          >
            <span>Kaia</span>
            <span className="block" style={{ color: "var(--mauve)" }}>
              &
            </span>
            <span>Richard</span>
          </div>

          <div
            className="my-9 hero-divider"
            style={{ width: 40, height: 1, background: "var(--mauve)" }}
          />

          <p
            className="font-serif mb-2"
            style={{
              fontSize: 14,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--white)",
            }}
          >
            Thursday · July 8th · 2027
          </p>
          <p
            className="font-serif italic mb-1"
            style={{ fontSize: 17, color: "var(--mauve-light)" }}
          >
            To Be Determined
          </p>
          <p
            className="font-sans"
            style={{
              fontSize: 11,
              fontWeight: 300,
              letterSpacing: "0.15em",
              color: "var(--subtle)",
            }}
          >
            Bellingham, Washington
          </p>

          <button
            onClick={() =>
              document
                .getElementById("rsvp")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-12 hero-rsvp-btn self-start flex items-center gap-3 transition-all duration-300"
            style={{
              padding: "14px 32px",
              background: "transparent",
              border: "1px solid var(--mauve)",
              color: "var(--white)",
              fontSize: 10,
              fontWeight: 400,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--mauve)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            RSVP <span>→</span>
          </button>
        </div>
      </section>
    </>
  );
}
