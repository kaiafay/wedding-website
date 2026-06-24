"use client";

import { useState, useEffect, useCallback } from "react";
import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion } from "framer-motion";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

export default function GalleryGrid({ photos }: { photos: StaticImageData[] }) {
  const isMobile = useIsMobile();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null)),
    [photos.length]
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : null)),
    [photos.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, close, prev, next]);

  return (
    <>
      <style>{`
        .gallery-grid {
          columns: 3;
          column-gap: 6px;
        }
        .gallery-item {
          break-inside: avoid;
          margin-bottom: 6px;
          display: block;
          overflow: hidden;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          width: 100%;
          text-align: left;
        }
        .gallery-item img {
          display: block;
          width: 100%;
          height: auto;
          transition: transform 0.5s ease;
        }
        .gallery-item:hover img { transform: scale(1.03); }
        @media (max-width: 768px) { .gallery-grid { columns: 2 !important; } .gallery-item { cursor: default; } }
        @media (max-width: 480px) { .gallery-grid { columns: 1 !important; } }
      `}</style>

      <div className="gallery-grid">
        {photos.map((photo, i) => (
          <button
            key={i}
            className="gallery-item"
            onClick={() => { if (!isMobile) setLightboxIndex(i); }}
            aria-label={`View photo ${i + 1}`}
          >
            <Image
              src={photo}
              alt=""
              placeholder="blur"
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
              style={{ width: "100%", height: "auto" }}
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.33, 0, 0.2, 1] }}
            onClick={close}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(26,26,26,0.96)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Close */}
            <button
              onClick={close}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 20,
                right: 24,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "10px 8px",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <line x1="1" y1="1" x2="15" y2="15" stroke="rgba(242,237,228,0.55)" strokeWidth="1" />
                <line x1="15" y1="1" x2="1" y2="15" stroke="rgba(242,237,228,0.55)" strokeWidth="1" />
              </svg>
            </button>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
              style={{
                position: "absolute",
                left: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "16px 12px",
                color: "rgba(242,237,228,0.45)",
                fontSize: 28,
                lineHeight: 1,
                fontWeight: 300,
              }}
            >
              ‹
            </button>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
              style={{
                position: "absolute",
                right: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "16px 12px",
                color: "rgba(242,237,228,0.45)",
                fontSize: 28,
                lineHeight: 1,
                fontWeight: 300,
              }}
            >
              ›
            </button>

            {/* Photo */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "min(900px, 90vw)",
                height: "85vh",
                overflow: "hidden",
              }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={lightboxIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  <Image
                    src={photos[lightboxIndex]}
                    alt=""
                    fill
                    placeholder="blur"
                    sizes="90vw"
                    style={{ objectFit: "contain" }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Counter */}
            <p
              className="font-sans"
              style={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                margin: 0,
                fontSize: 10,
                letterSpacing: "0.3em",
                color: "rgba(242,237,228,0.35)",
              }}
            >
              {lightboxIndex + 1} / {photos.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
