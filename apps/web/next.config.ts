import type { NextConfig } from "next";

const API =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://izn-studyapi-production.up.railway.app";

// Домены аналитики, которым разрешаем скрипты/маяки.
const ANALYTICS_SCRIPT = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://ssl.google-analytics.com",
  "https://mc.yandex.ru",
  "https://mc.yandex.com",
  "https://connect.facebook.net",
  "https://www.facebook.com",
];
const ANALYTICS_CONNECT = [
  "https://www.google-analytics.com",
  "https://region1.google-analytics.com",
  "https://analytics.google.com",
  "https://stats.g.doubleclick.net",
  "https://mc.yandex.ru",
  "https://mc.yandex.com",
  // Яндекс.Метрика использует WebSocket — схема wss обязательна отдельно.
  "wss://mc.yandex.ru",
  "wss://mc.yandex.com",
  "https://connect.facebook.net",
];

// Прагматичный CSP: скрипты допускают inline/eval (нужно GTM/аналитике),
// но ИСТОЧНИКИ ограничены allowlist'ом; фрейминг запрещён (антикликджекинг).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${ANALYTICS_SCRIPT.join(" ")}`,
  `connect-src 'self' ${API} ${ANALYTICS_CONNECT.join(" ")}`,
  "frame-src https://www.googletagmanager.com https://td.doubleclick.net",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // CSP — только в проде: в dev ломает HMR (websocket/eval).
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: csp }]
    : []),
];

const nextConfig: NextConfig = {
  // Пакет @izn-study/shared отдаёт исходный TypeScript — Next должен его транспилировать.
  transpilePackages: ["@izn-study/shared"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
