import { ImageResponse } from "next/og";
import { loadGreatVibes } from "@/lib/og-fonts";
import { MonogramImage, monogramColors } from "@/lib/monogram-image";

export const alt = "Kaia & Richard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MARK_SIZE = 560;

export default async function OpenGraphImage() {
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
          background: monogramColors.background,
        }}
      >
        <MonogramImage size={MARK_SIZE} />
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
