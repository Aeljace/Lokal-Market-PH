#!/usr/bin/env node
/**
 * Read-only sitemap audit for lokal-market.shop.
 *
 * Usage:
 *   node scripts/audit-sitemap.mjs --limit=50
 *   node scripts/audit-sitemap.mjs --limit=all --out=sitemap-audit.csv
 *
 * This tool does not modify the live site or its sitemap.
 */
import { writeFile } from "node:fs/promises";

const arg = (name) => {
  const value = process.argv.find((item) => item.startsWith("--" + name + "="));
  return value ? value.slice(name.length + 3) : undefined;
};
const sitemapUrl = arg("sitemap") || "https://lokal-market.shop/sitemap.xml";
const maxArg = arg("limit") || "50";
const limit = maxArg === "all" ? Infinity : Number(maxArg);
if (!(limit > 0)) {
  throw new Error("Use --limit=N (N > 0) or --limit=all");
}
const outputPath = arg("out");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const xmlDecode = (text) => text
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'");
const stripSlash = (value) => value.replace(/\/+$/, "");
const csvCell = (value) => '"' + String(value ?? "").replace(/"/g, '""') + '"';
const canonicalFrom = (html, documentUrl) => {
  const link = html.match(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/i)?.[0];
  const href = link?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
  if (!href) return "";
  try { return new URL(xmlDecode(href), documentUrl).href; } catch { return ""; }
};
const fetchWithTimeout = async (url) => fetch(url, {
  method: "GET",
  redirect: "manual",
  signal: AbortSignal.timeout(15000),
  headers: { "User-Agent": "LokalMarketSitemapAudit/1.0" }
});

async function audit(url, origin) {
  const row = { url, status: "", issue: "", destination: "", canonical: "" };
  if (!url.startsWith(origin + "/") && url !== origin) {
    row.issue = "wrong-origin"; return row;
  }
  try {
    const response = await fetchWithTimeout(url);
    row.status = response.status;
    if (response.status >= 300 && response.status < 400) {
      row.issue = "redirect";
      row.destination = response.headers.get("location") || "";
      await response.body?.cancel();
      return row;
    }
    if (response.status === 404 || response.status === 410) {
      row.issue = "removed"; await response.body?.cancel(); return row;
    }
    if (response.status !== 200) {
      row.issue = "http-error"; await response.body?.cancel(); return row;
    }
    const html = await response.text();
    const title = html.match(/<title\b[^>]*>([^<]*)<\/title>/i)?.[1] || "";
    const soft404 = /product\s+(?:not\s+found|unavailable)/i.test(title) ||
      /<h1\b[^>]*>\s*product\s+not\s+found\s*<\/h1>/i.test(html);
    const metaRobots = html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']robots["'])[^>]*>/i)?.[0] || "";
    const robots = (response.headers.get("x-robots-tag") || "") + " " + metaRobots;
    row.canonical = canonicalFrom(html, url);
    if (soft404) row.issue = "soft-404";
    else if (/\bnoindex\b/i.test(robots)) row.issue = "noindex";
    else if (row.canonical && stripSlash(row.canonical) !== stripSlash(url)) {
      row.issue = "canonical-mismatch";
    } else row.issue = "ok";
    return row;
  } catch (error) {
    row.issue = "request-error";
    row.destination = error.message;
    return row;
  }
}

const sitemapResponse = await fetchWithTimeout(sitemapUrl);
if (!sitemapResponse.ok) {
  throw new Error("Cannot read sitemap (" + sitemapResponse.status + "): " + sitemapUrl);
}
const xml = await sitemapResponse.text();
const urls = [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
  .map((match) => xmlDecode(match[1].trim()));
const uniqueUrls = [...new Set(urls)];
if (!uniqueUrls.length) throw new Error("No <loc> URLs found in the sitemap.");
const origin = new URL(sitemapUrl).origin;
const selected = uniqueUrls.slice(0, limit);
const rows = [];
for (let index = 0; index < selected.length; index += 1) {
  const row = await audit(selected[index], origin);
  rows.push(row);
  process.stdout.write("[" + (index + 1) + "/" + selected.length + "] " +
    row.issue + " " + row.url + "\n");
  await sleep(100);
}
const summary = rows.reduce((total, row) => {
  total[row.issue] = (total[row.issue] || 0) + 1;
  return total;
}, {});
console.log("\nSitemap entries: " + uniqueUrls.length + "; checked: " + rows.length);
console.log("Classification counts:", summary);
if (outputPath) {
  const header = ["url", "status", "issue", "destination", "canonical"];
  const csv = [header.join(","), ...rows.map((row) =>
    header.map((column) => csvCell(row[column])).join(","))].join("\n") + "\n";
  await writeFile(outputPath, csv, "utf8");
  console.log("Report: " + outputPath);
}
console.log("Read-only audit completed. Do not upload a static replacement sitemap.");
