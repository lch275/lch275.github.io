// 한국어 UI 문자열 — 기준 사전
// 이 객체의 타입이 Dictionary가 되므로, 다른 로케일 사전에서 키가 빠지면 컴파일 에러가 난다.
// (literal 타입이 고정되지 않도록 as const는 쓰지 않는다)

export const ko = {
  // 사이트 공통
  siteTagline: "개발자의 기록과 회고",
  siteDescription:
    "개인 IT 관련 기술 학습 및 트러블슈팅의 경험을 공유하는 개발자 블로그입니다. 프론트엔드, 백엔드, 인프라 등 다양한 기술 분야의 실무 경험과 문제 해결 과정을 기록합니다.",
  skipToContent: "본문으로 바로가기",

  // 내비게이션
  nav: {
    label: "주요 내비게이션",
    posts: "글 목록",
    categories: "카테고리",
    switchLanguage: "English로 보기",
  },

  // 공통 요소
  common: {
    home: "홈",
    tableOfContents: "목차",
    postCount: (count: number) => `${count}개의 글`,
    totalPostCount: (count: number) => `총 ${count}개의 글`,
  },

  // 홈
  home: {
    recentPosts: "최근 포스트",
    viewAll: "전체 보기 →",
    empty: "아직 작성된 포스트가 없습니다.",
  },

  // 글 목록
  posts: {
    title: "글 목록",
    description: (siteName: string) => `${siteName} 블로그의 모든 글 목록입니다.`,
  },

  // 포스트 상세
  post: {
    notFound: "포스트를 찾을 수 없습니다",
    updatedAt: "수정일",
    readingTime: (minutes: number) => `${minutes}분 읽기`,
  },

  // 카테고리
  categories: {
    title: "카테고리",
    empty: "아직 이 카테고리에 포스트가 없습니다.",
  },

  // 태그
  tags: {
    label: "태그",
    description: (siteName: string, tag: string) =>
      `${siteName}에서 #${tag} 태그가 달린 글 목록입니다.`,
  },

  // 쿠키 동의
  consent: {
    label: "쿠키 사용 동의",
    message:
      "이 사이트는 방문자 통계 분석을 위해 쿠키를 사용합니다. 동의하시면 Google Analytics를 통한 분석에 사용되며, 거부하셔도 서비스 이용에는 제한이 없습니다.",
    accept: "동의",
    decline: "거부",
  },
};

// 모든 로케일 사전이 만족해야 하는 형태
export type Dictionary = typeof ko;
