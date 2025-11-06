import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

type Offer = { site: string; title: string; price: number; url: string };

function parsePrice(text: string): number | null {
  const cleaned = text
    .replace(/[,\s]/g, "")
    .replace(/[??\u20B9]/g, "")
    .replace(/[^0-9.]/g, "");
  const value = parseInt(cleaned, 10);
  if (Number.isFinite(value) && value > 0 && value < 1000000) return value;
  return null;
}

function matchesIFB9kg(title: string): boolean {
  const t = title.toLowerCase();
  if (!t.includes("ifb")) return false;
  const kgMatch = /(\b|\s)(9\s*kg|9kg)(\b|\s)/i.test(title);
  return kgMatch;
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal, headers: {
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36",
      "accept-language": "en-IN,en;q=0.9"
    }});
  } finally {
    clearTimeout(id);
  }
}

async function scrapeAmazon(): Promise<Offer[]> {
  const url = "https://www.amazon.in/s?k=ifb+9+kg+washing+machine";
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);
  const offers: Offer[] = [];
  $("div.s-result-item").each((_, el) => {
    const title = $(el).find("h2 a span").text().trim();
    const priceText = $(el).find("span.a-price-whole").first().text().trim() || $(el).find("span.a-offscreen").first().text().trim();
    const href = $(el).find("h2 a").attr("href");
    const urlAbs = href ? new URL(href, "https://www.amazon.in").toString() : "";
    if (!title || !priceText) return;
    if (!matchesIFB9kg(title)) return;
    const price = parsePrice(priceText);
    if (!price) return;
    offers.push({ site: "Amazon", title, price, url: urlAbs });
  });
  return offers;
}

async function scrapeFlipkart(): Promise<Offer[]> {
  const url = "https://www.flipkart.com/search?q=ifb+9+kg+washing+machine";
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);
  const offers: Offer[] = [];
  // Try multiple layouts
  $("div._1AtVbE, div[data-id]").each((_, el) => {
    const title = $(el).find("div._4rR01T, a.s1Q9rs, a.IRpwTa").first().text().trim();
    const priceText = $(el).find("div._30jeq3, div.Nx9bqj").first().text().trim();
    const href = $(el).find("a._1fQZEK, a.s1Q9rs, a.IRpwTa").attr("href");
    const urlAbs = href ? new URL(href, "https://www.flipkart.com").toString() : "";
    if (!title || !priceText) return;
    if (!matchesIFB9kg(title)) return;
    const price = parsePrice(priceText);
    if (!price) return;
    offers.push({ site: "Flipkart", title, price, url: urlAbs });
  });
  return offers;
}

async function scrapeCroma(): Promise<Offer[]> {
  const url = "https://www.croma.com/search/?text=ifb%209%20kg%20washing%20machine";
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);
  const offers: Offer[] = [];
  $("a.cp-product-card, li.product a").each((_, el) => {
    const title = $(el).find("h3, .cp-product-card__title").first().text().trim() || $(el).attr("title")?.trim() || "";
    const priceText = $(el).find(".cp-price__current, .new-price").first().text().trim();
    const href = $(el).attr("href");
    const urlAbs = href ? new URL(href, "https://www.croma.com").toString() : "";
    if (!title || !priceText) return;
    if (!matchesIFB9kg(title)) return;
    const price = parsePrice(priceText);
    if (!price) return;
    offers.push({ site: "Croma", title, price, url: urlAbs });
  });
  return offers;
}

async function scrapeReliance(): Promise<Offer[]> {
  const url = "https://www.reliancedigital.in/search?q=ifb%209%20kg%20washing%20machine:relevance";
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);
  const offers: Offer[] = [];
  $(".productbox, li.search-product").each((_, el) => {
    const title = $(el).find(".sp__name, .pdp__title, a").first().text().trim();
    const priceText = $(el).find(".sc-bcXHqe, .sp__finalPrice, .price").first().text().trim();
    const href = $(el).find("a").attr("href");
    const urlAbs = href ? new URL(href, "https://www.reliancedigital.in").toString() : "";
    if (!title || !priceText) return;
    if (!matchesIFB9kg(title)) return;
    const price = parsePrice(priceText);
    if (!price) return;
    offers.push({ site: "Reliance Digital", title, price, url: urlAbs });
  });
  return offers;
}

async function scrapeVijaySales(): Promise<Offer[]> {
  const url = "https://www.vijaysales.com/search/ifb%209%20kg%20washing%20machine";
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);
  const offers: Offer[] = [];
  $(".product-list, .product-item").each((_, el) => {
    const title = $(el).find(".ProductName, .product-title, a").first().text().trim();
    const priceText = $(el).find(".ProductPrice, .price").first().text().trim();
    const href = $(el).find("a").attr("href");
    const urlAbs = href ? new URL(href, "https://www.vijaysales.com").toString() : "";
    if (!title || !priceText) return;
    if (!matchesIFB9kg(title)) return;
    const price = parsePrice(priceText);
    if (!price) return;
    offers.push({ site: "Vijay Sales", title, price, url: urlAbs });
  });
  return offers;
}

async function scrapeTataCliq(): Promise<Offer[]> {
  const url = "https://www.tatacliq.com/search/?searchCategory=all&text=ifb%209%20kg%20washing%20machine";
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);
  const offers: Offer[] = [];
  $("a[href][title], .ProductModule__base").each((_, el) => {
    const title = $(el).attr("title")?.trim() || $(el).find("h3").first().text().trim();
    const priceText = $(el).find(".ProductDescription__price, .ProductDescription__priceOffering").first().text().trim();
    const href = $(el).attr("href") || $(el).find("a").attr("href");
    const urlAbs = href ? new URL(href, "https://www.tatacliq.com").toString() : "";
    if (!title || !priceText) return;
    if (!matchesIFB9kg(title)) return;
    const price = parsePrice(priceText);
    if (!price) return;
    offers.push({ site: "TataCliq", title, price, url: urlAbs });
  });
  return offers;
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results = await Promise.allSettled([
      scrapeAmazon(),
      scrapeFlipkart(),
      scrapeCroma(),
      scrapeReliance(),
      scrapeVijaySales(),
      scrapeTataCliq()
    ]);

    const offers: Offer[] = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

    const unique: Offer[] = [];
    const seen = new Set<string>();
    for (const o of offers) {
      const key = `${o.site}|${o.title}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(o);
    }

    unique.sort((a, b) => a.price - b.price);

    return NextResponse.json({
      cheapest: unique[0] ?? null,
      offers: unique,
      checkedAt: new Date().toISOString()
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
