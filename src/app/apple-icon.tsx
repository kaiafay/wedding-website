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
          position: "relative",
          background: "#9B7E97",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 12,
            top: 8,
            fontFamily: "Great Vibes",
            fontSize: 78,
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
            right: 12,
            bottom: 8,
            fontFamily: "Great Vibes",
            fontSize: 78,
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
            fontSize: 94,
            color: "#F2EDE4",
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
