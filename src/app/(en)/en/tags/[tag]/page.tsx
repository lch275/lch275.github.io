import type { Metadata } from "next";
import TagView from "@/views/TagView";
import { getAllTags } from "@/lib/posts";
import { buildTagMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ tag: string }> };

// 영문 글에 실제로 달린 태그만 생성한다
export async function generateStaticParams() {
  const tags = await getAllTags("en");
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return buildTagMetadata("en", tag);
}

export default async function EnTagPage({ params }: PageProps) {
  const { tag } = await params;
  return <TagView locale="en" tag={tag} />;
}
