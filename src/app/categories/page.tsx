import Link from "next/link";
import { listCategories } from "../posts/utils";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-8">카테고리</h1>

      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map(({ category, count }) => (
          <li key={category}>
            <Link
              href={`/categories/${category}`}
              className="block border border-gray-200 dark:border-neutral-800 rounded-lg p-4 bg-white dark:bg-neutral-900 hover:border-gray-300 dark:hover:border-neutral-600 hover:shadow-sm transition-all group"
            >
              <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase mb-1">
                {category}
              </div>
              <div className="text-xs text-gray-400 dark:text-neutral-500">{count}개의 글</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
