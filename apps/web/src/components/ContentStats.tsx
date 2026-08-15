import { tasks, topics, tests, type Locale, type Task } from "@izn-study/shared";

const SUBJ_ORDER = ["math", "logic", "reading", "world", "olympiad"] as const;
const SUBJ_LABEL: Record<string, { ru: string; ky: string }> = {
  math: { ru: "Математика", ky: "Математика" },
  logic: { ru: "Логика", ky: "Логика" },
  reading: { ru: "Чтение", ky: "Окуу" },
  world: { ru: "Окружающий мир", ky: "Айлана-чөйрө" },
  olympiad: { ru: "Олимпиада", ky: "Олимпиада" },
};
const TYPE_ORDER: Task["type"][] = [
  "single_choice", "multi_select", "number_input", "ordering", "match_pairs",
];
const TYPE_LABEL: Record<string, { ru: string; ky: string }> = {
  single_choice: { ru: "Выбор варианта", ky: "Вариант тандоо" },
  multi_select: { ru: "Отметь все верные", ky: "Баарын белгиле" },
  number_input: { ru: "Ввод числа", ky: "Сан киргизүү" },
  ordering: { ru: "Упорядочивание", ky: "Иреттөө" },
  match_pairs: { ru: "Соединение пар", ky: "Жуп кошуу" },
};

const T = {
  ru: {
    title: "Контент платформы", grades: "Классы", topics: "Темы", tasks: "Задания",
    free: "Бесплатных", premium: "Платных", star: "Со звёздочкой", oly: "Олимпиадных",
    tests: "Тесты", byGrade: "По классам", grade: "Класс", bySubject: "По предметам",
    byType: "По типам заданий", subject: "Предмет", type: "Тип", count: "Кол-во", share: "Доля",
    pre: "0 (подгот.)",
  },
  ky: {
    title: "Платформанын контенти", grades: "Класстар", topics: "Темалар", tasks: "Тапшырмалар",
    free: "Акысыз", premium: "Акылуу", star: "Жылдызча", oly: "Олимпиада",
    tests: "Тесттер", byGrade: "Класстар боюнча", grade: "Класс", bySubject: "Предметтер боюнча",
    byType: "Тапшырма түрлөрү", subject: "Предмет", type: "Түрү", count: "Саны", share: "Үлүш",
    pre: "0 (даярдык)",
  },
};

function pct(n: number, total: number) {
  return total ? Math.round((n / total) * 100) : 0;
}

/** Сводная статистика по учебному контенту (считается из общих данных). */
export function ContentStats({ locale }: { locale: Locale }) {
  const t = T[locale] ?? T.ru;
  const grades = [...new Set(topics.map((x) => x.grade))].sort((a, b) => a - b);

  const total = tasks.length;
  const cards = [
    { label: t.grades, value: grades.length, tone: "from-indigo-100 to-violet-200 text-indigo-700 dark:from-indigo-500/15 dark:to-violet-500/10 dark:text-indigo-300" },
    { label: t.topics, value: topics.length, tone: "from-sky-100 to-cyan-200 text-sky-700 dark:from-sky-500/15 dark:to-cyan-500/10 dark:text-sky-300" },
    { label: t.tasks, value: total, tone: "from-emerald-100 to-green-200 text-emerald-700 dark:from-emerald-500/15 dark:to-green-500/10 dark:text-emerald-300" },
    { label: t.free, value: tasks.filter((x) => x.free).length, tone: "from-teal-100 to-emerald-200 text-teal-700 dark:from-teal-500/15 dark:to-emerald-500/10 dark:text-teal-300" },
    { label: t.star, value: tasks.filter((x) => x.star).length, tone: "from-amber-100 to-yellow-200 text-amber-700 dark:from-amber-500/15 dark:to-yellow-500/10 dark:text-amber-300" },
    { label: t.oly, value: tasks.filter((x) => x.subject === "olympiad").length, tone: "from-orange-100 to-red-200 text-orange-700 dark:from-orange-500/15 dark:to-red-500/10 dark:text-orange-300" },
  ];

  const th = "px-3 py-2 text-left font-semibold text-zinc-500 dark:text-zinc-400";
  const td = "px-3 py-2 tabular-nums";

  return (
    <section className="mt-10 rounded-3xl border border-black/[.06] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <h2 className="mb-5 font-display text-2xl font-extrabold">{t.title}</h2>

      {/* Карточки-итоги */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl bg-gradient-to-br p-4 text-center ${c.tone}`}>
            <div className="font-display text-3xl font-extrabold tabular-nums">{c.value}</div>
            <div className="mt-1 text-xs font-semibold">{c.label}</div>
          </div>
        ))}
      </div>

      {/* По классам */}
      <h3 className="mb-2 mt-8 font-display text-lg font-bold">{t.byGrade}</h3>
      <div className="overflow-x-auto rounded-2xl border border-black/[.06] dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/[.03] dark:bg-white/5">
            <tr>
              <th className={th}>{t.grade}</th>
              <th className={th}>{t.topics}</th>
              <th className={th}>{t.tasks}</th>
              <th className={th}>{t.free}</th>
              <th className={th}>{t.premium}</th>
              <th className={th}>★</th>
              <th className={th}>🏆</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => {
              const gt = tasks.filter((x) => x.grade === g);
              return (
                <tr key={g} className="border-t border-black/[.05] dark:border-white/5">
                  <td className={td + " font-semibold"}>{g === 0 ? t.pre : g}</td>
                  <td className={td}>{topics.filter((x) => x.grade === g).length}</td>
                  <td className={td + " font-semibold"}>{gt.length}</td>
                  <td className={td}>{gt.filter((x) => x.free).length}</td>
                  <td className={td}>{gt.filter((x) => !x.free).length}</td>
                  <td className={td}>{gt.filter((x) => x.star).length}</td>
                  <td className={td}>{gt.filter((x) => x.subject === "olympiad").length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* По предметам */}
        <div>
          <h3 className="mb-2 font-display text-lg font-bold">{t.bySubject}</h3>
          <div className="overflow-x-auto rounded-2xl border border-black/[.06] dark:border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-black/[.03] dark:bg-white/5">
                <tr>
                  <th className={th}>{t.subject}</th>
                  <th className={th}>{t.topics}</th>
                  <th className={th}>{t.tasks}</th>
                  <th className={th}>{t.share}</th>
                </tr>
              </thead>
              <tbody>
                {SUBJ_ORDER.map((s) => {
                  const st = tasks.filter((x) => x.subject === s);
                  return (
                    <tr key={s} className="border-t border-black/[.05] dark:border-white/5">
                      <td className={td + " font-semibold"}>{SUBJ_LABEL[s][locale] ?? SUBJ_LABEL[s].ru}</td>
                      <td className={td}>{topics.filter((x) => x.subject === s).length}</td>
                      <td className={td}>{st.length}</td>
                      <td className={td}>{pct(st.length, total)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* По типам */}
        <div>
          <h3 className="mb-2 font-display text-lg font-bold">{t.byType}</h3>
          <div className="overflow-x-auto rounded-2xl border border-black/[.06] dark:border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-black/[.03] dark:bg-white/5">
                <tr>
                  <th className={th}>{t.type}</th>
                  <th className={th}>{t.count}</th>
                  <th className={th}>{t.share}</th>
                </tr>
              </thead>
              <tbody>
                {TYPE_ORDER.map((ty) => {
                  const c = tasks.filter((x) => x.type === ty).length;
                  return (
                    <tr key={ty} className="border-t border-black/[.05] dark:border-white/5">
                      <td className={td + " font-semibold"}>{TYPE_LABEL[ty][locale] ?? TYPE_LABEL[ty].ru}</td>
                      <td className={td}>{c}</td>
                      <td className={td}>{pct(c, total)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {t.tests}: {tests.length}
          </p>
        </div>
      </div>
    </section>
  );
}
