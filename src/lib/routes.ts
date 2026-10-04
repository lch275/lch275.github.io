// 라우트 존재 여부의 단일 진실 공급원
//
// generateStaticParams(어떤 페이지를 만들지)와 hreflang(어떤 로케일을 가리킬지)이
// 어긋나면 존재하지 않는 URL을 가리키게 되고, Google은 양방향성이 깨진 hreflang
// 주석을 무시한다. 그래서 두 용도가 모두 이 파일의 함수를 사용한다.

import {
  ALL_CATEGORIES,
  getAllTags,
  isValidCategory,
  listCategories,
  listPostsByCategory,
  listPosts,
} from "@/lib/posts";
import { DEFAULT_LOCALE, localePath, LOCALES, type Locale } from "@/lib/i18n";

// 해당 로케일에 포스트가 1개 이상 있는 카테고리
async function listNonEmptyCategories(locale: Locale): Promise<string[]> {
  const categories = await listCategories(locale);
  return categories
    .filter(({ count }) => count > 0)
    .map(({ category }) => category);
}

// 카테고리 페이지를 생성할 목록
// 기본 로케일은 글이 없는 카테고리도 생성한다 — 이미 공개된 URL이고
// /categories/ 목록 페이지에서 링크되고 있어, 제거하면 404가 되기 때문이다.
// 추가 로케일은 글이 있는 것만 생성한다 (빈 페이지는 thin content).
export async function listCategoryParams(locale: Locale): Promise<string[]> {
  if (locale === DEFAULT_LOCALE) return [...ALL_CATEGORIES];
  return listNonEmptyCategories(locale);
}

// 특정 카테고리 페이지가 존재하는 로케일 목록
export async function localesWithCategory(category: string): Promise<Locale[]> {
  if (!isValidCategory(category)) return [];

  const flags = await Promise.all(
    LOCALES.map(async (locale) => {
      if (locale === DEFAULT_LOCALE) return true;
      const posts = await listPostsByCategory(locale, category);
      return posts.length > 0;
    })
  );
  return LOCALES.filter((_, index) => flags[index]);
}

// 특정 태그 페이지가 존재하는 로케일 목록
export async function localesWithTag(tag: string): Promise<Locale[]> {
  const flags = await Promise.all(
    LOCALES.map(async (locale) => (await getAllTags(locale)).includes(tag))
  );
  return LOCALES.filter((_, index) => flags[index]);
}

// 로케일별로 실제 생성되는 라우트 경로 목록
// 언어 스위처가 "대응 페이지가 존재하는지" 판정하는 데 사용한다
export async function listRoutePaths(locale: Locale): Promise<string[]> {
  const [posts, tags, categories] = await Promise.all([
    listPosts(locale),
    getAllTags(locale),
    listCategoryParams(locale),
  ]);

  return [
    localePath(locale, "/"),
    localePath(locale, "/posts"),
    localePath(locale, "/categories"),
    ...categories.map((category) => localePath(locale, `/categories/${category}`)),
    ...posts.map((post) => localePath(locale, `/posts/${post.slug}`)),
    // 태그는 공백·대문자를 포함할 수 있어 URL 인코딩된 형태로 생성된다
    ...tags.map((tag) => localePath(locale, `/tags/${encodeURIComponent(tag)}`)),
  ];
}

// 모든 로케일의 경로를 합친 목록
export async function listAllRoutePaths(): Promise<string[]> {
  const perLocale = await Promise.all(LOCALES.map(listRoutePaths));
  return perLocale.flat();
}
