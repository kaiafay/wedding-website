import SectionHeader from "@/components/ui/SectionHeader";

const schedule = [
  {
    time: "4:00 pm",
    event: "Ceremony",
    detail: "Outdoor-ish plan.\nAddress comes later.",
  },
  {
    time: "5:00 pm",
    event: "Cocktail Hour",
    detail: "Drinks and small talk.\nWhere TBD.",
  },
  {
    time: "6:30 pm",
    event: "Reception",
    detail: "Food, toasts, dance floor.\nDetails to follow.",
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
