import "./globals.css";
import BaseLayout from "@/views/BaseLayout";
import { buildRootMetadata } from "@/lib/seo";

export const metadata = buildRootMetadata("ko");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BaseLayout locale="ko">{children}</BaseLayout>;
}
