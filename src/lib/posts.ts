// MDX 블로그 포스트 처리를 위한 유틸리티 함수들
// 파일 시스템 기반 MDX 콘텐츠 관리와 메타데이터 파싱 담당

import fs from "node:fs/promises"; // 비동기 파일 시스템 API 사용
import path from "node:path"; // 파일 경로 조작을 위한 Node.js 내장 모듈
import matter from "gray-matter"; // MDX 파일의 frontmatter 파싱용 라이브러리
import { compileMDX } from "next-mdx-remote/rsc"; // React Server Component에서 MDX 컴파일
import React from "react";
import CodeBlock from "@/components/CodeBlock"; // 커스텀 코드 블록 컴포넌트
import rehypeSlug from "rehype-slug"; // HTML 헤딩에 id 속성 자동 추가
import rehypeAutolinkHeadings from "rehype-autolink-headings"; // 헤딩에 앵커 링크 자동 생성
import remarkGfm from "remark-gfm"; // GitHub Flavored Markdown 지원
import GithubSlugger from "github-slugger"; // rehype-slug와 동일한 ID 생성을 위해 사용
import { LOCALES, type Locale } from "@/lib/i18n"; // 로케일 정의

// 블로그 카테고리 타입 정의 - 개발 분야별로 구분
// 확장 가능하도록 union type으로 정의하되, 명확한 분류 체계 유지
export type Category = "frontend" | "backend" | "infra" | "etc";

// 모든 유효한 카테고리 목록 - 정적 생성과 유효성 검사에 사용
// 순서는 UI에서의 표시 순서를 반영 (기술 스택 순서)
export const ALL_CATEGORIES: Category[] = ["frontend", "backend", "infra", "etc"];

// MDX 파일의 frontmatter 타입 정의
// 블로그 포스트의 메타데이터 구조를 명확히 정의
export type PostFrontMatter = {
  title: string; // 포스트 제목 (필수)
  createdAt: string; // 생성일 (ISO 형식으로 정규화됨)
  updatedAt: string; // 수정일 (ISO 형식으로 정규화됨)
  category: Category; // 카테고리 (필수, 유효한 값으로 제한)
  description?: string; // 포스트 설명 (선택적, SEO용)
  tags?: string[]; // 태그 배열 (선택적, 향후 태그 기능용)
};

// 포스트 목록 아이템 타입 - 목록 표시용 간소화된 데이터
export type PostListItem = {
  slug: string; // URL slug (파일명에서 확장자 제거)
  frontMatter: PostFrontMatter; // 메타데이터
};

export type Heading = {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
};

// 로케일별 포스트 디렉토리 경로
// process.cwd()를 사용하여 프로젝트 루트 기준으로 절대 경로 생성
function postsDir(locale: Locale): string {
  return path.join(process.cwd(), "src", "content", locale);
}

// 로케일 디렉토리의 MDX 파일명 목록을 반환
// 번역이 아직 없는 로케일은 디렉토리가 비어 있을 수 있으므로 ENOENT를 빈 배열로 처리
async function readMdxFileNames(locale: Locale): Promise<string[]> {
  try {
    const entries = await fs.readdir(postsDir(locale), { withFileTypes: true });
    // MDX 파일만 필터링 - 파일이면서 .mdx 확장자를 가진 것만
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
      .map((e) => e.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

// 특정 로케일의 모든 포스트 목록을 가져오는 메인 함수
// 해당 로케일 디렉토리의 MDX 파일들을 스캔하고 메타데이터를 파싱
export async function listPosts(locale: Locale): Promise<PostListItem[]> {
  const mdxFiles = await readMdxFileNames(locale);

  const posts: PostListItem[] = [];

  // 각 MDX 파일을 순회하며 메타데이터 추출
  for (const fileName of mdxFiles) {
    const full = path.join(postsDir(locale), fileName);
    
    // 파일 내용을 UTF-8로 읽기
    const raw = await fs.readFile(full, "utf8");
    
    // gray-matter로 frontmatter와 본문 분리 (data가 frontmatter)
    const { data } = matter(raw);
    
    // frontmatter 데이터의 타입 안정성을 위한 타입 단언
    // unknown으로 먼저 받아서 런타임 검증 후 사용
    const fm = data as Partial<PostFrontMatter> & { 
      date?: unknown; 
      createdAt?: unknown; 
      updatedAt?: unknown; 
      category?: unknown; 
    };
    
    // frontmatter 데이터를 안전하게 정규화
    const normalized: PostFrontMatter = {
      // 제목이 없으면 "Untitled"로 기본값 설정
      title: String(fm.title ?? "Untitled"),
      // 생성일을 ISO 형식으로 정규화 - createdAt 우선, 없으면 date fallback
      createdAt: normalizeDateToISO(fm.createdAt ?? fm.date),
      // 수정일을 ISO 형식으로 정규화 - updatedAt 우선, 없으면 createdAt과 동일
      updatedAt: normalizeDateToISO(fm.updatedAt ?? fm.createdAt ?? fm.date),
      // 카테고리를 유효한 값으로 정규화 (잘못된 값은 "etc"로)
      category: normalizeCategory(fm.category),
      // 설명이 있으면 문자열로 변환, 없으면 undefined
      description: fm.description ? String(fm.description) : undefined,
      // 태그가 배열이면 각 요소를 문자열로 변환, 아니면 undefined
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : undefined,
    };
    
    // 파일명에서 확장자를 제거하여 slug 생성
    posts.push({ slug: fileName.replace(/\.mdx$/, ""), frontMatter: normalized });
  }
  
  // 생성일 기준 내림차순 정렬 (최신 포스트가 먼저)
  // getTime() 비교로 정확한 날짜 정렬 수행
  posts.sort((a, b) => (new Date(a.frontMatter.createdAt).getTime() < new Date(b.frontMatter.createdAt).getTime() ? 1 : -1));
  
  return posts;
}

// 특정 로케일의 모든 포스트 slug 목록만 가져오는 함수
// generateStaticParams에서 정적 라우트 생성용으로 사용
export async function getPostSlugs(locale: Locale): Promise<string[]> {
  const mdxFiles = await readMdxFileNames(locale);
  return mdxFiles.map((name) => name.replace(/\.mdx$/, "")); // 확장자 제거하여 slug 생성
}

// 특정 slug의 포스트가 해당 로케일에 존재하는지 확인
async function hasPost(locale: Locale, slug: string): Promise<boolean> {
  try {
    await fs.access(path.join(postsDir(locale), `${slug}.mdx`));
    return true;
  } catch {
    return false;
  }
}

// 특정 slug가 번역되어 있는 로케일 목록을 반환
// hreflang 주석은 양방향이어야 하므로, ko/en 양쪽 페이지가 모두 이 함수를 사용해
// 동일한 목록을 기준으로 alternates를 생성한다 (대칭성을 구조적으로 보장)
export async function getAvailableLocales(slug: string): Promise<Locale[]> {
  const flags = await Promise.all(LOCALES.map((locale) => hasPost(locale, slug)));
  return LOCALES.filter((_, index) => flags[index]);
}

// 특정 slug에 해당하는 포스트의 전체 데이터를 가져오는 함수
// MDX 컴파일과 커스텀 컴포넌트 적용을 포함
export async function getPostBySlug(locale: Locale, slug: string) {
  // slug를 이용해 파일 경로 생성
  const full = path.join(postsDir(locale), `${slug}.mdx`);
  
  // 파일 내용 읽기
  const raw = await fs.readFile(full, "utf8");
  
  const { content, data } = matter(raw);

  const { content: compiled } = await compileMDX<{ frontMatter: PostFrontMatter }>({
    source: content,
    options: {
      mdxOptions: {
        // Remark 플러그인들 (Markdown → MDX 변환 단계)
        remarkPlugins: [
          remarkGfm, // GitHub Flavored Markdown 지원 (테이블, 체크박스 등)
        ],
        // Rehype 플러그인들 (HTML 변환 후 처리 단계)
        rehypePlugins: [
          rehypeSlug, // 헤딩에 자동으로 id 속성 추가 (앵커 링크용)
          [rehypeAutolinkHeadings, { behavior: "append" }], // 헤딩에 링크 아이콘 추가
        ],
      },
    },
    // 커스텀 컴포넌트 매핑 - MDX의 기본 HTML 요소를 React 컴포넌트로 대체
    components: {
      // <pre> 태그를 커스텀 CodeBlock 컴포넌트로 대체
      // 복사 기능이 있는 코드 블록으로 향상
      pre: (props: React.ComponentProps<typeof CodeBlock>) =>
        React.createElement(CodeBlock, props),
    },
  });
  
  // frontmatter 정규화 (listPosts와 동일한 로직)
  const fm = data as Partial<PostFrontMatter> & { 
    date?: unknown; 
    createdAt?: unknown; 
    updatedAt?: unknown; 
    category?: unknown; 
  };
  const normalized: PostFrontMatter = {
    // 제목이 없으면 slug를 제목으로 사용 (파일명 기반)
    title: String(fm.title ?? slug),
    // 생성일을 ISO 형식으로 정규화 - createdAt 우선, 없으면 date fallback
    createdAt: normalizeDateToISO(fm.createdAt ?? fm.date),
    // 수정일을 ISO 형식으로 정규화 - updatedAt 우선, 없으면 createdAt과 동일
    updatedAt: normalizeDateToISO(fm.updatedAt ?? fm.createdAt ?? fm.date),
    category: normalizeCategory(fm.category),
    description: fm.description ? String(fm.description) : undefined,
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : undefined,
  };
  
  return { frontMatter: normalized, content: compiled, rawContent: content };
}

// 원시 마크다운에서 헤딩을 추출 — rehype-slug와 동일한 ID 생성 규칙 적용
export function extractHeadings(rawContent: string): Heading[] {
  const contentWithoutCodeBlocks = rawContent.replace(/^```[\s\S]*?^```/gm, "");

  const slugger = new GithubSlugger();
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Heading[] = [];

  let match;
  while ((match = headingRegex.exec(contentWithoutCodeBlocks)) !== null) {
    const level = match[1].length as 1 | 2 | 3 | 4 | 5 | 6;
    const text = match[2].replace(/`[^`]+`/g, (m) => m.slice(1, -1)).trim();
    const id = slugger.slug(text);

    headings.push({ id, text, level });
  }

  return headings;
}

// 라우트 파라미터는 URL 인코딩된 형태로 전달된다.
// 예: frontmatter의 "Script Loading"은 params.tag에 "Script%20Loading"으로 들어온다.
// 디코딩하지 않고 비교하면 매칭에 실패해 태그 페이지가 404 내용으로 생성된다.
export function decodeTagParam(param: string): string {
  try {
    return decodeURIComponent(param);
  } catch {
    // 잘못된 인코딩이면 원본을 그대로 쓴다
    return param;
  }
}

// 태그 비교용 키 — 표기(대소문자)가 섞여 있어도 같은 태그로 취급한다.
// 이렇게 하지 않으면 "java"와 "Java"가 서로 다른 URL로 갈라져 중복 페이지가 된다.
function tagKey(tag: string): string {
  return decodeTagParam(tag).trim().toLowerCase();
}

// 태그 키별 대표 표기를 결정한다.
//
// 대표 표기는 반드시 전 로케일의 표기를 합쳐서 정해야 한다. 로케일별로 따로 정하면
// 같은 태그가 ko에서 /tags/Java/, en에서 /en/tags/java/ 처럼 다른 경로가 되어
// hreflang 양방향성이 깨진다.
//
// 표기가 여러 개면 가장 많이 쓰인 표기를 쓰고, 동수면 사전순으로 정해 결정적으로 만든다.
async function resolveTagSpellings(): Promise<Map<string, string>> {
  const counts = new Map<string, Map<string, number>>();

  for (const locale of LOCALES) {
    const posts = await listPosts(locale);
    for (const post of posts) {
      for (const tag of post.frontMatter.tags ?? []) {
        const key = tagKey(tag);
        const spellings = counts.get(key) ?? new Map<string, number>();
        spellings.set(tag, (spellings.get(tag) ?? 0) + 1);
        counts.set(key, spellings);
      }
    }
  }

  const canonical = new Map<string, string>();
  for (const [key, spellings] of counts) {
    const [best] = Array.from(spellings.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    );
    canonical.set(key, best[0]);
  }
  return canonical;
}

// 해당 로케일에 존재하는 태그 목록 (대표 표기, 사전순)
export async function getAllTags(locale: Locale): Promise<string[]> {
  const [posts, canonical] = await Promise.all([
    listPosts(locale),
    resolveTagSpellings(),
  ]);

  const keys = new Set<string>();
  for (const post of posts) {
    for (const tag of post.frontMatter.tags ?? []) keys.add(tagKey(tag));
  }

  return Array.from(keys)
    .map((key) => canonical.get(key) ?? key)
    .sort();
}

// 포스트의 원시 태그 표기를 대표 표기로 변환한다.
// 원시 표기로 링크하면 대표 표기와 다를 때 생성되지 않은 URL을 가리켜 404가 된다.
export async function canonicalizeTags(tags: string[]): Promise<string[]> {
  const canonical = await resolveTagSpellings();
  return tags.map((tag) => canonical.get(tagKey(tag)) ?? tag);
}

// 라우트 파라미터를 해당 로케일의 대표 태그 표기로 해석한다.
// 그 로케일에 해당 태그가 없으면 null을 반환한다.
export async function resolveTag(
  locale: Locale,
  param: string
): Promise<string | null> {
  const key = tagKey(param);
  const tags = await getAllTags(locale);
  return tags.find((tag) => tagKey(tag) === key) ?? null;
}

export async function listPostsByTag(
  locale: Locale,
  tag: string
): Promise<PostListItem[]> {
  const key = tagKey(tag);
  const posts = await listPosts(locale);
  return posts.filter(
    (post) => post.frontMatter.tags?.some((t) => tagKey(t) === key) ?? false
  );
}

// 날짜 값을 안전하게 ISO 형식으로 정규화하는 헬퍼 함수
// frontmatter의 date 필드는 다양한 형식일 수 있으므로 통일된 처리 필요
function normalizeDateToISO(value: unknown): string {
  // 값이 없으면 Unix epoch (1970-01-01)를 기본값으로 사용
  if (!value) return new Date(0).toISOString();
  
  // 이미 Date 객체인 경우 바로 ISO 문자열로 변환
  if (value instanceof Date) return value.toISOString();
  
  // 문자열로 변환 후 Date 파싱 시도
  const asString = String(value);
  const dt = new Date(asString);
  
  // 유효한 날짜로 파싱되었으면 ISO 형식 반환
  if (!Number.isNaN(dt.getTime())) return dt.toISOString();
  
  // 파싱 실패 시 원본 문자열 반환 (fallback)
  return asString;
}

// 카테고리 값을 유효한 Category 타입으로 정규화하는 헬퍼 함수
// 잘못된 카테고리는 "etc"로 기본 처리하여 타입 안정성 보장
function normalizeCategory(value: unknown): Category {
  // 값이 없으면 기타 카테고리로 분류
  if (!value) return "etc";
  
  // 소문자로 변환하고 공백 제거하여 일관성 있는 비교
  const asString = String(value).toLowerCase().trim();
  
  // 유효한 카테고리 목록에 포함되어 있으면 해당 카테고리 반환
  // 타입 단언을 통해 Category 타입으로 캐스팅
  return (ALL_CATEGORIES as string[]).includes(asString) ? (asString as Category) : "etc";
}

// 모든 카테고리와 각 카테고리별 포스트 개수를 반환하는 함수
// 카테고리 목록 페이지에서 사용
export async function listCategories(
  locale: Locale
): Promise<{ category: Category; count: number }[]> {
  // 모든 포스트 목록 가져오기
  const posts = await listPosts(locale);
  
  // 카테고리별 포스트 개수를 저장할 Map 생성
  const counts = new Map<Category, number>();
  
  // 모든 카테고리를 0으로 초기화 (포스트가 없는 카테고리도 표시하기 위함)
  for (const c of ALL_CATEGORIES) counts.set(c, 0);
  
  // 각 포스트의 카테고리별로 개수 증가
  for (const p of posts) counts.set(p.frontMatter.category, (counts.get(p.frontMatter.category) ?? 0) + 1);
  
  // ALL_CATEGORIES 순서대로 카테고리와 개수 객체 배열 반환
  return ALL_CATEGORIES.map((c) => ({ category: c, count: counts.get(c) ?? 0 }));
}

// 특정 카테고리의 포스트 목록만 필터링하여 반환하는 함수
// 카테고리별 페이지에서 사용
export async function listPostsByCategory(
  locale: Locale,
  category: Category
): Promise<PostListItem[]> {
  // 전체 포스트 목록에서 해당 카테고리만 필터링
  // listPosts()에서 이미 날짜순 정렬이 되어 있으므로 추가 정렬 불필요
  const posts = await listPosts(locale);
  return posts.filter((p) => p.frontMatter.category === category);
}

// 문자열이 유효한 Category 타입인지 검사하는 타입 가드 함수
// 동적 라우팅에서 URL 파라미터 검증용
export function isValidCategory(category: string): category is Category {
  // ALL_CATEGORIES 배열에 포함되어 있으면 유효한 카테고리
  return (ALL_CATEGORIES as string[]).includes(category);
}


