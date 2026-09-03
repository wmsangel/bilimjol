import { ImageResponse } from "next/og";
import { BADGE_SVG, markDataUri } from "@/lib/brandMark";

// Брендовый фавикон — значок «книга-дорога».
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri(BADGE_SVG)} width={64} height={64} alt="" />
      </div>
    ),
    { ...size },
  );
}
