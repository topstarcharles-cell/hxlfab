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
        <a href="/working-with-us/"><span>05</span>Working With Us</a>
        <a href="/about/"><span>06</span>About & Team</a>
        <a href="/contact/"><span>07</span>Contact</a>
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
