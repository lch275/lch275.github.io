import type { Metadata } from "next";
import TagView from "@/views/TagView";
import { getAllTags } from "@/lib/posts";
import { buildTagMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  const tags = await getAllTags("ko");
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return buildTagMetadata("ko", tag);
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  return <TagView locale="ko" tag={tag} />;
}
