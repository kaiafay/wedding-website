"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";

const faqs = [
  {
    q: "What's the dress code?",
    a: "We’re calling it dressy casual, which is everyone’s least favorite phrase, but you know the drill: look nice, skip the jeans.",
  },
  {
    q: "Where is the venue and where do I park?",
    a: "Venue to be announced — check back soon. We'll update this page with the full address and parking details once everything is confirmed.",
  },
  {
    q: "Can I bring a plus-one?",
    a: "Your invitation will indicate whether a guest is included. If it’s not on your invite, we’re sorry. We’re working with limited space and an unlimited love for you.",
  },
  {
    q: "Are kids welcome?",
    a: "Please plan for adults only. Nothing against your kids, we're just keeping the headcount small and the guest list grown-up.",
  },
  {
    q: "Where are you registered?",
    a: "Registry coming soon. Your presence is truly the gift. But if you insist, we won't stop you.",
  },
  {
    q: "What if I cry?",
    a: "You’ll fit right in. Tissues will be provided. Waterproof mascara is on you.",
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
          className="font-sans faq-question"
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
    <>
      <style>{`
        @media (max-width: 640px) {
          .faq-question { letter-spacing: 0.08em !important; font-size: 9px !important; }
        }
      `}</style>
      <section style={{ background: "var(--white)", padding: "88px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
          {/* Header */}
          <SectionHeader label="Good to Know" title="FAQ" nowrap />

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
    </>
  );
}
