import PostsView from "@/views/PostsView";
import { buildPostsMetadata } from "@/lib/seo";

export const metadata = buildPostsMetadata("ko");

export default function PostsPage() {
  return <PostsView locale="ko" />;
}
