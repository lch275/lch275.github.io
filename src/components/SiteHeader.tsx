"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

interface Props {
  locale: Locale;
}

export default function SiteHeader({ locale }: Props) {
  const pathname = usePathname();
  const dict = getDictionary(locale);

  const navLinks = [
    { href: localePath(locale, "/posts"), label: dict.nav.posts },
    { href: localePath(locale, "/categories"), label: dict.nav.categories },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-neutral-800">
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 h-14 flex items-center justify-between"
        aria-label={dict.nav.label}
      >
        <Link
          href={localePath(locale, "/")}
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
