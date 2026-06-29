const BASE_SIZE = 180;

const COLORS = {
  background: "#9B7E97",
  letter: "#f8f8f7",
  ampersand: "#F2EDE4",
} as const;

export function MonogramImage({ size }: { size: number }) {
  const scale = size / BASE_SIZE;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        position: "relative",
        background: COLORS.background,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          left: 12 * scale,
          top: 8 * scale,
          fontFamily: "Great Vibes",
          fontSize: 78 * scale,
          color: COLORS.letter,
          lineHeight: 1,
        }}
      >
        K
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 12 * scale,
          bottom: 8 * scale,
          fontFamily: "Great Vibes",
          fontSize: 78 * scale,
          color: COLORS.letter,
          lineHeight: 1,
        }}
      >
        R
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          left: "50%",
          top: "50%",
          fontFamily: "Great Vibes",
          fontSize: 94 * scale,
          color: COLORS.ampersand,
          lineHeight: 1,
          transform: "translate(-50%, -50%)",
        }}
      >
        &amp;
      </div>
    </div>
  );
}

export { COLORS as monogramColors };
