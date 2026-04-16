"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
  {
    q: "What's the dress code?",
    a: "Think smart casual — somewhere between \"I tried\" and \"I dressed up for this.\" Button-ups, blouses, sundresses, maxi dresses, slacks, skirts. Leave the jeans and sneakers at home. You'll thank yourself in the photos.",
  },
  {
    q: "Where is the venue and where do I park?",
    a: "Whitmore Estate, 123 Garden Lane, Bellingham, WA 98225. Parking is available on-site. We recommend arriving 15 minutes early so you're not sprinting to your seat.",
  },
  {
    q: "Can I bring a plus-one?",
    a: "Your invitation will indicate whether a guest is included. If it's not on your invite, we're sorry — we're working with limited space and an unlimited love for you.",
  },
  {
    q: "Are kids welcome?",
    a: "This one's an adults-only celebration. We love your little ones, we promise — but tonight is for the grown-ups.",
  },
  {
    q: "Where are you registered?",
    a: "Registry coming soon. Your presence is truly the gift — but if you insist, we won't stop you.",
  },
  {
    q: "What if I cry?",
    a: "Honestly? Same. Tissues will be provided. No judgment.",
  },
];

function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--rule)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 24,
        }}
      >
        <span
          className="font-sans"
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--charcoal)",
          }}
        >
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{
            display: "block",
            flexShrink: 0,
            fontSize: 18,
            lineHeight: 1,
            color: "var(--mauve)",
            fontWeight: 300,
          }}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.33, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="font-sans"
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: "var(--subtle)",
                lineHeight: 1.7,
                paddingBottom: 24,
                maxWidth: 620,
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section style={{ background: "var(--white)", padding: "88px 0" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
        {/* Header */}
        <div className="flex items-center gap-6 mb-16">
          <span
            className="font-sans"
            style={{
              fontSize: 10,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--mauve)",
              whiteSpace: "nowrap",
            }}
          >
            Good to Know
          </span>
          <span
            className="font-script"
            style={{
              fontSize: 44,
              color: "var(--charcoal)",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            FAQ
          </span>
          <div
            className="flex-1"
            style={{ height: 1, background: "var(--rule)" }}
          />
        </div>

        {/* Accordion */}
        <div style={{ borderTop: "1px solid var(--rule)" }}>
          {faqs.map((item, i) => (
            <FaqItem
              key={item.q}
              q={item.q}
              a={item.a}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
