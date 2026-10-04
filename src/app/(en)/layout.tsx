// 영어 루트 레이아웃 — /en 하위 경로에 서비스된다.
// (en) 그룹이 루트 레이아웃을, 그 안의 en 세그먼트가 URL 접두어를 담당한다.

import "../globals.css";
import BaseLayout from "@/views/BaseLayout";
import { buildRootMetadata } from "@/lib/seo";

export const metadata = buildRootMetadata("en");

export default function EnRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BaseLayout locale="en">{children}</BaseLayout>;
}
