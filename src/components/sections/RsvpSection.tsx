"use client";

import InvitationCard from "@/components/rsvp/InvitationCard";

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
  if (!tokenChecked)
    return (
      <section
        id="rsvp"
        style={{ background: "var(--white)", padding: "96px 0" }}
      />
    );

  return (
    <section
      id="rsvp"
      style={{ background: "var(--white)", padding: "56px 0 64px" }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 24px" }}>
        {/* Public view — no personal link (used tokens pass token=null from page) */}
        {!token && !tokenUsed && (
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
              style={{
                fontSize: 52,
                color: "var(--mauve)",
                marginBottom: 12,
              }}
            >
              We got your RSVP
            </p>
            <p
              className="font-serif italic"
              style={{
                fontSize: 16,
                color: "var(--subtle)",
                lineHeight: 1.7,
              }}
            >
              If you need to make a change, please reach out to us directly.
            </p>
          </div>
        )}

        {/* Valid token — envelope + form */}
        {tokenValid && <InvitationCard token={token!} guestName={guestName} />}
      </div>
    </section>
  );
}
