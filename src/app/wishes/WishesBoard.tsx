"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WISH_MESSAGE_MAX, WISH_NAME_MAX } from "@/lib/wishes-constants";

const PASSPHRASE_KEY = "wishes_passphrase";
const NAME_KEY = "wishes_name";

export type Wish = {
  id: number;
  name: string;
  message: string;
};

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
  boxSizing: "border-box",
};

const EASE: [number, number, number, number] = [0.25, 0, 0.2, 1];

export default function WishesBoard({
  initialWishes,
}: {
  initialWishes: Wish[];
}) {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [passphrase, setPassphrase] = useState("");
  const [storedPassphrase, setStoredPassphrase] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassphraseField, setShowPassphraseField] = useState(true);

  useEffect(() => {
    const savedPassphrase = sessionStorage.getItem(PASSPHRASE_KEY);
    const savedName = sessionStorage.getItem(NAME_KEY);
    if (savedPassphrase) {
      setStoredPassphrase(savedPassphrase);
      setPassphrase(savedPassphrase);
      setShowPassphraseField(false);
    }
    if (savedName) setName(savedName);
  }, []);

  function clearStoredPassphrase() {
    sessionStorage.removeItem(PASSPHRASE_KEY);
    setStoredPassphrase(null);
    setPassphrase("");
    setShowPassphraseField(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const activePassphrase = showPassphraseField ? passphrase : storedPassphrase;
    if (!activePassphrase?.trim()) {
      setError("Passphrase is required.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passphrase: activePassphrase.trim(),
          name: name.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 403) {
          clearStoredPassphrase();
        }
        setError(
          (data as { error?: string }).error ?? "Something went wrong.",
        );
        return;
      }

      const wish = (data as { wish: Wish }).wish;
      setWishes((prev) => [wish, ...prev]);
      sessionStorage.setItem(PASSPHRASE_KEY, activePassphrase.trim());
      sessionStorage.setItem(NAME_KEY, name.trim());
      setStoredPassphrase(activePassphrase.trim());
      setShowPassphraseField(false);
      setMessage("");
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .wishes-inner { padding: 0 24px !important; }
          .wishes-h1 { font-size: 42px !important; }
          .wishes-grid { columns: 1 !important; }
        }
        .wishes-grid {
          columns: 3;
          column-gap: 12px;
        }
        .wishes-card {
          break-inside: avoid;
          margin-bottom: 12px;
        }
        @media (max-width: 768px) {
          .wishes-grid { columns: 2 !important; }
        }
        .wishes-submit:hover {
          background: var(--mauve) !important;
          color: var(--white) !important;
        }
      `}</style>

      <section style={{ background: "var(--white)", padding: "120px 0 72px" }}>
        <div
          className="wishes-inner"
          style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}
        >
          <p
            className="font-sans"
            style={{
              fontSize: 10,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--mauve)",
              marginBottom: 20,
            }}
          >
            Notes &amp; Cheers
          </p>
          <h1
            className="font-script wishes-h1"
            style={{
              fontSize: 56,
              color: "var(--charcoal)",
              lineHeight: 1,
              marginBottom: 24,
            }}
          >
            Wishes
          </h1>
          <p
            className="font-sans"
            style={{
              fontSize: 15,
              fontWeight: 300,
              color: "var(--subtle)",
              lineHeight: 1.8,
              maxWidth: 560,
              marginBottom: 48,
            }}
          >
            A little wall of love from our people near and far. You&apos;ll need
            the passphrase to leave a note — reach out if you need it.
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: 480, marginBottom: 56 }}>
            {showPassphraseField ? (
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
                  Passphrase
                </label>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  autoComplete="off"
                  style={inputStyle}
                />
              </div>
            ) : (
              <div style={{ marginBottom: 28 }}>
                <p
                  className="font-sans"
                  style={{
                    fontSize: 12,
                    fontWeight: 300,
                    color: "var(--subtle)",
                    margin: 0,
                  }}
                >
                  Passphrase saved for this visit.{" "}
                  <button
                    type="button"
                    onClick={clearStoredPassphrase}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "var(--mauve)",
                      font: "inherit",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                    }}
                  >
                    Change
                  </button>
                </p>
              </div>
            )}

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
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={WISH_NAME_MAX}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
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
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={WISH_MESSAGE_MAX}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "none",
                  minHeight: 96,
                  borderBottom: "1px solid var(--rule)",
                }}
              />
            </div>

            {message.length >= WISH_MESSAGE_MAX - 40 && (
              <p
                className="font-sans"
                style={{
                  fontSize: 11,
                  color: "var(--mauve-light)",
                  marginBottom: 16,
                  marginTop: 0,
                }}
              >
                {WISH_MESSAGE_MAX - message.length} characters left
              </p>
            )}

            {error && (
              <p
                className="font-sans"
                style={{
                  fontSize: 12,
                  color: "var(--mauve-dark)",
                  marginBottom: 16,
                }}
              >
                {error}
              </p>
            )}

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  style={{ marginBottom: 20 }}
                >
                  <p
                    className="font-script"
                    style={{
                      fontSize: 32,
                      color: "var(--mauve)",
                      marginBottom: 6,
                    }}
                  >
                    Thank you
                  </p>
                  <p
                    className="font-serif italic"
                    style={{ fontSize: 15, color: "var(--subtle)", margin: 0 }}
                  >
                    Your note is on the wall.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting}
              className="font-sans wishes-submit"
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                padding: "14px 32px",
                background: "transparent",
                border: "1px solid var(--mauve)",
                color: "var(--mauve)",
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.6 : 1,
                transition: "background 0.2s ease, color 0.2s ease",
              }}
            >
              {submitting ? "Posting…" : "Leave a note"}
            </button>
          </form>

          <div
            style={{
              height: 1,
              background: "var(--rule)",
              marginBottom: 56,
              maxWidth: 900,
            }}
          />

          {wishes.length === 0 ? (
            <p
              className="font-serif italic"
              style={{
                fontSize: 17,
                color: "var(--subtle)",
                textAlign: "center",
                lineHeight: 1.7,
                padding: "24px 0 48px",
              }}
            >
              Be the first to leave a note. We&apos;d love to hear from you.
            </p>
          ) : (
            <div className="wishes-grid">
              <AnimatePresence initial={false}>
                {wishes.map((wish) => (
                  <motion.div
                    key={wish.id}
                    className="wishes-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    style={{
                      background: "var(--white)",
                      border: "1px solid var(--rule)",
                      padding: "28px 24px",
                    }}
                  >
                    <p
                      className="font-serif italic"
                      style={{
                        fontSize: 17,
                        color: "var(--charcoal)",
                        lineHeight: 1.65,
                        marginBottom: 20,
                        marginTop: 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      &ldquo;{wish.message}&rdquo;
                    </p>
                    <p
                      className="font-sans"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: "var(--mauve)",
                        margin: 0,
                      }}
                    >
                      — {wish.name}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
