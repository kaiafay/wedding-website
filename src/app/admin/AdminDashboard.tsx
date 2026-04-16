"use client";

import { useRouter } from "next/navigation";

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

  const responded = guests.filter((g) => g.rsvp !== null);
  const attending = responded.filter((g) => g.rsvp?.attending);
  const notAttending = responded.filter((g) => !g.rsvp?.attending);
  const notResponded = guests.filter((g) => g.rsvp === null);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  async function handleReset(guestId: number, guestName: string | null) {
    const name = guestName ?? "this guest";
    if (!window.confirm(`Reset RSVP for ${name}? This will allow them to submit again.`)) return;

    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Reset failed. Please try again.");
    }
  }

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

        {/* Summary */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          <SummaryCard label="Invited" value={guests.length} />
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
                        onClick={() => handleReset(g.id, g.name)}
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
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 360 }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Added</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
