# Content Authoring Workflow

<!-- =========================================================================
  LEGACY ASSET DISPOSITION RECORD
  =========================================================================
  File:     public/blog/hire-mern-stack-developer-checklist.html
  Decision: DELETE + 301 redirect to /writing
  Date:     2025 (engineering rebrand)

  The file was a standalone HTML page entirely positioned around legacy
  freelance services. It contained prohibited positioning strings throughout
  its copy, meta tags, OG tags, structured data (BlogPosting JSON-LD), and
  footer related to the old "freelance M.E.R.N developer" branding.

  Rebranding was not viable because the page's entire premise — a checklist
  for hiring legacy services — conflicts with the engineering portfolio
  positioning. No reusable engineering content was present.

  Implementation:
  - The file was deleted from public/blog/.
  - netlify.toml now has two 301 redirect rules (with and without .html
    extension) mapping the old URL to /writing, preserving inbound link equity.

  Validates: Requirements 14.5, 20.2
  ========================================================================= -->

This directory contains all long-form content for the portfolio, stored as typed TypeScript modules.

## Directory Structure

```
src/content/
├── projects.ts            # Featured project entries
├── caseStudies.ts         # Case study entries (one per project)
├── architectureTopics.ts  # Architecture topic entries
├── articles.ts            # Writing/article entries
├── schemas.ts             # Zod validation schemas
├── index.ts               # Barrel export
└── README.md              # This file
```

## How Content Works

Each content file exports an array of typed entries. Fields that have not been authored yet use the `placeholder()` helper from `src/utils/placeholder.ts`. This ensures:

1. **Type safety** — placeholder values are branded types that cannot be accidentally used as real content.
2. **Visible markers** — templates render `"TODO: <field>"` for any unset field, making gaps obvious.
3. **No fabricated content** — the system never generates prose, metrics, or claims on your behalf.

## Authoring Content

To author content for a field:

1. Open the relevant content file (e.g. `projects.ts`).
2. Replace the `placeholder<T>('fieldName')` call with your authored value.
3. When all required fields are authored, change `status` from `'draft'` to `'published'`.

### Example

```ts
// Before (draft)
{
  slug: 'bvisionr',
  title: 'BVISIONR',
  summary: placeholder<string>('summary'),
  role: placeholder<string>('role'),
  status: 'draft',
  // ...
}

// After (published)
{
  slug: 'bvisionr',
  title: 'BVISIONR',
  summary: 'Multi-tenant SaaS platform powering AI-driven WhatsApp automation for businesses.',
  role: 'Lead Backend Engineer',
  status: 'published',
  // ...
}
```

## Content Status

- **`draft`** — Entry is visible in development but excluded from production builds and sitemap.
- **`published`** — Entry is live. All required fields must be authored (no placeholders allowed).

## Validation

Content is validated at build time via `scripts/validate-content.mjs`:

- All entries are checked against their Zod schemas in `schemas.ts`.
- Any `published` entry with a placeholder in a required field fails the build.
- Draft entries are allowed to have placeholders.

Run validation manually:

```bash
npm run validate-content
```

## Content Collections

### Projects (`projects.ts`)

| Field | Type | Required for publish |
|-------|------|---------------------|
| `slug` | string | Yes |
| `title` | string | Yes |
| `summary` | string | Yes |
| `role` | string | Yes |
| `primaryTech` | string[] | Yes |
| `caseStudySlug` | string \| null | Yes (null is valid) |
| `tags` | string[] | Yes |
| `thumbnail` | string | No |

### Case Studies (`caseStudies.ts`)

| Field | Type | Required for publish |
|-------|------|---------------------|
| `slug` | string | Yes |
| `projectSlug` | string | Yes |
| `title` | string | Yes |
| `summary` | string | Yes |
| `role` | string | Yes |
| `duration` | string | Yes |
| `sections.overview` | RichText | Yes |
| `sections.context` | RichText | No |
| `sections.problem` | RichText | No |
| `sections.constraints` | RichText | No |
| `sections.architecture` | RichText | No |
| `sections.decisions` | RichText | No |
| `sections.tradeoffs` | RichText | No |
| `sections.outcomes` | RichText | No |
| `sections.lessons` | RichText | No |

### Architecture Topics (`architectureTopics.ts`)

| Field | Type | Required for publish |
|-------|------|---------------------|
| `slug` | string | Yes |
| `title` | string | Yes |
| `summary` | string | Yes |
| `diagramId` | string | Yes |
| `prose` | RichText | No |
| `relatedCaseStudySlugs` | string[] | Yes (empty is valid) |
| `tags` | string[] | Yes |

### Articles (`articles.ts`)

| Field | Type | Required for publish |
|-------|------|---------------------|
| `slug` | string | Yes |
| `title` | string | Yes |
| `summary` | string | Yes |
| `body` | RichText | Yes |
| `readingTimeMinutes` | number | Yes (> 0) |
| `tags` | string[] | Yes |
| `toc` | TocEntry[] | No |
| `publishedAt` | string (ISO 8601) | No |

## Tips

- Keep slugs URL-friendly (lowercase, hyphens, no spaces).
- Use simple strings for prose initially; switch to `RichTextNode[]` when you need structured formatting.
- Tags are used for cross-linking (e.g. architecture topics link to related case studies via shared tags).
- The `diagramId` in architecture topics maps to a composed diagram component in `src/components/diagrams/composed/`.
