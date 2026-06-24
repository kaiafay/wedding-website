"use client";

import { motion } from "framer-motion";

const GOOGLE_CAL_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=Kaia+%26+Richard%27s+Wedding" +
  "&dates=20270710T210000Z%2F20270711T020000Z" +
  "&location=Bellingham%2C+Washington" +
  "&details=Ceremony+at+2pm.+Formal+invitation+to+follow.";

const EASE: [number, number, number, number] = [0.25, 0, 0.2, 1];
const STEP = 0.25;

function fadeUp(delay: number, duration = 0.85) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration, ease: EASE, delay },
  };
}

export default function SaveTheDateCard({
  guestName,
}: {
  guestName: string | null;
}) {
  const imgDelay = guestName ? STEP : 0;
  const IMG_DURATION = 1.0;

  return (
    <section
      style={{
        flex: 1,
        background: "var(--white)",
        padding: "120px 24px 80px",
      }}
    >
      <style>{`
        .std-cal-btn {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 10px 20px;
          display: inline-block;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .std-cal-btn-mauve {
          color: var(--mauve);
          border: 1px solid var(--mauve);
        }
        .std-cal-btn-mauve:hover {
          background: var(--mauve);
          color: var(--white);
        }
        .std-cal-btn-rule {
          color: var(--charcoal);
          border: 1px solid var(--rule);
        }
        .std-cal-btn-rule:hover {
          background: var(--rule);
        }
      `}</style>

      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        {/* Personalized salutation — only if name is set */}
        {guestName && (
          <motion.p
            {...fadeUp(0)}
            className="font-sans"
            style={{
              fontSize: 10,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--mauve)",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            for {guestName}
          </motion.p>
        )}

        {/* Image — outer div: entrance fade-up; inner div: sustained bob */}
        <motion.div {...fadeUp(imgDelay, IMG_DURATION)} style={{ marginBottom: 40 }}>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: imgDelay + IMG_DURATION,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/save-the-date.webp"
              alt="Save the Date — Kaia &amp; Richard"
              style={{
                display: "block",
                width: "100%",
                boxShadow: "0 4px 40px rgba(0,0,0,0.12)",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Warm note */}
        <motion.p
          {...fadeUp(imgDelay + STEP)}
          className="font-serif italic"
          style={{
            fontSize: 16,
            color: "var(--subtle)",
            textAlign: "center",
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          We can&apos;t wait to celebrate with you.
        </motion.p>

        {/* Divider */}
        <motion.div
          {...fadeUp(imgDelay + STEP * 2)}
          style={{ height: 1, background: "var(--rule)", marginBottom: 40 }}
        />

        {/* Add to Calendar */}
        <motion.div
          {...fadeUp(imgDelay + STEP * 3)}
          style={{ textAlign: "center" }}
        >
          <p
            className="font-sans"
            style={{
              fontSize: 10,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--subtle)",
              marginBottom: 20,
            }}
          >
            Add to Calendar
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href={GOOGLE_CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans std-cal-btn std-cal-btn-mauve"
            >
              Google Calendar
            </a>
            <a href="/api/ics" className="font-sans std-cal-btn std-cal-btn-rule">
              Apple / Outlook
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
