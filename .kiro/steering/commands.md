---
inclusion: auto
name: portfolio-commands
description: Build, lint, typecheck, test and Lighthouse commands for aniket-portfolio-fixed. Read before running checks or editing content in src/content, scripts/ or SEO files.
---

# Verified commands (2026-10-22)

- Lint: `npx eslint .` (0 errors; ~24 known warnings).
- Typecheck: `npx tsc --noEmit` (~25 s).
- Tests: `npx vitest run --maxWorkers=3 --testTimeout=120000`. The default 5 s timeout fails ~12 property tests on this machine; that is timing, not a bug.
- Build: `npm run build` (prebuild runs content validation, sitemap generation and token check; postbuild scans for banned strings). Regenerates `public/sitemap.xml`.
- Lighthouse: `npx vite preview --port 4173` in the background, then `npx lighthouse http://127.0.0.1:4173/ --output json`. A chrome-launcher kill error on exit is harmless.
- Site facts come from the local, git-ignored `TASKS.md` "Approved facts"; identity and origin live in `src/app/siteIdentity.ts` (index.html and robots.txt repeat it by hand). Live host is Vercel: redirects go in `vercel.json`.
