// 한국어 루트 레이아웃 — URL 접두어 없이 루트(/)에 서비스된다.
// 라우트 그룹 (ko)/(en)으로 루트 레이아웃을 분리해 <html lang>을 로케일별로 설정한다.

import "../globals.css";
import BaseLayout from "@/views/BaseLayout";
import { buildRootMetadata } from "@/lib/seo";

export const metadata = buildRootMetadata("ko");

export default function KoRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BaseLayout locale="ko">{children}</BaseLayout>;
}
