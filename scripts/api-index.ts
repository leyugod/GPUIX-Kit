import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const manifest = JSON.parse(
  readFileSync("packages/uikit/package.json", "utf8"),
) as { version: string; exports: Record<string, string> };
const config = ts.readConfigFile(
  "packages/uikit/tsconfig.json",
  ts.sys.readFile,
);
if (config.error) throw Error("Cannot read package TypeScript config");
const parsed = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  resolve("packages/uikit"),
);
const program = ts.createProgram(parsed.fileNames, parsed.options),
  checker = program.getTypeChecker();
const sections = Object.entries(manifest.exports).map(([entry, path]) => {
  const source = program.getSourceFile(resolve("packages/uikit", path));
  const symbol = source && checker.getSymbolAtLocation(source);
  if (!symbol) throw Error("Missing export module: " + entry);
  const names = checker
    .getExportsOfModule(symbol)
    .map((s) => s.getName())
    .sort();
  return { entry, path, names };
});
const markdown =
  "# Public API index · " +
  manifest.version +
  "\n\nGenerated from package exports and TypeScript symbols. This inventory identifies shipped exports, not a component-completeness score. See [release scope](releases/" +
  manifest.version +
  ".md) and component guides for behavior and limits.\n\n" +
  sections
    .map(
      (s) =>
        "## " +
        (s.entry === "." ? "@mirai/gpuix-kit" : s.entry) +
        "\n\n[Source](../packages/uikit/" +
        s.path.replace(/^\.\//, "") +
        ")\n\n" +
        s.names.map((n) => "`" + n + "`").join(", ") +
        "\n",
    )
    .join("\n");
if (process.argv.includes("--check")) {
  if (readFileSync("docs/api-index.md", "utf8") !== markdown)
    throw Error("API index is stale; run bun run docs:api");
} else writeFileSync("docs/api-index.md", markdown);
console.log("PASS public API index: " + sections.length + " entry points");
