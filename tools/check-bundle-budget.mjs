import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("dist/public");
const manifest = JSON.parse(
  await readFile(path.join(outputRoot, ".vite/manifest.json"), "utf8")
);

const budgets = [
  { module: "index.html", maxBytes: 650_000, label: "initial entry" },
  {
    module: "src/pages/SchoolDetailPage.tsx",
    maxBytes: 50_000,
    label: "School Detail route",
  },
  {
    module: "src/components/schools/SchoolTrendChart.tsx",
    maxBytes: 420_000,
    label: "deferred School Detail chart",
  },
];

let failed = false;
for (const budget of budgets) {
  const artifact = manifest[budget.module];
  if (!artifact?.file) {
    throw new Error(`Bundle manifest has no artifact for ${budget.module}`);
  }
  const bytes = (await stat(path.join(outputRoot, artifact.file))).size;
  console.log(
    `[bundle-budget] ${budget.label}: ${(bytes / 1000).toFixed(1)} kB / ${(budget.maxBytes / 1000).toFixed(0)} kB`
  );
  if (bytes > budget.maxBytes) failed = true;
}

if (failed) process.exitCode = 1;
