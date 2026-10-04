import Link from "next/link";
import { notFound } from "next/navigation";
import { canonicalizeTags, getPostBySlug, extractHeadings } from "@/lib/posts";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import {
  formatDate,
  getDictionary,
  HTML_LANG,
  localePath,
  localeUrl,
  type Locale,
} from "@/lib/i18n";
import GiscusArea from "@/components/GiscusArea";
import TableOfContents from "@/components/TableOfContents";

interface Props {
  locale: Locale;
  slug: string;
}

export default async function PostView({ locale, slug }: Props) {
  try {
    const post = await getPostBySlug(locale, slug);
    const dict = getDictionary(locale);
    const headings = extractHeadings(post.rawContent);
    // 태그 링크는 대표 표기를 써야 실제 생성된 태그 페이지를 가리킨다
    const tags = await canonicalizeTags(post.frontMatter.tags ?? []);

    const isUpdated = post.frontMatter.updatedAt !== post.frontMatter.createdAt;

    const wordCount = post.rawContent.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const blogPostingJsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.frontMatter.title,
      description: post.frontMatter.description,
      datePublished: post.frontMatter.createdAt,
      dateModified: post.frontMatter.updatedAt,
      url: localeUrl(locale, `/posts/${slug}`),
      inLanguage: HTML_LANG[locale],
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex gap-12">
            {/* 포스트 본문 */}
            <div className="min-w-0 max-w-[75ch] mx-auto xl:mx-0">
              {/* 포스트 헤더 */}
              <header className="mb-8">
                <nav className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
                  <Link
                    href={localePath(locale, "/")}
                    className="hover:text-gray-700 dark:hover:text-neutral-200"
                  >
                    {dict.common.home}
                  </Link>
                  {" / "}
                  <Link
                    href={localePath(
                      locale,
                      `/categories/${post.frontMatter.category}`
                    )}
                    className="hover:text-gray-700 dark:hover:text-neutral-200"
                  >
                    {post.frontMatter.category.toUpperCase()}
                  </Link>
                </nav>

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                  {post.frontMatter.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-neutral-400">
                  <time dateTime={post.frontMatter.createdAt}>
                    {formatDate(post.frontMatter.createdAt, locale)}
                  </time>
                  {isUpdated && (
                    <span>
                      {dict.post.updatedAt}:{" "}
                      {formatDate(post.frontMatter.updatedAt, locale)}
                    </span>
                  )}
                  <span>{dict.post.readingTime(readingTime)}</span>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <Link
                        key={tag}
                        href={localePath(locale, `/tags/${tag}`)}
                        className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
              </header>

              {/* 포스트 본문 */}
              <article className="prose prose-lg prose-zinc dark:prose-invert max-w-none">
                {post.content}
              </article>

              <GiscusArea locale={locale} />
            </div>

            {/* 목차 사이드바 */}
            {headings.length > 0 && (
              <aside className="hidden xl:block w-56 flex-shrink-0">
                <div className="sticky top-20">
                  <TableOfContents headings={headings} locale={locale} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </>
    );
  } catch {
    notFound();
  }
}
