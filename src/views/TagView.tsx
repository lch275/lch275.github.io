import Link from "next/link";
import { notFound } from "next/navigation";
import { listPostsByTag } from "@/lib/posts";
import {
  formatDate,
  getDictionary,
  localePath,
  type Locale,
} from "@/lib/i18n";

interface Props {
  locale: Locale;
  tag: string;
}

export default async function TagView({ locale, tag }: Props) {
  const dict = getDictionary(locale);
  const posts = await listPostsByTag(locale, tag);

  if (posts.length === 0) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
        <Link
          href={localePath(locale, "/")}
          className="hover:text-gray-700 dark:hover:text-neutral-200"
        >
          {dict.common.home}
        </Link>
        {" / "}
        <span>{dict.tags.label}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        #{tag}
      </h1>
      <p className="text-gray-500 dark:text-neutral-400 mb-8">
        {dict.common.postCount(posts.length)}
      </p>

      <div className="divide-y divide-gray-100 dark:divide-neutral-800">
        {posts.map((post) => (
          <article key={post.slug} className="py-5">
            <Link
              href={localePath(locale, `/posts/${post.slug}`)}
              className="group block"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.frontMatter.title}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-400 dark:text-neutral-500">
                <time dateTime={post.frontMatter.createdAt}>
                  {formatDate(post.frontMatter.createdAt, locale)}
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
