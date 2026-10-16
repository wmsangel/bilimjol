import Link from "next/link";
import { tests, type Locale } from "@izn-study/shared";
import { GAME_META } from "@/lib/classGames";

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "wmsangel@gmail.com";

const T = {
  ru: {
    tagline: "Учиться — это интересно. На кыргызском и русском.",
    sections: "Разделы", play: "Играть", games: "Игры", tests: "Тесты", articles: "Материалы", subscribe: "Подписка",
    parents: "Родителям", readiness: "Тест готовности", classes: "Классы", math: "Математика онлайн",
    library: "Библиотека", ort: "Подготовка к ОРТ", career: "Профориентация",
    popular: "Популярное",
    project: "Проект", about: "О проекте", privacy: "Конфиденциальность", terms: "Соглашение",
    contact: "Связаться", rights: "Все права защищены",
  },
  ky: {
    tagline: "Окуу — кызыктуу. Кыргызча жана орусча.",
    sections: "Бөлүмдөр", play: "Ойноо", games: "Оюндар", tests: "Тесттер", articles: "Материалдар", subscribe: "Жазылуу",
    parents: "Ата-энелерге", readiness: "Даярдык тести", classes: "Класстар", math: "Математика онлайн",
    library: "Китепкана", ort: "ЖРТга даярдык", career: "Профориентация",
    popular: "Популярдуу",
    project: "Долбоор", about: "Долбоор жөнүндө", privacy: "Купуялык", terms: "Келишим",
    contact: "Байланыш", rights: "Бардык укуктар корголгон",
  },
};

// Популярное — прямые ссылки на отдельные игры и тесты. Дают этим страницам
// входящие с КАЖДОЙ страницы сайта (RU и KY) и помогают обходу тонких KY-URL.
const POP_GAMES = ["bubbles", "build", "sprint"] as const;
const POP_TESTS = ["add", "division"] as const;

function Col({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-xs font-extrabold uppercase tracking-wide text-[#5c5880]">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm font-semibold text-[#5c5880] transition hover:text-[#191539]">
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
  const popular: [string, string][] = [
    ...POP_GAMES.map((id) => [GAME_META[id].title[lang], `/${lang}${GAME_META[id].slug}`] as [string, string]),
    ...POP_TESTS.map((id) => {
      const test = tests.find((x) => x.id === id);
      return [test ? test.title[lang] : id, `/${lang}/tests/${id}`] as [string, string];
    }),
  ];
  return (
    <footer className="border-t border-[#e6e1ff] bg-white font-sans text-[#191539]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <div className="font-display text-xl font-bold tracking-tight">
            Bilim<span className="text-[#c9a04f]">jol</span>
          </div>
          <p className="mt-2 max-w-xs text-sm text-[#5c5880]">{t.tagline}</p>
        </div>
        <Col
          title={t.sections}
          links={[
            [t.play, `/${lang}/play`],
            [t.classes, `/${lang}/class`],
            [t.math, `/${lang}/matematika`],
            [t.games, `/${lang}/games`],
            [t.tests, `/${lang}/tests`],
            [t.articles, `/${lang}/articles`],
            [t.library, `/${lang}/library`],
            [t.parents, `/${lang}/roditelyam`],
            [t.ort, `/${lang}/podgotovka-k-ort`],
            [t.career, `/${lang}/test-na-proforientaciyu`],
            [t.readiness, `/${lang}/gotovnost-k-shkole`],
            [t.subscribe, `/${lang}/subscribe`],
          ]}
        />
        <Col title={t.popular} links={popular} />
        <Col
          title={t.project}
          links={[
            [t.about, `/${lang}/about`],
            [t.privacy, `/${lang}/privacy`],
            [t.terms, `/${lang}/terms`],
          ]}
        />
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wide text-[#5c5880]">{t.contact}</div>
          <a
            href={`mailto:${CONTACT}`}
            className="mt-3 block text-sm font-extrabold text-[#6d5cf7] hover:underline"
          >
            {CONTACT}
          </a>
        </div>
      </div>
      <div className="border-t border-[#efecff]">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-[#5c5880]">
          © {new Date().getFullYear()} Bilimjol · {t.rights}
        </div>
      </div>
    </footer>
  );
}
