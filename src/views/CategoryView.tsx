import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidCategory, listPostsByCategory } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

interface Props {
  locale: Locale;
  category: string;
}

export default async function CategoryView({ locale, category }: Props) {
  if (!isValidCategory(category)) notFound();

  const dict = getDictionary(locale);
  const posts = await listPostsByCategory(locale, category);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav className="text-xs text-gray-500 dark:text-neutral-400 mb-4">
        <Link
          href={localePath(locale, "/")}
          className="hover:text-gray-700 dark:hover:text-neutral-200"
        >
          {dict.common.home}
        </Link>
        {" / "}
        <Link
          href={localePath(locale, "/categories")}
          className="hover:text-gray-700 dark:hover:text-neutral-200"
        >
          {dict.categories.title}
        </Link>
        {" / "}
        <span className="text-gray-900 dark:text-white">
          {category.toUpperCase()}
        </span>
      </nav>

      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-8">
        {category.toUpperCase()}
      </h1>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-neutral-500">
          <p className="text-sm">{dict.categories.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
