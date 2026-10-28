/**
 * Site identity: the single source for the public origin, name and profile links.
 *
 * index.html and public/robots.txt are static files that repeat SITE_ORIGIN by
 * hand; change them together with this file. scripts/generate-sitemap.mjs
 * imports SITE_ORIGIN from here.
 *
 * @module app/siteIdentity
 */

export const SITE_ORIGIN = 'https://www.aniket.page';

export const PERSON_NAME = 'Aniket Kushwaha';
export const JOB_TITLE = 'Backend / Full-Stack Engineer';
export const LOCATION = 'Navi Mumbai, India';
export const EMAIL = 'kushwahaaniket141@gmail.com';

export const GITHUB_URL = 'https://github.com/Aniketk8104';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/aniket-kushwaha-ak';

/** Profile URLs for JSON-LD `sameAs`. */
export const SAME_AS: readonly string[] = [GITHUB_URL, LINKEDIN_URL];

/** 1200×630 link-preview card (public/og-image.png). */
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = 'Aniket Kushwaha — Backend / Full-Stack Engineer';
export const SITE_NAME = 'Aniket Kushwaha — Engineering Portfolio';

/** Current resume, served from /public. */
export const RESUME_PATH = '/Aniket_Kushwaha_Resume.pdf';
