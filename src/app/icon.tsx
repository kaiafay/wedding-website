import { ImageResponse } from "next/og";
import { loadGreatVibes } from "@/lib/og-fonts";
import { MonogramImage } from "@/lib/monogram-image";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const greatVibes = await loadGreatVibes();

  return new ImageResponse(
    <MonogramImage size={64} />,
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
