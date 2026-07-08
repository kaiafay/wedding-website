import { buildEmailNameLockupImage } from "@/lib/email-name-lockup-image";

export async function GET() {
  return buildEmailNameLockupImage({
    nameColor: "#f8f8f7",
    ampersandColor: "#F2EDE4",
  });
}
