import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export const dynamic = "force-static";
import { listPosts } from "./posts/utils";
import { getAllTags } from "./posts/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([listPosts(), getAllTags()]);

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}/`,
    lastModified: post.frontMatter.updatedAt,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${SITE_URL}/tags/${tag}/`,
  }));

  return [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/posts/`, lastModified: new Date() },
    { url: `${SITE_URL}/categories/`, lastModified: new Date() },
    ...postEntries,
    ...tagEntries,
  ];
}
