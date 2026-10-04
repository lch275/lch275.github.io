// 로케일별 메타데이터 생성 — 루트 레이아웃과 각 라우트가 공유한다
// hreflang/canonical은 로케일 간 대칭이어야 하므로 생성 지점을 이 파일로 모은다.

import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/posts";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import {
  getDictionary,
  localeUrl,
  OG_LOCALE,
  type Locale,
} from "@/lib/i18n";

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
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
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

// 글 목록 페이지
export function buildPostsMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return {
    title: `${dict.posts.title} | ${SITE_NAME}`,
    description: dict.posts.description(SITE_NAME),
  };
}

// 카테고리 상세 페이지
export function buildCategoryMetadata(
  locale: Locale,
  category: string,
  isValid: boolean
): Metadata {
  if (!isValid) return { title: getDictionary(locale).categories.title };
  return { title: category.toUpperCase() };
}

// 태그 상세 페이지
export function buildTagMetadata(locale: Locale, tag: string): Metadata {
  const dict = getDictionary(locale);
  return {
    title: `#${tag} | ${SITE_NAME}`,
    description: dict.tags.description(SITE_NAME, tag),
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

    return {
      title: frontMatter.title,
      description: frontMatter.description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
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
