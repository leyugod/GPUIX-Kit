import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
// 发布验证使用独立解包目录，避免工作区软链接掩盖缺失文件。
const run = (args: string[], cwd = process.cwd()) => {
  const result = Bun.spawnSync(args, { cwd, stdout: "pipe", stderr: "pipe" });
  assert.equal(
    result.exitCode,
    0,
    args.join(" ") + "\n" + result.stdout + "\n" + result.stderr,
  );
  return String(result.stdout);
};
const version = JSON.parse(readFileSync("package.json", "utf8")).version;
const prefix = resolve("artifacts/gpuixKit-" + version + "-source");
const manifest = JSON.parse(
  readFileSync(prefix + ".manifest.json", "utf8"),
) as {
  version: string;
  files: { path: string; bytes: number; sha256: string }[];
};
assert.equal(manifest.version, version);
const paths = manifest.files.map((f) => f.path);
assert.equal(new Set(paths).size, paths.length);
assert(paths.every((p) => !p.startsWith("/") && !p.split("/").includes("..")));
assert.deepEqual(
  run(["tar", "-tzf", prefix + ".tar.gz"])
    .trim()
    .split("\n")
    .sort(),
  [...paths].sort(),
);
const directory = mkdtempSync(join(tmpdir(), "gpuix-kit-source-"));
try {
  run(["tar", "-xzf", prefix + ".tar.gz", "-C", directory]);
  for (const f of manifest.files) {
    const bytes = readFileSync(join(directory, f.path));
    assert.equal(bytes.length, f.bytes, f.path);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      f.sha256,
      f.path,
    );
    assert(
      bytes.equals(readFileSync(f.path)),
      "Archive differs from current source: " + f.path,
    );
    if (f.path.endsWith(".md")) {
      const text = bytes
        .toString("utf8")
        .replace(/\x60\x60\x60[\s\S]*?\x60\x60\x60/g, "");
      for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
        const url = match[1]!.split("#")[0]!;
        if (!url || /^[a-z]+:/.test(url)) continue;
        const target = resolve(dirname(f.path), url);
        assert(
          paths.some(
            (p) => resolve(p) === target || resolve(p).startsWith(target + "/"),
          ),
          "Unshipped Markdown link: " + f.path + " -> " + url,
        );
      }
    }
  }
  run(
    [
      process.execPath,
      "install",
      "--offline",
      "--frozen-lockfile",
      "--ignore-scripts",
    ],
    directory,
  );
  for (const script of [
    "check",
    "docs:api:check",
    "check:catalog",
    "check:release-source",
  ])
    run([process.execPath, "run", script], directory);
  console.log(
    "PASS source archive: " +
      paths.length +
      " byte-matched files, shipped Markdown links, isolated frozen install, types/rules/boundaries, API/catalog and source audit",
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
