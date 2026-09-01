import { ImageResponse } from "next/og";

// Превью-картинка при шэре в мессенджерах/соцсетях (1200×630).
// Рисуется кодом: без внешних картинок, без кириллицы в самом изображении
// (текст-описание идёт в мета-тегах), чтобы рендер был надёжным.

export const alt = "Bilimjol — развивающие занятия для детей на кыргызском и русском";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CHARS = ["#F5943C", "#9AA6B8", "#CBD4E2", "#F1E4F5", "#78C56A"];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5a5ad6 0%, #7c5cfc 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 26, marginBottom: 48 }}>
          {CHARS.map((c, i) => (
            <div
              key={i}
              style={{
                width: 148,
                height: 148,
                borderRadius: 74,
                background: c,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                boxShadow: "0 12px 30px rgba(30,20,70,0.25)",
              }}
            >
              <div style={{ width: 20, height: 30, borderRadius: 10, background: "#2C2540" }} />
              <div style={{ width: 20, height: 30, borderRadius: 10, background: "#2C2540" }} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: "-4px" }}>Bilimjol</div>
        <div style={{ fontSize: 42, marginTop: 8, color: "rgba(255,255,255,0.85)" }}>
          bilimjol.com
        </div>
      </div>
    ),
    { ...size },
  );
}
