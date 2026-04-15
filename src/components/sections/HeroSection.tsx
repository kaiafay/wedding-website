import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      className="min-h-screen grid"
      style={{
        gridTemplateColumns: "1fr 1fr",
        background: "var(--dark)",
      }}
    >
      {/* Photo column */}
      <div className="relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80"
          alt="Couple"
          fill
          sizes="50vw"
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
      <div className="flex flex-col justify-center px-16 py-20">
        <p
          className="font-sans mb-8"
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
          className="my-9"
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
          className="mt-12 self-start flex items-center gap-3 transition-all duration-300"
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
  );
}
