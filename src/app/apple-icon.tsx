import { ImageResponse } from "next/og";
import { loadGreatVibes } from "@/lib/og-fonts";
import { MonogramImage } from "@/lib/monogram-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const greatVibes = await loadGreatVibes();

  return new ImageResponse(
    <MonogramImage size={180} />,
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
