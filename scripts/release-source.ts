import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
  version: string;
  scripts: Record<string, string>;
};
const roots = [
  "AGENTS.md",
  "README.md",
  "README.en.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CHANGELOG.md",
  ".gitignore",
  "package.json",
  "bun.lock",
  "tsconfig.base.json",
  "tsconfig.tools.json",
  "vitest.config.ts",
  ".github",
  "apps",
  "packages",
  "docs",
  "scripts",
  "tests",
];
const required = [
  ".github/workflows/ci.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  "docs/releases/" + manifest.version + ".md",
  "docs/untitled-ui-coverage.json",
  "docs/untitled-ui-coverage.md",
  "packages/uikit/docs/catalog-completion.md",
  "docs/releases/validation-" + manifest.version + ".md",
  "docs/releases/native-" + manifest.version + ".json",
  "docs/api-index.md",
  "docs/releasing.md",
  "packages/uikit/docs/table-preferences.md",
  "packages/uikit/docs/host-adapter.md",
];
const native = JSON.parse(
  readFileSync("docs/releases/native-" + manifest.version + ".json", "utf8"),
);
const expected = Object.entries(manifest.scripts)
  .filter(
    ([, cmd]) =>
      cmd.startsWith("bun tests/integration/") && !cmd.includes("live.ts"),
  )
  .map(([name]) => "bun run " + name)
  .sort();
if (
  native.version !== manifest.version ||
  native.status !== "passed" ||
  native.commands.some((c: { status: string }) => c.status !== "passed") ||
  JSON.stringify(
    native.commands.map((c: { command: string }) => c.command).sort(),
  ) !== JSON.stringify(expected)
)
  throw Error("Current release requires every native regression result");
const files: string[] = [];
const excluded = new Set([
  "node_modules",
  "artifacts",
  ".git",
  ".DS_Store",
  ".codex",
  ".agents",
  "dist",
  "coverage",
]);
function visit(path: string) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink())
    throw Error("Source symlinks are not supported: " + path);
  if (stat.isDirectory()) {
    for (const name of readdirSync(path).sort()) {
      if (
        excluded.has(name) ||
        name.endsWith(".log") ||
        name.startsWith(".env")
      )
        continue;
      visit(join(path, name));
    }
  } else if (stat.isFile()) files.push(path);
}
for (const path of roots) {
  if (!existsSync(path)) throw Error("Missing release input: " + path);
  visit(path);
}
for (const path of required)
  if (!files.includes(path)) throw Error("Missing release document: " + path);
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:ghp_|github_pat_)[A-Za-z0-9_]{25,}\b/,
  /\bsk-[A-Za-z0-9]{32,}\b/,
  /\/Users\/[A-Za-z0-9_.-]+\//,
];
const inventory = files.sort().map((path) => {
  const bytes = readFileSync(path);
  if (path.endsWith(".png")) {
    if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a")
      throw Error("Invalid PNG: " + path);
  } else {
    const content = bytes.toString("utf8");
    if (patterns.some((p) => p.test(content)))
      throw Error("Review potentially private release content in " + path);
  }
  return {
    path,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
});
const kit = JSON.parse(readFileSync("packages/uikit/package.json", "utf8")),
  gallery = JSON.parse(readFileSync("apps/gallery/package.json", "utf8"));
if (kit.version !== manifest.version || gallery.version !== manifest.version)
  throw Error("Workspace versions differ");
if (
  readFileSync("LICENSE", "utf8") !==
  readFileSync("packages/uikit/LICENSE", "utf8")
)
  throw Error("Root and package license differ");
for (const target of Object.values(kit.exports) as string[])
  if (!files.includes(join("packages/uikit", target)))
    throw Error("Unshipped public export: " + target);
console.log(
  "PASS release source audit: " +
    files.length +
    " explicitly selected files; no dependency directories or generated artifacts",
);
if (!process.argv.includes("--check")) {
  mkdirSync("artifacts", { recursive: true });
  const prefix = "artifacts/gpuixKit-" + manifest.version + "-source",
    fileList = prefix + ".files";
  writeFileSync(fileList, files.join("\n") + "\n");
  const result = Bun.spawnSync(
    ["tar", "-czf", prefix + ".tar.gz", "-T", fileList],
    {
      env: { ...process.env, COPYFILE_DISABLE: "1" },
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  if (result.exitCode !== 0)
    throw Error("Source archive failed: " + result.stderr);
  writeFileSync(
    prefix + ".manifest.json",
    JSON.stringify(
      { version: manifest.version, scope: "source-only", files: inventory },
      null,
      2,
    ) + "\n",
  );
  console.log("READY " + prefix + ".tar.gz");
}
