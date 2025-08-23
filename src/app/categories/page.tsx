// 카테고리 목록 페이지 컴포넌트
// 모든 카테고리와 각 카테고리의 포스트 개수를 표시

import Link from "next/link";
import { listCategories } from "../posts/utils";

// 서버 컴포넌트로 정의 - 빌드 타임에 카테고리 정보를 정적 생성
// async 함수로 카테고리 데이터를 서버에서 미리 로드
export default async function CategoriesPage() {
  // 카테고리 목록과 각 카테고리별 포스트 개수를 가져옴
  // utils에서 모든 포스트를 분석하여 카테고리별 통계 제공
  const categories = await listCategories();
  
  return (
    // 홈페이지와 동일한 레이아웃 패턴 - 일관된 사용자 경험 제공
    <main className="mx-auto max-w-3xl px-6 py-12">
      {/* 페이지 제목 - 명확한 페이지 목적 전달 */}
      <h1 className="text-5xl font-bold mb-6">카테고리</h1>
      
      {/* 반응형 그리드 레이아웃으로 카테고리 목록 표시
          - 기본: 2열, 작은 화면(sm) 이상: 3열
          - gap-4로 카테고리 간 적절한 간격 유지 */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map(({ category, count }) => (
          <li key={category}>
            {/* 각 카테고리를 클릭 가능한 링크로 표시
                - 카테고리명과 포스트 개수를 함께 표시하여 정보 제공
                - 동적 라우팅으로 /categories/[category] 페이지로 이동 */}
            <Link className="text-blue-600 hover:underline" href={`/categories/${category}`}>
              {category} ({count})
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}


