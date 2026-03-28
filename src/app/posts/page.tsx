import type { Metadata } from "next";
import Link from "next/link";
import { listPosts } from "./utils";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `글 목록 | ${SITE_NAME}`,
  description: `${SITE_NAME} 블로그의 모든 글 목록입니다.`,
};

export default async function PostsPage() {
  const posts = await listPosts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">글 목록</h1>
      <p className="text-xs text-gray-500 dark:text-neutral-400 mb-8">총 {posts.length}개의 글</p>

      <div className="divide-y divide-gray-100 dark:divide-neutral-800">
        {posts.map((post) => (
          <article key={post.slug} className="py-4">
            <Link href={`/posts/${post.slug}`} className="group block">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                {post.frontMatter.title}
              </h2>
              {post.frontMatter.description && (
                <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400 line-clamp-2">
                  {post.frontMatter.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400 dark:text-neutral-500">
                <time dateTime={post.frontMatter.createdAt}>
                  {new Date(post.frontMatter.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <span aria-hidden="true">·</span>
                <span className="uppercase">{post.frontMatter.category}</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
