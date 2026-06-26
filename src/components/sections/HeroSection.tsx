"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.25, 0, 0.2, 1];

function fadeUp(delay: number, duration = 0.85, reduced = false) {
  if (reduced) return { initial: false as const };
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration, ease: EASE, delay },
  };
}

export default function HeroSection() {
  const reduced = useReducedMotion() ?? false;

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .hero-section { grid-template-columns: 1fr !important; gap: 0.5rem !important; }
          .hero-photo { height: 45vh; }
          .hero-photo img { object-position: 50% 55% !important; }
          .hero-content { padding: 1rem 2rem 1.5rem !important; }
          .hero-tagline { margin-bottom: 1.25rem !important; }
          .hero-divider { margin-top: 1.25rem !important; margin-bottom: 1.25rem !important; }
          .hero-rsvp-btn { margin-top: 1.5rem !important; }
        }
      `}</style>
      <section
        id="hero"
        className="min-h-screen grid hero-section"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          background: "var(--dark-mid)",
        }}
      >
        {/* Photo column */}
        <motion.div
          className="relative overflow-hidden hero-photo"
          initial={reduced ? false : { opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.95, ease: EASE }}
        >
          <Image
            src="/0G5A5201.webp"
            alt="Couple"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{
              objectFit: "cover",
              filter: "saturate(0.7) contrast(1.05)",
            }}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, transparent 55%, var(--dark-mid) 100%)",
            }}
          />
        </motion.div>

        {/* Content column */}
        <div className="flex flex-col justify-center hero-content px-16 py-20">
          <motion.p
            {...fadeUp(0.15, 0.65, reduced)}
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
          </motion.p>

          <div
            className="font-script"
            style={{
              fontSize: "clamp(52px, 5.5vw, 80px)",
              color: "var(--white)",
              lineHeight: 1.05,
            }}
          >
            <motion.span {...fadeUp(0.23, 0.65, reduced)} style={{ display: "block" }}>
              Kaia
            </motion.span>
            <motion.span
              {...fadeUp(0.31, 0.65, reduced)}
              className="block"
              style={{ color: "var(--mauve)" }}
            >
              &
            </motion.span>
            <motion.span {...fadeUp(0.39, 0.65, reduced)} style={{ display: "block" }}>
              Richard
            </motion.span>
          </div>

          <motion.div
            className="my-9 hero-divider"
            initial={reduced ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: EASE, delay: reduced ? 0 : 0.47 }}
            style={{
              width: 40,
              height: 1,
              background: "var(--mauve)",
              transformOrigin: "left",
            }}
          />

          <motion.p
            {...fadeUp(0.55, 0.65, reduced)}
            className="font-serif mb-2"
            style={{
              fontSize: 14,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--white)",
            }}
          >
            Saturday · July 10th · 2027
          </motion.p>
          <motion.p
            {...fadeUp(0.63, 0.65, reduced)}
            className="font-serif italic mb-1"
            style={{ fontSize: 17, color: "var(--mauve-light)" }}
          >
            The Vasak Estate · Bellingham, WA
          </motion.p>
          <motion.button
            {...fadeUp(0.71, 0.65, reduced)}
            onClick={() =>
              document
                .getElementById("rsvp")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-12 hero-rsvp-btn self-start flex items-center gap-3 transition-[background] duration-300"
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
          </motion.button>
        </div>
      </section>
    </>
  );
}
