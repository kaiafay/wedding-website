"use client";

import { useEffect, useRef, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";

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
  const [visibleEntries, setVisibleEntries] = useState<boolean[]>(
    () => new Array(entries.length).fill(false)
  );
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observations) => {
        observations.forEach((obs) => {
          if (obs.isIntersecting) {
            const idx = parseInt(
              (obs.target as HTMLElement).dataset.animIndex!,
              10
            );
            setVisibleEntries((prev) => {
              if (prev[idx]) return prev;
              const next = [...prev];
              next[idx] = true;
              return next;
            });
            observer.unobserve(obs.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const refs = entryRefs.current;
    refs.forEach((ref) => { if (ref) observer.observe(ref); });

    return () => { refs.forEach((ref) => { if (ref) observer.unobserve(ref); }); };
  }, []);

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
        /* Entrance animations — initial hidden state */
        .story-animate {
          opacity: 0;
          transition: opacity 1300ms ease-out, transform 1300ms ease-out;
        }
        @media (min-width: 601px) {
          .story-from-left  { transform: translateX(-50px); }
          .story-from-right { transform: translateX(50px); }
        }
        @media (max-width: 600px) {
          .story-from-left,
          .story-from-right { transform: translateY(30px); }
        }
        /* Stagger delays for label → title → body */
        .story-animate.story-delay-1 { transition-delay: 100ms; }
        .story-animate.story-delay-2 { transition-delay: 200ms; }
        /* Visible state — plays once, not reversed on scroll back */
        .story-animate.story-visible {
          opacity: 1;
          transform: none;
        }
      `}</style>
      <section style={{ background: "var(--white)", padding: "88px 0" }}>
        <div className="story-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
          {/* Header */}
          <SectionHeader label="Our Story" title="How It Started" titleClassName="story-header-script" />

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
              // isRight=true (i=0,2): content sits on LEFT side of spine → slides in from left
              // isRight=false (i=1,3): content sits on RIGHT side of spine → slides in from right
              const isRight = i % 2 === 0;
              const dirClass = isRight ? "story-from-left" : "story-from-right";
              const vis = visibleEntries[i] ? "story-visible" : "";

              const labelCls  = `font-sans story-animate ${dirClass} ${vis}`;
              const titleCls  = `font-script story-entry-title story-animate ${dirClass} story-delay-1 ${vis}`;
              const bodyCls   = `font-sans story-animate ${dirClass} story-delay-2 ${vis}`;

              return (
                <div
                  key={entry.title}
                  className="story-entry"
                  ref={(el) => { entryRefs.current[i] = el; }}
                  data-anim-index={String(i)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 40px 1fr",
                    alignItems: "start",
                    marginBottom: i < entries.length - 1 ? 32 : 0,
                  }}
                >
                  {/* Left content — visible for even entries (Gym Era, Black Cat) */}
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
                      className={labelCls}
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
                      className={titleCls}
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
                      className={bodyCls}
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

                  {/* Right content — visible for odd entries (The DM, The Hike) */}
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
                      className={labelCls}
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
                      className={titleCls}
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
                      className={bodyCls}
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
