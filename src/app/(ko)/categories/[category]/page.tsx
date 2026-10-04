import type { Metadata } from "next";
import CategoryView from "@/views/CategoryView";
import { isValidCategory } from "@/lib/posts";
import { listCategoryParams } from "@/lib/routes";
import { buildCategoryMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  const categories = await listCategoryParams("ko");
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  return buildCategoryMetadata("ko", category, isValidCategory(category));
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  return <CategoryView locale="ko" category={category} />;
}
