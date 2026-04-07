export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-neutral-800 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-sm text-gray-500 dark:text-neutral-500 text-center">
        <p>© {new Date().getFullYear()} ARCHIVE. All rights reserved.</p>
      </div>
    </footer>
  );
}
