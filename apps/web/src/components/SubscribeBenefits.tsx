import type { Locale } from "@izn-study/shared";
import { premiumStats } from "@/lib/premiumStats";
import { PRICE, annualPerDayKgs, annualPerMonthUsd, approxLocal } from "@/lib/pricing";
import { PlanCta, TelegramCta } from "@/components/SubscribeCtas";

// Продающая часть страницы подписки. Все числа — из контента (premiumStats) и
// цен (pricing): выдуманных процентов, отзывов и «тысяч заданий» здесь нет.
// Способы оплаты описаны так, как они реально работают: Paddle не принимает
// платежи из России и Беларуси и не поддерживает местные карты — для этих
// случаев честно ведём в Telegram (оплата по QR / вручную).

const COUNTRIES: { flag: string; ru: string; ky: string }[] = [
  { flag: "🇰🇬", ru: "Кыргызстан", ky: "Кыргызстан" },
  { flag: "🇰🇿", ru: "Казахстан", ky: "Казакстан" },
  { flag: "🇺🇿", ru: "Узбекистан", ky: "Өзбекстан" },
  { flag: "🇹🇯", ru: "Таджикистан", ky: "Тажикстан" },
  { flag: "🇷🇺", ru: "Россия", ky: "Россия" },
  { flag: "🇧🇾", ru: "Беларусь", ky: "Беларусь" },
  { flag: "🇺🇦", ru: "Украина", ky: "Украина" },
  { flag: "🇲🇩", ru: "Молдова", ky: "Молдова" },
];

const cta =
  "inline-flex items-center justify-center rounded-full bg-[#6d5cf7] px-7 py-3.5 text-base font-extrabold text-white shadow-[0_10px_26px_rgba(109,92,247,.32)] transition hover:-translate-y-0.5";
const tgLink = "font-bold text-[#6d5cf7] underline underline-offset-2 hover:text-[#191539]";

/**
 * part="stats"   — «что прибавится» + первый призыв (на телефоне стоит НАД карточкой оплаты);
 * part="details" — сравнение, годовая выгода, страны и способы оплаты (под карточкой).
 */
export function SubscribeBenefits({ lang, part }: { lang: Locale; part: "stats" | "details" }) {
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);
  const st = premiumStats();

  const stats: { label: string; from: string; to: string; note: string }[] = [
    {
      label: t("Задания", "Тапшырмалар"),
      from: String(st.freeTasks),
      to: String(st.totalTasks),
      note: t(
        `+${st.premiumTasks} заданий в ${st.topicsWithPremium} темах`,
        `${st.topicsWithPremium} темада +${st.premiumTasks} тапшырма`,
      ),
    },
    {
      label: t("Игры", "Оюндар"),
      from: String(st.freeGames),
      to: String(st.totalGames),
      note: t(
        `+${st.totalGames - st.freeGames} игр: память, счёт, слова, часы`,
        `+${st.totalGames - st.freeGames} оюн: эс тутум, эсеп, сөздөр, саат`,
      ),
    },
    {
      label: t("Гардероб героя", "Каармандын гардеробу"),
      from: t("по звёздам", "жылдыздар үчүн"),
      to: t("весь сразу", "баары дароо"),
      note: t("вся одежда героя открыта с первого дня", "каармандын бардык кийими биринчи күндөн ачык"),
    },
    {
      label: t("Профориентация, 8–11 класс", "Кесип тандоо, 8–11-класс"),
      from: t("результат", "жыйынтык"),
      to: t("полный разбор", "толук талдоо"),
      note: t("полный разбор результата теста", "тесттин жыйынтыгынын толук талдоосу"),
    },
  ];

  const yes = "✓";
  const rows: { name: string; free: string; premium: string }[] = [
    { name: t("Задания", "Тапшырмалар"), free: String(st.freeTasks), premium: String(st.totalTasks) },
    { name: t("Игры", "Оюндар"), free: String(st.freeGames), premium: String(st.totalGames) },
    { name: t("Тесты-тренажёры", "Тест-тренажёрлор"), free: String(st.tests), premium: String(st.tests) },
    { name: t("Разбор каждого ответа", "Ар бир жооптун талдоосу"), free: yes, premium: yes },
    { name: t("Отчёт для родителей и прогресс", "Ата-энелер үчүн отчёт жана прогресс"), free: yes, premium: yes },
    { name: t("Гардероб героя", "Каармандын гардеробу"), free: t("по звёздам", "жылдыздар үчүн"), premium: t("весь сразу", "баары дароо") },
    { name: t("Профориентация (8–11 класс)", "Кесип тандоо (8–11-класс)"), free: t("результат", "жыйынтык"), premium: t("полный разбор", "толук талдоо") },
  ];

  if (part === "stats") {
    return (
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">
          {t("Что прибавится с премиумом", "Премиум менен эмне кошулат")}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {stats.map((x) => (
            <div key={x.label} className="rounded-[20px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.05)]">
              <div className="text-sm font-bold text-[#8f8aa8]">{x.label}</div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 font-display">
                <span className={(/^\d/.test(x.from) ? "text-xl" : "text-base") + " font-bold text-[#8f8aa8]"}>{x.from}</span>
                <span className="text-xl text-[#c9a04f]" aria-hidden="true">→</span>
                <span className={(/^\d/.test(x.to) ? "text-3xl" : "text-xl") + " font-bold tracking-tight text-[#6d5cf7]"}>{x.to}</span>
              </div>
              <div className="mt-1 text-sm text-[#5c5880]">{x.note}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[15px] text-[#5c5880]">
          {t(
            `${st.subjects} предметов и ${st.grades} классов — от подготовки к школе до 11-го — без закрытых заданий. Одна подписка на весь аккаунт: заниматься могут несколько детей.`,
            `${st.subjects} предмет жана ${st.grades} класс — мектепке даярдыктан 11-класска чейин — жабык тапшырмаларсыз. Бир жазылуу бүт аккаунтка: бир нече бала иштесе болот.`,
          )}
        </p>
        <PlanCta plan="monthly" placement="subscribe-stats" className={cta + " mt-5"}>
          {t(`Открыть всё — ${PRICE.monthly.display} в месяц`, `Баарын ачуу — айына ${PRICE.monthly.display}`)}
        </PlanCta>
      </section>
    );
  }

  return (
    <div>
      {/* ── Сравнение ── */}
      <section className="mt-10 lg:mt-12">
        <h2 className="font-display text-2xl font-bold">
          {t("Бесплатно и с премиумом", "Акысыз жана премиум менен")}
        </h2>
        <div className="mt-4 overflow-hidden rounded-[20px] bg-white shadow-[0_8px_24px_rgba(25,21,57,.05)]">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="bg-[#f2effe] text-sm">
                <th scope="col" className="px-4 py-3 font-bold text-[#5c5880]">
                  <span className="sr-only">{t("Что входит", "Эмне кирет")}</span>
                </th>
                <th scope="col" className="px-3 py-3 text-center font-bold text-[#5c5880]">
                  {t("Бесплатно", "Акысыз")}
                </th>
                <th scope="col" className="px-3 py-3 text-center font-extrabold text-[#6d5cf7]">
                  ⭐ {t("Премиум", "Премиум")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efecff]">
              {rows.map((r) => (
                <tr key={r.name}>
                  <th scope="row" className="px-4 py-3 font-semibold text-[#191539]">{r.name}</th>
                  <td className="px-3 py-3 text-center text-[#5c5880]">{r.free}</td>
                  <td className="px-3 py-3 text-center font-extrabold text-[#191539]">{r.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-[#8f8aa8]">
          {t(
            "Цифры считаются из самих заданий на сайте и обновляются вместе с ними.",
            "Сандар сайттагы тапшырмалардын өзүнөн эсептелет жана алар менен кошо жаңыланат.",
          )}
        </p>
      </section>

      {/* ── Годовая выгода ── */}
      <section className="mt-10 rounded-[24px] bg-[#191539] p-6 text-white sm:p-7">
        <h2 className="font-display text-2xl font-bold text-[#e6c079]">
          {t(
            `$${annualPerMonthUsd()} в месяц при оплате за год`,
            `Жылдык төлөмдө айына $${annualPerMonthUsd()}`,
          )}
        </h2>
        <p className="mt-2 text-[#d9d5f5]">
          {t(
            `${PRICE.annual.display} за год (${approxLocal("annual")}) — это около ${annualPerDayKgs()} сомов в день и на треть дешевле помесячной оплаты.`,
            `Жылына ${PRICE.annual.display} (${approxLocal("annual")}) — бул күнүнө болжол менен ${annualPerDayKgs()} сом жана айлык төлөмдөн үчтөн бирге арзан.`,
          )}
        </p>
        <PlanCta
          plan="annual"
          placement="subscribe-annual"
          className="mt-4 inline-flex rounded-full bg-[#e6c079] px-7 py-3.5 text-base font-extrabold text-[#191539] transition hover:-translate-y-0.5"
        >
          {t("Выбрать годовой", "Жылдыкты тандоо")}
        </PlanCta>
      </section>

      {/* ── Страны и способы оплаты ── */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">
          {t("Нам рады из любой страны", "Бардык өлкөлөрдөн кош келиңиздер")}
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label={t("Страны", "Өлкөлөр")}>
          {COUNTRIES.map((c) => (
            <li key={c.ru} className="rounded-full bg-white px-3.5 py-2 text-sm font-bold shadow-[0_4px_14px_rgba(25,21,57,.05)]">
              <span aria-hidden="true">{c.flag}</span> {c[lang === "ky" ? "ky" : "ru"]}
            </li>
          ))}
          <li className="rounded-full bg-white px-3.5 py-2 text-sm font-bold text-[#8f8aa8] shadow-[0_4px_14px_rgba(25,21,57,.05)]">
            {t("и другие", "жана башкалар")}
          </li>
        </ul>

        <div className="mt-5 space-y-3">
          <div className="rounded-[20px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.05)]">
            <div className="font-bold">💳 {t("Международной картой — онлайн", "Эл аралык карта менен — онлайн")}</div>
            <p className="mt-1 text-[15px] text-[#5c5880]">
              {t(
                "Visa или Mastercard через Paddle: Кыргызстан, Казахстан, Узбекистан, Таджикистан, Украина, Молдова и большинство других стран. Доступ открывается сразу, чек приходит на почту.",
                "Paddle аркылуу Visa же Mastercard: Кыргызстан, Казакстан, Өзбекстан, Тажикстан, Украина, Молдова жана көпчүлүк башка өлкөлөр. Кирүү дароо ачылат, чек почтага келет.",
              )}
            </p>
            <p className="mt-2 text-sm text-[#8f8aa8]">
              {t(
                "Местные карты — Элкарт, Uzcard, Humo, «Мир» — Paddle не поддерживает, нужна международная.",
                "Жергиликтүү карталарды — Элкарт, Uzcard, Humo, «Мир» — Paddle колдобойт, эл аралык карта керек.",
              )}
            </p>
          </div>

          <div className="rounded-[20px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.05)]">
            <div className="font-bold">🇰🇬 {t("В Кыргызстане — по QR-коду", "Кыргызстанда — QR-код менен")}</div>
            <p className="mt-1 text-[15px] text-[#5c5880]">
              <TelegramCta placement="subscribe-countries-qr" className={tgLink}>
                {t("Напишите нам в Telegram", "Бизге Telegram'га жазыңыз")}
              </TelegramCta>
              {t(
                " — пришлём QR для оплаты и включим доступ вручную.",
                " — төлөө үчүн QR жөнөтүп, кирүүнү кол менен күйгүзөбүз.",
              )}
            </p>
          </div>

          <div className="rounded-[20px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.05)]">
            <div className="font-bold">🇷🇺 🇧🇾 {t("Из России и Беларуси", "Россиядан жана Беларусьтан")}</div>
            <p className="mt-1 text-[15px] text-[#5c5880]">
              {t(
                "Paddle не принимает оплату из этих стран, поэтому онлайн-оплата картой не сработает. ",
                "Paddle бул өлкөлөрдөн төлөм кабыл албайт, ошондуктан карта менен онлайн төлөм иштебейт. ",
              )}
              <TelegramCta placement="subscribe-countries-ru-by" className={tgLink}>
                {t("Напишите нам в Telegram", "Бизге Telegram'га жазыңыз")}
              </TelegramCta>
              {t(
                " — подскажем, как оплатить, и включим доступ вручную.",
                " — кантип төлөөнү айтып, кирүүнү кол менен күйгүзөбүз.",
              )}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#8f8aa8]">
          {t(
            "Карта не прошла или вашей страны нет в списке — тоже пишите, разберёмся.",
            "Карта өтпөй калса же өлкөңүз тизмеде жок болсо — жазыңыз, чечебиз.",
          )}
        </p>
      </section>
    </div>
  );
}
