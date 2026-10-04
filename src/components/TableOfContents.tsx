"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/posts";
import { getDictionary, type Locale } from "@/lib/i18n";

interface Props {
  headings: Heading[];
  locale: Locale;
}

export default function TableOfContents({ headings, locale }: Props) {
  const dict = getDictionary(locale);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0% 0% -70% 0%", threshold: 0 }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label={dict.common.tableOfContents}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-3">
        {dict.common.tableOfContents}
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
          >
            <a
              href={`#${h.id}`}
              className={`block text-sm leading-snug py-0.5 transition-colors ${
                activeId === h.id
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
