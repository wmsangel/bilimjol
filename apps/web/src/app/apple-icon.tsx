import { ImageResponse } from "next/og";
import { BADGE_SVG, markDataUri } from "@/lib/brandMark";

// Иконка для «добавить на экран» (iOS) — значок «книга-дорога».
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri(BADGE_SVG)} width={180} height={180} alt="" />
      </div>
    ),
    { ...size },
  );
}
