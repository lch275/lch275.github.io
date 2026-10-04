import type { Metadata } from "next";
import CategoryView from "@/views/CategoryView";
import { ALL_CATEGORIES, isValidCategory } from "@/lib/posts";
import { buildCategoryMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return ALL_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  return buildCategoryMetadata("ko", category, isValidCategory(category));
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  return <CategoryView locale="ko" category={category} />;
}
