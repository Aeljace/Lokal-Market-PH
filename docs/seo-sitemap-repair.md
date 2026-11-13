# Lokal Market — Search Console sitemap repair plan

## Confirmed current state (2026-11-13)

- Live domain: https://lokal-market.shop/
- Live deployment: Astro + Node.js on Hostinger, built **from an uploaded ZIP**, not from this GitHub repository.
- This repository currently contains an older React/Vite app. **Do not deploy this repository to the live Hostinger domain.**
- The live \`/sitemap.xml\` includes old product URLs, including two intentionally removed listings:
  - \`/product/24-36-60-80-120colors-painting-alcohol-markers-manga-highlighter-pen-set-marker-art-color\`
  - \`/product/maxicart-balance-bike-for-kids-boy-girl-1-2-3-years-old-toddler-baby-with-adjustable-seat-\`
- It also includes URLs such as Yozoto Sofa Bed and Australian Junior Backpack that navigate to Shopee.
- Search Console reports 15 redirected URLs (13 product URLs plus 2 HTTP homepage URLs). The HTTP→HTTPS redirects should remain.
- Many sitemap entries have a \`2026-06-19\` last-modified value, which should be checked against actual product modification dates.

## Diagnostic helper (safe and read-only)

Run from the repository root using Node.js 20+:

\`\`\`sh
node scripts/audit-sitemap.mjs --limit=50 --out=sitemap-audit.csv
node scripts/audit-sitemap.mjs --limit=all --out=sitemap-audit-all.csv
\`\`\`

The script requests the public sitemap and inspects URL responses. It flags 3xx redirects, 404/410 removals, non-200 responses, soft 404 pages, noindex directives, and canonical mismatches. The full scan requests every sitemap URL, so run thoughtfully. It does not edit the website or sitemap.

## REQUIRED: implement in the actual deployed Astro source

The correct code lives in the deployed Astro ZIP, *not* in this repository. Before changing production:

1. Obtain the exact deployed Astro source archive (\`lokalmarket_v159_analytics_security_seo_source.zip\`) or a clean source checkout. Keep \`.env\`, database credentials, keys, and private customer data out of GitHub.
2. Find the route or middleware that serves \`/sitemap.xml\` and locate the product data query/array it uses.
3. Generate sitemap entries **only** for URLs that can serve a meaningful, indexable local page with HTTP 200, have a self-consistent Lokal Market canonical, and are approved/published/currently available. Do not include intentionally deleted, pending/unapproved, noindex, or externally redirecting products.
4. Keep product links that intentionally send buyers to Shopee in the marketplace UI if that is the business model, but **do not put their redirect-only URLs in an XML sitemap**. If original Lokal Market product detail pages are desired in search, make them real standalone HTTP 200 pages with useful original content and a visible outbound purchase CTA instead of immediate redirects.
5. Generate \`lastmod\` from an actual modification timestamp (e.g., \`updatedAt\`) if available. Omit \`lastmod\` rather than hard-code a misleading date.
6. Keep intentional HTTP→HTTPS and www→non-www redirects; keep permanently removed listings as genuine HTTP 404/410. Use 301 only if the content has a truly equivalent live replacement.
7. Remove the two confirmed deleted listings and all redirect-only URLs from sitemap output; then rerun the audit against a test deployment.
8. Verify sitemap XML, 200 status for included URLs, correct canonical tags, and absence of deleted/redirecting entries before publishing.
9. After successful deployment, resubmit \`https://lokal-market.shop/sitemap.xml\` in Search Console. Do not use “Validate Fix” to force intentionally excluded 404 or redirect URLs to become indexed.

## Known URLs requiring review

- Missing/removed:
  - \`https://lokal-market.shop/product/24-36-60-80-120colors-painting-alcohol-markers-manga-highlighter-pen-set-marker-art-color\`
  - \`https://lokal-market.shop/product/maxicart-balance-bike-for-kids-boy-girl-1-2-3-years-old-toddler-baby-with-adjustable-seat-\`
- Redirect-only:
  - \`https://lokal-market.shop/product/yozoto-folding-sofa-bed-4in1-convertible-sofas-with-pillow-back-support-armrest-comfy-fold\`
  - \`https://lokal-market.shop/product/australian-junior-teeny-tiny-backpack-preschool-school-bag\`
- Canonical review:
  - \`https://lokal-market.shop/product/bicycle-for-kids-size-16\`
- Crawl/indexability review:
  - \`https://lokal-market.shop/become-a-seller\`

**This PR is a safe preparation step, not a deployed fix. Do not merge/deploy it as a replacement for the Astro application.**
