import { ImageResponse } from "next/og";

// Иконка для «добавить на экран» (iOS).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 120,
          fontWeight: 800,
        }}
      >
        B
      </div>
    ),
    { ...size },
  );
}
