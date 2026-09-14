import ts from "typescript";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const data = JSON.parse(
  readFileSync("docs/untitled-ui-coverage.json", "utf8"),
) as {
  version: string;
  reference: string;
  checkedAt: string;
  counts: Record<string, number>;
  rows: {
    id: string;
    group: string;
    reference: string;
    exports: string[];
    status: string;
    guide: string;
    validation: string;
  }[];
};
const root = JSON.parse(readFileSync("package.json", "utf8"));
const config = ts.readConfigFile(
  "packages/uikit/tsconfig.json",
  ts.sys.readFile,
);
const parsed = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  resolve("packages/uikit"),
);
const program = ts.createProgram(parsed.fileNames, parsed.options),
  checker = program.getTypeChecker();
const source = program.getSourceFile(resolve("packages/uikit/src/index.ts"))!;
const exports = new Set(
  checker
    .getExportsOfModule(checker.getSymbolAtLocation(source)!)
    .map((s) => s.getName()),
);
if (data.version !== root.version) throw Error("Catalog version differs");
if (data.rows.length !== 85 || new Set(data.rows.map((r) => r.id)).size !== 85)
  throw Error("Incomplete reference category inventory");
for (const [group, count] of Object.entries({
  base: 30,
  application: 37,
  marketing: 18,
})) {
  if (data.rows.filter((r) => r.group === group).length !== count)
    throw Error("Incomplete group " + group);
}
for (const row of data.rows) {
  if (
    row.status !== "implemented-native-contract" ||
    !row.exports.length ||
    row.exports.some((e) => !exports.has(e))
  )
    throw Error("Missing public component: " + row.id);
  if (!existsSync(row.guide) || !root.scripts[row.validation])
    throw Error("Missing guide or validation entry: " + row.id);
}
const markdown =
  "# Untitled UI directory mapping · " +
  data.version +
  "\n\nReference: [official component directory](" +
  data.reference +
  "), checked " +
  data.checkedAt +
  ".\n\nAll 30 base, 37 application and 18 marketing component categories are mapped below. This is a native API mapping, not a claim of identical commercial variations or browser behavior. Full-page examples are outside the component directory. The source list is [machine-readable](untitled-ui-coverage.json).\n\nFor contracts, host boundaries and examples see [component guide](../packages/uikit/docs/catalog-completion.md). Each row is included in the sequential native regression suite; results are recorded in [release validation](releases/validation-" + data.version + ".md). The mapping check alone does not prove runtime behavior.\n\n| Group | Reference category | Public components | Contract | Status |\n| --- | --- | --- | --- | --- |\n" +
  data.rows
    .map(
      (r) =>
        "| " +
        r.group +
        " | " +
        r.reference +
        " | " +
        r.exports.join(", ") +
        " | [Guide](../" +
        r.guide +
        ") | Native contract implemented |",
    )
    .join("\n") +
  "\n";
if (process.argv.includes("--write"))
  writeFileSync("docs/untitled-ui-coverage.md", markdown);
else if (readFileSync("docs/untitled-ui-coverage.md", "utf8") !== markdown)
  throw Error("Stale mapping; run docs:catalog");
console.log(
  "PASS catalog mapping: 85/85 categories have public exports, documented contracts and a regression entry; runtime evidence remains separate",
);
