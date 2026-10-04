import Link from "next/link";
import { listPosts } from "@/lib/posts";
import {
  formatDate,
  getDictionary,
  localePath,
  type Locale,
} from "@/lib/i18n";

interface Props {
  locale: Locale;
}

export default async function PostsView({ locale }: Props) {
  const dict = getDictionary(locale);
  const posts = await listPosts(locale);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
        {dict.posts.title}
      </h1>
      <p className="text-xs text-gray-500 dark:text-neutral-400 mb-8">
        {dict.common.totalPostCount(posts.length)}
      </p>

      <div className="divide-y divide-gray-100 dark:divide-neutral-800">
        {posts.map((post) => (
          <article key={post.slug} className="py-4">
            <Link
              href={localePath(locale, `/posts/${post.slug}`)}
              className="group block"
            >
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
                  {formatDate(post.frontMatter.createdAt, locale, "short")}
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
