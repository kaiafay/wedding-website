"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Stage = "idle" | "opening" | "rising" | "expanding" | "form";

const MEALS = ["Chicken", "Salmon", "Vegetarian"];

interface InvitationCardProps {
  token: string;
  guestName: string | null;
}

export default function InvitationCard({ token, guestName }: InvitationCardProps) {
  const [stage, setStage] = useState<Stage>("idle");

  // Form state
  const [name, setName] = useState(guestName || "");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [meal, setMeal] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    name.trim() &&
    attending !== null &&
    (attending === false || meal !== "") &&
    !submitting;

  const handleClick = () => {
    if (stage !== "idle") return;
    setStage("opening");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          attending,
          mealPreference: meal || null,
          message,
          name,
        }),
      });
      if (!res.ok) throw new Error("Something went wrong");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const envelopeVisible = stage === "idle" || stage === "opening" || stage === "rising";
  const cardVisible = stage === "expanding" || stage === "form";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 0",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--rule)",
    fontFamily: "var(--font-cormorant)",
    fontSize: 18,
    color: "var(--dark)",
    outline: "none",
    borderRadius: 0,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* ── ENVELOPE PHASE ── */}
      <AnimatePresence>
        {envelopeVisible && (
          <motion.div
            key="envelope-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            // Envelope is already visually gone (faded) by the time exit fires
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.5 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            {/* Hint — above the envelope, only during idle */}
            {stage === "idle" && (
              <p
                className="font-sans"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "var(--mauve-light)",
                  marginBottom: 24,
                }}
              >
                Open your invitation
              </p>
            )}

            {/* Bob wrapper + click target */}
            <motion.div
              animate={stage === "idle" ? { y: [0, -6, 0] } : { y: 0 }}
              transition={
                stage === "idle"
                  ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
              onClick={handleClick}
              style={{
                cursor: stage === "idle" ? "pointer" : "default",
                position: "relative",
                width: 320,
              }}
              role="button"
              tabIndex={stage === "idle" ? 0 : -1}
              onKeyDown={(e) => e.key === "Enter" && handleClick()}
            >
              {/* Clip container — hides card inside envelope during idle/opening */}
              <div
                style={{
                  position: "relative",
                  width: 320,
                  height: 213,
                  overflow: stage === "rising" ? "visible" : "hidden",
                }}
              >
                {/* Envelope body */}
                <motion.div
                  animate={stage === "rising" ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#EDE8E2",
                    borderRadius: 2,
                    boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
                    zIndex: 1,
                  }}
                >
                  {/* Side fold lines */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `
                        linear-gradient(135deg, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%),
                        linear-gradient(45deg, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%)
                      `,
                    }}
                  />
                </motion.div>

                {/* Wax seal — direct child of container so zIndex is in container's stacking
                    context, above the flap (zIndex 5). Fades with the envelope during rising. */}
                <motion.div
                  animate={stage === "rising" ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: 120,
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "var(--mauve-dark)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    zIndex: 6,
                  }}
                >
                  <span
                    className="font-script"
                    style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginTop: 2 }}
                  >
                    &
                  </span>
                </motion.div>

                {/* Mini card — rises out of envelope */}
                <motion.div
                  animate={stage === "rising" ? { y: -230 } : { y: 0 }}
                  transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                  onAnimationComplete={() => {
                    if (stage === "rising") setStage("expanding");
                  }}
                  style={{
                    position: "absolute",
                    left: 20,
                    right: 20,
                    bottom: 8,
                    background: "var(--white)",
                    padding: "18px 24px",
                    boxShadow: "0 -2px 12px rgba(0,0,0,0.1)",
                    // Behind the envelope body (zIndex 1) during idle/opening so it's hidden.
                    // Raised above everything once rising starts.
                    zIndex: stage === "rising" ? 3 : 0,
                  }}
                >
                  <p
                    className="font-script"
                    style={{ fontSize: 22, color: "var(--mauve)", textAlign: "center" }}
                  >
                    K & R
                  </p>
                  <p
                    className="font-serif italic"
                    style={{ fontSize: 12, color: "var(--subtle)", textAlign: "center" }}
                  >
                    July 8, 2027
                  </p>
                </motion.div>

                {/* Flap */}
                <motion.div
                  animate={
                    stage === "idle"
                      ? { rotateX: 0 }
                      : stage === "rising"
                      ? { rotateX: -175, opacity: 0 }
                      : { rotateX: -175 }
                  }
                  transition={
                    stage === "opening"
                      ? { duration: 0.65, ease: [0.4, 0, 0.2, 1] }
                      : stage === "rising"
                      ? { opacity: { duration: 0.3 } }
                      : {}
                  }
                  onAnimationComplete={() => {
                    if (stage === "opening") setStage("rising");
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 120,
                    transformOrigin: "top center",
                    transformStyle: "preserve-3d",
                    zIndex: stage === "idle" || stage === "opening" ? 5 : 0,
                  }}
                >
                  <svg
                    viewBox="0 0 320 120"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  >
                    <polygon points="0,0 320,0 160,120" fill="#E4DDD6" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CARD PHASE (expanding → form) ── */}
      <AnimatePresence>
        {cardVisible && (
          <motion.div
            key="card-phase"
            layout
            initial={{ width: 280, opacity: 0, y: -40 }}
            animate={{ width: 472, opacity: 1, y: 0 }}
            transition={{
              width: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.35 },
              y: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
              layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
            }}
            onAnimationComplete={() => {
              if (stage === "expanding") setStage("form");
            }}
            style={{
              background: "var(--white)",
              boxShadow: "0 4px 40px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            {submitted ? (
              /* Success */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ padding: "48px 40px", textAlign: "center" }}
              >
                <p
                  className="font-sans"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "var(--sage)",
                    marginBottom: 24,
                  }}
                >
                  — confirmed —
                </p>
                <h2
                  className="font-script"
                  style={{ fontSize: 52, color: "var(--dark)", marginBottom: 16 }}
                >
                  {attending ? "We'll see you there" : "We'll miss you"}
                </h2>
                <p
                  className="font-serif italic"
                  style={{ fontSize: 17, color: "var(--subtle)", lineHeight: 1.7 }}
                >
                  {attending
                    ? "Thank you so much — we can't wait to celebrate with you."
                    : "Thank you for letting us know. We'll be thinking of you."}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Mini card content shown while card is expanding */}
                {stage === "expanding" && (
                  <div style={{ padding: "18px 24px" }}>
                    <p
                      className="font-script"
                      style={{ fontSize: 22, color: "var(--mauve)", textAlign: "center" }}
                    >
                      K & R
                    </p>
                    <p
                      className="font-serif italic"
                      style={{ fontSize: 12, color: "var(--subtle)", textAlign: "center" }}
                    >
                      July 8, 2027
                    </p>
                  </div>
                )}

                {/* Full form — fades in once card is expanded */}
                {stage === "form" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ padding: "40px 40px 36px" }}
                  >
                    {/* Header */}
                    <div style={{ marginBottom: 40 }}>
                      <p
                        className="font-sans"
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.4em",
                          textTransform: "uppercase",
                          color: "var(--subtle)",
                          marginBottom: 14,
                        }}
                      >
                        Kindly reply by January 1st, 2027
                      </p>
                      <h2
                        className="font-script"
                        style={{
                          fontSize: 54,
                          color: "var(--dark)",
                          lineHeight: 1,
                          marginBottom: 10,
                        }}
                      >
                        Will you join us?
                      </h2>
                      <p
                        className="font-serif italic"
                        style={{ fontSize: 16, color: "var(--mauve)" }}
                      >
                        We&apos;d love to celebrate with you
                      </p>
                    </div>

                    {/* Name */}
                    <div style={{ marginBottom: 28 }}>
                      <label
                        className="font-sans"
                        style={{
                          display: "block",
                          fontSize: 10,
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                          color: "var(--subtle)",
                          marginBottom: 10,
                        }}
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        style={inputStyle}
                      />
                    </div>

                    {/* Attendance */}
                    <div style={{ marginBottom: 28 }}>
                      <label
                        className="font-sans"
                        style={{
                          display: "block",
                          fontSize: 10,
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                          color: "var(--subtle)",
                          marginBottom: 10,
                        }}
                      >
                        Attendance
                      </label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        {[true, false].map((val) => (
                          <button
                            key={String(val)}
                            onClick={() => setAttending(val)}
                            className="font-sans"
                            style={{
                              padding: "14px 12px",
                              background:
                                attending === val
                                  ? val
                                    ? "var(--sage)"
                                    : "var(--dark)"
                                  : "transparent",
                              border:
                                attending === val
                                  ? val
                                    ? "1px solid var(--sage)"
                                    : "1px solid var(--dark)"
                                  : "1px solid var(--rule)",
                              color:
                                attending === val
                                  ? "var(--white)"
                                  : "var(--subtle)",
                              fontSize: 10,
                              letterSpacing: "0.25em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                            }}
                          >
                            {val ? "Joyfully Accepts" : "Regretfully Declines"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Meal */}
                    {attending === true && (
                      <div style={{ marginBottom: 28 }}>
                        <label
                          className="font-sans"
                          style={{
                            display: "block",
                            fontSize: 10,
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: "var(--subtle)",
                            marginBottom: 10,
                          }}
                        >
                          Meal Preference
                        </label>
                        {MEALS.map((option) => (
                          <div
                            key={option}
                            onClick={() => setMeal(option)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              padding: "13px 0",
                              borderBottom: "1px solid var(--rule)",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                border: `1px solid ${meal === option ? "var(--mauve)" : "var(--rule)"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {meal === option && (
                                <div
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: "var(--mauve)",
                                  }}
                                />
                              )}
                            </div>
                            <span
                              className="font-serif"
                              style={{ fontSize: 17, color: "var(--dark)" }}
                            >
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message */}
                    <div style={{ marginBottom: 28 }}>
                      <label
                        className="font-sans"
                        style={{
                          display: "block",
                          fontSize: 10,
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                          color: "var(--subtle)",
                          marginBottom: 10,
                        }}
                      >
                        A Note{" "}
                        <span
                          className="font-serif italic"
                          style={{
                            fontSize: 13,
                            letterSpacing: 0,
                            textTransform: "none",
                            color: "var(--mauve)",
                          }}
                        >
                          optional
                        </span>
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share a wish or a few words…"
                        rows={3}
                        style={{ ...inputStyle, resize: "none", minHeight: 88 }}
                      />
                    </div>

                    {error && (
                      <p
                        className="font-sans"
                        style={{ fontSize: 12, color: "#C05050", marginBottom: 12 }}
                      >
                        {error}
                      </p>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="font-sans"
                      style={{
                        width: "100%",
                        padding: 16,
                        marginTop: 12,
                        background: canSubmit ? "var(--dark)" : "transparent",
                        color: canSubmit ? "var(--white)" : "var(--subtle)",
                        border: canSubmit ? "none" : "1px solid var(--rule)",
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.35em",
                        textTransform: "uppercase",
                        cursor: canSubmit ? "pointer" : "not-allowed",
                        transition: "background 0.2s, color 0.2s",
                      }}
                    >
                      {submitting ? "Sending…" : "Send RSVP"}
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
