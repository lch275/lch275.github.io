import Link from "next/link";
import { listPosts } from "./posts/utils";
import PostCard from "@/components/PostCard";

export default async function Home() {
  const allPosts = await listPosts();
  const recentPosts = allPosts.slice(0, 12);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">최근 포스트</h2>
        <Link
          href="/posts"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors"
        >
          전체 보기 →
        </Link>
      </div>

      {recentPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-neutral-500">
          <p className="text-sm">아직 작성된 포스트가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
