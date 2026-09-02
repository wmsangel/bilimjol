import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilimjol.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Приватные разделы не индексируем.
      disallow: [
        "/ru/me",
        "/ky/me",
        "/ru/parent",
        "/ky/parent",
        "/ru/wardrobe",
        "/ky/wardrobe",
        "/ru/admin",
        "/ky/admin",
        "/ru/login",
        "/ky/login",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
