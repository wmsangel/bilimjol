import { ImageResponse } from "next/og";
import { BADGE_SVG, markDataUri } from "@/lib/brandMark";

export const dynamic = "force-static";

// PWA-иконка 512×512 (значок «книга-дорога») для manifest.
export function GET() {
  const s = 512;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri(BADGE_SVG)} width={s} height={s} alt="" />
      </div>
    ),
    { width: s, height: s },
  );
}
