// Next.js 앱의 루트 레이아웃 컴포넌트
// 모든 페이지에 공통으로 적용되는 HTML 구조와 스타일을 정의

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Geist Sans 폰트를 정의 - 일반 텍스트용 모던한 폰트
// CSS 변수로 등록하여 전역에서 사용 가능하도록 함
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"], // 라틴 문자만 로드하여 번들 크기 최적화
});

// Geist Mono 폰트를 정의 - 코드 블록용 고정폭 폰트
// 프로그래밍 관련 블로그이므로 코드 가독성을 위해 추가
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"], // 라틴 문자만 로드하여 번들 크기 최적화
});

// 전역 메타데이터 정의 - SEO와 브라우저 탭 제목을 위함
// 개인 IT 기술 학습 및 트러블슈팅 경험 공유 블로그임을 명시
export const metadata: Metadata = {
  title: "ARCHIEVE - 주니어 개발자 기술 블로그",
  description: "개인 IT 관련 기술 학습 및 트러블슈팅의 경험을 공유하는 개발자 블로그입니다. 프론트엔드, 백엔드, 인프라 등 다양한 기술 분야의 실무 경험과 문제 해결 과정을 기록합니다.",
};

// 루트 레이아웃 컴포넌트 - 모든 페이지의 공통 구조를 제공
// children prop을 통해 각 페이지의 내용을 렌더링
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="en" 속성으로 접근성과 SEO 향상
    <html lang="en">
      {/* 폰트 CSS 변수와 antialiased 클래스를 body에 적용
          - antialiased: 텍스트 렌더링 품질 향상
          - 두 폰트 변수를 동시에 적용하여 필요에 따라 선택적 사용 가능 */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
