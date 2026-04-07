"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/posts", label: "글 목록" },
    { href: "/categories", label: "카테고리" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-neutral-800">
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 h-14 flex items-center justify-between"
        aria-label="주요 내비게이션"
      >
        <Link
          href="/"
          className="font-bold text-xl tracking-tight text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
        >
          ARCHIVE
        </Link>
        <div className="flex items-center gap-6">
          {navLinks.map(({ href, label }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
