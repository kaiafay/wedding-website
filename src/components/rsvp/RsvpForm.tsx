"use client";

import { useState } from "react";

interface RsvpFormProps {
  token: string;
  guestId: number;
  guestName: string | null;
}

const MEALS = ["Chicken", "Salmon", "Vegetarian"];

export default function RsvpForm({ token, guestId, guestName }: RsvpFormProps) {
  const [name, setName] = useState(guestName || "");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [meal, setMeal] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim() && attending !== null && !submitting;

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
          guestId,
          attending,
          mealPreference: meal,
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

  const inputStyle = {
    width: "100%",
    padding: "14px 0",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #3A3A3A",
    fontFamily: "var(--font-cormorant)",
    fontSize: 18,
    color: "var(--white)",
    outline: "none",
    borderRadius: 0,
  };

  if (submitted)
    return (
      <div style={{ textAlign: "center", paddingTop: 16 }}>
        <p
          className="font-sans"
          style={{
            fontSize: 13,
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
          style={{ fontSize: 52, color: "var(--white)", marginBottom: 16 }}
        >
          {attending ? "We'll see you there" : "We'll miss you"}
        </h2>
        <p
          className="font-serif italic"
          style={{ fontSize: 17, color: "var(--mauve-light)", lineHeight: 1.7 }}
        >
          {attending
            ? "Thank you so much — we can't wait to celebrate with you."
            : "Thank you for letting us know. We'll be thinking of you."}
        </p>
      </div>
    );

  return (
    <div style={{ marginTop: 48 }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <p
          className="font-sans"
          style={{
            fontSize: 10,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "var(--mauve-light)",
            marginBottom: 14,
          }}
        >
          Kindly reply by January 1st, 2027
        </p>
        <h2
          className="font-script"
          style={{
            fontSize: 54,
            color: "var(--white)",
            lineHeight: 1,
            marginBottom: 10,
          }}
        >
          Will you join us?
        </h2>
        <p
          className="font-serif italic"
          style={{ fontSize: 16, color: "var(--mauve-light)" }}
        >
          We'd love to celebrate with you
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
          style={{ ...inputStyle }}
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
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
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
                      : "var(--dark-mid)"
                    : "transparent",
                border:
                  attending === val
                    ? val
                      ? "1px solid var(--sage)"
                      : "1px solid var(--mauve)"
                    : "1px solid #3A3A3A",
                color: attending === val ? "var(--white)" : "var(--subtle)",
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
                borderBottom: "1px solid #2A2A2A",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: `1px solid ${meal === option ? "var(--mauve)" : "#3A3A3A"}`,
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
                style={{ fontSize: 17, color: "var(--white)" }}
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
          style={{ fontSize: 12, color: "#E07070", marginBottom: 12 }}
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
          background: canSubmit ? "var(--white)" : "transparent",
          color: canSubmit ? "var(--dark)" : "var(--subtle)",
          border: canSubmit ? "none" : "1px solid #3A3A3A",
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
    </div>
  );
}
