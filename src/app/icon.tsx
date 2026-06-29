import { ImageResponse } from "next/og";
import { loadGreatVibes } from "@/lib/og-fonts";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const greatVibes = await loadGreatVibes();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#2B2A2A",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 4,
            top: 3,
            fontFamily: "Great Vibes",
            fontSize: 28,
            color: "#f8f8f7",
            lineHeight: 1,
          }}
        >
          K
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 4,
            bottom: 3,
            fontFamily: "Great Vibes",
            fontSize: 28,
            color: "#f8f8f7",
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
            fontSize: 34,
            color: "#C2AFC0",
            lineHeight: 1,
            transform: "translate(-50%, -50%)",
          }}
        >
          &amp;
        </div>
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
