import { readFile } from "node:fs/promises";

const lockfile = JSON.parse(await readFile("package-lock.json", "utf8"));
const forbidden = /(?:^|[^A-Z])(A?GPL|SSPL|BUSL|NONCOMMERCIAL)(?:[^A-Z]|$)/i;
const explicitMetadataExceptions = new Set(["node_modules/posthog-js"]);
const violations = [];

for (const [path, metadata] of Object.entries(lockfile.packages ?? {})) {
  if (!path) continue;
  const license = metadata.license;
  if (!license && !explicitMetadataExceptions.has(path)) {
    violations.push(`${path}: missing license metadata`);
    continue;
  }
  if (license && forbidden.test(license)) {
    violations.push(`${path}: forbidden license ${license}`);
  }
  if (
    license === "SEE LICENSE IN LICENSE" &&
    !explicitMetadataExceptions.has(path)
  ) {
    violations.push(`${path}: license requires manual review`);
  }
}

if (violations.length > 0) {
  console.error("Dependency license policy failed:\n" + violations.join("\n"));
  process.exit(1);
}

console.log(
  `[licenses] checked ${Object.keys(lockfile.packages ?? {}).length - 1} packages`
);
