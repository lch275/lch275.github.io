import PostsView from "@/views/PostsView";
import { buildPostsMetadata } from "@/lib/seo";

export const metadata = buildPostsMetadata("en");

export default function EnPostsPage() {
  return <PostsView locale="en" />;
}
