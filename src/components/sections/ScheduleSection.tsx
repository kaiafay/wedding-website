import SectionHeader from "@/components/ui/SectionHeader";

const schedule = [
  {
    time: "2:00 pm",
    event: "Ceremony",
    detail: "The part where\nit becomes official.",
  },
  {
    time: "3:00 pm",
    event: "Social Hour",
    detail: "Light bites and fresh air\nbefore we sit down together.",
  },
  {
    time: "4:30 pm",
    event: "Dinner & Toasts",
    detail: "Good food, kind words,\nand a first dance.",
  },
];

export default function ScheduleSection() {
  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .schedule-grid { grid-template-columns: 1fr !important; }
          .schedule-card { padding: 24px 20px !important; }
        }
      `}</style>
      <section style={{ background: "var(--white)", padding: "88px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
          {/* Header */}
          <SectionHeader label="The Day" title="Schedule" />

          {/* Grid */}
          <div
            className="schedule-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              background: "var(--rule)",
              border: "1px solid var(--rule)",
            }}
          >
            {schedule.map((item) => (
              <div
                key={item.event}
                className="schedule-card"
                style={{ background: "var(--white)", padding: "40px 32px" }}
              >
                <p
                  className="font-sans"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "var(--mauve)",
                    marginBottom: 14,
                  }}
                >
                  {item.time}
                </p>
                <p
                  className="font-serif italic"
                  style={{
                    fontSize: 24,
                    color: "var(--charcoal)",
                    marginBottom: 10,
                  }}
                >
                  {item.event}
                </p>
                <p
                  className="font-sans"
                  style={{
                    fontSize: 12,
                    fontWeight: 300,
                    color: "var(--subtle)",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
