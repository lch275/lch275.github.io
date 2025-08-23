// 개별 포스트를 표시하는 동적 라우트 페이지
// MDX 콘텐츠를 렌더링하고 메타데이터를 동적으로 생성

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs } from "../utils";

// 페이지 props 타입 정의 - slug 파라미터를 받음
type PageProps = { params: Promise<{ slug: string }> };

// 정적 생성을 위한 파라미터 생성 함수
// 모든 MDX 포스트에 대해 빌드 타임에 정적 페이지 생성
export async function generateStaticParams() {
  // content 폴더의 모든 MDX 파일 slug를 가져옴
  const slugs = await getPostSlugs();
  // 각 slug에 대해 { slug } 객체 반환하여 정적 라우트 생성
  return slugs.map((slug) => ({ slug }));
}

// 동적 메타데이터 생성 함수 - 각 포스트의 frontmatter 기반
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    // 포스트의 frontmatter에서 메타데이터 추출
    const { frontMatter } = await getPostBySlug(slug);
    return {
      // 포스트 제목을 브라우저 탭 제목에 포함
      title: `${frontMatter.title} | MDX Blog`,
      // 포스트 설명을 메타 디스크립션으로 사용 (SEO 최적화)
      description: frontMatter.description,
    };
  } catch {
    // 포스트를 찾을 수 없는 경우 기본 메타데이터 반환
    return { title: "Post | MDX Blog" };
  }
}

// 포스트 상세 페이지 컴포넌트
export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  try {
    // slug를 기반으로 포스트 데이터와 렌더링된 MDX 콘텐츠 가져옴
    const post = await getPostBySlug(slug);
    const createdDate = new Date(post.frontMatter.createdAt);
    const updatedDate = new Date(post.frontMatter.updatedAt);
    const isUpdated = post.frontMatter.updatedAt !== post.frontMatter.createdAt;
    
    return (
      // Tailwind Typography 플러그인을 사용한 article 스타일링
      // prose 클래스로 타이포그래피 기본 스타일 적용
      // 다른 페이지들과 일관된 레이아웃으로 데스크톱에서 더 넓게
      <article className="prose prose-zinc dark:prose-invert mx-auto max-w-sm sm:max-w-2xl md:max-w-5xl lg:max-w-full xl:max-w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-12">
        {/* 포스트 제목 - h1 태그로 의미적 구조 제공 */}
        <h1>{post.frontMatter.title}</h1>
        
        {/* 포스트 작성일과 수정일 표시 - 메타 정보로 시각적 구분 */}
        <div className="text-xl text-gray-500 space-y-1 mb-8">
          <p>
            작성일: {`${createdDate.getFullYear()}년 ${createdDate.getMonth() + 1}월 ${createdDate.getDate()}일`}
          </p>
          {isUpdated && (
            <p>
              수정일: {`${updatedDate.getFullYear()}년 ${updatedDate.getMonth() + 1}월 ${updatedDate.getDate()}일`}
            </p>
          )}
        </div>
        
        {/* MDX로 컴파일된 콘텐츠 렌더링
            - mt-8로 제목과 본문 사이 여백 확보
            - post.content는 이미 JSX로 변환된 MDX 콘텐츠 */}
        <div className="mt-8">{post.content}</div>
      </article>
    );
  } catch {
    // 포스트를 찾을 수 없거나 파싱 오류 시 404 페이지로 이동
    notFound();
  }
}


