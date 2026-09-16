import { getTest } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogImage";

export const alt = "Bilimjol";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; testId: string }>;
}) {
  const { lang, testId } = await params;
  const l = isLocale(lang) ? lang : "ru";
  const test = getTest(testId);
  return ogImage({
    kicker: l === "ky" ? "Тест" : "Тест",
    title: test ? test.title[l] : "Bilimjol",
  });
}
