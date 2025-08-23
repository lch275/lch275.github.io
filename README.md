Static MDX blog powered by Next.js (App Router), TypeScript and Tailwind CSS.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Place posts in `src/content/*.mdx` with this frontmatter:

```md
---
title: Title
date: 2025-01-01
description: Optional summary
tags: [tag1, tag2]
---
```

### Static export

This project is configured for static hosting.

```bash
npm run build
npm run export
```

Static files are generated in `out/`.

### GitHub Pages

1) Enable Pages in your repo: Settings → Pages → Source: GitHub Actions
2) Push to `main`. The workflow `.github/workflows/deploy.yml` will:
   - Build and export with `output: "export"`
   - Set correct `basePath`/`assetPrefix` automatically for project pages
   - Publish `web/out` to Pages

For user/org sites like `yourname.github.io`, no basePath is added.
