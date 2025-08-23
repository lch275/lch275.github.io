// 특정 카테고리의 포스트 목록을 보여주는 동적 라우트 페이지
// Next.js의 [category] 폴더 구조를 통한 동적 라우팅 구현

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_CATEGORIES, isValidCategory, listPostsByCategory } from "../../posts/utils";

// 페이지 props 타입 정의 - Next.js 13+ App Router의 params는 Promise 타입
type PageProps = { params: Promise<{ category: string }> };

// 정적 생성을 위한 파라미터 생성 함수
// 빌드 타임에 모든 유효한 카테고리에 대한 페이지를 미리 생성
export function generateStaticParams() {
  // ALL_CATEGORIES 배열의 모든 카테고리에 대해 { category } 객체 반환
  return ALL_CATEGORIES.map((category) => ({ category }));
}

// 동적 메타데이터 생성 함수 - SEO 최적화를 위한 페이지별 메타데이터
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  // 유효하지 않은 카테고리인 경우 기본 메타데이터 반환
  if (!isValidCategory(category)) return { title: "Categories | ARCHIEVE" };
  // 유효한 카테고리인 경우 카테고리명을 포함한 제목 생성
  return { title: `${category.toUpperCase()} | ARCHIEVE` };
}

// 카테고리별 포스트 목록 페이지 컴포넌트
export default async function CategoryPage({ params }: PageProps) {
  // URL 파라미터에서 카테고리명 추출
  const { category } = await params;
  
  // 유효하지 않은 카테고리인 경우 404 페이지로 리다이렉트
  // 사용자가 잘못된 URL로 접근하는 것을 방지
  if (!isValidCategory(category)) notFound();
  
  // 해당 카테고리의 포스트 목록을 가져옴
  const posts = await listPostsByCategory(category);
  
  return (
    // 홈페이지와 동일한 반응형 레이아웃 적용
    <main className="mx-auto max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 헤더 영역 - 홈페이지와 동일한 스타일 */}
      <div className="flex items-center justify-center mb-6 sm:mb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">{category.toUpperCase()}</h1>
      </div>
      
      {/* 포스트 목록 영역 */}
      <div className="mb-8">
        {/* 조건부 렌더링 - 포스트 존재 여부에 따라 다른 UI 표시 */}
        {posts.length === 0 ? (
          // 포스트가 없는 경우 안내 메시지 - 홈페이지 스타일과 동일
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📝</div>
            <p className="text-2xl sm:text-3xl">아직 이 카테고리에 포스트가 없습니다.</p>
            <p className="text-xl mt-2">첫 번째 포스트를 작성해보세요!</p>
          </div>
        ) : (
          // 포스트가 있는 경우 홈페이지와 동일한 카드 형태로 표시
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {posts.map((post) => (
              // 각 포스트를 카드 형식으로 표시 - 홈페이지와 동일한 구조
              <article key={post.slug} className="group">
                <Link href={`/posts/${post.slug}`} className="block">
                  {/* 카드 컨테이너 - 반응형 호버 효과와 그림자 */}
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 h-full">
                    
                    {/* 썸네일 영역 - 카테고리별 색상으로 구분, 반응형 크기 */}
                    <div className={`aspect-video flex items-center justify-center ${
                      post.frontMatter.category === 'frontend' ? 'bg-gradient-to-br from-blue-100 to-cyan-100' :
                      post.frontMatter.category === 'backend' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                      post.frontMatter.category === 'infra' ? 'bg-gradient-to-br from-purple-100 to-pink-100' :
                      'bg-gradient-to-br from-orange-100 to-yellow-100'
                    }`}>
                      <div className="text-5xl sm:text-6xl text-gray-400">
                        {post.frontMatter.category === 'frontend' ? '🎨' :
                         post.frontMatter.category === 'backend' ? '⚙️' :
                         post.frontMatter.category === 'infra' ? '🏗️' : '📝'}
                      </div>
                    </div>
                    
                    {/* 카드 콘텐츠 영역 - 반응형 패딩 */}
                    <div className="p-3 sm:p-4 flex flex-col h-[calc(100%-theme(spacing.32))]">
                      {/* 포스트 제목 - 반응형 텍스트 크기, 2줄까지만 표시 */}
                      <h3 className="font-semibold text-2xl sm:text-3xl text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 flex-grow-0">
                        {post.frontMatter.title}
                      </h3>
                      
                      {/* 포스트 요약 - 반응형 텍스트, 2줄까지만 표시 */}
                      <p className="text-gray-600 text-lg sm:text-xl line-clamp-2 mb-3 h-16 overflow-hidden">
                        {post.frontMatter.description || "이 포스트에 대한 간단한 설명을 확인해보세요."}
                      </p>
                      
                      {/* 하단 메타 정보 영역 - 반응형 레이아웃 */}
                      <div className="flex items-center justify-between text-lg text-gray-500 mt-auto">
                        {/* 작성일 - 모바일에서는 더 간단한 형식 */}
                        <time dateTime={post.frontMatter.createdAt} className="truncate mr-2">
                          <span className="hidden sm:inline">
                            {new Date(post.frontMatter.createdAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="sm:hidden">
                            {new Date(post.frontMatter.createdAt).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </time>
                        
                        {/* 카테고리 태그 - 반응형 크기, 카테고리별 색상 적용 */}
                        <span className={`px-1.5 sm:px-2 py-1 rounded-full text-lg font-medium flex-shrink-0 ${
                          post.frontMatter.category === 'frontend' ? 'bg-blue-100 text-blue-700' :
                          post.frontMatter.category === 'backend' ? 'bg-green-100 text-green-700' :
                          post.frontMatter.category === 'infra' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          <span className="hidden sm:inline">{post.frontMatter.category.toUpperCase()}</span>
                          <span className="sm:hidden">{post.frontMatter.category.charAt(0).toUpperCase()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


