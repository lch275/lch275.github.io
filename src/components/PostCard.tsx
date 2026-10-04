import Link from "next/link";
import type { PostListItem } from "@/lib/posts";
import { formatDate, localePath, type Locale } from "@/lib/i18n";

interface Props {
  post: PostListItem;
  locale: Locale;
}

export default function PostCard({ post, locale }: Props) {
  return (
    <article className="group h-full">
      <Link
        href={localePath(locale, `/posts/${post.slug}`)}
        className="block h-full"
      >
        <div className="h-full flex flex-col border border-gray-200 dark:border-neutral-800 rounded-lg p-4 bg-white dark:bg-neutral-900 hover:border-gray-300 dark:hover:border-neutral-600 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-medium tracking-wider text-gray-400 dark:text-neutral-500 uppercase">
              {post.frontMatter.category}
            </span>
            <time
              className="text-[11px] text-gray-400 dark:text-neutral-500"
              dateTime={post.frontMatter.createdAt}
            >
              {formatDate(post.frontMatter.createdAt, locale, "short")}
            </time>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mb-2">
            {post.frontMatter.title}
          </h3>
          {post.frontMatter.description && (
            <p className="text-xs text-gray-500 dark:text-neutral-400 line-clamp-3 flex-1 leading-relaxed">
              {post.frontMatter.description}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
