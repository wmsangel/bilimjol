// /ads.txt — авторизованные продавцы рекламы (IAB ads.txt).
// Google AdSense: pub-5535516142831006, DIRECT. Статика, без локалей.
export const dynamic = "force-static";

export function GET() {
  return new Response(
    "google.com, pub-5535516142831006, DIRECT, f08c47fec0942fa0\n",
    { headers: { "content-type": "text/plain; charset=utf-8" } },
  );
}
