import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs, extractHeadings } from "../utils";
import { SITE_URL, SITE_NAME } from "@/lib/config";
import GiscusArea from "@/components/GiscusArea";
import TableOfContents from "@/components/TableOfContents";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontMatter } = await getPostBySlug(slug);
    const url = `${SITE_URL}/posts/${slug}/`;
    return {
      title: frontMatter.title,
      description: frontMatter.description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        title: frontMatter.title,
        description: frontMatter.description,
        publishedTime: frontMatter.createdAt,
        modifiedTime: frontMatter.updatedAt,
        siteName: SITE_NAME,
        locale: "ko_KR",
      },
      twitter: {
        card: "summary_large_image",
        title: frontMatter.title,
        description: frontMatter.description,
      },
    };
  } catch {
    return { title: "포스트를 찾을 수 없습니다" };
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  try {
    const [post] = await Promise.all([getPostBySlug(slug)]);
    const headings = extractHeadings(post.rawContent);

    const createdDate = new Date(post.frontMatter.createdAt);
    const updatedDate = new Date(post.frontMatter.updatedAt);
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
      url: `${SITE_URL}/posts/${slug}/`,
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
                  <Link href="/" className="hover:text-gray-700 dark:hover:text-neutral-200">
                    홈
                  </Link>
                  {" / "}
                  <Link
                    href={`/categories/${post.frontMatter.category}`}
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
                    {createdDate.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  {isUpdated && (
                    <span>
                      수정일:{" "}
                      {updatedDate.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  <span>{readingTime}분 읽기</span>
                </div>

                {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.frontMatter.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${tag}`}
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

              <GiscusArea />
            </div>

            {/* 목차 사이드바 */}
            {headings.length > 0 && (
              <aside className="hidden xl:block w-56 flex-shrink-0">
                <div className="sticky top-20">
                  <TableOfContents headings={headings} />
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
