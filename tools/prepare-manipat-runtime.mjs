import {
  access,
  lstat,
  mkdir,
  readlink,
  symlink,
} from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

const root = process.cwd();
const manipatRoot = path.join(root, "vendor", "manipat");
const corepack = process.platform === "win32" ? "corepack.cmd" : "corepack";

const workspacePackages = [
  "core",
  "geometry",
  "object-generator",
  "svg",
  "pat-angle",
  "pat-aperture",
  "pat-cube-counting",
  "pat-form-development",
  "pat-paper-folding",
  "pat-view-recognition",
  "question-bank",
  "renderer-three",
];

async function assertSubmodule() {
  try {
    await access(path.join(manipatRoot, "pnpm-lock.yaml"));
  } catch {
    throw new Error(
      "ManipAT submodule is missing. Run: git submodule update --init --recursive"
    );
  }
}

function run(args) {
  const result = spawnSync(corepack, args, {
    cwd: manipatRoot,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Command failed: corepack ${args.join(" ")}`);
  }
}

async function ensureLink(destinationName, source) {
  const destination = path.join(root, "node_modules", destinationName);
  await access(source);
  await mkdir(path.dirname(destination), { recursive: true });

  try {
    const stats = await lstat(destination);
    if (!stats.isSymbolicLink()) return;
    const current = await readlink(destination);
    const resolved = path.resolve(path.dirname(destination), current);
    if (resolved === source) return;
  } catch {
    // The destination does not exist yet.
  }

  const target =
    process.platform === "win32"
      ? source
      : path.relative(path.dirname(destination), source);
  await symlink(
    target,
    destination,
    process.platform === "win32" ? "junction" : "dir"
  );
}

await assertSubmodule();
run(["pnpm", "install", "--frozen-lockfile"]);
run(["pnpm", "build"]);

for (const packageName of workspacePackages) {
  await ensureLink(
    `@manipat/${packageName}`,
    path.join(manipatRoot, "packages", packageName)
  );
}
await ensureLink(
  "manifold-3d",
  path.join(manipatRoot, "packages", "geometry", "node_modules", "manifold-3d")
);
await ensureLink(
  "three",
  path.join(manipatRoot, "packages", "renderer-three", "node_modules", "three")
);

console.log("ManipAT runtime prepared from pinned submodule.");
