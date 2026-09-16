import { getArticle } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogImage";

export const alt = "Bilimjol";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const l = isLocale(lang) ? lang : "ru";
  const article = getArticle(slug);
  return ogImage({
    kicker: l === "ky" ? "Макала" : "Статья",
    title: article ? article.title[l] : "Bilimjol",
  });
}
