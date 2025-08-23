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

// 포스트 파일들이 저장된 디렉토리 경로
// process.cwd()를 사용하여 프로젝트 루트 기준으로 절대 경로 생성
const POSTS_DIR = path.join(process.cwd(), "src", "content");

// 모든 포스트 목록을 가져오는 메인 함수
// content 디렉토리의 MDX 파일들을 스캔하고 메타데이터를 파싱
export async function listPosts(): Promise<PostListItem[]> {
  // 콘텐츠 디렉토리의 모든 엔트리를 파일 타입 정보와 함께 읽기
  // withFileTypes: true로 파일/디렉토리 구분 가능
  const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });
  
  // MDX 파일만 필터링 - 파일이면서 .mdx 확장자를 가진 것만
  const mdxFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".mdx"));
  
  const posts: PostListItem[] = [];
  
  // 각 MDX 파일을 순회하며 메타데이터 추출
  for (const file of mdxFiles) {
    const full = path.join(POSTS_DIR, file.name);
    
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
    posts.push({ slug: file.name.replace(/\.mdx$/, ""), frontMatter: normalized });
  }
  
  // 생성일 기준 내림차순 정렬 (최신 포스트가 먼저)
  // getTime() 비교로 정확한 날짜 정렬 수행
  posts.sort((a, b) => (new Date(a.frontMatter.createdAt).getTime() < new Date(b.frontMatter.createdAt).getTime() ? 1 : -1));
  
  return posts;
}

// 모든 포스트의 slug 목록만 가져오는 함수
// generateStaticParams에서 정적 라우트 생성용으로 사용
export async function getPostSlugs(): Promise<string[]> {
  const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".mdx")) // MDX 파일만 필터링
    .map((e) => e.name.replace(/\.mdx$/, "")); // 확장자 제거하여 slug 생성
}

// 특정 slug에 해당하는 포스트의 전체 데이터를 가져오는 함수
// MDX 컴파일과 커스텀 컴포넌트 적용을 포함
export async function getPostBySlug(slug: string) {
  // slug를 이용해 파일 경로 생성
  const full = path.join(POSTS_DIR, `${slug}.mdx`);
  
  // 파일 내용 읽기
  const raw = await fs.readFile(full, "utf8");
  
  // frontmatter와 본문 분리
  const { content, data } = matter(raw);
  
  // MDX 컴파일 수행 - React Server Component 환경에서 실행
  const { content: compiled } = await compileMDX<{ frontMatter: PostFrontMatter }>({
    source: content, // MDX 본문 내용
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
  
  // 정규화된 메타데이터와 컴파일된 JSX 콘텐츠 반환
  return { frontMatter: normalized, content: compiled };
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
export async function listCategories(): Promise<{ category: Category; count: number }[]> {
  // 모든 포스트 목록 가져오기
  const posts = await listPosts();
  
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
export async function listPostsByCategory(category: Category): Promise<PostListItem[]> {
  // 전체 포스트 목록에서 해당 카테고리만 필터링
  // listPosts()에서 이미 날짜순 정렬이 되어 있으므로 추가 정렬 불필요
  const posts = await listPosts();
  return posts.filter((p) => p.frontMatter.category === category);
}

// 문자열이 유효한 Category 타입인지 검사하는 타입 가드 함수
// 동적 라우팅에서 URL 파라미터 검증용
export function isValidCategory(category: string): category is Category {
  // ALL_CATEGORIES 배열에 포함되어 있으면 유효한 카테고리
  return (ALL_CATEGORIES as string[]).includes(category);
}


