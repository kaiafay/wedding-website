"use client";

import { motion, AnimatePresence } from "framer-motion";

interface EnvelopeAnimationProps {
  isOpen: boolean;
  onOpen: () => void;
}

export default function EnvelopeAnimation({
  isOpen,
  onOpen,
}: EnvelopeAnimationProps) {
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
          transition={{ duration: 0.5 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Envelope */}
          <motion.div
            onClick={onOpen}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ cursor: "pointer", position: "relative", width: 320 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onOpen()}
          >
            {/* Envelope body */}
            <div
              style={{
                width: 320,
                height: 213,
                background: "#EDE8E2",
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
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

              {/* Card peeking out */}
              <div
                style={{
                  position: "absolute",
                  left: 20,
                  right: 20,
                  bottom: 8,
                  background: "var(--white)",
                  padding: "20px 24px",
                  boxShadow: "0 -2px 12px rgba(0,0,0,0.1)",
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
              </div>

              {/* Wax seal */}
              <div
                style={{
                  position: "absolute",
                  bottom: "50%",
                  left: "50%",
                  transform: "translate(-50%, 50%)",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--mauve-dark)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  zIndex: 10,
                }}
              >
                <span
                  className="font-script"
                  style={{
                    fontSize: 18,
                    color: "rgba(255,255,255,0.85)",
                    marginTop: 2,
                  }}
                >
                  &
                </span>
              </div>
            </div>

            {/* Flap */}
            <motion.div
              animate={isOpen ? { rotateX: -178 } : { rotateX: 0 }}
              transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 120,
                transformOrigin: "top center",
                transformStyle: "preserve-3d",
              }}
            >
              <svg
                viewBox="0 0 320 120"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <polygon points="0,0 320,0 160,120" fill="#E4DDD6" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Hint */}
          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <p
              className="font-sans"
              style={{
                fontSize: 10,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "var(--mauve-light)",
              }}
            >
              Open your invitation
            </p>
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ color: "var(--mauve)", fontSize: 16 }}
            >
              ↓
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
