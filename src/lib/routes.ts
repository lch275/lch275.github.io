// 로케일별로 실제 생성되는 라우트 경로 목록
// 언어 스위처가 "대응 페이지가 존재하는지" 판정하는 데 쓰고,
// 사이트맵도 같은 목록을 기준으로 만들어 두 곳이 어긋나지 않게 한다.

import { getAllTags, listCategories, listPosts } from "@/lib/posts";
import { localePath, LOCALES, type Locale } from "@/lib/i18n";

// 해당 로케일에 포스트가 1개 이상 있는 카테고리만 반환
// 글이 없는 카테고리 페이지는 빈 페이지(thin content)가 되므로 생성 대상에서 제외한다
export async function listNonEmptyCategories(locale: Locale): Promise<string[]> {
  const categories = await listCategories(locale);
  return categories.filter(({ count }) => count > 0).map(({ category }) => category);
}

export async function listRoutePaths(locale: Locale): Promise<string[]> {
  const [posts, tags, categories] = await Promise.all([
    listPosts(locale),
    getAllTags(locale),
    listNonEmptyCategories(locale),
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
