// English UI strings.
// Typed as Dictionary so a missing or renamed key fails at compile time.

import type { Dictionary } from "./ko";

export const en: Dictionary = {
  languageName: "English",
  siteTagline: "Notes and retrospectives from a developer",
  siteDescription:
    "A developer blog sharing what I learn and troubleshoot while building software. Write-ups of real-world problems and how they were solved across frontend, backend, and infrastructure.",
  skipToContent: "Skip to main content",

  nav: {
    label: "Main navigation",
    posts: "Posts",
    categories: "Categories",
    switchTo: (language: string) => `View in ${language}`,
  },

  common: {
    home: "Home",
    tableOfContents: "Contents",
    postCount: (count: number) => `${count} post${count === 1 ? "" : "s"}`,
    totalPostCount: (count: number) =>
      `${count} post${count === 1 ? "" : "s"} in total`,
  },

  home: {
    recentPosts: "Recent posts",
    viewAll: "View all →",
    empty: "No posts yet.",
  },

  posts: {
    title: "Posts",
    description: (siteName: string) => `Every post on the ${siteName} blog.`,
  },

  post: {
    notFound: "Post not found",
    updatedAt: "Updated",
    readingTime: (minutes: number) => `${minutes} min read`,
  },

  categories: {
    title: "Categories",
    empty: "No posts in this category yet.",
  },

  tags: {
    label: "Tag",
    description: (siteName: string, tag: string) =>
      `Posts tagged #${tag} on ${siteName}.`,
  },

  localeHint: {
    message: "This page is also available in English.",
    action: "Read in English",
    dismiss: "Dismiss",
  },

  consent: {
    label: "Cookie consent",
    message:
      "This site uses cookies to measure visitor statistics. If you accept, the data is used for analytics through Google Analytics. Declining places no restrictions on using the site.",
    accept: "Accept",
    decline: "Decline",
  },
};
