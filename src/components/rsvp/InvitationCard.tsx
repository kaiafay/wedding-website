"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";

const FLAP_TIP_LEN = 112;
const FLAP_DURATION_S = 0.75;

const FLAP_FRONT = { r: 228, g: 221, b: 214 };
const FLAP_INNER = { r: 216, g: 209, b: 202 };

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type Stage = "idle" | "opening" | "rising" | "expanding" | "form";

const MEALS = ["Chicken", "Salmon", "Vegetarian"];

interface InvitationCardProps {
  token: string;
  guestName: string | null;
}

export default function InvitationCard({
  token,
  guestName,
}: InvitationCardProps) {
  const [stage, setStage] = useState<Stage>("idle");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeInIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeOutIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const risingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
      if (fadeOutIntervalRef.current) clearInterval(fadeOutIntervalRef.current);
      if (risingTimerRef.current) clearTimeout(risingTimerRef.current);
      if (expandingTimerRef.current) clearTimeout(expandingTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Form state
  const [name, setName] = useState(guestName || "");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [meal, setMeal] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Flap angle as a MotionValue so all derived SVG attributes and seal position
  // update via direct DOM subscription — no React re-renders on every animation frame.
  const flapAngle = useMotionValue(0);
  const flapTipY = useTransform(flapAngle, (v) => Math.cos(v) * FLAP_TIP_LEN);
  const flapFill = useTransform(flapAngle, (v) => {
    const cosA = Math.cos(v);
    const shade = 0.75 + 0.25 * Math.abs(cosA);
    const blend = (1 - cosA) / 2;
    const r = Math.round((FLAP_FRONT.r * (1 - blend) + FLAP_INNER.r * blend) * shade);
    const g = Math.round((FLAP_FRONT.g * (1 - blend) + FLAP_INNER.g * blend) * shade);
    const b = Math.round((FLAP_FRONT.b * (1 - blend) + FLAP_INNER.b * blend) * shade);
    return `rgb(${r},${g},${b})`;
  });
  const flapPoints = useTransform(flapTipY, (y) => `0,0 320,0 160,${y}`);
  // Seal fades to 0 as flap passes 40% of its travel; entirely GPU-driven
  const sealOpacity = useTransform(
    flapAngle,
    (v) => Math.max(0, 1 - v / (0.4 * Math.PI)),
  );
  // Seal is 48px tall; top:0 + y=(flapTipY-24) keeps its center tracking the flap tip.
  // left:50% + x:-24 centers it horizontally without changing the layout property.
  const sealCenterY = useTransform(flapTipY, (y) => y - 24);

  useEffect(() => {
    if (stage !== "opening") {
      if (stage === "idle") flapAngle.set(0);
      return;
    }
    flapAngle.set(0);
    const controls = animate(flapAngle, Math.PI, {
      duration: FLAP_DURATION_S,
      ease: easeOutCubic,
      onComplete: () => setStage("rising"),
    });
    return () => controls.stop();
  }, [stage, flapAngle]);

  const canSubmit =
    name.trim() &&
    attending !== null &&
    (attending === false || meal !== "") &&
    !submitting;

  const handleClick = () => {
    if (stage !== "idle") return;
    setStage("opening");

    try {
      const audio = new Audio("/music/invitation.mp3");
      audio.volume = 0;
      audioRef.current = audio;

      const TARGET_VOL = 0.4;
      const TICK = 50;

      // Fade in over 0.3 s
      const fadeInDelta = TARGET_VOL / (300 / TICK);
      fadeInIntervalRef.current = setInterval(() => {
        const a = audioRef.current;
        if (!a) {
          clearInterval(fadeInIntervalRef.current!);
          return;
        }
        const next = Math.min(TARGET_VOL, a.volume + fadeInDelta);
        a.volume = next;
        if (next >= TARGET_VOL) {
          clearInterval(fadeInIntervalRef.current!);
          fadeInIntervalRef.current = null;
        }
      }, TICK);

      // Fade out over last 3 s, triggered by timeupdate
      const handleTimeUpdate = () => {
        const a = audioRef.current;
        if (!a || fadeOutIntervalRef.current) return;
        if (a.duration && a.duration - a.currentTime <= 3) {
          const fadeOutDelta = a.volume / (3000 / TICK);
          fadeOutIntervalRef.current = setInterval(() => {
            const b = audioRef.current;
            if (!b) {
              clearInterval(fadeOutIntervalRef.current!);
              return;
            }
            const next = Math.max(0, b.volume - fadeOutDelta);
            b.volume = next;
            if (next <= 0) {
              clearInterval(fadeOutIntervalRef.current!);
              fadeOutIntervalRef.current = null;
            }
          }, TICK);
        }
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.play().catch(() => {});
    } catch {
      // autoplay blocked or audio unavailable — fail silently
    }
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

  const envelopeVisible =
    stage === "idle" || stage === "opening" || stage === "rising";
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
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <style>{`
        @media (max-width: 640px) {
          .rsvp-form-inner { padding: 24px 24px 20px !important; }
        }
      `}</style>
      {/* ── ENVELOPE PHASE ── */}
      <AnimatePresence>
        {envelopeVisible && (
          <motion.div
            key="envelope-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.5 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Hint — fades out upward on click so the envelope doesn't jump */}
            <AnimatePresence>
              {stage === "idle" && (
                <motion.p
                  key="hint"
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
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
                </motion.p>
              )}
            </AnimatePresence>

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
                maxWidth: "100%",
              }}
              role="button"
              tabIndex={stage === "idle" ? 0 : -1}
              onKeyDown={(e) => e.key === "Enter" && handleClick()}
            >
              {/* Perspective container — card occluded by envelope body (z-index) until it clears the top */}
              <div
                style={{
                  position: "relative",
                  width: 320,
                  height: 213,
                  overflow: "visible",
                }}
              >
                {/* Envelope body */}
                <motion.div
                  animate={stage === "rising" ? { opacity: 0 } : { opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: stage === "rising" ? 0.3 : 0,
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#EDE8E2",
                    borderRadius: 2,
                    boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
                    zIndex: 2,
                  }}
                >
                  {/* Crease lines — true corner diagonals (45°/135° gradients don't match a non-square box) */}
                  <svg
                    width={320}
                    height={213}
                    viewBox="0 0 320 213"
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                    }}
                    aria-hidden
                  >
                    <line
                      x1={0}
                      y1={0}
                      x2={320}
                      y2={213}
                      stroke="rgba(0,0,0,0.07)"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                    <line
                      x1={320}
                      y1={0}
                      x2={0}
                      y2={213}
                      stroke="rgba(0,0,0,0.07)"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </motion.div>

                {/* Wax seal — position and opacity driven entirely by MotionValues.
                    top:0 + y=sealCenterY keeps the center tracking the flap tip.
                    left:50% + x=-24 centers it horizontally (seal is 48px wide). */}
                <motion.div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    x: -24,
                    y: sealCenterY,
                    opacity: sealOpacity,
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 38% 38%, #8a7290, #6b5f73 60%, #5a4f60)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "inset 0 1px 3px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.1), 0 2px 10px rgba(0,0,0,0.35)",
                    border: "1.5px solid rgba(0,0,0,0.15)",
                    zIndex: 5,
                  }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      color: "rgba(255,255,255,0.8)",
                      lineHeight: 1,
                    }}
                  >
                    ⚜
                  </span>
                </motion.div>

                {/* Mini card — rises out of envelope */}
                <motion.div
                  animate={stage === "rising" ? { y: -230 } : { y: 0 }}
                  transition={{ duration: 1.0, ease: [0.33, 0, 0.2, 1] }}
                  onAnimationComplete={() => {
                    if (stage === "rising")
                      risingTimerRef.current = setTimeout(
                        () => setStage("expanding"),
                        100,
                      );
                  }}
                  style={{
                    position: "absolute",
                    left: 20,
                    right: 20,
                    bottom: 8,
                    background: "var(--white)",
                    padding: "18px 24px",
                    boxShadow: "0 -2px 12px rgba(0,0,0,0.1)",
                    zIndex: 1,
                  }}
                >
                  <p
                    className="font-script"
                    style={{
                      fontSize: 22,
                      color: "var(--mauve)",
                      textAlign: "center",
                    }}
                  >
                    K & R
                  </p>
                  <p
                    className="font-serif italic"
                    style={{
                      fontSize: 12,
                      color: "var(--subtle)",
                      textAlign: "center",
                    }}
                  >
                    July 8, 2027
                  </p>
                </motion.div>

                {/* Top flap — polygon points and fill are MotionValues that update the
                    SVG DOM attributes directly, bypassing React re-renders entirely */}
                <motion.div
                  animate={stage === "rising" ? { opacity: 0 } : { opacity: 1 }}
                  transition={
                    stage === "rising"
                      ? { opacity: { duration: 0.4 } }
                      : { duration: 0 }
                  }
                  style={{
                    position: "absolute",
                    /* viewBox y=0 (hinge) maps to SVG vertical center; shift up so hinge meets envelope top */
                    top: -FLAP_TIP_LEN,
                    left: 0,
                    width: 320,
                    height: FLAP_TIP_LEN * 2,
                    zIndex: 4,
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    width={320}
                    height={FLAP_TIP_LEN * 2}
                    viewBox={`0 ${-FLAP_TIP_LEN} 320 ${FLAP_TIP_LEN * 2}`}
                    style={{ display: "block" }}
                    aria-hidden
                  >
                    <motion.polygon
                      points={flapPoints}
                      fill={flapFill}
                    />
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
            initial={{ scaleX: 0.593, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{
              scaleX: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
              opacity: { duration: 0.5 },
            }}
            onAnimationComplete={() => {
              if (stage === "expanding")
                expandingTimerRef.current = setTimeout(
                  () => setStage("form"),
                  200,
                );
            }}
            style={{
              width: "100%",
              maxWidth: 472,
              transformOrigin: "center",
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
                  style={{
                    fontSize: 36,
                    color: "var(--charcoal)",
                    marginBottom: 16,
                  }}
                >
                  {attending ? "We'll see you there" : "We'll miss you"}
                </h2>
                <p
                  className="font-serif italic"
                  style={{
                    fontSize: 17,
                    color: "var(--subtle)",
                    lineHeight: 1.7,
                  }}
                >
                  {attending
                    ? "Thank you so much — we can't wait to celebrate with you."
                    : "Thank you for letting us know. We'll be thinking of you."}
                </p>
              </motion.div>
            ) : (
              /* mode="wait" ensures expanding content fades out before form fades in,
                 eliminating the flash of empty card between stages */
              <AnimatePresence mode="wait">
                {stage === "expanding" && (
                  <motion.div
                    key="expanding-content"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    style={{ padding: "18px 24px" }}
                  >
                    <p
                      className="font-script"
                      style={{
                        fontSize: 22,
                        color: "var(--mauve)",
                        textAlign: "center",
                      }}
                    >
                      K & R
                    </p>
                    <p
                      className="font-serif italic"
                      style={{
                        fontSize: 12,
                        color: "var(--subtle)",
                        textAlign: "center",
                      }}
                    >
                      July 8, 2027
                    </p>
                  </motion.div>
                )}

                {stage === "form" && (
                  <motion.div
                    key="form-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="rsvp-form-inner"
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
                          fontSize: 40,
                          color: "var(--charcoal)",
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

                    {/* Meal — AnimatePresence animates height so the card never jumps */}
                    <AnimatePresence>
                      {attending === true && (
                        <motion.div
                          key="meal-section"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
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
                        </motion.div>
                      )}
                    </AnimatePresence>

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
                        style={{
                          fontSize: 12,
                          color: "var(--mauve-dark)",
                          marginBottom: 12,
                        }}
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
                        // transparent border holds layout when inactive; no 2px shift on toggle
                        border: canSubmit
                          ? "1px solid var(--dark)"
                          : "1px solid transparent",
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
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
