"use client";

import { useMemo, useState } from "react";
import { tasks, type Task, type Locale } from "@izn-study/shared";
import { sendGa4Event } from "@/lib/gtm";

// «Загляни внутрь премиума»: показываем РЕАЛЬНЫЕ премиум-задания (free:false) —
// одно можно попробовать прямо здесь (событие try_premium), ещё два — превью.
// Цель: родитель видит и щупает контент до оплаты (рычаг доверия).

type SingleChoice = Extract<Task, { type: "single_choice" }>;

const POOL = (tasks as Task[]).filter(
  (t): t is SingleChoice =>
    t.free === false && t.type === "single_choice" && t.options.length >= 3,
);

// До 3 премиум-заданий из РАЗНЫХ предметов, с иллюстрацией в приоритете.
function pickPeek(): SingleChoice[] {
  const bySubject = new Map<string, SingleChoice>();
  for (const t of POOL) if (t.illustration && !bySubject.has(t.subject)) bySubject.set(t.subject, t);
  for (const t of POOL) if (!bySubject.has(t.subject)) bySubject.set(t.subject, t);
  return [...bySubject.values()].slice(0, 3);
}

export function PremiumPeek({ lang, plansHref }: { lang: Locale; plansHref: string }) {
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);
  const peek = useMemo(pickPeek, []);
  const [picked, setPicked] = useState<number | null>(null);
  const [tried, setTried] = useState(false);

  if (peek.length === 0) return null;

  const trial = peek[0];
  const previews = peek.slice(1);
  const correct = picked !== null && picked === trial.correctIndex;

  function choose(i: number) {
    if (tried) return;
    setPicked(i);
    setTried(true);
    sendGa4Event("try_premium", {
      item: trial.id,
      task: trial.id,
      subject: trial.subject,
      correct: i === trial.correctIndex,
    });
  }

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-bold text-[#191539]">
        {t("Загляните внутрь премиума", "Премиумдун ичине көз чаптырыңыз")}
      </h2>
      <p className="mt-2 text-[#5c5880]">
        {t(
          "Это настоящие задания из подписки. Попробуйте одно бесплатно — прямо сейчас.",
          "Бул — жазылуудагы чыныгы тапшырмалар. Бирөөнү акысыз сынап көрүңүз — ушул жерде.",
        )}
      </p>

      {/* Интерактивная проба */}
      <div className="mt-5 rounded-[24px] border-2 border-[#e6c079] bg-white p-6 shadow-[0_10px_30px_rgba(25,21,57,.07)]">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#e6c079] px-2.5 py-0.5 text-xs font-extrabold text-[#191539]">
            {t("Проба премиума", "Премиум сыноо")}
          </span>
          <span className="text-xs font-bold text-[#8f8aa8]">
            {t("Бесплатно, без регистрации", "Акысыз, катталуусуз")}
          </span>
        </div>
        {trial.illustration && (
          <div className="mt-3 text-3xl" aria-hidden="true">{trial.illustration}</div>
        )}
        <p className="mt-2 font-display text-lg font-bold text-[#191539]">{trial.prompt[lang]}</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {trial.options.map((o, i) => {
            const isCorrect = i === trial.correctIndex;
            const isPicked = i === picked;
            let cls = "border-[#ece7fd] bg-[#f7f5ff] hover:border-[#d9d2fb]";
            if (tried && isCorrect) cls = "border-[#3fb27f] bg-[#e9f8f1] text-[#1f7a53]";
            else if (tried && isPicked && !isCorrect) cls = "border-[#e49] bg-[#fdeef2] text-[#b23a5b]";
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={tried}
                className={`rounded-2xl border-2 px-4 py-3 text-left text-[15px] font-bold transition disabled:cursor-default ${cls}`}
              >
                <span className="mr-2 text-[#8f8aa8]">{String.fromCharCode(65 + i)}.</span>
                {o[lang]}
                {tried && isCorrect && <span className="ml-1">✓</span>}
              </button>
            );
          })}
        </div>

        {tried && (
          <div className="mt-4 rounded-2xl bg-[#f7f5ff] p-4">
            <p className="font-bold text-[#191539]">
              {correct ? t("Верно! 🎉", "Туура! 🎉") : t("Почти — вот разбор:", "Дээрлик — мына талдоо:")}
            </p>
            {trial.explanation?.[lang] && (
              <p className="mt-1 text-sm text-[#5c5880]">{trial.explanation[lang]}</p>
            )}
            <a
              href={plansHref}
              onClick={() => sendGa4Event("cta_click", { item: "premium_peek", placement: "premium_peek" })}
              className="mt-4 inline-flex rounded-full bg-[#6d5cf7] px-6 py-3 font-extrabold text-white shadow-[0_8px_22px_rgba(109,92,247,.3)] transition hover:-translate-y-0.5"
            >
              {t("Понравилось? Открыть все задания →", "Жактыбы? Бардык тапшырмаларды ачуу →")}
            </a>
          </div>
        )}
      </div>

      {/* Превью ещё двух премиум-заданий */}
      {previews.length > 0 && (
        <>
          <p className="mt-6 text-sm font-bold text-[#8f8aa8]">
            {t("И ещё тысячи заданий по всем предметам:", "Жана бардык предметтер боюнча дагы миңдеген тапшырма:")}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {previews.map((p) => (
              <div key={p.id} className="rounded-2xl border border-[#ece7fd] bg-white p-4 shadow-[0_6px_18px_rgba(25,21,57,.05)]">
                <div className="flex items-center gap-2">
                  {p.illustration && <span className="text-xl" aria-hidden="true">{p.illustration}</span>}
                  <span className="rounded-full bg-[#f2effe] px-2 py-0.5 text-[11px] font-extrabold text-[#6d5cf7]">
                    {t("Премиум", "Премиум")}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-[#191539]">{p.prompt[lang]}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.options.map((o, i) => (
                    <span key={i} className="rounded-lg bg-[#f7f5ff] px-2 py-1 text-xs text-[#8f8aa8]">
                      {o[lang]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
