/**
 * Квиз-рилсы Bilimjol — как данные.
 *
 * Короткое вертикальное видео: задачка → полоса-таймер → ответ с разбором → CTA.
 * Весь текст рисует satori (scripts/social-reels.mjs), ffmpeg только анимирует
 * тайминг/полосу/переход. Двуязычно (ru/ky). Один рилс на день.
 *
 * Поля: id, day, theme (violet|light), kicker, question (крупно), answer (итог,
 * крупно), solve (короткий разбор, 1 строка), cta (призыв), page (куда ведём).
 */
export const REELS = [
  {
    id: "r-umnozhenie", day: "Пн", theme: "violet",
    kicker: { ru: "Задачка за 10 секунд", ky: "10 секундда маселе" },
    question: { ru: "7 × 8 = ?", ky: "7 × 8 = ?" },
    answer: { ru: "56", ky: "56" },
    solve: { ru: "7 × 8 = 56", ky: "7 × 8 = 56" },
    cta: { ru: "Тренажёр таблицы умножения", ky: "Көбөйтүү таблицасынын тренажёру" },
    page: "/matematika/tablica-umnozheniya",
  },
  {
    id: "r-procenty", day: "Вт", theme: "light",
    kicker: { ru: "Проценты · для ОРТ", ky: "Пайыздар · ЖРТга" },
    question: { ru: "20% от 150 = ?", ky: "150дин 20% = ?" },
    answer: { ru: "30", ky: "30" },
    solve: { ru: "1% = 1,5 → ×20 = 30", ky: "1% = 1,5 → ×20 = 30" },
    cta: { ru: "Задачи на проценты — бесплатно", ky: "Пайыз маселелери — акысыз" },
    page: "/podgotovka-k-ort",
  },
  {
    id: "r-kvadrat", day: "Ср", theme: "violet",
    kicker: { ru: "Квадрат числа", ky: "Сандын квадраты" },
    question: { ru: "13² = ?", ky: "13² = ?" },
    answer: { ru: "169", ky: "169" },
    solve: { ru: "13 × 13 = 169", ky: "13 × 13 = 169" },
    cta: { ru: "Таблица квадратов и тренажёр", ky: "Квадраттар таблицасы жана тренажёр" },
    page: "/matematika/kvadraty",
  },
  {
    id: "r-delenie", day: "Чт", theme: "light",
    kicker: { ru: "Задачка за 10 секунд", ky: "10 секундда маселе" },
    question: { ru: "84 ÷ 7 = ?", ky: "84 ÷ 7 = ?" },
    answer: { ru: "12", ky: "12" },
    solve: { ru: "7 × 12 = 84", ky: "7 × 12 = 84" },
    cta: { ru: "Математика по классам — бесплатно", ky: "Математика класстар боюнча — акысыз" },
    page: "/matematika",
  },
  {
    id: "r-poryadok", day: "Пт", theme: "violet",
    kicker: { ru: "Не попадись!", ky: "Жаңылба!" },
    question: { ru: "2 + 3 × 4 = ?", ky: "2 + 3 × 4 = ?" },
    answer: { ru: "14", ky: "14" },
    solve: { ru: "сначала 3×4=12, потом +2", ky: "адегенде 3×4=12, анан +2" },
    cta: { ru: "Порядок действий — разбор", ky: "Амалдардын тартиби — талдоо" },
    page: "/matematika",
  },
  {
    id: "r-drobi", day: "Сб", theme: "light",
    kicker: { ru: "Дроби", ky: "Бөлчөктөр" },
    question: { ru: "1/2 + 1/4 = ?", ky: "1/2 + 1/4 = ?" },
    answer: { ru: "3/4", ky: "3/4" },
    solve: { ru: "1/2 = 2/4 → 2/4 + 1/4 = 3/4", ky: "1/2 = 2/4 → 2/4 + 1/4 = 3/4" },
    cta: { ru: "Дроби по шагам — бесплатно", ky: "Бөлчөктөр кадам-кадам — акысыз" },
    page: "/matematika",
  },
  {
    id: "r-ryad", day: "Вс", theme: "violet",
    kicker: { ru: "Найди закономерность", ky: "Мыйзам ченемди тап" },
    question: { ru: "2, 4, 8, 16, ?", ky: "2, 4, 8, 16, ?" },
    answer: { ru: "32", ky: "32" },
    solve: { ru: "каждое число × 2", ky: "ар бир сан × 2" },
    cta: { ru: "Развивающие игры — бесплатно", ky: "Өнүктүрүүчү оюндар — акысыз" },
    page: "/games",
  },
];
