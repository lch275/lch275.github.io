import type { Metadata } from "next";
import PostView from "@/views/PostView";
import { getPostSlugs } from "@/lib/posts";
import { buildPostMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

// 번역된 포스트만 영문 라우트를 생성한다 (자동 번역 스텁을 만들지 않기 위함)
export async function generateStaticParams() {
  const slugs = await getPostSlugs("en");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildPostMetadata("en", slug);
}

export default async function EnPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <PostView locale="en" slug={slug} />;
}
