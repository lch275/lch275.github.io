import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export const dynamic = "force-static";
import { listPosts } from "@/lib/posts";
import { getAllTags } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([
    listPosts(DEFAULT_LOCALE),
    getAllTags(DEFAULT_LOCALE),
  ]);

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}/`,
    lastModified: post.frontMatter.updatedAt,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${SITE_URL}/tags/${encodeURIComponent(tag)}/`,
  }));

  return [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/posts/`, lastModified: new Date() },
    { url: `${SITE_URL}/categories/`, lastModified: new Date() },
    ...postEntries,
    ...tagEntries,
  ];
}
