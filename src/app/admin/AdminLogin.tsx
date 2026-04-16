"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.refresh();
    } else {
      setError("Incorrect password.");
      setPassword("");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--white)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 340, padding: "0 24px" }}>
        <p
          className="font-script"
          style={{
            fontSize: 36,
            color: "var(--charcoal)",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Admin
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 14,
              padding: "10px 14px",
              border: "1px solid var(--rule)",
              background: "transparent",
              color: "var(--charcoal)",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          {error && (
            <p
              className="font-sans"
              style={{ fontSize: 12, color: "var(--mauve-dark)", textAlign: "center" }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="font-sans"
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "11px 0",
              background: "var(--charcoal)",
              color: "var(--white)",
              border: "none",
              cursor: loading || !password ? "default" : "pointer",
              opacity: loading || !password ? 0.5 : 1,
            }}
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
