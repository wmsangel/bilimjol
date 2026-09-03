import { ImageResponse } from "next/og";
import { MARK_SVG, markDataUri } from "@/lib/brandMark";

// Превью-картинка при шэре (1200×630). Знак «книга-дорога» + вордмарк.
// Текст латиницей — надёжный рендер Satori без загрузки кириллических шрифтов.

export const alt = "Bilimjol — развивающие занятия для детей на кыргызском и русском";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Контент не зависит от запроса — генерируем на билде.
export const dynamic = "force-static";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 22,
          background:
            "radial-gradient(120% 140% at 24% 20%, #2c2560 0%, #191539 46%, #100d27 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 44,
            padding: "0 64px",
            border: "2px solid rgba(230,192,121,0.55)",
            borderRadius: 26,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markDataUri(MARK_SVG)} width={320} height={320} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 104, fontWeight: 800, letterSpacing: "-2px" }}>
              <span style={{ color: "#ffffff" }}>Bilim</span>
              <span style={{ color: "#e6c079" }}>jol</span>
            </div>
            <div
              style={{
                marginTop: 26,
                display: "flex",
                padding: "10px 22px",
                border: "1px solid rgba(230,192,121,0.6)",
                borderRadius: 999,
                fontSize: 34,
                fontWeight: 700,
                color: "#e6c079",
              }}
            >
              bilimjol.com
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
