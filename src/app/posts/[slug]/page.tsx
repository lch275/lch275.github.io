import type { Metadata } from "next";
import PostView from "@/views/PostView";
import { getPostSlugs } from "../utils";
import { buildPostMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPostSlugs("ko");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildPostMetadata("ko", slug);
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  return <PostView locale="ko" slug={slug} />;
}
