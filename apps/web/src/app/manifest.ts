import type { MetadataRoute } from "next";

// PWA-манифест: сайт можно «установить» на телефон и открывать как приложение.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bilimjol — развитие и обучение детей",
    short_name: "Bilimjol",
    description:
      "Логика, счёт, чтение и окружающий мир для детей 0–11 классов. На русском и кыргызском.",
    start_url: "/ru",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ru",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
