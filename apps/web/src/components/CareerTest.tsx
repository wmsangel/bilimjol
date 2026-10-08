"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  careerQuestions,
  careerTypes,
  getCareerType,
  scoreCareer,
  topCareerTypes,
  CAREER_MAX_PER_TYPE,
  CAREER_CORE,
  type CareerTypeId,
} from "@izn-study/shared";
import type { Locale } from "@/i18n/config";
import { pushEvent } from "@/lib/gtm";
import { getEntitlement, isLoggedIn } from "@/lib/api";

const KEY = "izn.study:career:v1";

export function CareerTest({
  locale,
  classHref,
  ortHref,
  subscribeHref,
  loginHref,
}: {
  locale: Locale;
  classHref: string;
  ortHref: string;
  subscribeHref: string;
  loginHref: string;
}) {
  const total = careerQuestions.length;
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [premium, setPremium] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const paywallFired = useRef(false);

  const t = (ru: string, ky: string) => (locale === "ky" ? ky : ru);

  useEffect(() => {
    const li = isLoggedIn();
    setLoggedIn(li);
    setAuthChecked(true);
    if (li) {
      getEntitlement()
        .then((e) => setPremium(e.premium))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (done && !premium && !paywallFired.current) {
      paywallFired.current = true;
      pushEvent("career_paywall_view", {});
    }
  }, [done, premium]);

  function start() {
    pushEvent("career_start", {});
    paywallFired.current = false;
    setStarted(true);
    setIndex(0);
    setAnswers([]);
    setDone(false);
  }

  function answer(value: number) {
    const next = [...answers, value];
    setAnswers(next);
    if (index + 1 >= total) {
      const code = topCareerTypes(next).join("");
      pushEvent("career_finish", { code });
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
      } catch {}
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  }

  function back() {
    if (index === 0) return;
    setAnswers(answers.slice(0, -1));
    setIndex(index - 1);
  }

  // ── Интро ──
  if (!started) {
    return (
      <div className="mx-auto w-full max-w-xl text-center font-sans text-[#191539]">
        <p className="mb-2 text-lg leading-relaxed text-[#5c5880]">
          {t(
            "48 утверждений о том, что вам нравится. Оцените каждое по шкале — правильных ответов нет. Бесплатно вы узнаете свой ведущий тип и диаграмму, а полный разбор с профессиями и планом — в премиуме.",
            "Сизге эмне жагаары жөнүндө 48 айтым. Ар бирин шкала боюнча баалаңыз — туура жооп жок. Акысыз жетектөөчү типиңизди жана диаграммаңызды билесиз, кесиптер менен план камтыган толук талдоо — премиумда.",
          )}
        </p>
        <p className="mb-6 text-sm text-[#8f8aa8]">
          {t("Методика RIASEC · 4–5 минут · результат сохранится в аккаунте", "RIASEC методикасы · 4–5 мүнөт · жыйынтык аккаунтка сакталат")}
        </p>
        {!authChecked ? (
          <div className="mx-auto h-14 w-48 animate-pulse rounded-full bg-[#ece8fb]" />
        ) : loggedIn ? (
          <button
            onClick={start}
            className="rounded-full bg-[#6d5cf7] px-10 py-4 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5 active:scale-95"
          >
            {t("Пройти тест", "Тестти өтүү")}
          </button>
        ) : (
          <div className="mx-auto max-w-md rounded-[26px] border-2 border-[#e6e1f5] bg-white p-6 shadow-[0_12px_30px_rgba(25,21,57,.06)]">
            <div className="text-3xl">🔐</div>
            <h3 className="mt-2 font-display text-xl font-bold">
              {t("Войдите, чтобы пройти тест", "Тестти өтүү үчүн кириңиз")}
            </h3>
            <p className="mt-2 text-[15px] text-[#5c5880]">
              {t(
                "Нужен бесплатный аккаунт — так результат сохранится и будет под рукой на всех устройствах.",
                "Акысыз аккаунт керек — ошондо жыйынтык сакталып, бардык түзмөктө колуңузда болот.",
              )}
            </p>
            <Link
              href={loginHref}
              onClick={() => pushEvent("career_login_required", {})}
              className="mt-5 inline-flex rounded-full bg-[#6d5cf7] px-8 py-3.5 font-display font-bold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5 active:scale-95"
            >
              {t("Войти и пройти тест", "Кирип, тестти өтүү")}
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ── Результат ──
  if (done) {
    const scores = scoreCareer(answers);
    const top = topCareerTypes(answers, 3);
    const code = top.join("");
    const lead = getCareerType(top[0]);
    const sorted = [...careerTypes].sort((a, b) => scores[b.id] - scores[a.id]);

    return (
      <div className="mx-auto w-full max-w-2xl font-sans text-[#191539]">
        {/* Бесплатная часть: ведущий тип + диаграмма */}
        <div className="rounded-[32px] bg-white p-7 text-center shadow-[0_20px_50px_rgba(25,21,57,.08)] sm:p-9">
          <div className="text-5xl">{lead.emoji}</div>
          <p className="mt-3 text-xs font-extrabold uppercase tracking-[1.4px] text-[#5c5880]">
            {t("Ваш ведущий тип", "Сиздин жетектөөчү тип")}
          </p>
          <h2 className="mt-1 font-display text-[26px] font-bold sm:text-[30px]">{lead.name[locale]}</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-[#5c5880]">{lead.tagline[locale]}</p>

          <div className="mt-6 space-y-2.5 text-left">
            {sorted.map((ty) => {
              const pct = Math.round((scores[ty.id] / CAREER_MAX_PER_TYPE) * 100);
              const isTop = top.includes(ty.id);
              return (
                <div key={ty.id} className="flex items-center gap-3">
                  <span className="w-7 flex-none text-xl">{ty.emoji}</span>
                  <span className="w-28 flex-none truncate text-sm font-bold">{ty.name[locale]}</span>
                  <span className="h-3 flex-1 overflow-hidden rounded-full bg-[#eee9ff]">
                    <span
                      className={"block h-full rounded-full " + (isTop ? "bg-[#6d5cf7]" : "bg-[#c4bbf0]")}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-9 flex-none text-right text-xs font-extrabold text-[#5c5880]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {premium ? (
          <FullReport top={top} code={code} locale={locale} classHref={classHref} ortHref={ortHref} t={t} />
        ) : (
          <Paywall code={code} top={top} locale={locale} subscribeHref={subscribeHref} t={t} />
        )}

        <button
          onClick={start}
          className="mt-4 block w-full text-center text-sm font-extrabold text-[#5c5880] transition hover:text-[#191539]"
        >
          🔄 {t("Пройти заново", "Кайра өтүү")}
        </button>
      </div>
    );
  }

  // ── Вопрос (5-балльная шкала) ──
  const pct = ((index + 1) / total) * 100;
  const options: [number, string][] = [
    [4, t("Точно про меня", "Так мен жөнүндө")],
    [3, t("Скорее да", "Көбүнчө ооба")],
    [2, t("Нейтрально", "Нейтралдуу")],
    [1, t("Скорее нет", "Көбүнчө жок")],
    [0, t("Совсем не про меня", "Такыр меники эмес")],
  ];
  return (
    <div className="mx-auto w-full max-w-xl font-sans text-[#191539]">
      <div className="mb-2 flex items-center justify-between text-sm font-extrabold text-[#5c5880]">
        <span>{t("Вопрос", "Суроо")} {index + 1} / {total}</span>
      </div>
      <div className="mb-7 h-3 overflow-hidden rounded-full bg-[#e6e1ff]">
        <div className="h-full rounded-full bg-[#6d5cf7] transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      <div className="rounded-[32px] bg-white p-7 shadow-[0_20px_50px_rgba(25,21,57,.08)] sm:p-9">
        <p className="font-display text-[22px] font-bold leading-snug sm:text-[26px]">
          {careerQuestions[index].text[locale]}
        </p>
        <div className="mt-7 flex flex-col gap-2.5">
          {options.map(([value, text], i) => (
            <button
              key={value}
              onClick={() => answer(value)}
              className={
                "rounded-2xl border-2 px-6 py-3.5 text-left text-base font-extrabold transition hover:-translate-y-0.5 active:scale-[.99] " +
                (i === 0
                  ? "border-[#a7f3d0] hover:border-[#34d399]"
                  : i === 1
                    ? "border-[#cdebd9] hover:border-[#6ee7b7]"
                    : i === 2
                      ? "border-[#e6c079] bg-[#fbf3e3] hover:border-[#c9a04f]"
                      : i === 3
                        ? "border-[#f0d0d0] hover:border-[#e0a0a0]"
                        : "border-black/10 hover:border-[#b9b3e6]")
              }
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {index > 0 && (
        <button
          onClick={back}
          className="mt-4 text-sm font-extrabold text-[#5c5880] transition hover:text-[#191539]"
        >
          ← {t("Назад", "Артка")}
        </button>
      )}
    </div>
  );
}

// ── Полный разбор (премиум) ──
function FullReport({
  top,
  code,
  locale,
  classHref,
  ortHref,
  t,
}: {
  top: CareerTypeId[];
  code: string;
  locale: Locale;
  classHref: string;
  ortHref: string;
  t: (ru: string, ky: string) => string;
}) {
  const lead = getCareerType(top[0]);
  const synthesis = t(
    `Ваш профиль сочетает тягу к ${CAREER_CORE[top[0]].ru}, ${CAREER_CORE[top[1]].ru} и ${CAREER_CORE[top[2]].ru}. Ведущий тип — «${lead.name.ru}»: на него стоит опираться в первую очередь, а два других дополняют картину и расширяют выбор профессий.`,
    `Сиздин профилиңиз ${CAREER_CORE[top[0]].ky}, ${CAREER_CORE[top[1]].ky} жана ${CAREER_CORE[top[2]].ky} умтулууну айкалыштырат. Жетектөөчү тип — «${lead.name.ky}»: биринчи кезекте ошого таянуу керек, калган экөө сүрөттү толуктап, кесип тандоону кеңейтет.`,
  );

  return (
    <>
      <div className="mt-4 rounded-[26px] bg-[#191539] p-6 text-white shadow-[0_16px_40px_rgba(25,21,57,.2)]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold uppercase tracking-[1.4px] text-[#b9b3e6]">
            {t("Полный разбор", "Толук талдоо")}
          </p>
          <span className="rounded-full bg-[#6d5cf7] px-3 py-1 text-xs font-extrabold tracking-wider">
            {t("Код", "Код")} {code}
          </span>
        </div>
        <p className="mt-3 leading-relaxed text-[#e4e1f5]">{synthesis}</p>
      </div>

      {top.map((id, i) => {
        const ty = getCareerType(id);
        const rank = i === 0 ? t("Ведущий", "Жетектөөчү") : i === 1 ? t("Второй", "Экинчи") : t("Третий", "Үчүнчү");
        const rows: [string, string][] = [
          [t("Сильные стороны", "Күчтүү жактары"), ty.strengths[locale]],
          [t("Зоны роста", "Өсүү чөйрөлөрү"), ty.cautions[locale]],
          [t("Профессии", "Кесиптер"), ty.professions[locale]],
          [t("Направления", "Багыттар"), ty.directions[locale]],
          [t("Куда поступать", "Кайда тапшыруу"), ty.universities[locale]],
          [t("Предметы", "Предметтер"), ty.subjects[locale]],
          [t("ОРТ", "ЖРТ"), ty.ortSubjects[locale]],
        ];
        return (
          <div key={id} className="mt-4 rounded-[26px] bg-white p-6 shadow-[0_12px_30px_rgba(25,21,57,.06)]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{ty.emoji}</span>
              <div>
                <h3 className="font-display text-xl font-bold">
                  {ty.name[locale]}
                  <span className="ml-2 align-middle text-xs font-extrabold uppercase tracking-wide text-[#8f8aa8]">{rank}</span>
                </h3>
                <p className="text-xs font-bold uppercase tracking-wide text-[#8f8aa8]">{ty.holland[locale]}</p>
              </div>
            </div>
            <p className="mt-3 leading-relaxed text-[#2d2950]">{ty.description[locale]}</p>
            <dl className="mt-4 space-y-2 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-32 flex-none font-bold text-[#6d5cf7]">{k}</dt>
                  <dd className="text-[#2d2950]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}

      {/* Персональный план по предметам */}
      <div className="mt-4 rounded-[26px] bg-[#f7f5ff] p-6">
        <h3 className="font-display text-lg font-bold">{t("Ваш план по предметам", "Предметтер боюнча планыңыз")}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-[#2d2950]">
          {t(
            `Сфокусируйтесь на предметах ведущего типа: ${lead.subjects.ru}. На ОРТ — ${lead.ortSubjects.ru}. Тренируйте эти предметы заранее и регулярно — так проще поступить на выбранное направление.`,
            `Жетектөөчү типтин предметтерине көңүл буруңуз: ${lead.subjects.ky}. ЖРТда — ${lead.ortSubjects.ky}. Бул предметтерди алдын ала жана үзгүлтүксүз машыктырыңыз — ошондо тандаган багытка тапшыруу жеңилирээк.`,
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={classHref} className="rounded-full bg-[#6d5cf7] px-6 py-3 font-extrabold text-white shadow-md transition hover:-translate-y-0.5">
            {t("К занятиям по предметам", "Предметтер боюнча сабактарга")}
          </Link>
          <Link href={ortHref} className="rounded-full bg-white px-6 py-3 font-extrabold text-[#6d5cf7] ring-1 ring-[#d9d2f5] transition hover:-translate-y-0.5">
            {t("Подготовка к ОРТ", "ЖРТга даярдык")}
          </Link>
        </div>
      </div>

      <p className="mt-4 px-2 text-sm leading-relaxed text-[#8f8aa8]">
        {t(
          "Это не приговор, а подсказка: профиль показывает склонности, а не единственный путь. Пробуйте разное — и усиливайте предметы, которые ведут к интересным вам профессиям.",
          "Бул өкүм эмес, кеңеш: профиль жөндөмдү көрсөтөт, бирок бирден-бир жол эмес. Ар кандайды сынап көрүңүз — жана сизди кызыктырган кесиптерге алып барган предметтерди чыңдаңыз.",
        )}
      </p>
    </>
  );
}

// ── Пейвол (бесплатным) ──
function Paywall({
  code,
  top,
  locale,
  subscribeHref,
  t,
}: {
  code: string;
  top: CareerTypeId[];
  locale: Locale;
  subscribeHref: string;
  t: (ru: string, ky: string) => string;
}) {
  const names = top.map((id) => getCareerType(id).name[locale]).join(" · ");
  const bullets = [
    t("Разбор сочетания ваших трёх типов", "Үч типиңиздин айкалышынын талдоосу"),
    t("Сильные стороны и зоны роста", "Күчтүү жактар жана өсүү чөйрөлөрү"),
    t("Профессии и куда поступать (вузовские направления)", "Кесиптер жана кайда тапшыруу (вуз багыттары)"),
    t("Персональный план по предметам и ОРТ", "Предметтер жана ЖРТ боюнча жеке план"),
  ];
  return (
    <div className="relative mt-4 overflow-hidden rounded-[26px] border-2 border-[#e6e1f5] bg-white p-6 shadow-[0_12px_30px_rgba(25,21,57,.06)]">
      <div className="text-center">
        <div className="text-3xl">🔒</div>
        <p className="mt-2 text-xs font-extrabold uppercase tracking-[1.4px] text-[#8f8aa8]">
          {t("Ваш код", "Сиздин код")} {code} · {names}
        </p>
        <h3 className="mt-1 font-display text-[22px] font-bold">
          {t("Полный разбор — в премиуме", "Толук талдоо — премиумда")}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-[#5c5880]">
          {t(
            "Ведущий тип и диаграмму вы уже видите бесплатно. В полном разборе — глубокий анализ и конкретные шаги:",
            "Жетектөөчү тип менен диаграмманы акысыз көрүп жатасыз. Толук талдоодо — терең анализ жана конкреттүү кадамдар:",
          )}
        </p>
      </div>
      <ul className="mx-auto mt-4 max-w-md space-y-2">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-[15px] text-[#2d2950]">
            <span className="mt-0.5 flex-none font-bold text-[#6d5cf7]">✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center">
        <Link
          href={subscribeHref}
          onClick={() => pushEvent("career_unlock_click", { code })}
          className="inline-flex rounded-full bg-[#6d5cf7] px-8 py-3.5 font-display font-bold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5 active:scale-95"
        >
          {t("Открыть полный разбор", "Толук талдоону ачуу")}
        </Link>
        <p className="mt-2 text-xs text-[#8f8aa8]">
          {t("Премиум открывает разбор, все игры и задания", "Премиум талдоону, бардык оюндарды жана тапшырмаларды ачат")}
        </p>
      </div>
    </div>
  );
}
