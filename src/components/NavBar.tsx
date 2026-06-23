"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Our Story", anchor: "story" },
  { label: "Schedule", anchor: "schedule" },
  { label: "FAQ", anchor: "faq" },
];

const overlayLinks = [
  { label: "Our Story", anchor: "story" },
  { label: "Schedule", anchor: "schedule" },
  { label: "FAQ", anchor: "faq" },
  { label: "Travel", href: "/travel" },
  { label: "Gallery", href: "/gallery" },
];

export default function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [visible, setVisible] = useState(!isHome);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const href = (anchor: string) => (isHome ? `#${anchor}` : `/#${anchor}`);

  useEffect(() => {
    if (!isHome) return;
    const hero = document.getElementById("hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [overlayOpen]);

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        .nav-hamburger { display: none; }
        .nav-link {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--subtle);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .nav-link:hover { color: var(--charcoal); }
        .nav-rsvp {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--mauve);
          text-decoration: none;
          border: 1px solid var(--mauve);
          padding: 6px 14px;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .nav-rsvp:hover {
          background: var(--mauve);
          color: var(--white);
        }
        .overlay-link {
          font-size: 11px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(242, 237, 228, 0.75);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .overlay-link:hover { color: var(--ivory); }
        .overlay-rsvp {
          font-size: 11px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--mauve-light);
          text-decoration: none;
          border: 1px solid var(--mauve-light);
          padding: 12px 28px;
          display: inline-block;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .overlay-rsvp:hover {
          background: var(--mauve-light);
          color: var(--charcoal);
        }
      `}</style>

      {/* Nav bar */}
      <AnimatePresence>
        {visible && (
          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.33, 0, 0.2, 1] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              background: "var(--white)",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div
              className="nav-inner"
              style={{
                maxWidth: 900,
                margin: "0 auto",
                padding: "0 24px 0 48px",
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <a
                href={isHome ? "#hero" : "/"}
                className="font-script"
                style={{ fontSize: 22, color: "var(--charcoal)", textDecoration: "none", lineHeight: 1 }}
              >
                Kaia &amp; Richard
              </a>

              {/* Desktop links */}
              <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 36 }}>
                {links.map((link) => (
                  <a key={link.anchor} href={href(link.anchor)} className="nav-link font-sans">
                    {link.label}
                  </a>
                ))}
                <a href="/travel" className="nav-link font-sans">Travel</a>
                <a href="/gallery" className="nav-link font-sans">Gallery</a>
                <a href={href("rsvp")} className="nav-rsvp font-sans">RSVP</a>
              </div>

              {/* Hamburger — mobile only */}
              <button
                className="nav-hamburger"
                onClick={() => setOverlayOpen(true)}
                aria-label="Open menu"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "10px 8px",
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="22" height="12" viewBox="0 0 22 12" fill="none" aria-hidden>
                  <line x1="0" y1="1" x2="22" y2="1" stroke="var(--charcoal)" strokeWidth="1"/>
                  <line x1="0" y1="11" x2="22" y2="11" stroke="var(--charcoal)" strokeWidth="1"/>
                </svg>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.33, 0, 0.2, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "var(--charcoal)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Overlay top row */}
            <div style={{
              padding: "0 24px",
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}>
              <a
                href={isHome ? "#hero" : "/"}
                className="font-script"
                onClick={() => setOverlayOpen(false)}
                style={{ fontSize: 22, color: "var(--ivory)", textDecoration: "none", lineHeight: 1 }}
              >
                Kaia &amp; Richard
              </a>
              <button
                onClick={() => setOverlayOpen(false)}
                aria-label="Close menu"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "10px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <line x1="1" y1="1" x2="15" y2="15" stroke="rgba(242,237,228,0.65)" strokeWidth="1"/>
                  <line x1="15" y1="1" x2="1" y2="15" stroke="rgba(242,237,228,0.65)" strokeWidth="1"/>
                </svg>
              </button>
            </div>

            {/* Centered links */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 40,
            }}>
              {overlayLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.22, ease: [0.33, 0, 0.2, 1] }}
                >
                  <a
                    href={"href" in link ? link.href : href(link.anchor!)}
                    className="overlay-link font-sans"
                    onClick={() => setOverlayOpen(false)}
                  >
                    {link.label}
                  </a>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + overlayLinks.length * 0.05, duration: 0.22, ease: [0.33, 0, 0.2, 1] }}
              >
                <a
                  href={href("rsvp")}
                  className="overlay-rsvp font-sans"
                  onClick={() => setOverlayOpen(false)}
                >
                  RSVP
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
