import { buildEmailNameLockupImage } from "@/lib/email-name-lockup-image";

export async function GET() {
  return buildEmailNameLockupImage({
    nameColor: "#3D3A3A",
    ampersandColor: "#9B7E97",
  });
}
