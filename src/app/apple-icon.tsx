import { ImageResponse } from "next/og";
import { loadGreatVibes } from "@/lib/og-fonts";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const greatVibes = await loadGreatVibes();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2B2A2A",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "Great Vibes",
            fontSize: 108,
            color: "#f8f8f7",
            lineHeight: 1,
            transform: "translateY(6px)",
          }}
        >
          K&amp;R
        </p>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Great Vibes",
          data: greatVibes,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
