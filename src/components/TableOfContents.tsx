"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/app/posts/utils";

interface Props {
  headings: Heading[];
}

export default function TableOfContents({ headings }: Props) {
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
    <nav aria-label="목차">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-3">
        목차
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
