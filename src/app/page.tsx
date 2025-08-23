// 블로그 홈페이지 컴포넌트
// 최신 10개의 포스트를 카드 형식으로 표시하는 메인 페이지

import Link from "next/link";
import { listPosts } from "./posts/utils";

// 서버 컴포넌트로 정의 - 빌드 타임에 포스트 목록을 가져와 정적 생성
// async 함수로 정의하여 포스트 데이터를 서버에서 미리 로드
export default async function Home() {
  // 모든 포스트 목록을 가져옴 - utils에서 MDX 파일들을 파싱한 결과
  const allPosts = await listPosts();
  
  // 최신 10개 포스트만 선택 - 이미 날짜순으로 정렬되어 있으므로 slice만 사용
  // 홈페이지 로딩 성능 향상과 사용자 집중도를 위해 개수 제한
  const recentPosts = allPosts.slice(0, 10);
  
  // 카테고리 네비게이션을 위한 카테고리 순서 정의
  const categoryOrder = ["frontend", "backend", "infra", "etc"] as const;
  
  return (
    // 반응형 레이아웃 - 기기별 최적화된 너비와 패딩 적용
    // 모바일: 전체 너비, 태블릿: 최대 5xl, 데스크톱: 최대 7xl
    <main className="mx-auto max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 헤더 영역 - 반응형 제목 크기 적용 */}
      <div className="flex items-center justify-center mb-6 sm:mb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">ARCHIEVE</h1>
      </div>
      
      {/* 카테고리 네비게이션 - 반응형 레이아웃과 스크롤 적용 */}
      <div className="mb-6 sm:mb-8">
        {/* 모바일에서는 가로 스크롤, 태블릿 이상에서는 중앙 정렬 */}
        <div className="flex justify-start sm:justify-start overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
          <div className="flex space-x-4 sm:space-x-6 min-w-max sm:min-w-0">
            {categoryOrder.map((cat) => (
              <Link 
                key={cat} 
                className="text-blue-600 hover:text-blue-800 hover:underline text-xl sm:text-2xl font-medium whitespace-nowrap transition-colors" 
                href={`/categories/${cat}`}
              >
                {cat.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* 최신 포스트 목록 영역 - 카드 형식의 리스트 아이템으로 표시 */}
      <div className="mb-8">
        {/* 섹션 제목 - 반응형 텍스트 크기 */}
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">최근 포스트</h2>
        
        {/* 포스트가 없는 경우와 있는 경우 분기 처리 */}
        {recentPosts.length === 0 ? (
          // 포스트가 없는 경우 안내 메시지 - 반응형 크기 적용
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📝</div>
            <p className="text-2xl sm:text-3xl">아직 작성된 포스트가 없습니다.</p>
            <p className="text-xl mt-2">첫 번째 포스트를 작성해보세요!</p>
          </div>
        ) : (
          // 반응형 그리드로 포스트 카드들 배치
          // 모바일: 1열, 태블릿: 2열, 데스크톱: 3열, 대형 화면: 4열
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {recentPosts.map((post) => (
              // 각 포스트를 카드 형식으로 표시
              <article key={post.slug} className="group">
                <Link href={`/posts/${post.slug}`} className="block">
                  {/* 카드 컨테이너 - 반응형 호버 효과와 그림자, 반응형 높이 (최소 250px) */}
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 h-[250px] sm:h-[280px] md:h-[300px] lg:h-[320px] xl:h-[350px] flex flex-col">
                    
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
                    
                    {/* 카드 콘텐츠 영역 - 반응형 패딩, flex-1로 남은 공간 차지 */}
                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      {/* 포스트 제목 - 반응형 텍스트 크기, 2줄까지만 표시 */}
                      <h3 className="font-semibold text-2xl sm:text-3xl text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 flex-grow-0">
                        {post.frontMatter.title}
                      </h3>
                      
                      {/* 포스트 요약 - 반응형 텍스트, flex-1로 공간 확보 */}
                      <p className="text-gray-600 text-lg sm:text-xl mb-3 flex-1">
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
