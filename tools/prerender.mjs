import fs from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("dist/public");
const baseHtml = await fs.readFile(path.join(outputRoot, "index.html"), "utf8");
const sitemap = await fs.readFile(path.resolve("public/sitemap.xml"), "utf8");
const sitemapRoutes = [
  ...sitemap.matchAll(/<loc>https:\/\/predent\.vercel\.app([^<]*)<\/loc>/g),
].map(match => match[1] || "/");
const schoolIds = [
  "uoft",
  "western",
  "mcgill",
  "udem",
  "laval",
  "ubc",
  "alberta",
  "saskatchewan",
  "manitoba",
  "dalhousie",
];
const routes = [
  ...new Set([...sitemapRoutes, ...schoolIds.map(id => `/school/${id}`)]),
];

const overrides = {
  "/": [
    "PreDent Canada — Canadian DAT Prep & Dental School Admissions",
    "Prepare for the Canadian DAT, compare dental schools, and plan your application.",
  ],
  "/schools": [
    "Canadian Dental Schools — Admissions Requirements | PreDent Canada",
    "Compare admissions requirements and profiles for Canada's ten dental schools.",
  ],
  "/guides": [
    "Canadian DAT and Dental Admissions Guides | PreDent Canada",
    "Evidence-informed guides for DAT preparation and Canadian dental school admissions.",
  ],
  "/tools": [
    "Free Pre-Dental Admissions Tools | PreDent Canada",
    "Calculate GPA, assess competitiveness, and plan Canadian dental school applications.",
  ],
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
}

function titleFor(route) {
  if (overrides[route]) return overrides[route];
  const label = route
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replaceAll("-", " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
  return [
    `${label || "PreDent Canada"} | PreDent Canada`,
    `Explore ${label || "Canadian dental admissions"} resources from PreDent Canada.`,
  ];
}

for (const route of routes) {
  const [title, description] = titleFor(route);
  const canonical = `https://predent.vercel.app${route === "/" ? "" : route}`;
  let html = baseHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapeHtml(description)}" />`
    )
    .replace(
      /<link rel="canonical" href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${canonical}" />`
    )
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${escapeHtml(title)}" />`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${escapeHtml(description)}" />`
    )
    .replace(
      /<meta property="og:url" content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${canonical}" />`
    )
    .replace(
      '<div id="root"></div>',
      `<div id="root"><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><noscript>JavaScript is required for interactive tools.</noscript></main></div>`
    );
  const target =
    route === "/"
      ? path.join(outputRoot, "index.html")
      : path.join(outputRoot, route, "index.html");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, html);
}

console.log(`Pre-rendered ${routes.length} public routes.`);
