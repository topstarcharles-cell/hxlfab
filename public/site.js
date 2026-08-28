(() => {
  const nav = document.querySelector(".nav");
  if (!nav || document.querySelector(".menu-toggle")) return;

  const menuId = "mobileSiteMenu";
  const toggle = document.createElement("button");
  toggle.className = "menu-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", menuId);
  toggle.setAttribute("aria-label", "Open site menu");
  toggle.innerHTML = "<span></span><span></span><span></span>";

  const menu = document.createElement("div");
  menu.id = menuId;
  menu.className = "mobile-menu";
  menu.setAttribute("aria-hidden", "true");
  menu.setAttribute("inert", "");
  menu.hidden = true;
  menu.innerHTML = `
    <button class="mobile-menu-backdrop" type="button" aria-label="Close site menu"></button>
    <div class="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="Site navigation">
      <div class="mobile-menu-head">
        <span>Explore HXLFAB</span>
        <button class="mobile-menu-close" type="button" aria-label="Close site menu">Close ×</button>
      </div>
      <nav aria-label="Mobile navigation">
        <a href="/pcb-manufacturing/"><span>01</span>PCB Manufacturing</a>
        <a href="/quality-certifications/"><span>02</span>Quality & Certifications</a>
        <a href="/factory-process/"><span>03</span>Factory & Process</a>
        <a href="/engineering-scenarios/"><span>04</span>Engineering Scenarios</a>
        <a href="/help-center/"><span>05</span>Help Center</a>
        <a href="/working-with-us/"><span>06</span>Working With Us</a>
        <a href="/about/"><span>07</span>About & Team</a>
        <a href="/contact/"><span>08</span>Contact</a>
      </nav>
      <div class="mobile-menu-actions">
        <a href="mailto:sales@hxlfab.com?subject=PCB%20engineering%20question">Email engineering</a>
        <a class="button" href="/#quote">Start an RFQ <span>↗</span></a>
      </div>
    </div>`;

  nav.append(toggle);
  document.body.append(menu);

  const closeButton = menu.querySelector(".mobile-menu-close");
  const backdrop = menu.querySelector(".mobile-menu-backdrop");
  let previousFocus = null;

  function setOpen(open) {
    if (open) menu.hidden = false;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close site menu" : "Open site menu");
    menu.setAttribute("aria-hidden", String(!open));
    menu.toggleAttribute("inert", !open);
    menu.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    if (open) {
      previousFocus = document.activeElement;
      closeButton?.focus();
    } else {
      menu.hidden = true;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    }
  }

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  closeButton?.addEventListener("click", () => setOpen(false));
  backdrop?.addEventListener("click", () => setOpen(false));
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    if (event.key === "Escape" && open) setOpen(false);
    if (event.key !== "Tab" || !open) return;
    const focusable = [...menu.querySelectorAll("a, button")].filter((element) => !element.hasAttribute("disabled"));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  const mobileActions = document.createElement("nav");
  mobileActions.className = "mobile-sticky-actions";
  mobileActions.setAttribute("aria-label", "Quick contact");
  mobileActions.innerHTML = `
    <a href="mailto:sales@hxlfab.com?subject=PCB%20engineering%20question">Ask engineering</a>
    <a href="/#quote">Start RFQ <span>↗</span></a>`;
  document.body.append(mobileActions);
})();

(() => {
  const panel = document.querySelector(".market-pulse");
  if (!panel) return;

  const byId = (id) => document.getElementById(id);
  const formatMonth = (value) => new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
  const formatDate = (value) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value));
  const trustedArticleUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : null;
    } catch { return null; }
  };

  function renderChart(points) {
    const svg = byId("copperChart");
    if (!svg || !Array.isArray(points) || points.length < 2) return;
    const width = 360;
    const height = 150;
    const pad = 10;
    const values = points.map((point) => Number(point.value)).filter(Number.isFinite);
    const low = Math.min(...values);
    const high = Math.max(...values);
    const span = high - low || 1;
    const coordinates = values.map((value, index) => ({
      x: pad + (index / (values.length - 1)) * (width - pad * 2),
      y: pad + ((high - value) / span) * (height - pad * 2),
    }));
    const ns = "http://www.w3.org/2000/svg";
    svg.replaceChildren();
    [38, 75, 112].forEach((y) => {
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", "0"); line.setAttribute("x2", String(width)); line.setAttribute("y1", String(y)); line.setAttribute("y2", String(y));
      line.setAttribute("stroke", "rgba(6,21,28,.12)"); line.setAttribute("stroke-width", "1");
      svg.append(line);
    });
    const area = document.createElementNS(ns, "path");
    const path = coordinates.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
    area.setAttribute("d", `${path} L${coordinates.at(-1).x.toFixed(1)} ${height} L${coordinates[0].x.toFixed(1)} ${height} Z`);
    area.setAttribute("fill", "rgba(12,143,151,.11)");
    const line = document.createElementNS(ns, "path");
    line.setAttribute("d", path); line.setAttribute("fill", "none"); line.setAttribute("stroke", "#0c8f97"); line.setAttribute("stroke-width", "3"); line.setAttribute("stroke-linecap", "square"); line.setAttribute("stroke-linejoin", "miter");
    const last = coordinates.at(-1);
    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("cx", String(last.x)); dot.setAttribute("cy", String(last.y)); dot.setAttribute("r", "4"); dot.setAttribute("fill", "#d87b43"); dot.setAttribute("stroke", "#fff"); dot.setAttribute("stroke-width", "2");
    svg.append(area, line, dot);
    svg.setAttribute("aria-label", `Copper benchmark trend from ${formatMonth(points[0].date)} to ${formatMonth(points.at(-1).date)}`);
  }

  function renderNews(news) {
    const list = byId("industryNewsList");
    if (!list) return;
    list.replaceChildren();
    news.slice(0, 4).forEach((item) => {
      const href = trustedArticleUrl(item.url);
      if (!href) return;
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = href; link.target = "_blank"; link.rel = "noopener noreferrer";
      const meta = document.createElement("span");
      meta.className = "news-meta";
      const source = document.createElement("span"); source.textContent = item.source;
      const time = document.createElement("time"); time.dateTime = item.publishedAt; time.textContent = formatDate(item.publishedAt);
      const title = document.createElement("strong"); title.textContent = item.title;
      const arrow = document.createElement("b"); arrow.textContent = "↗"; arrow.setAttribute("aria-hidden", "true");
      meta.append(source, time); link.append(meta, title, arrow); li.append(link); list.append(li);
    });
    if (!list.children.length) {
      const li = document.createElement("li"); li.className = "pulse-loading"; li.textContent = "No current industry updates are available."; list.append(li);
    }
  }

  async function loadPulse() {
    try {
      const response = await fetch("/data/industry-pulse.json", { cache: "no-store", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Market data request failed (${response.status})`);
      const data = await response.json();
      const copper = data.copper;
      byId("pulseUpdated").textContent = `Source update · ${formatDate(data.updatedAt)}`;
      byId("copperValue").textContent = Number(copper.latest).toLocaleString("en-US", { maximumFractionDigits: 0 });
      byId("copperUnit").textContent = `${copper.currency} / metric ton · monthly`;
      const change = Number(copper.changePct);
      const changeNode = byId("copperChange");
      changeNode.textContent = `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}% over ${copper.trend.length - 1} months`;
      changeNode.classList.toggle("down", change < 0);
      byId("chartStart").textContent = formatMonth(copper.trend[0].date);
      byId("chartEnd").textContent = formatMonth(copper.trend.at(-1).date);
      byId("marketSources").textContent = `Copper: ${copper.source.name}. News: ${data.newsSources.join(" + ")}. General market awareness only; not purchasing or financial advice.`;
      renderChart(copper.trend);
      renderNews(data.news || []);
    } catch (error) {
      byId("pulseUpdated").textContent = "Update temporarily unavailable";
      const list = byId("industryNewsList");
      if (list) {
        list.replaceChildren();
        const li = document.createElement("li"); li.className = "pulse-loading"; li.textContent = "The latest feed could not be loaded. Please check again later."; list.append(li);
      }
      console.warn("Industry pulse:", error);
    }
  }

  loadPulse();
})();
