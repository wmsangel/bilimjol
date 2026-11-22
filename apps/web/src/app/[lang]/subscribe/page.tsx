import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { localizedAlternates, productJsonLd } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/JsonLd";
import { SubscribePlans } from "@/components/SubscribePlans";
import { PremiumPeek } from "@/components/PremiumPeek";
import { Faq } from "@/components/Faq";
import { getDictionary } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: `${dict.subscribe.title} — Bilimjol`,
    description: dict.subscribe.subtitle,
    alternates: localizedAlternates(lang, "/subscribe"),
  };
}

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const s = dict.subscribe;
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  const faq = [
    {
      q: t("Как оплатить из Кыргызстана?", "Кыргызстандан кантип төлөйм?"),
      a: t(
        "Если карта не проходит онлайн, можно оплатить по QR-коду — напишите нам в Telegram @izagorodnyi, пришлём QR и включим доступ вручную. Онлайн-оплата идёт через Paddle (Visa/Mastercard).",
        "Эгер карта онлайн өтпөй жатса, QR-код менен төлөсө болот — Telegram @izagorodnyi дарегине жазыңыз, QR жөнөтүп, кирүүнү кол менен күйгүзөбүз. Онлайн төлөм Paddle аркылуу (Visa/Mastercard).",
      ),
    },
    {
      q: t("А если ребёнку не понравится?", "Эгер балага жакпай калса?"),
      a: t(
        "Есть 7 дней на возврат: если не подошло — напишите нам, вернём деньги через Paddle. Плюс большую часть заданий можно попробовать бесплатно до оплаты.",
        "Кайтарууга 7 күн бар: туура келбесе — бизге жазыңыз, Paddle аркылуу акчаны кайтарабыз. Ошондой эле тапшырмалардын көбүн төлөөдөн мурда акысыз сынап көрсө болот.",
      ),
    },
    {
      q: t("Подписка на одного ребёнка или на всю семью?", "Жазылуу бир балагабы же бүт үй-бүлөгөбү?"),
      a: t(
        "Одна подписка открывает все задания в аккаунте — заниматься могут несколько детей по очереди на одном устройстве или на разных, войдя в тот же аккаунт.",
        "Бир жазылуу аккаунттагы бардык тапшырмаларды ачат — бир нече бала кезекпе-кезек бир түзмөктө же ошол эле аккаунтка кирип, башка түзмөктө иштесе болот.",
      ),
    },
    {
      q: t("Как отменить подписку?", "Жазылууну кантип токтотом?"),
      a: t(
        "В любой момент в личном кабинете (раздел «Подписка») — одной кнопкой, без звонков и писем. Доступ остаётся до конца оплаченного периода.",
        "Каалаган убакта жеке кабинетте («Жазылуу» бөлүмү) — бир баскыч менен, чалуусуз, катсыз. Кирүү төлөнгөн мөөнөттүн аягына чейин сакталат.",
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff] font-sans text-[#191539]">
      <SiteHeader lang={lang} dict={dict} />
      <JsonLd
        data={productJsonLd(lang, {
          name: "Bilimjol Premium",
          description: s.subtitle,
        })}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_420px]">
          {/* Левая колонка: описание + выгоды */}
          <div>
            <span className="inline-block rounded-full bg-[#fbf3e3] px-3.5 py-1.5 text-sm font-extrabold text-[#7a5a1e]">
              ⭐ Premium
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {s.title}
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-[#5c5880]">
              {s.subtitle}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {s.benefits.map((b) => (
                <div
                  key={b}
                  className="flex items-start gap-3 rounded-[20px] bg-white p-4 text-[15px] font-bold shadow-[0_8px_24px_rgba(25,21,57,.05)]"
                >
                  <span className="font-extrabold text-[#6d5cf7]">✓</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <PremiumPeek lang={lang} plansHref="#plans" />
          </div>

          {/* Правая колонка: тарифная карточка */}
          <div id="plans" className="scroll-mt-6 lg:sticky lg:top-6">
            <SubscribePlans
              labels={s}
              locale={lang}
              loginHref={`/${lang}/login`}
              playHref={`/${lang}/play`}
            />
            <div className="mt-6 text-center">
              <Link
                href={`/${lang}`}
                className="text-sm font-extrabold text-[#5c5880] transition hover:text-[#191539]"
              >
                {s.back}
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />
        </div>
      </main>
    </div>
  );
}
