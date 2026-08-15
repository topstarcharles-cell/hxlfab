import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { helpArticles, helpCategories, helpCenterMeta } from "./help-center-data.mjs";

const publicDir = new URL("../public/", import.meta.url).pathname;
const helpDir = join(publicDir, "help-center");
const siteUrl = "https://hxlfab.com";
const assetVersion = "20260815f";
const company = {
  name: "HXLFAB",
  legalName: "Guilin Hengxinlong Electronic Technology Co., Ltd.",
  email: helpCenterMeta.email,
  phone: "+86 138 2366 3114",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function headingId(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const categoryBySlug = new Map(helpCategories.map((category) => [category.slug, category]));
const articleBySlug = new Map(helpArticles.map((article) => [article.slug, article]));

function validateData() {
  const errors = [];
  if (helpCategories.length !== 7) errors.push(`expected 7 categories, found ${helpCategories.length}`);
  if (helpArticles.length !== 26) errors.push(`expected 26 articles, found ${helpArticles.length}`);
  if (categoryBySlug.size !== helpCategories.length) errors.push("duplicate category slug");
  if (articleBySlug.size !== helpArticles.length) errors.push("duplicate article slug");

  for (const article of helpArticles) {
    if (!categoryBySlug.has(article.category)) errors.push(`${article.slug}: unknown category ${article.category}`);
    if (!article.sections?.length) errors.push(`${article.slug}: article has no sections`);
    for (const related of article.related ?? []) {
      if (!articleBySlug.has(related)) errors.push(`${article.slug}: unknown related article ${related}`);
      if (related === article.slug) errors.push(`${article.slug}: article relates to itself`);
    }
  }

  if (errors.length) throw new Error(`Help Center data validation failed:\n${errors.join("\n")}`);
}

function articleHref(article) {
  return `/help-center/articles/${article.slug}/`;
}

function categoryHref(category) {
  return `/help-center/${category.slug}/`;
}

function siteHeader() {
  return `
  <div class="utility"><div class="shell utility-inner"><span>PCB manufacturing · Guilin production base · Shenzhen service office</span><a href="mailto:${company.email}">${company.email}</a></div></div>
  <header class="header"><div class="shell nav">
    <a class="brand" href="/" aria-label="HXLFAB home"><span class="brand-bars" aria-hidden="true"><i></i><i></i><i></i></span><span>HXL<strong>FAB</strong></span></a>
    <nav aria-label="Main navigation"><a href="/pcb-manufacturing/">Manufacturing</a><a href="/quality-certifications/">Quality</a><a href="/factory-process/">Factory</a><a href="/engineering-scenarios/">Engineering reviews</a><a href="/help-center/" aria-current="page">Help Center</a><a href="/about/">About</a></nav>
    <a class="button small" href="/#quote">Start an RFQ <span>↗</span></a>
  </div></header>`;
}

function siteFooter() {
  return `
  <footer><div class="shell footer-grid">
    <div><a class="brand footer-brand" href="/"><span class="brand-bars" aria-hidden="true"><i></i><i></i><i></i></span><span>HXL<strong>FAB</strong></span></a><p>PCB manufacturing brand<br>Guilin production base · Shenzhen service office</p></div>
    <div><span>Evidence</span><p><a href="/quality-certifications/">Quality & certifications</a><br><a href="/factory-process/">Factory & process</a><br><a href="/engineering-scenarios/">Engineering scenarios</a></p></div>
    <div><span>Resources</span><p><a href="/help-center/">Help Center</a><br><a href="/working-with-us/">Working with us</a><br><a href="/contact/">Contact engineering</a></p></div>
    <div><span>Contact</span><p><a href="mailto:${company.email}">${company.email}</a><br><a href="tel:+8613823663114">${company.phone}</a></p></div>
  </div><div class="shell footer-bottom"><span>© 2026 HXLFAB. All rights reserved.</span><span><a href="/privacy-file-handling/">Privacy & file handling</a> · Technical data subject to engineering confirmation.</span></div></footer>`;
}

function breadcrumbs(items) {
  return `<nav class="help-breadcrumbs" aria-label="Breadcrumb"><ol>${items.map((item, index) => `<li>${item.href && index < items.length - 1 ? `<a href="${item.href}">${escapeHtml(item.label)}</a>` : `<span aria-current="page">${escapeHtml(item.label)}</span>`}</li>`).join("")}</ol></nav>`;
}

function searchForm({ prominent = false } = {}) {
  return `<form class="help-search${prominent ? " help-search-prominent" : ""}" action="/help-center/" method="get" role="search"${prominent ? ' data-help-search-form' : ""}>
    <label for="${prominent ? "helpSearch" : "helpSearchCompact"}">Search the HXLFAB Help Center</label>
    <div class="help-search-control"><span aria-hidden="true">⌕</span><input id="${prominent ? "helpSearch" : "helpSearchCompact"}" name="q" type="search" autocomplete="off" placeholder="Search files, DFM, capabilities, quality, or commercial terms"${prominent ? ' data-help-search-input aria-describedby="helpSearchHint"' : ""}><button type="submit">Search</button></div>
${prominent ? '    <p id="helpSearchHint">Search 26 reviewed answers, or browse by topic below.</p>\n' : ""}  </form>`;
}

function structuredData(page) {
  const canonical = `${siteUrl}${page.path}`;
  const breadcrumbItems = page.breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: `${siteUrl}${item.href ?? page.path}`,
  }));
  const graph = [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: company.name,
      legalName: company.legalName,
      url: `${siteUrl}/`,
      email: company.email,
      telephone: company.phone,
    },
    page.schema ?? {
      "@type": "CollectionPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#organization` },
      dateModified: helpCenterMeta.reviewedDateIso,
    },
    { "@type": "BreadcrumbList", itemListElement: breadcrumbItems },
  ];
  return { "@context": "https://schema.org", "@graph": graph };
}

function head(page) {
  const canonical = `${siteUrl}${page.path}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="theme-color" content="#08242e">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="${page.ogType ?? "website"}"><meta property="og:site_name" content="HXLFAB"><meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${siteUrl}/images/guilin-production-base.jpg">
  <link rel="stylesheet" href="/styles.css?v=${assetVersion}"><link rel="stylesheet" href="/help-center.css?v=${assetVersion}">
  <script type="application/ld+json">${safeJson(structuredData(page))}</script>
  <script src="/site.js?v=${assetVersion}" defer></script><script src="/help-center.js?v=${assetVersion}" defer></script>
</head>`;
}

function pageShell(page, main) {
  return `${head(page)}
<body class="help-page">
<a class="help-skip" href="#main-content">Skip to main content</a>
${siteHeader()}
${main}
${siteFooter()}
</body>
</html>`;
}

function compactHero(page, eyebrow, title, intro, breadcrumbItems) {
  return `<section class="help-subhero"><div class="shell">${breadcrumbs(breadcrumbItems)}<div class="help-subhero-grid"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(intro)}</p></div>${searchForm()}</div></div></section>`;
}

function articleCard(article, { showCategory = true } = {}) {
  const category = categoryBySlug.get(article.category);
  return `<a class="help-article-card" href="${articleHref(article)}">${showCategory ? `<span>${escapeHtml(category.title)}</span>` : ""}<strong>${escapeHtml(article.title)}</strong><p>${escapeHtml(article.summary)}</p><b>Read answer <span aria-hidden="true">→</span></b></a>`;
}

function renderHome() {
  const title = "PCB Help Center | RFQ, DFM, Quality & File Security | HXLFAB";
  const description = "Get reviewed answers about PCB quote files, DFM, stack-ups, capabilities, quality records, commercial terms, and secure HXLFAB uploads.";
  const page = {
    path: "/help-center/",
    title,
    description,
    breadcrumbs: [{ label: "Home", href: "/" }, { label: "Help Center" }],
  };
  const searchData = helpArticles.map((article) => {
    const category = categoryBySlug.get(article.category);
    return {
      title: article.title,
      summary: article.summary,
      keywords: article.keywords,
      category: category.title,
      categoryHref: categoryHref(category),
      href: articleHref(article),
    };
  });
  const popular = [
    "what-to-send-for-a-pcb-quote",
    "controlled-impedance-data",
    "use-published-capability-limits",
    "request-quality-document-pack",
    "moq-price-and-lead-time",
    "secure-upload-limits-and-file-types",
  ].map((slug) => articleBySlug.get(slug));
  const main = `<main id="main-content" data-help-center-index>
    <section class="help-hero"><div class="shell">${breadcrumbs(page.breadcrumbs)}<div class="help-hero-copy"><p class="eyebrow">HXLFAB Help Center</p><h1>Answers before your board reaches production.</h1><p>Practical guidance for quote preparation, fabrication data, engineering review, quality evidence, commercial terms, and secure file handling.</p></div>${searchForm({ prominent: true })}</div></section>
    <section class="help-search-results" data-help-search-results hidden aria-labelledby="helpResultsHeading"><div class="shell"><div class="help-results-head"><div><p class="eyebrow dark">Search results</p><h2 id="helpResultsHeading" tabindex="-1">Help Center results</h2></div><button type="button" class="help-clear-search" data-help-clear-search>Clear search</button></div><p class="help-results-status" data-help-results-status aria-live="polite"></p><div class="help-results-grid" data-help-results-grid></div></div></section>
    <div data-help-browse-content>
      <section class="help-proof" aria-label="Help Center coverage"><div class="shell help-proof-grid"><div><strong>${helpArticles.length}</strong><span>Reviewed articles</span></div><div><strong>${helpCategories.length}</strong><span>Practical categories</span></div><div><strong>Project-specific</strong><span>No universal MOQ or lead-time claims</span></div><div><strong>${escapeHtml(helpCenterMeta.reviewedDate)}</strong><span>Content review date</span></div></div></section>
      <section class="help-section"><div class="shell"><div class="help-section-heading"><div><p class="eyebrow dark">Browse by topic</p><h2>Start with the decision in front of you.</h2></div><p>Every answer separates published planning guidance from the conditions that still require file, material, quality, or commercial confirmation.</p></div><div class="help-category-grid">${helpCategories.map((category) => {
        const articles = helpArticles.filter((article) => article.category === category.slug);
        return `<article class="help-category-card"><div class="help-category-number">${category.number}</div><h3><a href="${categoryHref(category)}">${escapeHtml(category.title)}</a></h3><p>${escapeHtml(category.description)}</p><ul>${articles.slice(0, 3).map((article) => `<li><a href="${articleHref(article)}">${escapeHtml(article.title)}</a></li>`).join("")}</ul><a class="help-category-all" href="${categoryHref(category)}">View all ${articles.length} answers <span aria-hidden="true">→</span></a></article>`;
      }).join("")}</div></div></section>
      <section class="help-section help-mist"><div class="shell"><div class="help-section-heading"><div><p class="eyebrow dark">Top questions</p><h2>Common questions, direct answers.</h2></div><p>These are the topics most likely to affect quote quality, revision control, or supplier trust.</p></div><div class="help-article-grid">${popular.map((article) => articleCard(article)).join("")}</div></div></section>
      <section class="help-guidance"><div class="shell help-guidance-grid"><div><p class="eyebrow">Guidance boundary</p><h2>The Help Center supports a review. It does not approve a design.</h2></div><div><p>Published limits and process explanations are planning inputs. Final capability, material, price, lead time, testing, documents, shipping, and terms are confirmed against the actual RFQ.</p><a class="text-link" href="/working-with-us/">See how confirmation works <span>→</span></a></div></div></section>
    </div>
    <section class="help-cta"><div class="shell help-cta-inner"><div><p class="eyebrow dark">Still deciding what to send?</p><h2>Start with a question or a controlled RFQ package.</h2></div><div><a class="button help-button-dark" href="mailto:${company.email}?subject=PCB%20engineering%20question">Ask engineering <span>↗</span></a><a class="help-cta-link" href="/#quote">Start an RFQ <span>→</span></a></div></div></section>
    <script id="help-search-data" type="application/json">${safeJson(searchData)}</script>
  </main>`;
  return pageShell(page, main);
}

function renderCategory(category) {
  const articles = helpArticles.filter((article) => article.category === category.slug);
  const page = {
    path: categoryHref(category),
    title: `${category.title} Help | PCB Support | HXLFAB`,
    description: category.description,
    breadcrumbs: [{ label: "Home", href: "/" }, { label: "Help Center", href: "/help-center/" }, { label: category.title }],
  };
  const main = `<main id="main-content">
    ${compactHero(page, `Help Center · ${category.number}`, category.title, category.description, page.breadcrumbs)}
    <section class="help-section"><div class="shell help-category-layout"><aside class="help-topic-nav" aria-label="Help Center categories"><p>Browse topics</p><nav>${helpCategories.map((item) => `<a href="${categoryHref(item)}"${item.slug === category.slug ? ' aria-current="page"' : ""}><span>${item.number}</span>${escapeHtml(item.title)}</a>`).join("")}</nav></aside><div><div class="help-list-heading"><h2>${articles.length} reviewed answers</h2><p>Last content review: <time datetime="${helpCenterMeta.reviewedDateIso}">${escapeHtml(helpCenterMeta.reviewedDate)}</time></p></div><div class="help-category-article-list">${articles.map((article, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><h3><a href="${articleHref(article)}">${escapeHtml(article.title)}</a></h3><p>${escapeHtml(article.summary)}</p><a href="${articleHref(article)}">Read answer <span aria-hidden="true">→</span></a></div></article>`).join("")}</div></div></div></section>
    <section class="help-cta"><div class="shell help-cta-inner"><div><p class="eyebrow dark">Need a project-specific answer?</p><h2>Send the construction and the decision you need confirmed.</h2></div><div><a class="button help-button-dark" href="mailto:${company.email}?subject=${encodeURIComponent(category.title)}%20question">Ask engineering <span>↗</span></a><a class="help-cta-link" href="/#quote">Start an RFQ <span>→</span></a></div></div></section>
  </main>`;
  return pageShell(page, main);
}

function renderArticle(article) {
  const category = categoryBySlug.get(article.category);
  const path = articleHref(article);
  const title = `${article.title} | HXLFAB`;
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Help Center", href: "/help-center/" }, { label: category.title, href: categoryHref(category) }, { label: article.title }];
  const page = {
    path,
    title,
    description: article.description,
    ogType: "article",
    breadcrumbs: breadcrumbItems,
    schema: {
      "@type": "TechArticle",
      "@id": `${siteUrl}${path}#article`,
      headline: article.title,
      description: article.description,
      url: `${siteUrl}${path}`,
      mainEntityOfPage: `${siteUrl}${path}`,
      dateModified: helpCenterMeta.reviewedDateIso,
      datePublished: helpCenterMeta.reviewedDateIso,
      author: { "@id": `${siteUrl}/#organization` },
      publisher: { "@id": `${siteUrl}/#organization` },
      about: "Printed circuit board manufacturing",
    },
  };
  const related = article.related.map((slug) => articleBySlug.get(slug));
  const sectionLinks = article.sections.map((section) => ({ id: headingId(section.heading), title: section.heading }));
  const main = `<main id="main-content">
    <section class="help-article-hero"><div class="shell">${breadcrumbs(breadcrumbItems)}<div class="help-article-hero-grid"><div><p class="eyebrow">${escapeHtml(category.title)}</p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.summary)}</p><div class="help-review-date"><span aria-hidden="true">✓</span> Reviewed <time datetime="${helpCenterMeta.reviewedDateIso}">${escapeHtml(helpCenterMeta.reviewedDate)}</time></div></div>${searchForm()}</div></div></section>
    <section class="help-article-section"><div class="shell help-article-layout"><aside class="help-article-aside"><div><p>In this answer</p><nav>${sectionLinks.map((section) => `<a href="#${section.id}">${escapeHtml(section.title)}</a>`).join("")}</nav></div><a class="help-back-category" href="${categoryHref(category)}"><span aria-hidden="true">←</span> All ${escapeHtml(category.title)} answers</a></aside><article class="help-article-body"><div class="help-direct-answer"><span>Direct answer</span><p>${escapeHtml(article.answer)}</p></div>${article.sections.map((section) => `<section id="${headingId(section.heading)}"><h2>${escapeHtml(section.heading)}</h2>${(section.paragraphs ?? []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}${section.bullets?.length ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}</section>`).join("")}<div class="help-resource-box"><h2>Next useful step</h2><div>${article.resources.map((resource) => `<a href="${resource.href}">${escapeHtml(resource.label)} <span aria-hidden="true">→</span></a>`).join("")}</div><p>Final capability, commercial terms, and project records are confirmed against the actual RFQ and written project documents.</p></div></article></div></section>
    <section class="help-related"><div class="shell"><div class="help-section-heading"><div><p class="eyebrow">Related answers</p><h2>Continue the review.</h2></div><a href="${categoryHref(category)}">Browse ${escapeHtml(category.title)} <span aria-hidden="true">→</span></a></div><div class="help-article-grid">${related.map((item) => articleCard(item)).join("")}</div></div></section>
    <section class="help-cta"><div class="shell help-cta-inner"><div><p class="eyebrow dark">Need this applied to your board?</p><h2>Send the actual data for an engineer-confirmed answer.</h2></div><div><a class="button help-button-dark" href="mailto:${company.email}?subject=${encodeURIComponent(article.title)}">Ask engineering <span>↗</span></a><a class="help-cta-link" href="/#quote">Start an RFQ <span>→</span></a></div></div></section>
  </main>`;
  return pageShell(page, main);
}

validateData();
await rm(helpDir, { recursive: true, force: true });
await mkdir(helpDir, { recursive: true });
await writeFile(join(helpDir, "index.html"), renderHome());

for (const category of helpCategories) {
  const directory = join(helpDir, category.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.html"), renderCategory(category));
}

for (const article of helpArticles) {
  const directory = join(helpDir, "articles", article.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.html"), renderArticle(article));
}

console.log(`Generated HXLFAB Help Center: ${helpCategories.length} categories and ${helpArticles.length} articles.`);
