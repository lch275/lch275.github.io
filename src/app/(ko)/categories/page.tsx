import CategoriesView from "@/views/CategoriesView";
import { buildCategoriesMetadata } from "@/lib/seo";

export const metadata = buildCategoriesMetadata("ko");

export default function CategoriesPage() {
  return <CategoriesView locale="ko" />;
}
