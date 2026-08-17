import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const publicDir = new URL("../public/", import.meta.url).pathname;
const siteUrl = "https://hxlfab.com";
const company = {
  legalName: "Guilin Hengxinlong Electronic Technology Co., Ltd.",
  email: "sales@hxlfab.com",
  contactName: "Charles Liu",
  contactEmail: "charles@hxlfab.com",
  phone: "+86 138 2366 3114",
};

function link(slug, href, label) {
  return `<a href="${href}"${slug === href.replaceAll("/", "") ? ' aria-current="page"' : ""}>${label}</a>`;
}

function siteHeader(slug) {
  return `
  <div class="utility"><div class="shell utility-inner"><span>PCB manufacturing · Guilin production base · Shenzhen service office</span><a href="mailto:${company.email}">${company.email}</a></div></div>
  <header class="header"><div class="shell nav">
    <a class="brand" href="/" aria-label="HXLFAB home"><span class="brand-bars"><i></i><i></i><i></i></span><span>HXL<strong>FAB</strong></span></a>
    <nav aria-label="Main navigation">${link(slug, "/pcb-manufacturing/", "Manufacturing")}${link(slug, "/quality-certifications/", "Quality")}${link(slug, "/factory-process/", "Factory")}${link(slug, "/engineering-scenarios/", "Engineering reviews")}${link(slug, "/help-center/", "Help")}${link(slug, "/about/", "About")}</nav>
    <a class="button small" href="/#quote">Start an RFQ <span>↗</span></a>
  </div></header>`;
}

function siteFooter() {
  return `
  <footer><div class="shell footer-grid">
    <div><a class="brand footer-brand" href="/"><span class="brand-bars"><i></i><i></i><i></i></span><span>HXL<strong>FAB</strong></span></a><p>PCB manufacturing brand<br>Guilin production base · Shenzhen service office</p></div>
    <div><span>Evidence</span><p><a href="/quality-certifications/">Quality & certifications</a><br><a href="/factory-process/">Factory & process</a><br><a href="/engineering-scenarios/">Engineering scenarios</a></p></div>
    <div><span>Working together</span><p><a href="/help-center/">Help center</a><br><a href="/working-with-us/">Working with us</a><br><a href="/about/">About & team</a><br><a href="/contact/">Contact engineering</a></p></div>
    <div><span>Contact</span><p>${company.contactName}<br>International customer contact<br><a href="mailto:${company.contactEmail}">${company.contactEmail}</a><br><a href="mailto:${company.email}">${company.email}</a><br><a href="tel:+8613823663114">${company.phone}</a></p></div>
  </div><div class="shell footer-bottom"><span>© 2026 HXLFAB. All rights reserved.</span><span><a href="/privacy-file-handling/">Privacy & file handling</a> · Technical data subject to engineering confirmation.</span></div></footer>`;
}

function head(page) {
  const canonical = `${siteUrl}/${page.slug}/`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "HXLFAB",
        url: `${siteUrl}/`,
        email: company.email,
        telephone: company.phone,
        contactPoint: {
          "@type": "ContactPoint",
          name: company.contactName,
          email: company.contactEmail,
          contactType: "international customer enquiries",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: page.title,
        description: page.description,
        about: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: page.h1, item: canonical },
        ],
      },
    ],
  });
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <meta name="theme-color" content="#08242e">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website"><meta property="og:site_name" content="HXLFAB"><meta property="og:title" content="${page.title}"><meta property="og:description" content="${page.description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${siteUrl}${page.image}">
  <link rel="stylesheet" href="/styles.css?v=20260815f"><link rel="stylesheet" href="/product-pages.css?v=20260815f"><link rel="stylesheet" href="/content-pages.css?v=20260815f">
  <script type="application/ld+json">${jsonLd}</script>
  <script src="/site.js?v=20260815f" defer></script>
</head>`;
}

function hero(page) {
  return `<section class="info-hero"><div class="shell">
    <p class="breadcrumbs"><a href="/">Home</a> / ${page.h1}</p>
    <div class="info-hero-grid"><div><span class="status-note">${page.status}</span><h1>${page.h1}</h1><p class="lede">${page.intro}</p><div class="info-hero-actions"><a class="button" href="${page.primaryHref}">${page.primaryLabel} <span>↗</span></a><a class="text-link" href="${page.secondaryHref}">${page.secondaryLabel} <span>→</span></a></div></div>
    <figure class="info-hero-media${page.mediaClass ? ` ${page.mediaClass}` : ""}"><img src="${page.image}" alt="${page.imageAlt}" width="${page.imageWidth ?? 1536}" height="${page.imageHeight ?? 1024}"><figcaption>${page.caption}</figcaption></figure></div>
  </div></section>`;
}

function render(page) {
  return `${head(page)}
<body>
${siteHeader(page.slug)}
<main>
${hero(page)}
${page.body}
</main>
${siteFooter()}
</body>
</html>`;
}

const quality = {
  slug: "quality-certifications",
  title: "PCB Quality & Certification Documents | HXLFAB",
  description: "Review HXLFAB quality controls, certification document status and the project-level records available for PCB supplier qualification.",
  h1: "Quality you can verify.",
  status: "Quality & supplier qualification",
  intro: "This page separates company-provided certification claims from the documents and project records that must be matched to a legal entity, site, scope and validity period.",
  image: "/images/automated-line.webp",
  imageAlt: "Company-supplied photograph of PCB production equipment",
  caption: "Company-supplied factory photograph · production equipment",
  primaryHref: "mailto:sales@hxlfab.com?subject=Request%20HXLFAB%20quality%20document%20pack",
  primaryLabel: "Request the quality pack",
  secondaryHref: "/working-with-us/",
  secondaryLabel: "See supplier onboarding",
  body: `
  <section class="page-section"><div class="shell"><div class="page-heading"><p class="eyebrow dark">Document status</p><h2>Certification claims are not a substitute for current documents.</h2><p>HXLFAB lists the following systems and approvals in its supplied company profile. A controlled copy should be reviewed for the exact legal entity, manufacturing address, scope, issuing body and validity before it is used in supplier qualification.</p></div>
    <div class="document-grid">
      <article class="document-card"><span>Quality management</span><h3>ISO 9001</h3><p>Request the current certificate, scope and site match for supplier review.</p><b class="document-status">Controlled copy on request</b><br><a href="mailto:sales@hxlfab.com?subject=Request%20current%20ISO%209001%20certificate">Request document →</a></article>
      <article class="document-card"><span>Environmental management</span><h3>ISO 14001</h3><p>Verify the covered entity, facility address, scope and expiry date against the source document.</p><b class="document-status">Controlled copy on request</b><br><a href="mailto:sales@hxlfab.com?subject=Request%20current%20ISO%2014001%20certificate">Request document →</a></article>
      <article class="document-card"><span>Automotive quality</span><h3>IATF 16949</h3><p>Automotive requirements are project-specific. Confirm certificate scope and customer-specific requirements before release.</p><b class="document-status">Controlled copy on request</b><br><a href="mailto:sales@hxlfab.com?subject=Request%20current%20IATF%2016949%20certificate">Request document →</a></article>
      <article class="document-card"><span>Product recognition</span><h3>UL</h3><p>The applicable UL file number and product scope must be confirmed for the requested construction.</p><b class="document-status">File details on request</b><br><a href="mailto:sales@hxlfab.com?subject=Request%20HXLFAB%20UL%20file%20details">Request details →</a></article>
      <article class="document-card"><span>Product conformity</span><h3>CQC</h3><p>Ask for the certificate and the exact product categories covered by the current approval.</p><b class="document-status">Scope confirmation required</b><br><a href="mailto:sales@hxlfab.com?subject=Request%20HXLFAB%20CQC%20document">Request document →</a></article>
      <article class="document-card"><span>Material compliance</span><h3>RoHS</h3><p>RoHS is handled as a material and declaration requirement, not as a management-system certificate.</p><b class="document-status">Confirm per material system</b><br><a href="mailto:sales@hxlfab.com?subject=Request%20HXLFAB%20RoHS%20material%20declaration">Request declaration →</a></article>
    </div>
    <p class="small-print">Public PDF downloads will only be added after the current copy is cleared for publication and matched to the stated entity, site, scope and validity. No certificate number or expiry date is invented on this page.</p>
  </div></section>
  <section class="page-section mist"><div class="shell"><div class="page-heading"><p class="eyebrow dark">Quality-control route</p><h2>Controls are defined around the build.</h2><p>The exact inspection plan depends on construction, material, acceptance criteria and customer requirements. These are the core control points described in the company profile.</p></div>
    <div class="process-list"><article><div><h3>Incoming material control</h3><p>Material identity, condition and project requirements are checked before release.</p></div></article><article><div><h3>CAM and DFM review</h3><p>Files, stack-up, feature limits, vias and test requirements are reviewed before routing.</p></div></article><article><div><h3>In-process inspection</h3><p>AOI and process checks are applied at the stages defined by the construction.</p></div></article><article><div><h3>Electrical testing</h3><p>Flying probe, fixture or four-wire testing is selected according to the agreed plan.</p></div></article><article><div><h3>Targeted verification</h3><p>Impedance measurement, line-width checks, microsection or TG testing may be specified.</p></div></article><article><div><h3>Final release</h3><p>Final inspection, documentation and packaging requirements are checked against the released build.</p></div></article></div>
  </div></section>
  <section class="page-section"><div class="shell"><div class="page-heading"><p class="eyebrow dark">Company-supplied inspection photographs</p><h2>Testing resources shown in the source profile.</h2><p>These images are cropped from the company-supplied profile. They show equipment categories, not a claim about model, quantity, calibration status or inclusion in every project control plan.</p></div>
    <div class="inspection-photo-grid"><figure><img src="/images/inspection-automatic-test.jpg" alt="Company-supplied photograph of automated PCB test equipment"><figcaption><strong>Automated electrical test</strong><span>Company-supplied photograph · source profile</span></figcaption></figure><figure><img src="/images/inspection-flying-probe.jpg" alt="Company-supplied photograph of flying-probe PCB test equipment"><figcaption><strong>Flying-probe test</strong><span>Company-supplied photograph · source profile</span></figcaption></figure><figure><img src="/images/inspection-hole-position.jpg" alt="Company-supplied photograph of PCB hole-position measurement equipment"><figcaption><strong>Hole-position measurement</strong><span>Company-supplied photograph · source profile</span></figcaption></figure><figure><img src="/images/inspection-tg.jpg" alt="Company-supplied photograph of PCB material TG test equipment"><figcaption><strong>TG material test</strong><span>Company-supplied photograph · source profile</span></figcaption></figure></div>
  </div></section>
  <section class="page-section dark"><div class="shell"><div class="page-heading"><p class="eyebrow">Project records</p><h2>Define the evidence before production.</h2><p>Depending on the agreed build and control plan, the project package may include electrical-test records, impedance measurements, microsection results, material declarations or a certificate of conformance. Availability is confirmed in writing at quotation.</p></div>
    <div class="evidence-grid"><article class="evidence-card"><span>Before quote</span><h3>Share acceptance criteria</h3><p>Identify the IPC class, test method, reporting format and any customer-specific controls.</p></article><article class="evidence-card"><span>At quotation</span><h3>Confirm included records</h3><p>The quotation should state which reports, coupons, samples or declarations are included.</p></article><article class="evidence-card"><span>Before release</span><h3>Lock revision and scope</h3><p>File revision, material, construction and inspection requirements must be aligned before production.</p></article></div>
  </div></section>
  <section class="cta-band"><div class="shell cta-band-inner"><h2>Need a supplier-qualification package?</h2><a class="button" href="mailto:sales@hxlfab.com?subject=Request%20HXLFAB%20supplier%20qualification%20pack">Request documents <span>↗</span></a></div></section>`,
};

const factory = {
  slug: "factory-process",
  title: "PCB Factory & Manufacturing Process | HXLFAB",
  description: "See company-supplied PCB factory photographs and the engineering route from RFQ review through fabrication, testing and final inspection.",
  h1: "See how an RFQ becomes a production plan.",
  status: "Factory & manufacturing process",
  intro: "Process routes vary by board construction. This page shows the review and manufacturing stages that may apply, together with clearly labeled company-supplied photographs and representative product visuals.",
  image: "/images/plating-line.webp",
  imageAlt: "Company-supplied photograph of a PCB plating production line",
  caption: "Company-supplied factory photograph · plating line",
  primaryHref: "/#quote",
  primaryLabel: "Start an RFQ",
  secondaryHref: "/quality-certifications/",
  secondaryLabel: "Review quality controls",
  body: `
  <section class="page-section"><div class="shell"><div class="page-heading"><p class="eyebrow dark">Manufacturing route</p><h2>The route starts with the actual data.</h2><p>No single process flow applies to every board. Layer count, material, via structure, copper, impedance, surface finish, testing and volume determine which stages and controls are required.</p></div>
    <div class="process-list"><article><div><h3>Data intake</h3><p>Gerber or ODB++, drill data, fabrication notes, stack-up and quantity are checked for completeness.</p></div></article><article><div><h3>CAM and DFM</h3><p>Manufacturability, copper distribution, drill relationships and required tolerances are reviewed.</p></div></article><article><div><h3>Stack-up and material</h3><p>Construction, laminate, copper, finished thickness and controlled features are aligned.</p></div></article><article><div><h3>Inner-layer processing</h3><p>Imaging, etching and inner-layer inspection are routed according to the construction.</p></div></article><article><div><h3>Lamination</h3><p>Layer build, material behavior and sequential requirements are controlled for the agreed route.</p></div></article><article><div><h3>Drilling or laser processing</h3><p>Mechanical holes, microvias and related preparation are selected from the released data.</p></div></article><article><div><h3>Plating and outer layers</h3><p>Hole-wall and pattern formation controls are applied for the specified copper construction.</p></div></article><article><div><h3>Solder mask and finish</h3><p>Mask, legend and surface finish are produced to the fabrication specification.</p></div></article><article><div><h3>Test and inspection</h3><p>Electrical test and any specified impedance, microsection or other verification are completed.</p></div></article><article><div><h3>Release and packing</h3><p>Final inspection, project records and packing requirements are checked before shipment.</p></div></article></div>
  </div></section>
  <section class="page-section mist factory-motion"><div class="shell"><div class="page-heading"><p class="eyebrow dark">Company-supplied on-site video</p><h2>Factory in motion.</h2><p>Three short, silent clips show the production environment, automated panel handling and inspection workstations. They are presented as on-site visual evidence; equipment model, quantity and process scope are confirmed separately during technical review.</p></div>
    <div class="video-evidence-grid">
      <figure class="video-evidence-card"><video controls playsinline preload="none" poster="/images/video-yellow-light-production-area.jpg" width="960" height="540" aria-label="Silent factory video showing a yellow-light-controlled production area"><source src="/videos/yellow-light-production-area.mp4" type="video/mp4"><a href="/videos/yellow-light-production-area.mp4">Open the yellow-light production area video</a></video><figcaption><span class="video-kicker">Production environment · 14 sec</span><strong>Yellow-light controlled production area</strong><p>Enclosed panel-processing equipment and operators loading panels in a controlled-light area.</p><small>Company-supplied on-site video · silent footage</small></figcaption></figure>
      <figure class="video-evidence-card"><video controls playsinline preload="none" poster="/images/video-automated-panel-handling.jpg" width="960" height="540" aria-label="Silent factory video showing automated PCB panel handling"><source src="/videos/automated-panel-handling.mp4" type="video/mp4"><a href="/videos/automated-panel-handling.mp4">Open the automated panel handling video</a></video><figcaption><span class="video-kicker">Automation · 11 sec</span><strong>Automated panel handling</strong><p>A robotic arm transfers PCB panels across a protected roller bed between process steps.</p><small>Company-supplied on-site video · silent footage</small></figcaption></figure>
      <figure class="video-evidence-card"><video controls playsinline preload="none" poster="/images/video-panel-inspection-review.jpg" width="960" height="540" aria-label="Silent factory video showing operators at PCB panel inspection review stations"><source src="/videos/panel-inspection-review.mp4" type="video/mp4"><a href="/videos/panel-inspection-review.mp4">Open the panel inspection review video</a></video><figcaption><span class="video-kicker">Inspection · 21 sec</span><strong>Inspection review stations</strong><p>Operators review PCB panels at computer-assisted inspection stations and dedicated workstations.</p><small>Company-supplied on-site video · silent footage</small></figcaption></figure>
    </div>
  </div></section>
  <section class="page-section dark"><div class="shell"><div class="page-heading"><p class="eyebrow">Company-supplied photographs</p><h2>Factory imagery, labeled by source.</h2><p>These photographs were supplied with the website project as factory imagery. Equipment model, count and calibration records are confirmed separately during technical or supplier review.</p></div>
    <div class="photo-evidence-grid"><figure class="evidence-photo factory-exterior"><img src="/images/guilin-production-base.jpg" alt="Company-supplied exterior photograph of the Guilin production base building with Hengxinlong signage" width="1050" height="1000" loading="lazy" decoding="async"><figcaption>Company-supplied exterior photograph · Guilin production base</figcaption></figure><figure class="evidence-photo"><img src="/images/automated-line.webp" alt="Company-supplied photograph of automated PCB production equipment"><figcaption>Company-supplied factory photograph · automated line</figcaption></figure><figure class="evidence-photo"><img src="/images/cnc-drilling.webp" alt="Company-supplied photograph of multi-spindle PCB drilling equipment"><figcaption>Company-supplied factory photograph · CNC drilling</figcaption></figure></div>
    <div class="inspection-heading"><h3>Inspection and test evidence</h3><p>Cropped from the supplied company profile; model, quantity and calibration status are confirmed during supplier review.</p></div>
    <div class="inspection-photo-grid dark-cards"><figure><img src="/images/inspection-automatic-test.jpg" alt="Company-supplied photograph of automated PCB test equipment"><figcaption><strong>Automated electrical test</strong><span>Company-supplied photograph</span></figcaption></figure><figure><img src="/images/inspection-flying-probe.jpg" alt="Company-supplied photograph of flying-probe PCB test equipment"><figcaption><strong>Flying-probe test</strong><span>Company-supplied photograph</span></figcaption></figure><figure><img src="/images/inspection-hole-position.jpg" alt="Company-supplied photograph of PCB hole-position measurement equipment"><figcaption><strong>Hole-position measurement</strong><span>Company-supplied photograph</span></figcaption></figure><figure><img src="/images/inspection-tg.jpg" alt="Company-supplied photograph of PCB material TG test equipment"><figcaption><strong>TG material test</strong><span>Company-supplied photograph</span></figcaption></figure></div>
  </div></section>
  <section class="page-section mist"><div class="shell"><div class="page-heading"><p class="eyebrow dark">Representative board constructions</p><h2>Visuals for orientation—not production evidence.</h2><p>The following AI-generated product visuals help explain three technology paths. They are not customer boards, factory photographs, inspection evidence or claims of completed production.</p></div>
    <div class="visual-grid"><figure><img src="/images/representative-hdi.jpg" alt="Representative AI-generated visualization of a bare HDI PCB"><figcaption><strong>HDI / microvia</strong><span>Representative visualization — not a customer board.</span></figcaption></figure><figure><img src="/images/representative-rf.jpg" alt="Representative AI-generated visualization of a mixed-material RF PCB"><figcaption><strong>RF / mixed material</strong><span>Representative visualization — not a customer board.</span></figcaption></figure><figure><img src="/images/representative-heavy-copper.jpg" alt="Representative AI-generated visualization of a heavy-copper PCB"><figcaption><strong>Heavy copper</strong><span>Representative visualization — not a customer board.</span></figcaption></figure></div>
  </div></section>
  <section class="cta-band"><div class="shell cta-band-inner"><h2>Share the construction you need reviewed.</h2><a class="button" href="/#quote">Start an RFQ <span>↗</span></a></div></section>`,
};

const scenarios = {
  slug: "engineering-scenarios",
  title: "Representative PCB Engineering Scenarios | HXLFAB",
  description: "See how controlled-impedance, HDI and heavy-copper PCB requirements are reviewed before an engineer-confirmed quotation.",
  h1: "Engineering questions before production claims.",
  status: "Representative engineering scenarios",
  intro: "These scenarios show the inputs reviewed, manufacturing questions raised and expected engineering deliverables. They do not claim a named customer, delivery result, yield or completed production order.",
  image: "/images/representative-hdi.jpg",
  imageAlt: "Representative AI-generated visualization of a bare HDI PCB",
  caption: "Representative visualization · not a customer board",
  primaryHref: "/#quote",
  primaryLabel: "Request a design review",
  secondaryHref: "/working-with-us/",
  secondaryLabel: "See the commercial process",
  body: `
  <section class="page-section"><div class="shell"><div class="disclosure"><strong>Transparent status:</strong> These are representative engineering scenarios built from the capability boundaries published on this website. They are not anonymized customer case studies. A scenario becomes a production case study only after the actual project record, dates, quantity, results and publication permission are verified.</div>
    <div class="scenario-list">
      <article class="scenario"><figure class="scenario-media"><img src="/images/representative-rf.jpg" alt="Representative AI-generated visualization of a controlled-impedance RF PCB"><figcaption>Representative visualization — not a customer board or factory photograph.</figcaption></figure><div class="scenario-copy"><span>Scenario 01 · Controlled impedance</span><h2>Mixed-material RF stack-up</h2><p>A high-frequency design requires a manufacturable construction while preserving material intent, controlled impedance and critical transmission-line geometry.</p><h3>Engineering review focuses on</h3><ul><li>Specified laminate grade and permitted alternatives</li><li>Reference layers, dielectric assumptions and copper profile</li><li>Single-ended or differential targets and tolerances</li><li>Critical line geometry, plating and surface finish</li><li>Coupon design and impedance measurement plan</li></ul><div class="scenario-output"><strong>Expected review output</strong>Engineer-confirmed construction assumptions, DFM questions, impedance plan and quotation conditions.</div><dl class="scenario-meta"><div><dt>Quantity</dt><dd>Defined per RFQ</dd></div><div><dt>Lead time</dt><dd>Confirmed after DFM, material and capacity review</dd></div><div><dt>Production result</dt><dd>Not claimed in this representative scenario</dd></div></dl></div></article>
      <article class="scenario"><figure class="scenario-media"><img src="/images/representative-hdi.jpg" alt="Representative AI-generated visualization of a fine-pitch HDI PCB"><figcaption>Representative visualization — not a customer board or factory photograph.</figcaption></figure><div class="scenario-copy"><span>Scenario 02 · HDI / microvia</span><h2>Fine-pitch module with microvias</h2><p>A compact layout uses microvias or via-in-pad structures to escape a fine-pitch device while controlling registration, copper balance and fill requirements.</p><h3>Engineering review focuses on</h3><ul><li>Blind and buried via transitions</li><li>Stacked or staggered microvia construction</li><li>Laser-via, capture-pad and target-pad geometry</li><li>Resin fill, capping and sequential lamination</li><li>AOI, microsection and electrical-test requirements</li></ul><div class="scenario-output"><strong>Expected review output</strong>A feasible via and lamination route, identified design exceptions, inspection assumptions and commercial inputs. Actual capability is confirmed from the released data.</div><dl class="scenario-meta"><div><dt>Quantity</dt><dd>Defined per RFQ</dd></div><div><dt>Lead time</dt><dd>Confirmed after DFM, material and capacity review</dd></div><div><dt>Production result</dt><dd>Not claimed in this representative scenario</dd></div></dl></div></article>
      <article class="scenario"><figure class="scenario-media"><img src="/images/representative-heavy-copper.jpg" alt="Representative AI-generated visualization of a heavy-copper PCB"><figcaption>Representative visualization — not a customer board or factory photograph.</figcaption></figure><div class="scenario-copy"><span>Scenario 03 · Heavy copper</span><h2>Power-control board with thick copper</h2><p>A power design must balance current and thermal intent with etching limits, conductor clearance, hole-wall requirements and finished thickness.</p><h3>Engineering review focuses on</h3><ul><li>Inner- and outer-layer copper requirement</li><li>Minimum conductor width and clearance</li><li>Copper distribution, thermal transitions and resin fill</li><li>Finished holes, annular rings and plating requirements</li><li>Surface finish, electrical test and microsection plan</li></ul><div class="scenario-output"><strong>Expected review output</strong>Design-rule exceptions, a proposed heavy-copper route, test assumptions and quotation scope.</div><dl class="scenario-meta"><div><dt>Quantity</dt><dd>Defined per RFQ</dd></div><div><dt>Lead time</dt><dd>Confirmed after DFM, material and capacity review</dd></div><div><dt>Production result</dt><dd>Not claimed in this representative scenario</dd></div></dl></div></article>
    </div>
  </div></section>
  <section class="cta-band"><div class="shell cta-band-inner"><h2>Turn your files into a project-specific review.</h2><a class="button" href="/#quote">Upload production data <span>↗</span></a></div></section>`,
};

const working = {
  slug: "working-with-us",
  title: "PCB Quotation, Lead Time & File Process | HXLFAB",
  description: "Understand HXLFAB quotation assumptions, MOQ and lead-time confirmation, shipping terms, change control, NDA requests and private PCB file handling.",
  h1: "Commercial clarity before production.",
  status: "Working with HXLFAB",
  intro: "A useful quotation records the assumptions that apply to your build. Material availability, panel utilization, testing, special processes and production load can change the answer.",
  image: "/images/cam-production.webp",
  imageAlt: "Company-supplied photograph of PCB production preparation",
  caption: "Company-supplied factory photograph · production preparation",
  primaryHref: "/#quote",
  primaryLabel: "Start a secure RFQ",
  secondaryHref: "/contact/",
  secondaryLabel: "Ask a question first",
  body: `
  <section class="page-section"><div class="shell"><div class="page-heading"><p class="eyebrow dark">Commercial checkpoints</p><h2>What is confirmed—and when.</h2><p>HXLFAB does not publish an unverified universal price, MOQ or lead time. The written quotation should define the conditions that apply to the submitted construction and quantity.</p></div>
    <div class="policy-grid"><article class="policy-card"><span>Quotation timing</span><h3>Starts with file completeness</h3><p>Expected review timing is confirmed after checking the available files and technical inputs. Include any fixed decision or delivery date.</p></article><article class="policy-card"><span>MOQ & quantity</span><h3>Program-specific</h3><p>Prototype, pilot and production quantities are quoted against the board construction, material and required process route.</p></article><article class="policy-card"><span>Lead time</span><h3>Confirmed after review</h3><p>Schedule is issued after files, stack-up, material availability, testing requirements, capacity and commercial terms are aligned.</p></article><article class="policy-card"><span>Shipping</span><h3>Written into the quote</h3><p>Incoterm, carrier, destination, packing method and customs responsibility should be stated in the quotation or order confirmation.</p></article><article class="policy-card"><span>Payment</span><h3>Project terms control</h3><p>Payment method and timing are confirmed in the commercial quotation. No website text overrides the written terms.</p></article><article class="policy-card"><span>Change control</span><h3>Revision before release</h3><p>Changes to files, stack-up, material, quantity or testing may affect price and schedule. The released revision is identified before production.</p></article></div>
  </div></section>
  <section class="page-section mist"><div class="shell"><div class="content-split"><div class="long-copy"><p class="eyebrow dark">From first contact to release</p><h2>Two ways to begin.</h2><h3>Ask a question first</h3><p>If files are not ready, email the sales engineering team with the board type, estimated layer count, quantity, target date and the issue you want reviewed. No upload is required for the first conversation.</p><h3>Submit a secure RFQ</h3><p>The RFQ form captures the board configuration, contact details and production files. A traceable RFQ number is created, uploaded files are stored outside the public website and the quotation team receives controlled access links.</p><h3>Before uploading restricted data</h3><p>If an NDA, export-control review, government-program restriction or customer-specific data workflow applies, contact HXLFAB before uploading. Project-specific access, retention and deletion requirements should be agreed in writing.</p></div><aside class="side-note"><p class="eyebrow">First-contact checklist</p><h2>Start with what you have.</h2><p>Files help, but they are not required for the first question.</p><ul><li>Board type and layer count</li><li>Quantity or volume range</li><li>Material, via or impedance needs</li><li>Target decision or delivery date</li><li>Gerber / ODB++ readiness</li></ul><a class="button" href="mailto:sales@hxlfab.com?subject=PCB%20project%20question">Email engineering <span>↗</span></a></aside></div></div></section>
  <section class="page-section dark"><div class="shell"><div class="page-heading"><p class="eyebrow">Secure file route</p><h2>What the current RFQ system does.</h2><p>The production upload workflow creates a random RFQ identifier, uses token-controlled upload and download access, stores files in private object storage and schedules production files for deletion after 60 days. Links are intended only for the HXLFAB quotation team.</p></div><div class="evidence-grid"><article class="evidence-card"><span>Private storage</span><h3>Not served as public assets</h3><p>Uploaded design archives are stored separately from the public website repository and are returned only through controlled endpoints.</p></article><article class="evidence-card"><span>Bounded uploads</span><h3>File and RFQ limits</h3><p>The current form accepts up to 10 supported files, 100 MB per file and 200 MB total per RFQ.</p></article><article class="evidence-card"><span>Retention</span><h3>60-day file schedule</h3><p>Production files are scheduled for automatic deletion after 60 days. Confirm any project-specific retention requirement before upload.</p></article></div></div></section>
  <section class="cta-band"><div class="shell cta-band-inner"><h2>Ready for an engineer-confirmed quotation?</h2><a class="button" href="/#quote">Configure the board <span>↗</span></a></div></section>`,
};

const about = {
  slug: "about",
  title: "About HXLFAB & Your PCB Project Team",
  description: "Learn how HXLFAB connects sales coordination, CAM and DFM, process engineering, quality and production coordination for PCB programs.",
  h1: "The roles behind the RFQ.",
  status: "About HXLFAB & project ownership",
  intro: "Charles Liu is the named first contact for international customer enquiries. He coordinates the initial RFQ and connects each project with CAM, process, quality and production support.",
  image: "/images/guilin-production-base.jpg",
  imageAlt: "Company-supplied exterior photograph of the Guilin production base building with Hengxinlong signage",
  imageWidth: 1050,
  imageHeight: 1000,
  mediaClass: "factory-exterior",
  caption: "Company-supplied exterior photograph · Guilin production base",
  primaryHref: "mailto:charles@hxlfab.com?subject=PCB%20project%20introduction",
  primaryLabel: "Email Charles Liu",
  secondaryHref: "/factory-process/",
  secondaryLabel: "See the factory process",
  body: `
  <section class="page-section"><div class="shell"><div class="page-heading"><p class="eyebrow dark">Company identity</p><h2>Brand, profile name and operating locations.</h2><p>Supplier records must be matched to current controlled documents. The supplied company profile uses the name below, while contracts, certificates, banking details and corporate relationships should be verified for each project.</p></div><div class="evidence-grid"><article class="evidence-card"><span>Brand</span><h3>HXLFAB</h3><p>The customer-facing PCB manufacturing brand used on this website.</p></article><article class="evidence-card"><span>Name in supplied profile</span><h3>Guilin Hengxinlong Electronic Technology Co., Ltd.</h3><p>Use the current registration or contracting document—not this web page—as the legal-entity record.</p></article><article class="evidence-card"><span>Operating locations</span><h3>Guilin · Shenzhen</h3><p>The profile identifies a Guilin production base and a Shenzhen service office. The responsible contracting entity is confirmed in project documents.</p></article></div></div></section>
  <section class="fact-grid shell" aria-label="Operating structure"><article><strong>Guilin</strong><span>Production base</span></article><article><strong>Shenzhen</strong><span>Service office</span></article><article><strong>NPI → volume</strong><span>Program range</span></article><article><strong>${company.contactName}</strong><span>International customer contact</span></article></section>
  <section class="page-section mist"><div class="shell"><div class="page-heading"><p class="eyebrow dark">Your project team</p><h2>A named first contact, with clear ownership behind him.</h2><p>Charles Liu is the authorized first contact shown on HXLFAB customer correspondence. He coordinates initial enquiries and routes technical decisions to the responsible CAM, process, quality and production functions.</p></div><div class="role-grid"><article class="role-card"><span>01 · Named customer contact</span><h3>Charles Liu</h3><p>International customer enquiries, RFQ coordination, supplier-qualification requests and project communication.</p><a href="mailto:${company.contactEmail}?subject=PCB%20project%20introduction">${company.contactEmail} →</a></article><article class="role-card"><span>02 · Data review</span><h3>CAM & DFM engineering</h3><p>Reviews fabrication data, stack-up, tooling, design rules and manufacturability questions.</p></article><article class="role-card"><span>03 · Process route</span><h3>Process engineering</h3><p>Confirms materials, via structures, plating, lamination and special-process requirements.</p></article><article class="role-card"><span>04 · Acceptance plan</span><h3>Quality</h3><p>Aligns inspection, electrical test, targeted verification and required project records.</p></article><article class="role-card"><span>05 · Released build</span><h3>Production coordination</h3><p>Tracks the released revision through the confirmed process route and shipment preparation.</p></article><article class="role-card"><span>06 · Shared business route</span><h3>HXLFAB Sales</h3><p>The shared mailbox keeps general enquiries and project correspondence accessible to the business team.</p><a href="mailto:${company.email}?subject=PCB%20project%20question">${company.email} →</a></article></div></div></section>
  <section class="page-section"><div class="shell"><div class="content-split"><div class="long-copy"><p class="eyebrow dark">Locations</p><h2>Where the work is coordinated.</h2><h3>Production base</h3><p>Jinjiping Industrial Park, Xinping Town, Lipu City, Guilin, Guangxi, China.</p><h3>Service office</h3><p>Room 911, Haichuan Building, Baoyuan Road, Xixiang, Bao’an District, Shenzhen, Guangdong, China.</p><p class="small-print">For supplier registration, contracts, payments, certificates or site audits, confirm the current legal address and responsible entity in the project documents.</p></div><aside class="side-note"><p class="eyebrow">Direct contact</p><h2>${company.contactName}</h2><p>International customer enquiries and RFQ coordination.</p><p><a href="mailto:${company.contactEmail}">${company.contactEmail}</a><br><a href="mailto:${company.email}">${company.email}</a><br><a href="tel:+8613823663114">${company.phone}</a></p><a class="button" href="mailto:${company.contactEmail}?subject=PCB%20project%20introduction">Introduce your project <span>↗</span></a></aside></div></div></section>
  <section class="cta-band"><div class="shell cta-band-inner"><h2>Start your PCB conversation with Charles Liu.</h2><a class="button" href="mailto:${company.contactEmail}?subject=PCB%20project%20introduction">Email Charles <span>↗</span></a></div></section>`,
};

const contact = {
  slug: "contact",
  title: "Contact HXLFAB Sales Engineering",
  description: "Ask HXLFAB a PCB engineering question, request supplier documents or start a secure Gerber and ODB++ quotation.",
  h1: "Start with what you have.",
  status: "Lightweight inquiry",
  intro: "Charles Liu is the named contact for international customer enquiries. Files are helpful, but they are not required for the first conversation.",
  image: "/images/cnc-drilling.webp",
  imageAlt: "Company-supplied photograph of PCB drilling equipment",
  caption: "Company-supplied factory photograph · drilling equipment",
  primaryHref: "mailto:charles@hxlfab.com?subject=PCB%20engineering%20question",
  primaryLabel: "Email Charles Liu",
  secondaryHref: "/#quote",
  secondaryLabel: "Start a secure RFQ",
  body: `
  <section class="page-section"><div class="shell"><div class="page-heading"><p class="eyebrow dark">Choose the shortest useful path</p><h2>You do not need a complete fabrication package to ask a question.</h2><p>Use email for an early technical or commercial question. Use the secure RFQ when production data is ready and you want a traceable quotation record.</p></div><div class="contact-grid"><article class="contact-card"><span>Named customer contact</span><h3>Charles Liu</h3><p>International customer enquiries, RFQ coordination and project communication.</p><a href="mailto:${company.contactEmail}?subject=PCB%20engineering%20question">${company.contactEmail} →</a><br><a href="mailto:${company.email}?subject=PCB%20engineering%20question">Shared mailbox: ${company.email} →</a></article><article class="contact-card"><span>Files ready</span><h3>Submit a secure RFQ</h3><p>Configure the board and upload Gerber, ODB++ or related fabrication files through the private RFQ route.</p><a href="/#quote">Open RFQ workspace →</a></article><article class="contact-card"><span>Supplier review</span><h3>Request qualification documents</h3><p>Ask for current certificates, scope documents and the quality records relevant to your program.</p><a href="mailto:${company.contactEmail}?subject=Request%20HXLFAB%20supplier%20qualification%20pack">Request document pack →</a></article></div></div></section>
  <section class="page-section mist"><div class="shell"><div class="content-split"><div class="long-copy"><p class="eyebrow dark">Useful first-message details</p><h2>A short brief prevents an unnecessary email loop.</h2><ul><li>Board type and approximate layer count</li><li>Prototype, pilot or production quantity</li><li>Material, impedance, via or copper requirements</li><li>Target decision or delivery date</li><li>Whether Gerber / ODB++ files are ready</li><li>Any required certification, report or packaging condition</li></ul><h3>Before restricted data is uploaded</h3><p>If an NDA, export-control review, government-program restriction or customer-specific data workflow applies, contact the team first and agree the handling route in writing.</p></div><aside class="side-note"><p class="eyebrow">Direct line</p><h2>${company.phone}</h2><p>For international calling, time-zone and language availability should be confirmed by email.</p><a class="button" href="tel:+8613823663114">Call HXLFAB <span>↗</span></a></aside></div></div></section>
  <section class="cta-band"><div class="shell cta-band-inner"><h2>Have files ready for engineering review?</h2><a class="button" href="/#quote">Start the RFQ <span>↗</span></a></div></section>`,
};

const privacy = {
  slug: "privacy-file-handling",
  title: "Privacy & PCB File Handling | HXLFAB",
  description: "Understand what HXLFAB collects through its RFQ workflow, how PCB production files are stored, used, accessed and scheduled for deletion.",
  h1: "Privacy and production-file handling.",
  status: "Operational notice · updated August 15, 2026",
  intro: "This notice describes the current website RFQ workflow in plain language. Project contracts, NDAs and regulated-data requirements may impose additional terms.",
  image: "/images/automated-line.webp",
  imageAlt: "Company-supplied photograph of PCB production equipment",
  caption: "Company-supplied factory photograph · production equipment",
  primaryHref: "mailto:sales@hxlfab.com?subject=Privacy%20or%20file-handling%20question",
  primaryLabel: "Ask a handling question",
  secondaryHref: "/working-with-us/",
  secondaryLabel: "See the RFQ process",
  body: `
  <section class="page-section"><div class="shell"><div class="content-split"><article class="long-copy"><p class="eyebrow dark">What the website collects</p><h2>Information used to review and quote your PCB request.</h2><p>The RFQ form may collect your name, work email, company, target date, project notes, board configuration and the production files you choose to upload. Basic security and operational logs may also be created when the service is used.</p><h3>How the information is used</h3><p>Information is used to create a traceable RFQ, review manufacturability and commercial requirements, communicate with you, prepare a quotation and operate or secure the upload service.</p><h3>Where production files are stored</h3><p>Uploaded files are stored in private Cloudflare R2 object storage rather than the public website repository. File access is routed through token-controlled endpoints linked to the RFQ. The public website does not publish the uploaded archives.</p><h3>Retention</h3><p>Production files are scheduled for automatic deletion after 60 days. RFQ metadata and business correspondence may be retained longer for quotation, security, legal or operational records. If your project needs a different retention period, confirm it before upload.</p><h3>Who receives access</h3><p>Access is intended for personnel involved in quotation and engineering review, plus service providers needed to operate hosting, storage, email delivery and security. File links should not be forwarded outside the authorized project team.</p><h3>Your choices</h3><p>You may ask what contact information is held, request a correction or raise a deletion question by emailing <a href="mailto:sales@hxlfab.com?subject=Privacy%20request">sales@hxlfab.com</a>. A request may require identity or project verification.</p><h3>Restricted or regulated data</h3><p>Do not upload export-controlled, government-restricted, health, payment, identity or other specially regulated data until an appropriate handling route has been agreed in writing. Contact HXLFAB before uploading if an NDA or customer-specific security requirement applies.</p><h3>Security limits</h3><p>The service uses access controls, bounded file types and sizes, non-public storage and project access tokens. No internet service can promise absolute security; notify HXLFAB promptly if you believe a file link or account detail has been exposed.</p></article><aside class="side-note"><p class="eyebrow">RFQ file controls</p><h2>Current website limits</h2><ul><li>Up to 10 files per RFQ</li><li>100 MB maximum per file</li><li>200 MB maximum total</li><li>Supported PCB files and archives only</li><li>60-day production-file schedule</li></ul><a class="button" href="mailto:sales@hxlfab.com?subject=Privacy%20or%20file-handling%20question">Contact HXLFAB <span>↗</span></a></aside></div></div></section>
  <section class="cta-band"><div class="shell cta-band-inner"><h2>Need an NDA or a different data-handling route?</h2><a class="button" href="mailto:sales@hxlfab.com?subject=NDA%20or%20restricted-data%20workflow">Contact us before upload <span>↗</span></a></div></section>`,
};

const pages = [quality, factory, scenarios, working, about, contact, privacy];

for (const page of pages) {
  const directory = join(publicDir, page.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.html"), render(page));
}

console.log(`Generated ${pages.length} trust and procurement pages.`);
