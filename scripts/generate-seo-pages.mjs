import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const out = new URL("../public/", import.meta.url).pathname;
const common = {
  company: "Guilin Hengxinlong Electronic Technology Co., Ltd.",
  phone: "+86 138 2366 3114",
  email: "sales@hxlfab.com",
};

const pages = [
  {
    slug: "pcb-manufacturing",
    title: "Custom PCB Manufacturer | 1–30 Layer PCB Fabrication | HXLFAB",
    description: "Custom PCB manufacturing from prototype to volume production. HXLFAB fabricates 1–30 layer multilayer, HDI, RF and heavy-copper boards.",
    eyebrow: "Custom PCB manufacturing",
    h1: "Engineering-led PCB manufacturing",
    intro: "HXLFAB supports hardware teams from prototype and NPI through controlled volume production. Every RFQ is reviewed for stack-up, material, impedance, via structure, test coverage and manufacturing risk before commercial confirmation.",
    image: "/images/automated-line.webp",
    imageAlt: "Automated PCB production equipment inside the HXLFAB Guilin factory",
    caption: "Controlled production at the Guilin base",
    specs: [["1–30", "Layer count"], ["3/3 mil", "Minimum trace / space"], ["0.10 mm", "Minimum laser via"], ["8 oz", "Outer-layer copper capability"]],
    overviewTitle: "A manufacturing partner for complex rigid PCBs",
    overview: [
      "PCB sourcing works best when fabrication limits are discussed before release, not after a production hold. HXLFAB combines CAM preparation, material review, automated processing, plating, drilling, inspection and electrical testing within an engineering-led workflow.",
      "Programs can be routed for standard rigid multilayer production or advanced review for HDI, high-frequency, mixed-material, fine-line, heavy-copper and controlled-impedance requirements. Capability values remain subject to the final design, selected laminate and order volume.",
    ],
    focusTitle: "What we review before quoting",
    focus: ["Gerber or ODB++ completeness and fabrication notes", "Board outline, stack-up, copper distribution and finished thickness", "Minimum trace, spacing, annular ring and finished-hole requirements", "Material system, surface finish, impedance and via construction", "Electrical test, inspection, marking, packaging and compliance requirements"],
    table: [["Board construction", "Rigid PCB fabrication from 1 to 30 layers"], ["Feature capability", "Down to 3/3 mil trace and space, subject to design review"], ["Hole and via capability", "0.15 mm minimum mechanical drill and 0.10 mm minimum laser via"], ["Materials", "TG135 / TG150 / TG170 FR-4, halogen-free, CAF-resistant, PTFE and mixed material systems"], ["Copper", "Up to 4 oz inner-layer and 8 oz outer-layer capability, subject to review"], ["Panel and thickness", "Up to 850 × 520 mm panel; 0.15–7.0 mm finished thickness"], ["Quality controls", "AOI, electrical test, impedance measurement, microsection analysis and final inspection"]],
    applications: [["Communications", "Multilayer and RF boards for network and communications equipment."], ["Industrial control", "Reliable fabrication for controls, drives, sensing and automation hardware."], ["Automotive electronics", "Engineering review and controlled production for qualified automotive programs."], ["Medical equipment", "Traceable build documentation and test planning for medical hardware."], ["AI & computing", "Fine-feature multilayer and impedance-controlled boards for compute platforms."], ["New energy", "Power, control and monitoring boards including heavy-copper requirements."]],
    faqs: [["Can HXLFAB support both prototypes and volume production?", "Yes. Programs can begin with prototype or NPI quantities and transition to controlled volume production after engineering and quality requirements are confirmed."], ["Do you provide an instant online PCB price?", "No. HXLFAB provides an engineer-confirmed quotation after reviewing the production files, construction and quantity. This avoids a misleading price for designs that require special materials or processes."], ["What should I upload for a quotation?", "A compressed Gerber or ODB++ package is preferred. Include drill files, fabrication notes, stack-up, impedance requirements, quantity and any material or certification requirements."], ["Are uploaded design files public?", "No. Files submitted through the RFQ form are stored in private, access-controlled storage and are scheduled for automatic deletion after 60 days."]],
    related: ["multilayer-pcb", "hdi-pcb", "pcb-prototype"],
  },
  {
    slug: "multilayer-pcb",
    title: "Multilayer PCB Manufacturer | 4–30 Layer Boards | HXLFAB",
    description: "Multilayer PCB manufacturing from 4 to 30 layers with 3/3 mil capability, impedance review and engineer-confirmed Gerber quotations.",
    eyebrow: "4–30 layer PCB fabrication",
    h1: "Multilayer PCB manufacturer",
    intro: "Build dense, reliable multilayer boards with stack-up, material, impedance and via requirements reviewed before production. HXLFAB supports prototypes, NPI, pilot builds and volume programs up to 30 layers.",
    image: "/images/cam-production.webp", imageAlt: "HXLFAB CAM engineers reviewing multilayer PCB production data", caption: "CAM and stack-up preparation",
    specs: [["4–30", "Multilayer construction"], ["3/3 mil", "Minimum trace / space"], ["0.15 mm", "Minimum mechanical drill"], ["0.15–7.0 mm", "Finished thickness range"]],
    overviewTitle: "Stack-up discipline before production release",
    overview: ["Multilayer PCB performance depends on more than layer count. Copper distribution, dielectric selection, finished thickness, drill aspect ratio, registration and impedance targets must work together as a manufacturable construction.", "HXLFAB reviews the supplied stack-up and can flag conflicts among trace geometry, via structure, material availability and finished-board requirements. The confirmed fabrication package becomes the basis for CAM preparation, process routing, inspection and electrical testing."],
    focusTitle: "Best suited for",
    focus: ["Dense digital and mixed-signal boards", "Communications, industrial and computing platforms", "Controlled-impedance layer structures", "Fine-line routing down to 3/3 mil where the design permits", "Prototype-to-volume programs requiring consistent construction"],
    table: [["Layer count", "4–30 layers"], ["Minimum trace / space", "3/3 mil subject to design, copper weight and yield review"], ["Minimum mechanical drill", "0.15 mm"], ["Finished thickness", "0.15–7.0 mm"], ["Base materials", "FR-4 TG135 / TG150 / TG170, halogen-free and CAF-resistant options"], ["Surface finishes", "Lead-free HASL, ENIG, OSP, immersion tin, immersion silver and hard gold subject to specification"], ["Testing", "AOI plus flying-probe, fixture or four-wire electrical testing as required"]],
    applications: [["Network hardware", "Routers, switches, gateways and communications infrastructure."], ["Industrial electronics", "Controllers, instrumentation, motion and factory automation."], ["High-end computing", "Dense interconnect for servers, accelerators and embedded compute."], ["Medical systems", "Diagnostic, monitoring and control electronics."], ["Automotive modules", "Qualified multilayer programs for automotive electronics."], ["Energy systems", "Control, monitoring and power-management electronics."]],
    faqs: [["What files are needed for a multilayer PCB quote?", "Upload Gerber or ODB++, NC drill files, fabrication drawing, proposed stack-up, impedance table, quantity and any controlled-depth or special-via requirements."], ["Can you review a customer-supplied stack-up?", "Yes. Engineering review checks material system, dielectric spacing, copper weight, finished thickness, impedance intent and manufacturability before confirmation."], ["Is 3/3 mil available on every multilayer design?", "No. It is a capability boundary, not a default rule. Availability depends on copper weight, layer construction, panel utilization and overall design risk."], ["Can prototype construction transfer to volume production?", "Yes, provided the material, stack-up, process and acceptance requirements are controlled. Any proposed production change should be reviewed before release."]],
    related: ["impedance-controlled-pcb", "hdi-pcb", "pcb-prototype"],
  },
  {
    slug: "hdi-pcb",
    title: "HDI PCB Manufacturer | Microvia & Via-in-Pad Boards | HXLFAB",
    description: "HDI PCB manufacturing with 0.10 mm laser vias, blind and buried vias, via-in-pad options and engineering-led stack-up review.",
    eyebrow: "HDI and microvia fabrication",
    h1: "HDI PCB manufacturer",
    intro: "For compact hardware that needs finer routing and higher interconnect density, HXLFAB reviews microvia structure, sequential build requirements, via filling, capture pads and material selection before confirming the process route.",
    image: "/images/cnc-drilling.webp", imageAlt: "Multi-spindle precision drilling equipment at HXLFAB", caption: "Precision drilling and via preparation",
    specs: [["0.10 mm", "Minimum laser via"], ["3/3 mil", "Minimum trace / space"], ["Via-in-pad", "Available by review"], ["1–30", "Total layer capability"]],
    overviewTitle: "Microvia structures reviewed as a complete build",
    overview: ["HDI designs concentrate routing transitions into smaller spaces, which makes pad geometry, dielectric thickness, copper balance and lamination sequence especially important. A microvia that is feasible in isolation may still conflict with the complete stack-up.", "HXLFAB evaluates blind and buried via intent, via-in-pad requirements, filling and capping, layer transitions and registration demands together. Final availability depends on the design data, material system and reliability requirements."],
    focusTitle: "Engineering review includes",
    focus: ["Laser-via diameter, capture pad and target pad geometry", "Blind, buried and staggered microvia layer transitions", "Via-in-pad filling and capping requirements", "Sequential lamination and dielectric selection", "Fine-line routing, copper balance and impedance interaction"],
    table: [["Minimum laser via", "0.10 mm subject to construction review"], ["Trace / space", "Down to 3/3 mil subject to copper weight and design"], ["Via structures", "Blind, buried, staggered microvia and via-in-pad options by review"], ["Via treatment", "Plugging, resin filling and capping options according to the fabrication specification"], ["Materials", "High-TG, halogen-free, CAF-resistant and application-specific systems"], ["Inspection", "AOI, microsection analysis, electrical test and targeted process checks"], ["Quote input", "Gerber/ODB++, stack-up, via table, impedance requirements and quantity"]],
    applications: [["Compact communications", "Dense routing for radios, gateways and network modules."], ["Embedded compute", "Fine-pitch packages and compact high-performance processors."], ["Medical electronics", "Space-constrained diagnostic and monitoring hardware."], ["Automotive modules", "Compact control and sensing electronics for qualified programs."], ["AI edge hardware", "Dense interconnect for accelerators and edge computing."], ["Miniaturized devices", "Products where board area and interconnect density drive the architecture."]],
    faqs: [["What is the minimum laser-via size?", "HXLFAB lists 0.10 mm as the minimum laser-via capability. The finished construction, pad geometry, material and reliability requirements must be reviewed before confirmation."], ["Do you support via-in-pad?", "Via-in-pad, resin filling and capping can be reviewed. Provide the via table and clearly identify filled, capped or plated-over requirements in the fabrication notes."], ["Can every blind-via design use the same process?", "No. The lamination sequence depends on which layers are connected, whether vias are stacked or staggered, and the selected dielectric system."], ["What information speeds up an HDI quotation?", "Provide complete production data, stack-up, via transition table, finished thickness, copper weights, impedance requirements, quantity and the component pad constraints that drive the HDI structure."]],
    related: ["multilayer-pcb", "impedance-controlled-pcb", "pcb-prototype"],
  },
  {
    slug: "high-frequency-pcb",
    title: "High-Frequency & RF PCB Manufacturer | PTFE + FR-4 | HXLFAB",
    description: "High-frequency and RF PCB manufacturing with PTFE, Rogers, Isola and mixed-material stack-up review for impedance-controlled designs.",
    eyebrow: "RF and microwave PCB fabrication",
    h1: "High-frequency PCB manufacturer",
    intro: "Translate RF intent into a controlled fabrication package. HXLFAB reviews laminate selection, mixed-material construction, impedance geometry, copper profile, surface finish and mechanical requirements before quoting.",
    image: "/images/plating-line.webp", imageAlt: "Automated PCB plating line inside the HXLFAB factory", caption: "Controlled plating for demanding constructions",
    specs: [["PTFE + FR-4", "Mixed-material systems"], ["3/3 mil", "Minimum trace / space"], ["Impedance", "Measurement available"], ["30 layers", "Maximum layer count"]],
    overviewTitle: "Material behavior matters at high frequency",
    overview: ["RF PCB performance is influenced by dielectric properties, dielectric thickness, conductor geometry, copper surface profile, plating and the selected finish. Substituting a laminate or changing a construction without review can affect the intended electrical behavior.", "HXLFAB routes high-frequency and mixed-material programs through engineering review so material availability, stack-up, impedance intent and fabrication tolerances can be aligned before commercial confirmation."],
    focusTitle: "Include these RF requirements",
    focus: ["Specified laminate family, grade and permitted alternatives", "Target impedance and reference-layer information", "Critical transmission-line geometry and tolerance notes", "Copper weight, copper profile or roughness requirements", "Surface finish, connector, cavity or controlled-depth features"],
    table: [["Material systems", "PTFE, Rogers, Isola and mixed PTFE + FR-4 constructions by specification and availability"], ["Layer construction", "Single- or multilayer rigid boards up to the stated 30-layer capability"], ["Impedance", "Engineering review and impedance measurement for defined structures"], ["Feature capability", "Down to 3/3 mil trace and space where material and copper construction permit"], ["Surface finishes", "ENIG and other application-appropriate finishes subject to design review"], ["Special processes", "Mixed-material lamination, controlled depth and application-specific mechanical features by review"], ["Verification", "Electrical test, impedance measurement, inspection and microsection analysis as specified"]],
    applications: [["Wireless infrastructure", "Radio, antenna, base-station and communications hardware."], ["Network systems", "High-speed connectivity and signal-distribution platforms."], ["Radar and sensing", "RF sensing, measurement and signal-processing electronics."], ["Aerospace programs", "High-frequency electronics subject to program-specific requirements."], ["Medical RF", "Imaging, sensing and treatment systems using controlled RF paths."], ["Test equipment", "Measurement, instrumentation and laboratory electronics."]],
    faqs: [["Can HXLFAB build PTFE and FR-4 hybrid boards?", "Mixed PTFE + FR-4 constructions can be reviewed. Provide the exact laminate callouts, stack-up and performance requirements because the process depends on material compatibility."], ["Will you substitute an RF laminate automatically?", "No substitution should be assumed. Permitted alternates need to be agreed during engineering review because dielectric and mechanical properties can affect performance."], ["Do you measure controlled impedance?", "Impedance measurement is listed among HXLFAB's inspection resources. Supply target values, tolerances, layer references and test-coupon requirements."], ["What improves RF quote accuracy?", "Provide the material specification, stack-up, copper weights, critical line geometries, impedance table, surface finish, quantity and any controlled-depth or connector requirements."]],
    related: ["impedance-controlled-pcb", "multilayer-pcb", "pcb-manufacturing"],
  },
  {
    slug: "heavy-copper-pcb",
    title: "Heavy Copper PCB Manufacturer | 4 oz, 6 oz & 8 oz | HXLFAB",
    description: "Heavy-copper PCB manufacturing with up to 4 oz inner and 8 oz outer copper capability for power, industrial and new-energy applications.",
    eyebrow: "Heavy-copper PCB fabrication",
    h1: "Heavy copper PCB manufacturer",
    intro: "Design and source thick-copper boards with conductor spacing, thermal distribution, plating, etching, finished thickness and mechanical limits reviewed as one manufacturing system.",
    image: "/images/plating-line.webp", imageAlt: "HXLFAB automated plating production line for PCB fabrication", caption: "Automated plating process control",
    specs: [["4 oz", "Inner-layer copper capability"], ["8 oz", "Outer-layer copper capability"], ["7.0 mm", "Maximum finished thickness"], ["850 × 520 mm", "Maximum panel"]],
    overviewTitle: "Copper weight changes the complete design rule set",
    overview: ["Heavy copper supports current carrying, thermal spreading and mechanical robustness, but it also changes etching behavior, conductor spacing, hole-wall plating, dielectric fill and overall thickness. Standard one-ounce design rules should not be copied directly into a thick-copper build.", "HXLFAB reviews copper distribution, minimum features, clearances, thermal transitions, via requirements and stack-up symmetry before confirming a heavy-copper production route."],
    focusTitle: "Engineering inputs that matter",
    focus: ["Copper weight by layer, not only a single overall value", "Minimum conductor width, clearance and current requirement", "Thermal distribution and copper-balance strategy", "Finished thickness, hole sizes and plated-hole requirements", "Surface finish, solder-mask clearance and assembly constraints"],
    table: [["Inner-layer copper", "Up to 4 oz capability, subject to design review"], ["Outer-layer copper", "Up to 8 oz capability, subject to design review"], ["Finished thickness", "0.15–7.0 mm overall capability; heavy-copper construction determines the practical range"], ["Panel size", "Up to 850 × 520 mm"], ["Materials", "High-TG and application-specific FR-4 systems according to thermal and reliability requirements"], ["Design review", "Spacing, etch compensation, resin fill, copper balance, drill and plating requirements"], ["Verification", "Electrical test, inspection and microsection analysis according to the agreed control plan"]],
    applications: [["Power electronics", "Power conversion, distribution and switching assemblies."], ["New energy", "Energy storage, charging, inverter and monitoring equipment."], ["Industrial drives", "Motor control, drives and high-current automation hardware."], ["Automotive power", "Qualified power and control modules for automotive programs."], ["LED and lighting", "Power delivery and thermal-management boards."], ["Protection systems", "High-current protection, relay and control electronics."]],
    faqs: [["Does 8 oz apply to every layer?", "No. HXLFAB lists up to 4 oz inner-layer and 8 oz outer-layer capability. The practical copper weight depends on the complete stack-up and design rules."], ["Can I use normal trace spacing on a heavy-copper board?", "Do not assume so. Thicker copper generally requires different conductor and spacing rules, which should be confirmed from the actual layer copper and geometry."], ["What should a heavy-copper RFQ include?", "Specify copper weight per layer, stack-up, current and thermal requirements, minimum conductor geometry, finished thickness, hole plating requirements, quantity and acceptance criteria."], ["How is heavy-copper quality checked?", "The control plan can include CAM review, process inspection, electrical testing and microsection analysis. Exact acceptance criteria should be defined in the fabrication specification."]],
    related: ["pcb-manufacturing", "multilayer-pcb", "pcb-prototype"],
  },
  {
    slug: "impedance-controlled-pcb",
    title: "Impedance Controlled PCB Manufacturer | Stack-Up Review | HXLFAB",
    description: "Impedance-controlled PCB manufacturing with stack-up review, material confirmation, test coupons and impedance measurement for high-speed designs.",
    eyebrow: "Controlled-impedance PCB fabrication",
    h1: "Impedance controlled PCB manufacturer",
    intro: "Align electrical targets with a manufacturable stack-up. HXLFAB reviews reference layers, trace geometry, dielectric thickness, copper construction, material properties and coupon requirements before production.",
    image: "/images/cam-production.webp", imageAlt: "HXLFAB CAM workstations used for PCB stack-up and production preparation", caption: "CAM preparation and construction review",
    specs: [["Single-ended", "Structures supported"], ["Differential", "Structures supported"], ["PTFE + FR-4", "Material systems"], ["Measurement", "Impedance verification"]],
    overviewTitle: "Control the construction, then verify the result",
    overview: ["An impedance value without layer references, geometry and material context is incomplete. The target depends on the relationship among the signal trace, reference plane, dielectric thickness, copper thickness and the laminate's electrical properties.", "HXLFAB uses the supplied stack-up and impedance table to prepare a manufacturable construction. Where required, impedance coupons and measurement requirements can be incorporated into the production and inspection plan."],
    focusTitle: "Provide a complete impedance table",
    focus: ["Target impedance and permitted tolerance", "Single-ended or differential structure", "Signal layer and reference layer", "Nominal trace width, spacing and copper weight", "Material, dielectric thickness and coupon requirements"],
    table: [["Structures", "Single-ended and differential controlled-impedance structures"], ["Materials", "FR-4, high-TG, PTFE and mixed-material systems according to specification"], ["Stack-up input", "Customer-defined or engineering-reviewed construction with layer references"], ["Fine features", "Down to 3/3 mil where copper weight and construction permit"], ["Verification", "Impedance measurement with agreed coupon and acceptance requirements"], ["Related processes", "Multilayer, HDI, microvia and high-frequency fabrication by engineering review"], ["Required files", "Gerber/ODB++, stack-up, impedance table, fabrication notes, quantity and material requirements"]],
    applications: [["High-speed digital", "Servers, storage, computing and data-conversion platforms."], ["Communications", "Routers, switches, gateways and signal-distribution hardware."], ["RF systems", "Transmission structures using application-specific laminates."], ["Automotive data", "Qualified high-speed control and connectivity modules."], ["Medical imaging", "Data acquisition and signal-processing electronics."], ["Test systems", "Measurement and instrumentation with controlled signal paths."]],
    faqs: [["What impedance information is required?", "Provide target value, tolerance, single-ended or differential type, signal and reference layers, nominal trace geometry and any coupon requirements."], ["Can the fabricator adjust trace width?", "Any permitted adjustment should be defined and approved. Manufacturing compensation may be necessary, but changes must remain consistent with the electrical and mechanical requirements."], ["Is impedance testing automatic for every order?", "Testing should be specified in the quotation and fabrication requirements. Include coupon quantity, location and reporting needs where applicable."], ["Can impedance control be combined with HDI or RF materials?", "Yes, subject to engineering review. Microvia construction and RF materials introduce additional variables that must be evaluated with the stack-up."]],
    related: ["high-frequency-pcb", "multilayer-pcb", "hdi-pcb"],
  },
  {
    slug: "pcb-prototype",
    title: "Custom PCB Prototype Manufacturer | Engineering RFQ | HXLFAB",
    description: "Custom PCB prototype fabrication with engineer-reviewed Gerber quotations, multilayer, HDI, RF and heavy-copper options for NPI builds.",
    eyebrow: "Prototype and NPI fabrication",
    h1: "Custom PCB prototype manufacturing",
    intro: "Use prototype builds to validate the intended production construction—not a disconnected temporary process. HXLFAB reviews design data, stack-up, material, special processes and test requirements before confirming lead time and price.",
    image: "/images/cnc-drilling.webp", imageAlt: "Precision drilling equipment used for PCB prototype and production builds", caption: "Prototype-to-production process discipline",
    specs: [["1–30", "Prototype layer count"], ["10 files", "Secure RFQ upload limit"], ["100 MB", "Maximum per file"], ["60 days", "Scheduled file retention"]],
    overviewTitle: "Prototype with the production route in mind",
    overview: ["A useful PCB prototype validates fit, electrical function and the intended fabrication construction. If material, stack-up or process changes silently between NPI and volume production, later results can be difficult to compare.", "HXLFAB can review prototype data with the next production stage in mind. The RFQ workflow captures the board configuration, application notes, contact details and securely uploaded production files under a traceable RFQ number."],
    focusTitle: "A complete prototype package includes",
    focus: ["Gerber or ODB++ data and NC drill files", "Fabrication drawing and board outline", "Stack-up, finished thickness and copper weights", "Impedance, special-via and material requirements", "Quantity, target date, test and packaging expectations"],
    table: [["Technology range", "Standard rigid, multilayer, HDI, high-frequency and heavy-copper prototypes by review"], ["Layer count", "1–30 layers"], ["Fine features", "Down to 3/3 mil trace and space subject to construction review"], ["Quote method", "Engineer-confirmed after production-data review; not an unverified instant price"], ["File upload", "Private upload for supported PCB files and compressed Gerber/ODB++ packages"], ["Storage controls", "Access-controlled files linked to the RFQ and scheduled for deletion after 60 days"], ["Transition", "Prototype, NPI, pilot and volume routes can be planned around a controlled construction"]],
    applications: [["Hardware startups", "Engineering builds for functional validation and investor or customer samples."], ["New product introduction", "NPI builds intended to transfer into pilot and volume production."], ["Design revisions", "Controlled fabrication for form, fit and functional changes."], ["Research equipment", "Custom boards for laboratories, universities and development teams."], ["Industrial pilots", "Low-volume builds for field trials and equipment qualification."], ["Supply qualification", "Evaluation builds for alternate-source and manufacturing qualification."]],
    faqs: [["Does HXLFAB offer a true instant PCB quote?", "No. Quotes are engineer-confirmed after reviewing the construction and files. This is especially important for advanced materials, HDI, impedance or heavy-copper prototypes."], ["How fast will I receive a quotation?", "Lead time for the quotation depends on file completeness and technical complexity. Upload complete production data and clearly identify special requirements to reduce clarification cycles."], ["Can I upload multiple files?", "The secure RFQ currently supports up to 10 files, 100 MB per file and 200 MB total. A single ZIP or 7Z package is preferred for related Gerber or ODB++ data."], ["Will my prototype files be public?", "No. Uploaded files remain in private storage, require access-controlled links and are scheduled for automatic deletion after 60 days."]],
    related: ["pcb-manufacturing", "multilayer-pcb", "hdi-pcb"],
  },
];

const labels = Object.fromEntries(pages.map((page) => [page.slug, page.h1.replace(/^./, (c) => c.toUpperCase())]));

function jsonLd(page) {
  const faqs = page.faqs.map(([name, answer]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text: answer } }));
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": "https://hxlfab.com/#organization", name: "HXLFAB", url: "https://hxlfab.com/", email: common.email, telephone: common.phone, address: [{ "@type": "PostalAddress", addressLocality: "Lipu City", addressRegion: "Guangxi", addressCountry: "CN" }, { "@type": "PostalAddress", addressLocality: "Shenzhen", addressRegion: "Guangdong", addressCountry: "CN" }] },
    { "@type": "WebPage", "@id": `https://hxlfab.com/${page.slug}/#webpage`, url: `https://hxlfab.com/${page.slug}/`, name: page.title, description: page.description, isPartOf: { "@id": "https://hxlfab.com/#website" }, about: { "@id": "https://hxlfab.com/#organization" } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://hxlfab.com/" }, { "@type": "ListItem", position: 2, name: page.h1, item: `https://hxlfab.com/${page.slug}/` }] },
    { "@type": "FAQPage", mainEntity: faqs }
  ] });
}

function render(page) {
  const related = page.related.map((slug) => `<a href="/${slug}/"><span>Manufacturing capability</span><strong>${labels[slug]}</strong><b>Explore →</b></a>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <meta name="theme-color" content="#08242e">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="canonical" href="https://hxlfab.com/${page.slug}/">
  <meta property="og:type" content="website"><meta property="og:site_name" content="HXLFAB"><meta property="og:title" content="${page.title}"><meta property="og:description" content="${page.description}"><meta property="og:url" content="https://hxlfab.com/${page.slug}/"><meta property="og:image" content="https://hxlfab.com${page.image}">
  <link rel="stylesheet" href="/styles.css?v=20260815b"><link rel="stylesheet" href="/product-pages.css?v=20260815b">
  <script type="application/ld+json">${jsonLd(page)}</script>
  <script src="/site.js?v=20260815b" defer></script>
</head>
<body>
  <div class="utility"><div class="shell utility-inner"><span>PCB manufacturing · Guilin production base · Shenzhen service office</span><a href="mailto:${common.email}">${common.email}</a></div></div>
  <header class="header"><div class="shell nav"><a class="brand" href="/" aria-label="HXLFAB home"><span class="brand-bars"><i></i><i></i><i></i></span><span>HXL<strong>FAB</strong></span></a><nav aria-label="Main navigation"><a href="/pcb-manufacturing/">Manufacturing</a><a href="/quality-certifications/">Quality</a><a href="/factory-process/">Factory</a><a href="/engineering-scenarios/">Engineering reviews</a><a href="/about/">About</a></nav><a class="button small" href="/#quote">Start an RFQ <span>↗</span></a></div></header>
  <main>
    <section class="page-hero"><div class="shell"><p class="breadcrumbs"><a href="/">Home</a> / ${page.h1}</p><div class="page-hero-grid"><div><p class="eyebrow">${page.eyebrow}</p><h1>${page.h1}</h1><p class="lede">${page.intro}</p><div class="hero-actions"><a class="button" href="/#quote">Upload files for quote <span>↗</span></a><a class="text-link" href="#specifications">View capabilities <span>↓</span></a></div></div><figure class="page-hero-image"><img src="${page.image}" alt="${page.imageAlt}" width="1280" height="960"><figcaption>${page.caption}</figcaption></figure></div></div></section>
    <section class="quick-specs" aria-label="Key capabilities"><div class="shell quick-spec-grid">${page.specs.map(([a,b]) => `<div><strong>${a}</strong><span>${b}</span></div>`).join("")}</div></section>
    <section class="section"><div class="shell content-grid"><article class="content-copy"><p class="eyebrow dark">Engineering approach</p><h2>${page.overviewTitle}</h2>${page.overview.map((p) => `<p>${p}</p>`).join("")}<h3>${page.focusTitle}</h3><ul>${page.focus.map((item) => `<li>${item}</li>`).join("")}</ul></article><aside class="side-panel"><p class="eyebrow">Secure PCB RFQ</p><h2>Get an engineer-confirmed quote</h2><p>Upload Gerber or ODB++ files with your build requirements. Every submission receives a traceable RFQ number.</p><a class="button" href="/#quote">Configure your PCB <span>↗</span></a><a href="mailto:${common.email}">${common.email}</a></aside></div></section>
    <section class="section spec-section" id="specifications"><div class="shell"><div class="section-heading"><p class="eyebrow dark">Manufacturing envelope</p><h2>Capabilities for quotation planning</h2><p>These values describe the available manufacturing envelope. Final capability, lead time and price are confirmed after review of the actual production data, construction, material and quantity.</p></div><table class="spec-table"><tbody>${page.table.map(([a,b]) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join("")}</tbody></table></div></section>
    <section class="section"><div class="shell"><div class="section-heading"><p class="eyebrow dark">From RFQ to release</p><h2>A controlled engineering workflow</h2></div><div class="process-grid"><article><span>01 / DATA REVIEW</span><h3>Check the fabrication package</h3><p>Gerber or ODB++, drill data, drawings, stack-up and requirements are checked for completeness.</p></article><article><span>02 / DFM & ROUTING</span><h3>Confirm the process route</h3><p>Engineering evaluates materials, features, via construction, test coverage and manufacturing risk.</p></article><article><span>03 / QUOTE & RELEASE</span><h3>Issue confirmed terms</h3><p>Price and lead time are confirmed after the technical route and commercial inputs are aligned.</p></article></div></div></section>
    <section class="section spec-section"><div class="shell"><div class="section-heading"><p class="eyebrow dark">Applications</p><h2>Where this capability is used</h2></div><div class="use-grid">${page.applications.map(([a,b]) => `<article><h3>${a}</h3><p>${b}</p></article>`).join("")}</div></div></section>
    <section class="section"><div class="shell"><div class="section-heading"><p class="eyebrow dark">Frequently asked questions</p><h2>Before you request a quote</h2></div><div class="faq-list">${page.faqs.map(([q,a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div></section>
    <section class="section related"><div class="shell"><div class="section-heading"><p class="eyebrow">Related capabilities</p><h2>Explore the right manufacturing route</h2><p>Each capability page explains the design inputs and manufacturing limits that matter for an accurate quotation.</p></div><div class="related-grid">${related}</div></div></section>
    <section class="page-cta"><div class="shell page-cta-grid"><h2>Ready to review your PCB build?</h2><a class="button" href="/#quote">Upload Gerber files <span>↗</span></a></div></section>
  </main>
  <footer><div class="shell footer-grid"><div><a class="brand footer-brand" href="/"><span class="brand-bars"><i></i><i></i><i></i></span><span>HXL<strong>FAB</strong></span></a><p>PCB manufacturing brand<br>Guilin production base · Shenzhen service office</p></div><div><span>Evidence</span><p><a href="/quality-certifications/">Quality & certifications</a><br><a href="/factory-process/">Factory & process</a><br><a href="/engineering-scenarios/">Engineering scenarios</a></p></div><div><span>Working together</span><p><a href="/working-with-us/">Working with us</a><br><a href="/about/">About & team</a><br><a href="/contact/">Contact engineering</a></p></div><div><span>Contact</span><p><a href="mailto:${common.email}">${common.email}</a><br><a href="tel:+8613823663114">${common.phone}</a></p></div></div><div class="shell footer-bottom"><span>© 2026 HXLFAB. All rights reserved.</span><span><a href="/privacy-file-handling/">Privacy & file handling</a> · Technical data subject to engineering confirmation.</span></div></footer>
</body>
</html>`;
}

for (const page of pages) {
  const dir = join(out, page.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), render(page));
}

console.log(`Generated ${pages.length} SEO landing pages.`);
