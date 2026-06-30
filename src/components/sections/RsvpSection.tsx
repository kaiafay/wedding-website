"use client";

import { useEffect, useState } from "react";
import InvitationCard from "@/components/rsvp/InvitationCard";

type TokenState =
  | { status: "loading" }
  | { status: "none" }
  | { status: "valid"; name: string | null; token: string }
  | { status: "used" };

export default function RsvpSection() {
  const [tokenState, setTokenState] = useState<TokenState>({ status: "loading" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setTokenState({ status: "none" });
      return;
    }
    fetch(`/api/token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setTokenState({ status: "valid", name: data.name, token });
        } else if (data.reason === "used") {
          setTokenState({ status: "used" });
        } else {
          setTokenState({ status: "none" });
        }
      })
      .catch(() => setTokenState({ status: "none" }));
  }, []);

  const token = tokenState.status === "valid" ? tokenState.token : null;
  const tokenValid = tokenState.status === "valid";
  const tokenChecked = tokenState.status !== "loading";
  const tokenUsed = tokenState.status === "used";
  const guestName = tokenState.status === "valid" ? tokenState.name : null;

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
        {/* Public view — no token in URL */}
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
