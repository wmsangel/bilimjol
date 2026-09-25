// Paddle.js оверлей-чекаут (merchant of record). Скрипт грузится лениво —
// только когда пользователь реально открывает оплату. Client-side token
// публичный, его место в коде/публичном env.

const CLIENT_TOKEN =
  process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "live_52deec23f0e08b3924d37cb3525";
const PADDLE_ENV = process.env.NEXT_PUBLIC_PADDLE_ENV ?? "production";

export type PlanKey = "monthly" | "annual";

// priceId — из Paddle (product «Bilimjol Premium»). Переопределяются публичным env.
export const PADDLE_PLANS: {
  key: PlanKey;
  priceId: string;
  price: string;
  per: { ru: string; ky: string };
  save?: string;
}[] = [
  {
    key: "monthly",
    priceId:
      process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY ?? "pri_01m3bx11sxnp35sth25ptm90ds",
    price: "$1.99",
    per: { ru: "мес", ky: "ай" },
  },
  {
    key: "annual",
    priceId:
      process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL ?? "pri_01m3bx124svzmzasfd2mct47h0",
    price: "$15.99",
    per: { ru: "год", ky: "жыл" },
    save: "−33%",
  },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
let loading: Promise<any> | null = null;
let onCompleteCb: (() => void) | null = null;

function loadPaddle(): Promise<any> {
  const w = window as any;
  if (w.Paddle) return Promise.resolve(w.Paddle);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => {
      const P = w.Paddle;
      try {
        if (PADDLE_ENV === "sandbox") P.Environment.set("sandbox");
        P.Initialize({
          token: CLIENT_TOKEN,
          eventCallback: (ev: any) => {
            if (ev?.name === "checkout.completed") onCompleteCb?.();
          },
        });
        resolve(P);
      } catch (e) {
        reject(e);
      }
    };
    s.onerror = () => {
      loading = null;
      reject(new Error("paddle.js failed to load"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/**
 * Открывает оверлей-чекаут Paddle. Бросает, если Paddle не удалось загрузить —
 * вызывающий должен показать запасной путь (написать администратору).
 */
export async function openPaddleCheckout(opts: {
  priceId: string;
  userId?: string;
  email?: string;
  locale?: string;
  onComplete?: () => void;
}): Promise<void> {
  onCompleteCb = opts.onComplete ?? null;
  const P = await loadPaddle();
  P.Checkout.open({
    items: [{ priceId: opts.priceId, quantity: 1 }],
    ...(opts.userId ? { customData: { userId: opts.userId } } : {}),
    ...(opts.email ? { customer: { email: opts.email } } : {}),
    settings: {
      displayMode: "overlay",
      theme: "light",
      locale: opts.locale === "ky" ? "ru" : opts.locale || "ru",
    },
  });
}
