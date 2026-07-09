"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_NOTE =
  "We'd love to celebrate with you. Click the link below to RSVP.";

// Controls when the bulk RSVP-send reminder appears. Per-guest sends remain available.
const BULK_RSVP_INVITE_AVAILABLE_DATE = "2027-03-10";

type RsvpRow = {
  id: number;
  attending: boolean;
  mealPreference: string | null;
  allergies: string | null;
  message: string | null;
};

type GuestRow = {
  id: number;
  name: string | null;
  email: string | null;
  usedAt: string | null;
  sentAt: string | null;
  saveTheDateSentAt: string | null;
  hasSaveTheDateToken: boolean;
  createdAt: string;
  rsvp: RsvpRow | null;
};

type WishRow = {
  id: number;
  name: string;
  message: string;
  hidden: boolean;
  createdAt: string;
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

const actionControl: React.CSSProperties = {
  width: 92,
  minHeight: 26,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isTodayOrAfter(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= target;
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="adm-summary-card"
      style={{
        padding: "18px 24px",
        border: "1px solid var(--rule)",
        minWidth: 100,
        textAlign: "center",
        boxSizing: "border-box",
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

function RecipientList({ guests }: { guests: GuestRow[] }) {
  return (
    <div
      style={{
        border: "1px solid var(--rule)",
        marginBottom: 20,
        maxHeight: 180,
        overflowY: "auto",
      }}
    >
      {guests.map((guest) => (
        <div
          key={guest.id}
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <div
            className="font-sans"
            style={{
              fontSize: 13,
              color: "var(--charcoal)",
              lineHeight: 1.4,
            }}
          >
            {guest.name ?? "Guest"}
          </div>
          <div
            className="font-sans"
            style={{
              fontSize: 11,
              color: "var(--subtle)",
              lineHeight: 1.5,
            }}
          >
            {guest.email ?? "No email"}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

export default function AdminDashboard({
  guests,
  wishes: initialWishes,
}: {
  guests: GuestRow[];
  wishes: WishRow[];
}) {
  const router = useRouter();
  const [guestList, setGuestList] = useState<GuestRow[]>(guests);
  const [wishList, setWishList] = useState<WishRow[]>(initialWishes);
  const [wishActionError, setWishActionError] = useState<string | null>(null);
  const [deleteWishId, setDeleteWishId] = useState<number | null>(null);
  const [deleteWishLoading, setDeleteWishLoading] = useState(false);

  const responded = guestList.filter((g) => g.rsvp !== null);
  const attending = responded.filter((g) => g.rsvp?.attending);
  const notAttending = responded.filter((g) => !g.rsvp?.attending);
  const notResponded = guestList.filter(
    (g) => g.rsvp === null && g.sentAt !== null,
  );
  const unsentStdGuests = guestList.filter(
    (g) => g.saveTheDateSentAt === null && g.email !== null && g.hasSaveTheDateToken,
  );
  const unsentStdCount = unsentStdGuests.length;
  const unsentRsvpGuests = guestList.filter(
    (g) => g.sentAt === null && g.email !== null,
  );
  const showRsvpSendBanner =
    isTodayOrAfter(BULK_RSVP_INVITE_AVAILABLE_DATE) &&
    unsentRsvpGuests.length > 0;

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
  const [sendRsvpConfirmOpen, setSendRsvpConfirmOpen] = useState(false);
  const [bulkInviteLoading, setBulkInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [bulkInviteResult, setBulkInviteResult] = useState<{
    sent: number;
    failed: number;
    skipped: number;
  } | null>(null);

  // Detail modal
  const [detailGuest, setDetailGuest] = useState<GuestRow | null>(null);

  // Send save the dates
  const [sendStdConfirmOpen, setSendStdConfirmOpen] = useState(false);
  const [sendStdLoading, setSendStdLoading] = useState(false);
  const [sendStdGuestId, setSendStdGuestId] = useState<number | null>(null);
  const [sendStdError, setSendStdError] = useState<string | null>(null);
  const [sendStdResult, setSendStdResult] = useState<{
    sent: number;
    failed: number;
    skipped: number;
  } | null>(null);

  useEffect(() => {
    document.documentElement.style.overscrollBehavior = "none";
    return () => {
      document.documentElement.style.overscrollBehavior = "";
    };
  }, []);

  // Poll for RSVP updates every 30 seconds, paused when tab is hidden
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

    let intervalId: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      stopPolling();
      intervalId = setInterval(poll, 30_000);
    }

    function stopPolling() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    }

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
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
        prev.map((g) =>
          g.id === resetGuestId
            ? {
                ...g,
                rsvp: null,
                usedAt: null,
                sentAt: null,
              }
            : g,
        ),
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
        {
          id: g.id,
          name: g.name,
          email: g.email,
          usedAt: null,
          sentAt: null,
          saveTheDateSentAt: null,
          hasSaveTheDateToken: true,
          createdAt: g.createdAt,
          rsvp: null,
        },
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

  async function sendSaveDates(guestId?: number) {
    if (guestId === undefined) {
      setSendStdLoading(true);
    } else {
      setSendStdGuestId(guestId);
    }
    setSendStdError(null);
    const res = await fetch("/api/admin/send-save-the-date", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: guestId === undefined ? undefined : JSON.stringify({ guestId }),
    });
    if (guestId === undefined) {
      setSendStdLoading(false);
    } else {
      setSendStdGuestId(null);
    }
    if (res.ok) {
      const data = await res.json();
      const results: { id: number; status: string }[] = data.results ?? [];
      const sentIds = new Set<number>(
        results.filter((r) => r.status === "sent").map((r) => r.id),
      );
      const sent = sentIds.size;
      const failed = results.filter((r) => r.status === "failed").length;
      const skipped = data.skipped ?? 0;
      const now = new Date().toISOString();
      setGuestList((prev) =>
        prev.map((g) =>
          sentIds.has(g.id) ? { ...g, saveTheDateSentAt: now } : g,
        ),
      );
      if (guestId === undefined) {
        setSendStdResult({ sent, failed, skipped });
      } else if (failed > 0 || sent === 0) {
        setSendStdError("Save the date was not sent. Check email and token.");
      }
    } else {
      const data = await res.json().catch(() => ({}));
      setSendStdError(
        (data as { error?: string }).error ??
          "Failed to send. Please try again.",
      );
    }
  }

  async function handleSendSaveDates() {
    await sendSaveDates();
  }

  async function handleSendSaveDateToGuest(guestId: number) {
    await sendSaveDates(guestId);
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
        prev.map((g) =>
          g.id === inviteGuestId
            ? { ...g, sentAt: new Date().toISOString() }
            : g,
        ),
      );
      closeInviteModal();
    } else {
      const data = await res.json();
      setInviteError(data.error ?? "Failed to send RSVP");
    }
  }

  async function handleSendAllInvites() {
    setBulkInviteLoading(true);
    setInviteError(null);
    setBulkInviteResult(null);
    const res = await fetch("/api/admin/guests/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: DEFAULT_NOTE }),
    });
    setBulkInviteLoading(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const results: { id: number; status: string }[] = data.results ?? [];
      const sentIds = new Set<number>(
        results.filter((r) => r.status === "sent").map((r) => r.id),
      );
      const now = new Date().toISOString();
      setGuestList((prev) =>
        prev.map((g) => (sentIds.has(g.id) ? { ...g, sentAt: now } : g)),
      );
      const failed = results.filter((r) => r.status === "failed").length;
      const skipped = data.skipped ?? 0;
      setBulkInviteResult({ sent: sentIds.size, failed, skipped });
    } else {
      setInviteError(
        (data as { error?: string }).error ??
          "Failed to send RSVP invites. Please try again.",
      );
    }
  }

  async function handleToggleWishHidden(id: number, hidden: boolean) {
    setWishActionError(null);
    try {
      const res = await fetch(`/api/admin/wishes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setWishActionError(
          (data as { error?: string }).error ?? "Failed to update wish.",
        );
        return;
      }
      setWishList((prev) =>
        prev.map((w) => (w.id === id ? (data.wish as WishRow) : w)),
      );
    } catch {
      setWishActionError("Failed to update wish.");
    }
  }

  function openDeleteWishModal(id: number) {
    setDeleteWishId(id);
    setWishActionError(null);
  }

  function closeDeleteWishModal() {
    if (deleteWishLoading) return;
    setDeleteWishId(null);
  }

  function closeSendRsvpConfirmModal() {
    if (bulkInviteLoading) return;
    setSendRsvpConfirmOpen(false);
    setInviteError(null);
  }

  async function handleConfirmDeleteWish() {
    if (deleteWishId === null) return;

    setWishActionError(null);
    setDeleteWishLoading(true);
    try {
      const res = await fetch(`/api/admin/wishes/${deleteWishId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      setDeleteWishLoading(false);
      if (!res.ok) {
        setWishActionError(
          (data as { error?: string }).error ?? "Failed to delete wish.",
        );
        return;
      }
      setWishList((prev) => prev.filter((w) => w.id !== deleteWishId));
      setDeleteWishId(null);
    } catch {
      setDeleteWishLoading(false);
      setWishActionError("Failed to delete wish.");
    }
  }

  const inviteGuest =
    inviteGuestId !== null
      ? (guestList.find((g) => g.id === inviteGuestId) ?? null)
      : null;
  const deleteWish =
    deleteWishId !== null
      ? (wishList.find((w) => w.id === deleteWishId) ?? null)
      : null;
  const sendSaveDateConfirmText = `Send a save the date email to ${unsentStdCount} ${
    unsentStdCount === 1 ? "guest" : "guests"
  } who haven't received one yet?`;
  const sendRsvpConfirmText = `Send an RSVP invite to ${unsentRsvpGuests.length} ${
    unsentRsvpGuests.length === 1 ? "guest" : "guests"
  } who haven't received one yet?`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--white)",
        padding: "48px 32px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @media (max-width: 639px) {
          .adm-col { display: none !important; }
          .adm-name-btn { display: inline !important; }
          .adm-name-txt { display: none !important; }
          .adm-summary { justify-content: center; }
          .adm-summary-card { flex: 1 1 calc(50% - 6px); max-width: calc(50% - 6px); }
        }
        @media (min-width: 640px) {
          .adm-col { display: table-cell !important; }
          .adm-name-btn { display: none !important; }
          .adm-name-txt { display: inline !important; }
          .adm-summary { justify-content: flex-start; }
          .adm-summary-card { flex: 1 1 0; }
        }
      `}</style>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 36,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p
            className="font-script"
            style={{
              fontSize: 36,
              color: "var(--charcoal)",
              lineHeight: 1,
              margin: 0,
            }}
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
            padding: "28px 32px",
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
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label
                className="font-sans"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--subtle)",
                }}
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
                  width: 220,
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label
                className="font-sans"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--subtle)",
                }}
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
                  width: 220,
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
              style={{
                fontSize: 12,
                color: "var(--mauve-dark)",
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              {addError}
            </p>
          )}
        </div>

        {/* Operational alerts */}
        {(unsentStdCount > 0 ||
          showRsvpSendBanner ||
          sendStdError ||
          inviteError) && (
          <div style={{ display: "grid", gap: 12, marginBottom: 40 }}>
            {sendStdError && (
              <div
                className="font-sans"
                style={{
                  padding: "14px 18px",
                  border: "1px solid var(--mauve-light)",
                  color: "var(--mauve-dark)",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {sendStdError}
              </div>
            )}
            {inviteError && inviteGuestId === null && (
              <div
                className="font-sans"
                style={{
                  padding: "14px 18px",
                  border: "1px solid var(--mauve-light)",
                  color: "var(--mauve-dark)",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {inviteError}
              </div>
            )}
            {unsentStdCount > 0 && (
              <div
                style={{
                  padding: "18px 20px",
                  border: "1px solid var(--rule)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <p
                  className="font-sans"
                  style={{
                    fontSize: 13,
                    color: "var(--charcoal)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {unsentStdCount} guest
                  {unsentStdCount === 1 ? "" : "s"} still need save the date
                  emails.
                </p>
                <button
                  onClick={() => {
                    setSendStdConfirmOpen(true);
                    setSendStdError(null);
                    setSendStdResult(null);
                  }}
                  className="font-sans"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    background: "var(--mauve)",
                    color: "var(--white)",
                    border: "none",
                    padding: "9px 18px",
                    cursor: "pointer",
                  }}
                >
                  Send All Save the Dates
                </button>
              </div>
            )}
            {showRsvpSendBanner && (
              <div
                style={{
                  padding: "18px 20px",
                  border: "1px solid var(--rule)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <p
                  className="font-sans"
                  style={{
                    fontSize: 13,
                    color: "var(--charcoal)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  RSVP invite sending is open. {unsentRsvpGuests.length} guest
                  {unsentRsvpGuests.length === 1 ? "" : "s"} still need RSVP
                  emails.
                </p>
                <button
                  onClick={() => {
                    setSendRsvpConfirmOpen(true);
                    setInviteError(null);
                    setBulkInviteResult(null);
                  }}
                  className="font-sans"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    background: "var(--mauve)",
                    color: "var(--white)",
                    border: "none",
                    padding: "9px 18px",
                    cursor: "pointer",
                  }}
                >
                  Send All RSVP Invites
                </button>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div
          className="adm-summary"
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          <SummaryCard label="Guests" value={guestList.length} />
          <SummaryCard label="Responded" value={responded.length} />
          <SummaryCard label="Attending" value={attending.length} />
          <SummaryCard label="Not attending" value={notAttending.length} />
        </div>

        {/* Guest table */}
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
          Guests ({guestList.length})
        </div>
        <div style={{ overflowX: "auto", marginBottom: 48 }}>
          {guestList.length === 0 ? (
            <p
              className="font-sans"
              style={{
                fontSize: 13,
                color: "var(--subtle)",
                padding: "12px 0",
              }}
            >
              No guests yet.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th className="adm-col" style={th}>
                    Email
                  </th>
                  <th className="adm-col" style={th}>
                    Save the Date
                  </th>
                  <th className="adm-col" style={th}>
                    RSVP Sent
                  </th>
                  <th style={th}>Status</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {guestList.map((g) => {
                  const canSendSaveTheDate =
                    g.saveTheDateSentAt === null &&
                    g.email !== null &&
                    g.hasSaveTheDateToken;
                  const canSendInvite = g.sentAt === null && g.email !== null;
                  const saveDateStatusLabel = g.saveTheDateSentAt
                    ? "Date Sent"
                    : g.email === null
                      ? "No Email"
                      : !g.hasSaveTheDateToken
                        ? "No Link"
                        : "No Date";
                  const rsvpStatusLabel = g.sentAt
                    ? "RSVP Sent"
                    : g.email === null
                      ? "No Email"
                      : "No RSVP";
                  return (
                    <tr key={g.id}>
                      <td style={cell}>
                        <button
                          onClick={() => setDetailGuest(g)}
                          className="font-sans adm-name-btn"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            margin: 0,
                            cursor: "pointer",
                            fontSize: 13,
                            color: "var(--charcoal)",
                            textAlign: "left",
                            textDecoration: "underline",
                            textDecorationColor: "var(--rule)",
                            textUnderlineOffset: "3px",
                          }}
                        >
                          {g.name ?? "—"}
                        </button>
                        <span className="adm-name-txt">{g.name ?? "—"}</span>
                      </td>
                      <td className="adm-col" style={cell}>
                        {g.email ?? "—"}
                      </td>
                      <td
                        className="adm-col"
                        style={{ ...cell, whiteSpace: "nowrap" }}
                      >
                        {g.saveTheDateSentAt
                          ? formatDate(g.saveTheDateSentAt)
                          : "—"}
                      </td>
                      <td
                        className="adm-col"
                        style={{ ...cell, whiteSpace: "nowrap" }}
                      >
                        {g.sentAt ? formatDate(g.sentAt) : "—"}
                      </td>
                      <td style={{ ...cell, whiteSpace: "nowrap" }}>
                        {g.rsvp ? (
                          <span
                            style={{
                              color: g.rsvp.attending
                                ? "var(--sage)"
                                : "var(--mauve-dark)",
                            }}
                          >
                            {g.rsvp.attending ? "Attending" : "Declined"}
                          </span>
                        ) : (
                          <span style={{ color: "var(--subtle)" }}>
                            Pending
                          </span>
                        )}
                      </td>
                      <td style={{ ...cell, minWidth: 250 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            justifyContent: "flex-end",
                            flexWrap: "wrap",
                          }}
                        >
                          {canSendSaveTheDate ? (
                            <button
                              onClick={() => handleSendSaveDateToGuest(g.id)}
                              disabled={sendStdGuestId === g.id}
                              className="font-sans"
                              style={{
                                ...actionControl,
                                fontSize: 9,
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                background: "none",
                                border: "1px solid var(--mauve-light)",
                                color: "var(--mauve-dark)",
                                padding: "4px 10px",
                                cursor:
                                  sendStdGuestId === g.id
                                    ? "default"
                                    : "pointer",
                                opacity: sendStdGuestId === g.id ? 0.6 : 1,
                              }}
                            >
                              {sendStdGuestId === g.id
                                ? "Sending…"
                                : "Send Date"}
                            </button>
                          ) : (
                            <span
                              className="font-sans"
                              style={{
                                ...actionControl,
                                fontSize: 9,
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                color: g.saveTheDateSentAt
                                  ? "var(--sage)"
                                  : "var(--subtle)",
                                padding: "5px 0",
                              }}
                            >
                              {saveDateStatusLabel}
                            </span>
                          )}
                          {canSendInvite ? (
                            <button
                              onClick={() => openInviteModal(g.id)}
                              className="font-sans"
                              style={{
                                ...actionControl,
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
                              Send RSVP
                            </button>
                          ) : (
                            <span
                              className="font-sans"
                              style={{
                                ...actionControl,
                                fontSize: 9,
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                color: g.sentAt
                                  ? "var(--sage)"
                                  : "var(--subtle)",
                                padding: "5px 0",
                              }}
                            >
                              {rsvpStatusLabel}
                            </span>
                          )}
                          {g.rsvp && (
                            <button
                              onClick={() => openResetModal(g.id)}
                              className="font-sans"
                              style={{
                                ...actionControl,
                                width: 68,
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
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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
              style={{
                fontSize: 13,
                color: "var(--subtle)",
                padding: "12px 0",
              }}
            >
              No responses yet.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th className="adm-col" style={th}>
                    Email
                  </th>
                  <th style={th}>Status</th>
                  <th className="adm-col" style={th}>
                    Meal
                  </th>
                  <th className="adm-col" style={th}>
                    Allergies
                  </th>
                  <th className="adm-col" style={th}>
                    Message
                  </th>
                  <th className="adm-col" style={th}>
                    RSVP&rsquo;d
                  </th>
                </tr>
              </thead>
              <tbody>
                {responded.map((g) => (
                  <tr key={g.id}>
                    <td style={cell}>
                      <button
                        onClick={() => setDetailGuest(g)}
                        className="font-sans adm-name-btn"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          margin: 0,
                          cursor: "pointer",
                          fontSize: 13,
                          color: "var(--charcoal)",
                          textAlign: "left",
                          textDecoration: "underline",
                          textDecorationColor: "var(--rule)",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        {g.name ?? "—"}
                      </button>
                      <span className="adm-name-txt">{g.name ?? "—"}</span>
                    </td>
                    <td className="adm-col" style={cell}>
                      {g.email ?? "—"}
                    </td>
                    <td style={cell}>
                      <span
                        style={{
                          color: g.rsvp?.attending
                            ? "var(--sage)"
                            : "var(--mauve-dark)",
                        }}
                      >
                        {g.rsvp?.attending ? "Attending" : "Not attending"}
                      </span>
                    </td>
                    <td className="adm-col" style={cell}>
                      {g.rsvp?.mealPreference ?? "—"}
                    </td>
                    <td className="adm-col" style={cell}>
                      {g.rsvp?.allergies ?? "—"}
                    </td>
                    <td className="adm-col" style={{ ...cell, maxWidth: 220 }}>
                      {g.rsvp?.message ?? "—"}
                    </td>
                    <td
                      className="adm-col"
                      style={{ ...cell, whiteSpace: "nowrap" }}
                    >
                      {formatDate(g.usedAt)}
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
              style={{
                fontSize: 13,
                color: "var(--subtle)",
                padding: "12px 0",
              }}
            >
              All guests have responded.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th className="adm-col" style={th}>
                    Email
                  </th>
                  <th className="adm-col" style={th}>
                    RSVP Sent
                  </th>
                </tr>
              </thead>
              <tbody>
                {notResponded.map((g) => (
                  <tr key={g.id}>
                    <td style={cell}>
                      <button
                        onClick={() => setDetailGuest(g)}
                        className="font-sans adm-name-btn"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          margin: 0,
                          cursor: "pointer",
                          fontSize: 13,
                          color: "var(--charcoal)",
                          textAlign: "left",
                          textDecoration: "underline",
                          textDecorationColor: "var(--rule)",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        {g.name ?? "—"}
                      </button>
                      <span className="adm-name-txt">{g.name ?? "—"}</span>
                    </td>
                    <td className="adm-col" style={cell}>
                      {g.email ?? "—"}
                    </td>
                    <td
                      className="adm-col"
                      style={{ ...cell, whiteSpace: "nowrap" }}
                    >
                      {g.sentAt ? formatDate(g.sentAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Wishes table */}
        <div
          className="font-sans"
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--subtle)",
            marginTop: 48,
            marginBottom: 14,
          }}
        >
          Wishes ({wishList.length})
        </div>
        {wishActionError && (
          <p
            className="font-sans"
            style={{
              fontSize: 12,
              color: "var(--mauve-dark)",
              marginTop: -4,
              marginBottom: 14,
            }}
          >
            {wishActionError}
          </p>
        )}
        <div style={{ overflowX: "auto" }}>
          {wishList.length === 0 ? (
            <p
              className="font-sans"
              style={{
                fontSize: 13,
                color: "var(--subtle)",
                padding: "12px 0",
              }}
            >
              No wishes yet.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Message</th>
                  <th className="adm-col" style={th}>
                    Posted
                  </th>
                  <th style={th}>Status</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {wishList.map((w) => (
                  <tr key={w.id}>
                    <td style={cell}>{w.name}</td>
                    <td style={{ ...cell, maxWidth: 360 }}>{w.message}</td>
                    <td className="adm-col" style={cell}>
                      {formatDate(w.createdAt)}
                    </td>
                    <td style={cell}>
                      <button
                        onClick={() => handleToggleWishHidden(w.id, !w.hidden)}
                        className="font-sans"
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          background: "none",
                          border: "1px solid var(--rule)",
                          color: w.hidden ? "var(--mauve-dark)" : "var(--sage)",
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        {w.hidden ? "Hidden" : "Visible"}
                      </button>
                    </td>
                    <td style={cell}>
                      <button
                        onClick={() => openDeleteWishModal(w.id)}
                        className="font-sans"
                        aria-label={`Delete wish from ${w.name}`}
                        title="Delete wish"
                        style={{
                          width: 30,
                          height: 30,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          border: "1px solid var(--rule)",
                          color: "var(--mauve-dark)",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detailGuest !== null &&
        (() => {
          const g = detailGuest;
          const isResponded = g.rsvp !== null;
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
              onClick={(e) => {
                if (e.target === e.currentTarget) setDetailGuest(null);
              }}
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
                    marginBottom: 20,
                  }}
                >
                  Guest Details
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {[
                    { label: "Name", value: g.name ?? "—" },
                    { label: "Email", value: g.email ?? "—" },
                    ...(isResponded
                      ? [
                          {
                            label: "Status",
                            value: g.rsvp?.attending
                              ? "Attending"
                              : "Not attending",
                          },
                          {
                            label: "Meal",
                            value: g.rsvp?.mealPreference ?? "—",
                          },
                          {
                            label: "Allergies",
                            value: g.rsvp?.allergies ?? "—",
                          },
                          { label: "Message", value: g.rsvp?.message ?? "—" },
                          { label: "RSVP'd", value: formatDate(g.usedAt) },
                        ]
                      : [
                          { label: "Added", value: formatDate(g.createdAt) },
                          {
                            label: "Save the date sent",
                            value: g.saveTheDateSentAt
                              ? formatDate(g.saveTheDateSentAt)
                              : "Not yet sent",
                          },
                          {
                            label: "RSVP sent",
                            value: g.sentAt
                              ? formatDate(g.sentAt)
                              : "Not yet sent",
                          },
                        ]),
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div
                        className="font-sans"
                        style={{
                          fontSize: 9,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "var(--subtle)",
                          marginBottom: 3,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        className="font-sans"
                        style={{
                          fontSize: 13,
                          color: "var(--charcoal)",
                          lineHeight: 1.5,
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 24,
                  }}
                >
                  <button
                    onClick={() => setDetailGuest(null)}
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
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Reset Confirmation Modal */}
      {resetGuestId !== null &&
        (() => {
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
              onClick={(e) => {
                if (e.target === e.currentTarget) closeResetModal();
              }}
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
                  style={{
                    fontSize: 14,
                    color: "var(--charcoal)",
                    marginBottom: 20,
                    lineHeight: 1.5,
                  }}
                >
                  Allow {guest?.name ?? "this guest"} to submit a new response?
                </div>
                {resetError && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 12,
                      color: "var(--mauve-dark)",
                      marginBottom: 16,
                      marginTop: 0,
                    }}
                  >
                    {resetError}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                  }}
                >
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

      {/* Delete Wish Modal */}
      {deleteWishId !== null && deleteWish && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteWishModal();
          }}
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
              Delete Wish
            </div>
            <div
              className="font-sans"
              style={{
                fontSize: 14,
                color: "var(--charcoal)",
                marginBottom: 10,
                lineHeight: 1.5,
              }}
            >
              Delete {deleteWish.name}&rsquo;s wish? This cannot be undone.
            </div>
            <p
              className="font-sans"
              style={{
                fontSize: 12,
                color: "var(--subtle)",
                marginTop: 0,
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              {deleteWish.message}
            </p>
            {wishActionError && (
              <p
                className="font-sans"
                style={{
                  fontSize: 12,
                  color: "var(--mauve-dark)",
                  marginBottom: 16,
                  marginTop: 0,
                }}
              >
                {wishActionError}
              </p>
            )}
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={closeDeleteWishModal}
                disabled={deleteWishLoading}
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
                onClick={handleConfirmDeleteWish}
                disabled={deleteWishLoading}
                className="font-sans"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  background: "var(--mauve-dark)",
                  color: "var(--white)",
                  border: "none",
                  padding: "9px 18px",
                  cursor: deleteWishLoading ? "default" : "pointer",
                  opacity: deleteWishLoading ? 0.6 : 1,
                }}
              >
                {deleteWishLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Save the Dates Modal */}
      {sendStdConfirmOpen && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget && !sendStdLoading)
              setSendStdConfirmOpen(false);
          }}
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
              Send Save the Dates
            </div>
            {sendStdResult !== null ? (
              <>
                <p
                  className="font-sans"
                  style={{
                    fontSize: 14,
                    color: "var(--charcoal)",
                    marginBottom: 8,
                    lineHeight: 1.5,
                  }}
                >
                  {sendStdResult.failed === 0
                    ? `${sendStdResult.sent} save the date${sendStdResult.sent === 1 ? "" : "s"} sent successfully.`
                    : `Sent ${sendStdResult.sent}, failed ${sendStdResult.failed}.`}
                </p>
                {sendStdResult.skipped > 0 && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 12,
                      color: "var(--subtle)",
                      marginBottom: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    {sendStdResult.skipped} guest
                    {sendStdResult.skipped === 1 ? "" : "s"} skipped — no email
                    or link on file.
                  </p>
                )}
                {sendStdResult.failed > 0 && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 12,
                      color: "var(--mauve-dark)",
                      marginBottom: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    Failed guests were not marked as sent and will be retried on
                    the next send.
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 16,
                  }}
                >
                  <button
                    onClick={() => setSendStdConfirmOpen(false)}
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
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p
                  className="font-sans"
                  style={{
                    fontSize: 14,
                    color: "var(--charcoal)",
                    marginBottom: 20,
                    lineHeight: 1.5,
                  }}
                >
                  {sendSaveDateConfirmText}
                </p>
                <RecipientList guests={unsentStdGuests} />
                {sendStdError && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 12,
                      color: "var(--mauve-dark)",
                      marginBottom: 16,
                      marginTop: 0,
                    }}
                  >
                    {sendStdError}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => setSendStdConfirmOpen(false)}
                    disabled={sendStdLoading}
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
                    onClick={handleSendSaveDates}
                    disabled={sendStdLoading}
                    className="font-sans"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      background: "var(--mauve)",
                      color: "var(--white)",
                      border: "none",
                      padding: "9px 18px",
                      cursor: sendStdLoading ? "default" : "pointer",
                      opacity: sendStdLoading ? 0.6 : 1,
                    }}
                  >
                    {sendStdLoading ? "Sending…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Send RSVP Invites Modal */}
      {sendRsvpConfirmOpen && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget && !bulkInviteLoading)
              closeSendRsvpConfirmModal();
          }}
        >
          <div
            style={{
              background: "var(--white)",
              padding: "32px",
              maxWidth: 440,
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
              Send RSVP Invites
            </div>
            {bulkInviteResult !== null ? (
              <>
                <p
                  className="font-sans"
                  style={{
                    fontSize: 14,
                    color: "var(--charcoal)",
                    marginBottom: 8,
                    lineHeight: 1.5,
                  }}
                >
                  {bulkInviteResult.failed === 0
                    ? `${bulkInviteResult.sent} RSVP invite${bulkInviteResult.sent === 1 ? "" : "s"} sent successfully.`
                    : `Sent ${bulkInviteResult.sent}, failed ${bulkInviteResult.failed}.`}
                </p>
                {bulkInviteResult.skipped > 0 && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 12,
                      color: "var(--subtle)",
                      marginBottom: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    {bulkInviteResult.skipped} guest
                    {bulkInviteResult.skipped === 1 ? "" : "s"} skipped — no
                    email on file.
                  </p>
                )}
                {bulkInviteResult.failed > 0 && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 12,
                      color: "var(--mauve-dark)",
                      marginBottom: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    Failed guests were not marked as sent and will be retried on
                    the next send.
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 16,
                  }}
                >
                  <button
                    onClick={closeSendRsvpConfirmModal}
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
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p
                  className="font-sans"
                  style={{
                    fontSize: 14,
                    color: "var(--charcoal)",
                    marginBottom: 20,
                    lineHeight: 1.5,
                  }}
                >
                  {sendRsvpConfirmText}
                </p>
                <RecipientList guests={unsentRsvpGuests} />
                {inviteError && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 12,
                      color: "var(--mauve-dark)",
                      marginBottom: 16,
                      marginTop: 0,
                    }}
                  >
                    {inviteError}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={closeSendRsvpConfirmModal}
                    disabled={bulkInviteLoading}
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
                    onClick={handleSendAllInvites}
                    disabled={bulkInviteLoading}
                    className="font-sans"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      background: "var(--mauve)",
                      color: "var(--white)",
                      border: "none",
                      padding: "9px 18px",
                      cursor: bulkInviteLoading ? "default" : "pointer",
                      opacity: bulkInviteLoading ? 0.6 : 1,
                    }}
                  >
                    {bulkInviteLoading ? "Sending…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* RSVP Modal */}
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
          onClick={(e) => {
            if (e.target === e.currentTarget) closeInviteModal();
          }}
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
              Send RSVP
            </div>
            <div
              className="font-sans"
              style={{
                fontSize: 14,
                color: "var(--charcoal)",
                marginBottom: 20,
              }}
            >
              {inviteGuest.name ?? "Guest"}
              {inviteGuest.email ? ` · ${inviteGuest.email}` : ""}
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
                style={{
                  fontSize: 12,
                  color: "var(--mauve-dark)",
                  marginTop: 8,
                  marginBottom: 0,
                }}
              >
                {inviteError}
              </p>
            )}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
                justifyContent: "flex-end",
              }}
            >
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
