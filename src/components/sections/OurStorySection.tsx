const entries = [
  {
    label: "2021",
    title: "The Gym Era",
    body: "We went to the same gym for months. We never spoke. Not once. (In our defense, we both had headphones in.)",
  },
  {
    label: "July 2023",
    title: "The DM",
    body: "Richard slid into Kaia's Instagram DMs. She responded. The rest, as they say, is history — or at least a very long text thread.",
  },
  {
    label: "Us, Actually",
    title: "Black Cat & Golden Retriever",
    body: "He's a golden retriever in human form. She's a black cat who pretends she doesn't want attention. Together they lift weights, debate games vs. books, and somehow make it work beautifully.",
  },
  {
    label: "July 2025",
    title: "The Hike",
    body: "On a trail at one of their favorite spots, Richard got down on one knee. It was public enough to be a moment, private enough to be theirs.",
  },
];

export default function OurStorySection() {
  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .story-inner { padding: 0 20px !important; }
          .story-header-script { font-size: 34px !important; white-space: nowrap; }
          .story-entry-title { font-size: 26px !important; }
          .story-spine { left: 19px !important; transform: translateX(-50%) !important; }
          .story-entry { grid-template-columns: 38px 1fr !important; }
          .story-entry-left { display: none !important; }
          .story-entry-right {
            visibility: visible !important;
            padding-left: 16px !important;
            padding-right: 0 !important;
            text-align: left !important;
          }
        }
      `}</style>
      <section style={{ background: "var(--white)", padding: "88px 0" }}>
      <div className="story-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
        {/* Header */}
        <div className="flex items-center gap-6 mb-16">
          <span
            className="font-sans"
            style={{
              fontSize: 10,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--mauve)",
            }}
          >
            Our Story
          </span>
          <span
            className="font-script story-header-script"
            style={{
              fontSize: 44,
              color: "var(--charcoal)",
              lineHeight: 1,
            }}
          >
            How It Started
          </span>
          <div
            className="flex-1"
            style={{ height: 1, background: "var(--rule)" }}
          />
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical spine */}
          <div
            className="story-spine"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: 1,
              background: "var(--rule)",
              opacity: 0.8,
              transform: "translateX(-50%)",
            }}
          />

          {entries.map((entry, i) => {
            const isRight = i % 2 === 0;
            const align = isRight ? "right" : "left";

            return (
              <div
                key={entry.title}
                className="story-entry"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 40px 1fr",
                  alignItems: "start",
                  marginBottom: i < entries.length - 1 ? 32 : 0,
                }}
              >
                {/* Left content (shown for right-aligned / odd entries) */}
                <div
                  className="story-entry-left"
                  style={{
                    paddingRight: 32,
                    paddingBottom: 16,
                    textAlign: "right",
                    visibility: isRight ? "visible" : "hidden",
                  }}
                >
                  <span
                    className="font-sans"
                    style={{
                      display: "block",
                      fontSize: 9,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "var(--mauve)",
                      marginBottom: 8,
                    }}
                  >
                    {entry.label}
                  </span>
                  <p
                    className="font-script story-entry-title"
                    style={{
                      fontSize: 34,
                      color: "var(--charcoal)",
                      lineHeight: 1.1,
                      marginBottom: 10,
                    }}
                  >
                    {entry.title}
                  </p>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 13,
                      fontWeight: 300,
                      color: "var(--subtle)",
                      lineHeight: 1.75,
                      marginLeft: "auto",
                      maxWidth: 340,
                    }}
                  >
                    {entry.body}
                  </p>
                </div>

                {/* Spine dot */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: 18,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--mauve)",
                      flexShrink: 0,
                    }}
                  />
                </div>

                {/* Right content (shown for left-aligned / even entries) */}
                <div
                  className="story-entry-right"
                  style={{
                    paddingLeft: 32,
                    paddingBottom: 16,
                    textAlign: "left",
                    visibility: isRight ? "hidden" : "visible",
                  }}
                >
                  <span
                    className="font-sans"
                    style={{
                      display: "block",
                      fontSize: 9,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "var(--mauve)",
                      marginBottom: 8,
                    }}
                  >
                    {entry.label}
                  </span>
                  <p
                    className="font-script story-entry-title"
                    style={{
                      fontSize: 34,
                      color: "var(--charcoal)",
                      lineHeight: 1.1,
                      marginBottom: 10,
                    }}
                  >
                    {entry.title}
                  </p>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 13,
                      fontWeight: 300,
                      color: "var(--subtle)",
                      lineHeight: 1.75,
                      maxWidth: 340,
                    }}
                  >
                    {entry.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
    </>
  );
}
