import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_CATEGORIES, isValidCategory, listPostsByCategory } from "../../posts/utils";
import PostCard from "@/components/PostCard";

type PageProps = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return ALL_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isValidCategory(category)) return { title: "카테고리" };
  return { title: category.toUpperCase() };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!isValidCategory(category)) notFound();

  const posts = await listPostsByCategory(category);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav className="text-xs text-gray-500 dark:text-neutral-400 mb-4">
        <Link href="/" className="hover:text-gray-700 dark:hover:text-neutral-200">홈</Link>
        {" / "}
        <Link href="/categories" className="hover:text-gray-700 dark:hover:text-neutral-200">카테고리</Link>
        {" / "}
        <span className="text-gray-900 dark:text-white">{category.toUpperCase()}</span>
      </nav>

      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-8">
        {category.toUpperCase()}
      </h1>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-neutral-500">
          <p className="text-sm">아직 이 카테고리에 포스트가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
