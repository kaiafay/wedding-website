import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";

export const alt = "Kaia & Richard — July 10, 2027 · Bellingham, Washington";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const fonts = await loadOgFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#2B2A2A",
          padding: "64px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "Cormorant",
            fontSize: 18,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#C2AFC0",
          }}
        >
          Together with their families
        </p>
        <p
          style={{
            margin: "24px 0 0",
            fontFamily: "Great Vibes",
            fontSize: 112,
            color: "#f8f8f7",
            lineHeight: 1,
          }}
        >
          Kaia &amp; Richard
        </p>
        <div
          style={{
            width: 48,
            height: 1,
            background: "#9B7E97",
            margin: "36px 0",
          }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: "Cormorant",
            fontSize: 28,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#f8f8f7",
          }}
        >
          Saturday · July 10th · 2027
        </p>
        <p
          style={{
            margin: "16px 0 0",
            fontFamily: "Cormorant Italic",
            fontSize: 32,
            color: "#C2AFC0",
          }}
        >
          The Vasak Estate · Bellingham, WA
        </p>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Great Vibes",
          data: fonts.greatVibes,
          style: "normal",
          weight: 400,
        },
        {
          name: "Cormorant",
          data: fonts.cormorantLight,
          style: "normal",
          weight: 300,
        },
        {
          name: "Cormorant Italic",
          data: fonts.cormorantItalic,
          style: "italic",
          weight: 300,
        },
      ],
    },
  );
}
