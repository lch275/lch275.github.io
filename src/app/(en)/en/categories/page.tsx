import CategoriesView from "@/views/CategoriesView";
import { buildCategoriesMetadata } from "@/lib/seo";

export const metadata = buildCategoriesMetadata("en");

export default function EnCategoriesPage() {
  return <CategoriesView locale="en" />;
}
