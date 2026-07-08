import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const emailNameLockupSize = { width: 720, height: 180 };

async function loadEmailGreatVibes() {
  return readFile(join(process.cwd(), "public/fonts/great-vibes.ttf"));
}

export async function buildEmailNameLockupImage({
  nameColor,
  ampersandColor,
}: {
  nameColor: string;
  ampersandColor: string;
}) {
  const greatVibes = await loadEmailGreatVibes();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          padding: "8px 24px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            color: nameColor,
            fontFamily: "Great Vibes",
            fontSize: 112,
            fontWeight: 400,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          <span>Kaia</span>
          <span style={{ color: ampersandColor, margin: "0 26px" }}>&amp;</span>
          <span>Richard</span>
        </div>
      </div>
    ),
    {
      ...emailNameLockupSize,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
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
