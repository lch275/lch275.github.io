import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, listPostsByTag } from "../../posts/utils";
import { SITE_NAME } from "@/lib/config";

type PageProps = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag} | ${SITE_NAME}`,
    description: `${SITE_NAME}에서 #${tag} 태그가 달린 글 목록입니다.`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const posts = await listPostsByTag(tag);

  if (posts.length === 0) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
        <Link href="/" className="hover:text-gray-700 dark:hover:text-neutral-200">홈</Link>
        {" / "}
        <span>태그</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">#{tag}</h1>
      <p className="text-gray-500 dark:text-neutral-400 mb-8">{posts.length}개의 글</p>

      <div className="divide-y divide-gray-100 dark:divide-neutral-800">
        {posts.map((post) => (
          <article key={post.slug} className="py-5">
            <Link href={`/posts/${post.slug}`} className="group block">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.frontMatter.title}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-400 dark:text-neutral-500">
                <time dateTime={post.frontMatter.createdAt}>
                  {new Date(post.frontMatter.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span aria-hidden="true">·</span>
                <span>{post.frontMatter.category.toUpperCase()}</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
