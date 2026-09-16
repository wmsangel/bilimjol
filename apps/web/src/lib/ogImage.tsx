import { ImageResponse } from "next/og";
import { MARK_SVG, markDataUri } from "@/lib/brandMark";
import { PT_SANS_LATIN_700, PT_SANS_CYRILLIC_700 } from "@/og-assets/fonts";

// Общий рендер OG-картинки (1200×630) с заголовком на кириллице.
// Шрифт PT Sans (latin+cyrillic) завендорен как base64 — Satori рисует
// кириллицу без fetch/fs. Картинки генерируются on-demand (не на билде) и
// кэшируются CDN — билд-минуты не растут.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const decode = (b64: string) => Buffer.from(b64, "base64");
const FONTS = [
  { name: "PT Sans", data: decode(PT_SANS_LATIN_700), weight: 700 as const, style: "normal" as const },
  { name: "PT Sans", data: decode(PT_SANS_CYRILLIC_700), weight: 700 as const, style: "normal" as const },
];

export async function ogImage({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "radial-gradient(120% 120% at 15% 10%, #2c2659 0%, #191539 46%, #0e0b22 100%)",
          fontFamily: "PT Sans",
        }}
      >
        {/* верх: знак + рубрика */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markDataUri(MARK_SVG)} width={104} height={104} alt="" />
          <div
            style={{
              fontSize: 34,
              color: "#e6c079",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </div>
        </div>

        {/* заголовок */}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 60 : 72,
            lineHeight: 1.15,
            color: "#ffffff",
            fontWeight: 700,
          }}
        >
          {title}
        </div>

        {/* низ: домен */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#0e0b22",
              background: "#e6c079",
              padding: "12px 28px",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            bilimjol.com
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: FONTS },
  );
}
