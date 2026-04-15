"use client";

import { useState } from "react";
import EnvelopeAnimation from "@/components/rsvp/EnvelopeAnimation";
import RsvpForm from "@/components/rsvp/RsvpForm";

interface RsvpSectionProps {
  token: string | null;
  tokenValid: boolean;
  tokenChecked: boolean;
  tokenUsed: boolean;
  guestName: string | null;
}

export default function RsvpSection({
  token,
  tokenValid,
  tokenChecked,
  tokenUsed,
  guestName,
}: RsvpSectionProps) {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  if (!tokenChecked)
    return (
      <section
        id="rsvp"
        style={{ background: "var(--dark)", padding: "96px 0" }}
      />
    );

  return (
    <section
      id="rsvp"
      style={{ background: "var(--dark)", padding: "96px 0 112px" }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 24px" }}>
        {/* No token — public view */}
        {!token && (
          <div style={{ textAlign: "center" }}>
            <p
              className="font-sans"
              style={{
                fontSize: 10,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "var(--mauve-light)",
                marginBottom: 16,
              }}
            >
              Received an invitation?
            </p>
            <p
              className="font-serif italic"
              style={{ fontSize: 18, color: "var(--subtle)" }}
            >
              Use the link from your invitation to RSVP.
            </p>
          </div>
        )}

        {/* Token already used */}
        {tokenUsed && (
          <div style={{ textAlign: "center" }}>
            <p
              className="font-sans"
              style={{
                fontSize: 10,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "var(--mauve-light)",
                marginBottom: 16,
              }}
            >
              — already responded —
            </p>
            <p
              className="font-script"
              style={{ fontSize: 52, color: "var(--white)", marginBottom: 12 }}
            >
              We got your RSVP
            </p>
            <p
              className="font-serif italic"
              style={{
                fontSize: 16,
                color: "var(--mauve-light)",
                lineHeight: 1.7,
              }}
            >
              You've already responded to this invitation. If you need to make a
              change, please reach out to us directly.
            </p>
          </div>
        )}

        {/* Valid token — show envelope + form */}
        {tokenValid && (
          <>
            {!envelopeOpen && (
              <p
                className="font-sans"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: "var(--mauve-light)",
                  textAlign: "center",
                  marginBottom: 64,
                }}
              >
                Received an invitation? Open it below.
              </p>
            )}
            <EnvelopeAnimation
              isOpen={envelopeOpen}
              onOpen={() => setEnvelopeOpen(true)}
            />
            {envelopeOpen && (
              <RsvpForm
                token={token!}
                guestName={guestName}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
