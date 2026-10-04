import type { MetadataRoute } from "next";
import { getAllTags, getAvailableLocales, listPosts } from "@/lib/posts";
import {
  listCategoryParams,
  localesWithCategory,
  localesWithTag,
} from "@/lib/routes";
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  localeUrl,
  LOCALES,
  type Locale,
} from "@/lib/i18n";

export const dynamic = "force-static";

// 엔트리별 hreflang 주석(xhtml:link) 생성
// HTML <link> 주석과 동일한 "존재하는 로케일" 판정을 공유한다
function alternates(path: string, availableLocales: Locale[]) {
  const languages: Record<string, string> = {};
  for (const locale of availableLocales) {
    languages[HTML_LANG[locale]] = localeUrl(locale, path);
  }
  // HTML <link> 주석과 동일한 내용이 되도록 x-default도 함께 넣는다
  if (availableLocales.includes(DEFAULT_LOCALE)) {
    languages["x-default"] = localeUrl(DEFAULT_LOCALE, path);
  }
  return { languages };
}

async function localeEntries(locale: Locale): Promise<MetadataRoute.Sitemap> {
  const [posts, tags, categories] = await Promise.all([
    listPosts(locale),
    getAllTags(locale),
    listCategoryParams(locale),
  ]);

  const allLocales = [...LOCALES];

  const postEntries: MetadataRoute.Sitemap = await Promise.all(
    posts.map(async (post) => {
      const path = `/posts/${post.slug}`;
      return {
        url: localeUrl(locale, path),
        lastModified: post.frontMatter.updatedAt,
        alternates: alternates(path, await getAvailableLocales(post.slug)),
      };
    })
  );

  const categoryEntries: MetadataRoute.Sitemap = await Promise.all(
    categories.map(async (category) => {
      const path = `/categories/${category}`;
      return {
        url: localeUrl(locale, path),
        alternates: alternates(path, await localesWithCategory(category)),
      };
    })
  );

  const tagEntries: MetadataRoute.Sitemap = await Promise.all(
    tags.map(async (tag) => {
      const path = `/tags/${encodeURIComponent(tag)}`;
      return {
        url: localeUrl(locale, path),
        alternates: alternates(path, await localesWithTag(tag)),
      };
    })
  );

  return [
    {
      url: localeUrl(locale, "/"),
      lastModified: new Date(),
      alternates: alternates("/", allLocales),
    },
    {
      url: localeUrl(locale, "/posts"),
      lastModified: new Date(),
      alternates: alternates("/posts", allLocales),
    },
    {
      url: localeUrl(locale, "/categories"),
      lastModified: new Date(),
      alternates: alternates("/categories", allLocales),
    },
    ...categoryEntries,
    ...postEntries,
    ...tagEntries,
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const perLocale = await Promise.all(LOCALES.map(localeEntries));
  return perLocale.flat();
}
