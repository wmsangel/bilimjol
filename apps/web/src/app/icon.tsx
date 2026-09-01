import { ImageResponse } from "next/og";

// Брендовый фавикон (генерируется кодом). Показывается во вкладке и в поиске.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5a5ad6, #7c5cfc)",
          color: "#ffffff",
          fontSize: 44,
          fontWeight: 800,
          borderRadius: 14,
        }}
      >
        B
      </div>
    ),
    { ...size },
  );
}
