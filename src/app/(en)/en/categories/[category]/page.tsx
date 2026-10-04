import type { Metadata } from "next";
import CategoryView from "@/views/CategoryView";
import { isValidCategory } from "@/lib/posts";
import { listNonEmptyCategories } from "@/lib/routes";
import { buildCategoryMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ category: string }> };

// 영문 글이 있는 카테고리만 생성한다 — 글 0건인 카테고리 페이지는 빈 페이지가 된다
export async function generateStaticParams() {
  const categories = await listNonEmptyCategories("en");
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  return buildCategoryMetadata("en", category, isValidCategory(category));
}

export default async function EnCategoryPage({ params }: PageProps) {
  const { category } = await params;
  return <CategoryView locale="en" category={category} />;
}
