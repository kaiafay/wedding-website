"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_NOTE = "We'd love to celebrate with you. Click the link below to RSVP.";

type RsvpRow = {
  id: number;
  attending: boolean;
  mealPreference: string | null;
  message: string | null;
};

type GuestRow = {
  id: number;
  name: string | null;
  email: string | null;
  usedAt: string | null;
  sentAt: string | null;
  createdAt: string;
  rsvp: RsvpRow | null;
};

const cell: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans), sans-serif",
  fontSize: 13,
  color: "var(--charcoal)",
  padding: "10px 12px",
  borderBottom: "1px solid var(--rule)",
  verticalAlign: "top",
};

const th: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans), sans-serif",
  fontSize: 9,
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  color: "var(--subtle)",
  padding: "8px 12px",
  borderBottom: "2px solid var(--rule)",
  textAlign: "left" as const,
  whiteSpace: "nowrap" as const,
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: "18px 24px",
        border: "1px solid var(--rule)",
        minWidth: 100,
        textAlign: "center",
      }}
    >
      <div
        className="font-sans"
        style={{ fontSize: 28, color: "var(--charcoal)", lineHeight: 1 }}
      >
        {value}
      </div>
      <div
        className="font-sans"
        style={{
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--subtle)",
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function AdminDashboard({ guests }: { guests: GuestRow[] }) {
  const router = useRouter();
  const [guestList, setGuestList] = useState<GuestRow[]>(guests);

  const responded = guestList.filter((g) => g.rsvp !== null);
  const attending = responded.filter((g) => g.rsvp?.attending);
  const notAttending = responded.filter((g) => !g.rsvp?.attending);
  const notResponded = guestList.filter((g) => g.rsvp === null);

  // Add guest form
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Reset confirmation modal
  const [resetGuestId, setResetGuestId] = useState<number | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Invite modal
  const [inviteGuestId, setInviteGuestId] = useState<number | null>(null);
  const [inviteNote, setInviteNote] = useState(DEFAULT_NOTE);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Poll for RSVP updates every 30 seconds
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/admin/data");
        if (!res.ok) return;
        const data = await res.json();
        setGuestList(data.guests);
      } catch {
        // silently ignore network errors between polls
      }
    }

    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  function openResetModal(guestId: number) {
    setResetGuestId(guestId);
    setResetError(null);
  }

  function closeResetModal() {
    setResetGuestId(null);
    setResetError(null);
  }

  async function handleConfirmReset() {
    if (!resetGuestId) return;
    setResetLoading(true);
    setResetError(null);
    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: resetGuestId }),
    });
    setResetLoading(false);
    if (res.ok) {
      setGuestList((prev) =>
        prev.map((g) => g.id === resetGuestId ? { ...g, rsvp: null, usedAt: null } : g)
      );
      closeResetModal();
    } else {
      setResetError("Reset failed. Please try again.");
    }
  }

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    const res = await fetch("/api/admin/guests/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: addName, email: addEmail }),
    });
    setAddLoading(false);
    if (res.ok) {
      const data = await res.json();
      const g = data.guest;
      setGuestList((prev) => [
        ...prev,
        { id: g.id, name: g.name, email: g.email, usedAt: null, sentAt: null, createdAt: g.createdAt, rsvp: null },
      ]);
      setAddName("");
      setAddEmail("");
    } else {
      const data = await res.json();
      setAddError(data.error ?? "Failed to add guest");
    }
  }

  function openInviteModal(guestId: number) {
    setInviteGuestId(guestId);
    setInviteNote(DEFAULT_NOTE);
    setInviteError(null);
  }

  function closeInviteModal() {
    setInviteGuestId(null);
    setInviteNote(DEFAULT_NOTE);
    setInviteError(null);
  }

  async function handleSendInvite() {
    if (!inviteGuestId) return;
    setInviteLoading(true);
    setInviteError(null);
    const res = await fetch("/api/admin/guests/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: inviteGuestId, note: inviteNote }),
    });
    setInviteLoading(false);
    if (res.ok) {
      setGuestList((prev) =>
        prev.map((g) => g.id === inviteGuestId ? { ...g, sentAt: new Date().toISOString() } : g)
      );
      closeInviteModal();
    } else {
      const data = await res.json();
      setInviteError(data.error ?? "Failed to send invite");
    }
  }

  const inviteGuest = inviteGuestId !== null
    ? guestList.find((g) => g.id === inviteGuestId) ?? null
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--white)",
        padding: "48px 32px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 36,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p
            className="font-script"
            style={{ fontSize: 36, color: "var(--charcoal)", lineHeight: 1 }}
          >
            RSVPs
          </p>
          <button
            onClick={handleLogout}
            className="font-sans"
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "none",
              border: "1px solid var(--rule)",
              color: "var(--subtle)",
              padding: "7px 14px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>

        {/* Add Guest Form */}
        <div
          style={{
            marginBottom: 40,
            padding: "24px",
            border: "1px solid var(--rule)",
          }}
        >
          <div
            className="font-sans"
            style={{
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--subtle)",
              marginBottom: 16,
            }}
          >
            Add Guest
          </div>
          <form
            onSubmit={handleAddGuest}
            style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label
                className="font-sans"
                style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--subtle)" }}
              >
                Name
              </label>
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                required
                placeholder="Full name"
                className="font-sans"
                style={{
                  fontSize: 13,
                  color: "var(--charcoal)",
                  border: "1px solid var(--rule)",
                  padding: "8px 12px",
                  background: "var(--white)",
                  outline: "none",
                  width: 200,
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label
                className="font-sans"
                style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--subtle)" }}
              >
                Email
              </label>
              <input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="font-sans"
                style={{
                  fontSize: 13,
                  color: "var(--charcoal)",
                  border: "1px solid var(--rule)",
                  padding: "8px 12px",
                  background: "var(--white)",
                  outline: "none",
                  width: 240,
                }}
              />
            </div>
            <button
              type="submit"
              disabled={addLoading}
              className="font-sans"
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                background: "var(--charcoal)",
                color: "var(--white)",
                border: "none",
                padding: "9px 18px",
                cursor: addLoading ? "default" : "pointer",
                opacity: addLoading ? 0.6 : 1,
              }}
            >
              {addLoading ? "Adding…" : "Add Guest"}
            </button>
          </form>
          {addError && (
            <p
              className="font-sans"
              style={{ fontSize: 12, color: "var(--mauve-dark)", marginTop: 10, marginBottom: 0 }}
            >
              {addError}
            </p>
          )}
        </div>

        {/* Summary */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          <SummaryCard label="Invited" value={guestList.length} />
          <SummaryCard label="Responded" value={responded.length} />
          <SummaryCard label="Attending" value={attending.length} />
          <SummaryCard label="Not attending" value={notAttending.length} />
        </div>

        {/* RSVP table */}
        <div
          className="font-sans"
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--subtle)",
            marginBottom: 14,
          }}
        >
          Responses ({responded.length})
        </div>
        <div style={{ overflowX: "auto", marginBottom: 48 }}>
          {responded.length === 0 ? (
            <p
              className="font-sans"
              style={{ fontSize: 13, color: "var(--subtle)", padding: "12px 0" }}
            >
              No responses yet.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Status</th>
                  <th style={th}>Meal</th>
                  <th style={th}>Message</th>
                  <th style={th}>RSVP&rsquo;d</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {responded.map((g) => (
                  <tr key={g.id}>
                    <td style={cell}>{g.name ?? "—"}</td>
                    <td style={cell}>{g.email ?? "—"}</td>
                    <td style={cell}>
                      <span
                        style={{
                          color: g.rsvp?.attending ? "var(--sage)" : "var(--mauve-dark)",
                        }}
                      >
                        {g.rsvp?.attending ? "Attending" : "Not attending"}
                      </span>
                    </td>
                    <td style={cell}>{g.rsvp?.mealPreference ?? "—"}</td>
                    <td style={{ ...cell, maxWidth: 220 }}>{g.rsvp?.message ?? "—"}</td>
                    <td style={{ ...cell, whiteSpace: "nowrap" }}>{formatDate(g.usedAt)}</td>
                    <td style={{ ...cell, whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => openResetModal(g.id)}
                        className="font-sans"
                        style={{
                          fontSize: 9,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          background: "none",
                          border: "1px solid var(--rule)",
                          color: "var(--subtle)",
                          padding: "4px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Reset
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Not yet responded */}
        <div
          className="font-sans"
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--subtle)",
            marginBottom: 14,
          }}
        >
          Not yet responded ({notResponded.length})
        </div>
        <div style={{ overflowX: "auto" }}>
          {notResponded.length === 0 ? (
            <p
              className="font-sans"
              style={{ fontSize: 13, color: "var(--subtle)", padding: "12px 0" }}
            >
              All guests have responded.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Added</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {notResponded.map((g) => (
                  <tr key={g.id}>
                    <td style={cell}>{g.name ?? "—"}</td>
                    <td style={cell}>{g.email ?? "—"}</td>
                    <td style={{ ...cell, whiteSpace: "nowrap" }}>
                      {formatDate(g.createdAt)}
                    </td>
                    <td style={{ ...cell, whiteSpace: "nowrap" }}>
                      {g.sentAt !== null ? (
                        <span
                          className="font-sans"
                          style={{
                            fontSize: 9,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "var(--sage)",
                          }}
                        >
                          Sent ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => openInviteModal(g.id)}
                          className="font-sans"
                          style={{
                            fontSize: 9,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            background: "none",
                            border: "1px solid var(--mauve-light)",
                            color: "var(--mauve-dark)",
                            padding: "4px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Send Invite
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetGuestId !== null && (() => {
        const guest = guestList.find((g) => g.id === resetGuestId);
        return (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(26, 26, 26, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "20px",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) closeResetModal(); }}
          >
            <div
              style={{
                background: "var(--white)",
                padding: "32px",
                maxWidth: 400,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                className="font-sans"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--subtle)",
                  marginBottom: 6,
                }}
              >
                Reset RSVP
              </div>
              <div
                className="font-sans"
                style={{ fontSize: 14, color: "var(--charcoal)", marginBottom: 20, lineHeight: 1.5 }}
              >
                Allow {guest?.name ?? "this guest"} to submit a new response?
              </div>
              {resetError && (
                <p
                  className="font-sans"
                  style={{ fontSize: 12, color: "var(--mauve-dark)", marginBottom: 16, marginTop: 0 }}
                >
                  {resetError}
                </p>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={closeResetModal}
                  disabled={resetLoading}
                  className="font-sans"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    background: "none",
                    border: "1px solid var(--rule)",
                    color: "var(--subtle)",
                    padding: "9px 18px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  disabled={resetLoading}
                  className="font-sans"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    background: "var(--charcoal)",
                    color: "var(--white)",
                    border: "none",
                    padding: "9px 18px",
                    cursor: resetLoading ? "default" : "pointer",
                    opacity: resetLoading ? 0.6 : 1,
                  }}
                >
                  {resetLoading ? "Resetting…" : "Reset"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Invite Modal */}
      {inviteGuestId !== null && inviteGuest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26, 26, 26, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeInviteModal(); }}
        >
          <div
            style={{
              background: "var(--white)",
              padding: "32px",
              maxWidth: 480,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              className="font-sans"
              style={{
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--subtle)",
                marginBottom: 6,
              }}
            >
              Send Invite
            </div>
            <div
              className="font-sans"
              style={{ fontSize: 14, color: "var(--charcoal)", marginBottom: 20 }}
            >
              {inviteGuest.name ?? "Guest"}{inviteGuest.email ? ` · ${inviteGuest.email}` : ""}
            </div>
            <div
              className="font-sans"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--subtle)",
                marginBottom: 8,
              }}
            >
              Personal note
            </div>
            <textarea
              value={inviteNote}
              onChange={(e) => setInviteNote(e.target.value)}
              rows={4}
              className="font-sans"
              style={{
                width: "100%",
                fontSize: 13,
                color: "var(--charcoal)",
                border: "1px solid var(--rule)",
                padding: "10px 12px",
                background: "var(--white)",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                lineHeight: 1.6,
              }}
            />
            {inviteError && (
              <p
                className="font-sans"
                style={{ fontSize: 12, color: "var(--mauve-dark)", marginTop: 8, marginBottom: 0 }}
              >
                {inviteError}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button
                onClick={closeInviteModal}
                disabled={inviteLoading}
                className="font-sans"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  background: "none",
                  border: "1px solid var(--rule)",
                  color: "var(--subtle)",
                  padding: "9px 18px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={inviteLoading || !inviteNote.trim()}
                className="font-sans"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  background: "var(--charcoal)",
                  color: "var(--white)",
                  border: "none",
                  padding: "9px 18px",
                  cursor: inviteLoading ? "default" : "pointer",
                  opacity: inviteLoading ? 0.6 : 1,
                }}
              >
                {inviteLoading ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
