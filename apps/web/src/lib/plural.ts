// Русское склонение по числу: 1 задание, 2 задания, 5 заданий.
export function pluralRu(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
