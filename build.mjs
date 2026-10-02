#!/usr/bin/env node
/**
 * Cross-platform build: zip tracked files only via `git archive`.
 * No npm dependencies — Node built-ins + git.
 * Usage: node build.mjs  |  ./build  |  build.cmd
 */
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(fileURLToPath(import.meta.url));
const outRel = join("dist", "jamarkup.zip");
const outAbs = resolve(root, outRel);

mkdirSync(resolve(root, "dist"), { recursive: true });
if (existsSync(outAbs)) rmSync(outAbs);

// git archive: committed/tracked files only — no .git, no untracked junk.
// .DS_Store / dist/ are gitignored (+ export-ignore) so they stay out.
const result = spawnSync(
  "git",
  ["archive", "--format=zip", `--output=${outRel}`, "HEAD"],
  {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  }
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Wrote ${outAbs}`);
