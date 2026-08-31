import Link from "next/link";
import type { Locale } from "@izn-study/shared";

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "wmsangel@gmail.com";

const T = {
  ru: {
    tagline: "Учиться — это интересно. На кыргызском и русском.",
    sections: "Разделы", play: "Играть", tests: "Тесты", articles: "Материалы", subscribe: "Подписка",
    project: "Проект", about: "О проекте", privacy: "Конфиденциальность", terms: "Соглашение",
    contact: "Связаться", rights: "Все права защищены",
  },
  ky: {
    tagline: "Окуу — кызыктуу. Кыргызча жана орусча.",
    sections: "Бөлүмдөр", play: "Ойноо", tests: "Тесттер", articles: "Материалдар", subscribe: "Жазылуу",
    project: "Долбоор", about: "Долбоор жөнүндө", privacy: "Купуялык", terms: "Келишим",
    contact: "Байланыш", rights: "Бардык укуктар корголгон",
  },
};

function Col({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-zinc-400">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-zinc-600 transition hover:text-foreground dark:text-zinc-300">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ lang }: { lang: Locale }) {
  const t = T[lang] ?? T.ru;
  return (
    <footer className="border-t border-black/[.06] dark:border-white/10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="font-display text-xl font-extrabold tracking-tight">
            Bilim<span className="text-indigo-600 dark:text-indigo-400">jol</span>
          </div>
          <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t.tagline}</p>
        </div>
        <Col
          title={t.sections}
          links={[
            [t.play, `/${lang}/play`],
            [t.tests, `/${lang}/tests`],
            [t.articles, `/${lang}/articles`],
            [t.subscribe, `/${lang}/subscribe`],
          ]}
        />
        <Col
          title={t.project}
          links={[
            [t.about, `/${lang}/about`],
            [t.privacy, `/${lang}/privacy`],
            [t.terms, `/${lang}/terms`],
          ]}
        />
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-zinc-400">{t.contact}</div>
          <a
            href={`mailto:${CONTACT}`}
            className="mt-3 block text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {CONTACT}
          </a>
        </div>
      </div>
      <div className="border-t border-black/[.05] dark:border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-zinc-400">
          © {new Date().getFullYear()} Bilimjol · {t.rights}
        </div>
      </div>
    </footer>
  );
}
