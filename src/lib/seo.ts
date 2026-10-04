// 로케일별 메타데이터 생성 — 루트 레이아웃과 각 라우트가 공유한다
// hreflang/canonical은 로케일 간 대칭이어야 하므로 생성 지점을 이 파일로 모은다.

import type { Metadata } from "next";
import {
  decodeTagParam,
  getAvailableLocales,
  getPostBySlug,
  resolveTag,
} from "@/lib/posts";
import { localesWithCategory, localesWithTag } from "@/lib/routes";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import {
  DEFAULT_LOCALE,
  getDictionary,
  HTML_LANG,
  localeUrl,
  LOCALES,
  OG_LOCALE,
  type Locale,
} from "@/lib/i18n";

// hreflang 주석 생성
// Google 요건: 각 언어 버전은 자기 자신과 다른 모든 언어 버전을 함께 나열해야 하고,
// 참조가 양방향이어야 한다. 한쪽이라도 빠지면 주석 전체가 무시된다.
// 따라서 "실제로 존재하는 로케일 목록"을 양쪽 페이지가 동일한 함수로 구해서 쓴다.
function buildAlternates(
  locale: Locale,
  path: string,
  availableLocales: Locale[]
): Metadata["alternates"] {
  const languages: Record<string, string> = {};

  for (const available of availableLocales) {
    languages[HTML_LANG[available]] = localeUrl(available, path);
  }

  // 어떤 언어에도 매칭되지 않는 사용자를 위한 폴백은 기본 로케일로 둔다
  if (availableLocales.includes(DEFAULT_LOCALE)) {
    languages["x-default"] = localeUrl(DEFAULT_LOCALE, path);
  }

  return {
    // canonical은 반드시 자기 자신 — 로케일 간 교차 지정하면 해당 버전이 색인에서 빠진다
    canonical: localeUrl(locale, path),
    languages,
  };
}

const OG_IMAGE = { url: "/image.png", width: 1200, height: 630 };

// 파비콘·앱 아이콘은 로케일과 무관하므로 한 곳에서 관리
const ICONS: Metadata["icons"] = {
  icon: [
    { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    { url: "/favicon.ico" },
  ],
  apple: [
    { url: "/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
    { url: "/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
    { url: "/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
    { url: "/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
    { url: "/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
    { url: "/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
    { url: "/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
    { url: "/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
    { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
  ],
  other: [
    {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-icon-precomposed.png",
    },
  ],
};

// 루트 레이아웃용 메타데이터
export function buildRootMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  const title = `${SITE_NAME} - ${dict.siteTagline}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description: dict.siteDescription,
    manifest: "/manifest.json",
    icons: ICONS,
    // 홈은 모든 로케일에 존재한다
    alternates: buildAlternates(locale, "/", [...LOCALES]),
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((other) => other !== locale).map(
        (other) => OG_LOCALE[other]
      ),
      url: localeUrl(locale, "/"),
      siteName: SITE_NAME,
      title,
      description: dict.siteDescription,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: dict.siteDescription,
      images: [OG_IMAGE.url],
    },
    verification: {
      google: "zgQ64xU6IrOcuDIz8oXAiBoILR011ixm2SIHOC5iQmQ",
    },
  };
}

// 글 목록 페이지 — 모든 로케일에 존재한다
export function buildPostsMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return {
    title: `${dict.posts.title} | ${SITE_NAME}`,
    description: dict.posts.description(SITE_NAME),
    alternates: buildAlternates(locale, "/posts", [...LOCALES]),
  };
}

// 카테고리 목록 페이지 — 모든 로케일에 존재한다
export function buildCategoriesMetadata(locale: Locale): Metadata {
  return {
    title: getDictionary(locale).categories.title,
    alternates: buildAlternates(locale, "/categories", [...LOCALES]),
  };
}

// 카테고리 상세 페이지 — 해당 카테고리에 글이 있는 로케일만 가리킨다
export async function buildCategoryMetadata(
  locale: Locale,
  category: string,
  isValid: boolean
): Promise<Metadata> {
  if (!isValid) return { title: getDictionary(locale).categories.title };

  return {
    title: category.toUpperCase(),
    alternates: buildAlternates(
      locale,
      `/categories/${category}`,
      await localesWithCategory(category)
    ),
  };
}

// 태그 상세 페이지 — 해당 태그가 달린 글이 있는 로케일만 가리킨다
// tag는 라우트 파라미터이므로 대표 표기로 해석한 뒤 사용한다
export async function buildTagMetadata(
  locale: Locale,
  tag: string
): Promise<Metadata> {
  const dict = getDictionary(locale);
  const tagName = (await resolveTag(locale, tag)) ?? decodeTagParam(tag);

  return {
    title: `#${tagName} | ${SITE_NAME}`,
    description: dict.tags.description(SITE_NAME, tagName),
    alternates: buildAlternates(
      locale,
      `/tags/${encodeURIComponent(tagName)}`,
      await localesWithTag(tag)
    ),
  };
}

// 포스트 상세 페이지
export async function buildPostMetadata(
  locale: Locale,
  slug: string
): Promise<Metadata> {
  try {
    const { frontMatter } = await getPostBySlug(locale, slug);
    const url = localeUrl(locale, `/posts/${slug}`);
    // 번역이 존재하는 로케일만 가리킨다 — 미번역 포스트에 hreflang을 달면
    // 404로 이어지고 양방향성이 깨져 주석 전체가 무시된다
    const availableLocales = await getAvailableLocales(slug);

    return {
      title: frontMatter.title,
      description: frontMatter.description,
      alternates: buildAlternates(locale, `/posts/${slug}`, availableLocales),
      openGraph: {
        type: "article",
        url,
        alternateLocale: availableLocales
          .filter((other) => other !== locale)
          .map((other) => OG_LOCALE[other]),
        title: frontMatter.title,
        description: frontMatter.description,
        publishedTime: frontMatter.createdAt,
        modifiedTime: frontMatter.updatedAt,
        siteName: SITE_NAME,
        locale: OG_LOCALE[locale],
        images: [OG_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: frontMatter.title,
        description: frontMatter.description,
        images: [OG_IMAGE.url],
      },
    };
  } catch {
    return { title: getDictionary(locale).post.notFound };
  }
}
