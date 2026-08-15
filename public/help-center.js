(() => {
  function addHelpCenterToMobileMenu() {
    const mobileNav = document.querySelector(".mobile-menu nav");
    if (!mobileNav) return;
    const existingHelpLink = mobileNav.querySelector('a[href="/help-center/"]');
    if (existingHelpLink) {
      existingHelpLink.setAttribute("aria-current", "page");
      return;
    }

    const helpLink = document.createElement("a");
    helpLink.href = "/help-center/";
    helpLink.setAttribute("aria-current", "page");
    const number = document.createElement("span");
    helpLink.append(number, "Help Center");

    const workingLink = mobileNav.querySelector('a[href="/working-with-us/"]');
    mobileNav.insertBefore(helpLink, workingLink);
    mobileNav.querySelectorAll(":scope > a").forEach((link, index) => {
      const label = link.querySelector("span");
      if (label) label.textContent = String(index + 1).padStart(2, "0");
    });
  }

  addHelpCenterToMobileMenu();

  const page = document.querySelector("[data-help-center-index]");
  const form = document.querySelector("[data-help-search-form]");
  const input = document.querySelector("[data-help-search-input]");
  const resultsSection = document.querySelector("[data-help-search-results]");
  const resultsGrid = document.querySelector("[data-help-results-grid]");
  const status = document.querySelector("[data-help-results-status]");
  const resultsHeading = document.querySelector("#helpResultsHeading");
  const browseContent = document.querySelector("[data-help-browse-content]");
  const clearButton = document.querySelector("[data-help-clear-search]");
  const dataElement = document.querySelector("#help-search-data");
  if (!page || !form || !input || !resultsSection || !resultsGrid || !status || !browseContent || !dataElement) return;

  let articles = [];
  try {
    articles = JSON.parse(dataElement.textContent || "[]");
  } catch {
    status.textContent = "Search is temporarily unavailable. Browse the topics below.";
    return;
  }

  const normalize = (value) => String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .trim();

  const indexedArticles = articles.map((article) => ({
    ...article,
    normalizedTitle: normalize(article.title),
    normalizedSummary: normalize(article.summary),
    normalizedCategory: normalize(article.category),
    normalizedKeywords: normalize((article.keywords || []).join(" ")),
  }));

  function scoreArticle(article, rawQuery) {
    const query = normalize(rawQuery);
    if (!query) return 0;
    const terms = [...new Set(query.split(/\s+/).filter(Boolean))];
    const allText = `${article.normalizedTitle} ${article.normalizedSummary} ${article.normalizedCategory} ${article.normalizedKeywords}`;
    if (!terms.every((term) => allText.includes(term))) return 0;

    let score = 1;
    if (article.normalizedTitle === query) score += 120;
    else if (article.normalizedTitle.startsWith(query)) score += 70;
    else if (article.normalizedTitle.includes(query)) score += 48;
    if (article.normalizedKeywords.includes(query)) score += 30;
    if (article.normalizedCategory.includes(query)) score += 18;
    if (article.normalizedSummary.includes(query)) score += 12;

    for (const term of terms) {
      if (article.normalizedTitle.includes(term)) score += 16;
      if (article.normalizedKeywords.includes(term)) score += 9;
      if (article.normalizedCategory.includes(term)) score += 5;
      if (article.normalizedSummary.includes(term)) score += 3;
    }
    return score;
  }

  function resultCard(article) {
    const card = document.createElement("article");
    card.className = "help-result-card";

    const category = document.createElement("span");
    category.textContent = article.category;

    const heading = document.createElement("h3");
    const link = document.createElement("a");
    link.href = article.href;
    link.textContent = article.title;
    heading.append(link);

    const summary = document.createElement("p");
    summary.textContent = article.summary;
    card.append(category, heading, summary);
    return card;
  }

  function updateUrl(query) {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function showBrowse() {
    resultsSection.hidden = true;
    browseContent.hidden = false;
    resultsGrid.replaceChildren();
    status.textContent = "";
  }

  function renderSearch(rawQuery, { updateHistory = true, focusHeading = false } = {}) {
    const query = rawQuery.trim().slice(0, 120);
    input.value = query;
    if (updateHistory) updateUrl(query);
    if (!query) {
      showBrowse();
      return;
    }

    const matches = indexedArticles
      .map((article) => ({ article, score: scoreArticle(article, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title))
      .map((entry) => entry.article);

    browseContent.hidden = true;
    resultsSection.hidden = false;
    resultsGrid.replaceChildren();
    status.textContent = `${matches.length} ${matches.length === 1 ? "answer" : "answers"} for “${query}”.`;

    if (matches.length) {
      const fragment = document.createDocumentFragment();
      matches.forEach((article) => fragment.append(resultCard(article)));
      resultsGrid.append(fragment);
    } else {
      const empty = document.createElement("div");
      empty.className = "help-empty-results";
      const heading = document.createElement("h3");
      heading.textContent = "No exact answer found";
      const guidance = document.createElement("p");
      guidance.textContent = "Try a shorter term such as Gerber, impedance, certificate, MOQ, upload, or NDA—or clear the search to browse all topics.";
      empty.append(heading, guidance);
      resultsGrid.append(empty);
    }

    if (focusHeading) resultsHeading?.focus({ preventScroll: true });
  }

  let inputTimer;
  input.addEventListener("input", () => {
    window.clearTimeout(inputTimer);
    inputTimer = window.setTimeout(() => renderSearch(input.value), 180);
  });

  input.addEventListener("search", () => renderSearch(input.value));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.clearTimeout(inputTimer);
    renderSearch(input.value, { focusHeading: true });
  });

  clearButton?.addEventListener("click", () => {
    renderSearch("");
    input.focus();
  });

  window.addEventListener("popstate", () => {
    const query = new URL(window.location.href).searchParams.get("q") || "";
    renderSearch(query, { updateHistory: false });
  });

  const initialQuery = new URL(window.location.href).searchParams.get("q") || "";
  if (initialQuery) renderSearch(initialQuery, { updateHistory: false });
})();
