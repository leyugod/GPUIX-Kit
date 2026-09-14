import ts from "typescript";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";
// 示例、手册和 Gallery 使用同一份源码，参数从真实公开类型提取。
const inventory = JSON.parse(
  readFileSync("docs/untitled-ui-coverage.json", "utf8"),
) as {
  version: string;
  rows: {
    id: string;
    group: string;
    reference: string;
    exports: string[];
    guide: string;
  }[];
};
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
const module = program.getSourceFile(resolve("packages/uikit/src/index.ts"))!;
const symbols = new Map(
  checker
    .getExportsOfModule(checker.getSymbolAtLocation(module)!)
    .map((s) => [s.name, s]),
);
const check = process.argv.includes("--check");
function output(path: string, content: string) {
  if (check) {
    if (readFileSync(path, "utf8") !== content)
      throw Error("Stale handbook: " + path);
  } else {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
}
const rows = inventory.rows.map((row) => {
  const code = readFileSync(
    "apps/gallery/src/examples/" + row.id + ".tsx",
    "utf8",
  );
  const components = row.exports.flatMap((name) => {
    let symbol = symbols.get(name);
    if (!symbol) throw Error("Unknown export " + name);
    if (symbol.flags & ts.SymbolFlags.Alias)
      symbol = checker.getAliasedSymbol(symbol);
    const declaration = symbol.valueDeclaration;
    if (!declaration || !/^[A-Z]/.test(name)) return [];
    const signature = checker
        .getTypeOfSymbolAtLocation(symbol, declaration)
        .getCallSignatures()[0],
      param = signature?.parameters[0];
    if (!param) return [];
    const props = checker
      .getPropertiesOfType(
        checker.getTypeOfSymbolAtLocation(param, declaration),
      )
      .map((prop) => ({
        name: prop.name,
        required: !(prop.flags & ts.SymbolFlags.Optional),
        type: checker.typeToString(
          checker.getTypeOfSymbolAtLocation(
            prop,
            prop.valueDeclaration ?? declaration,
          ),
          undefined,
          ts.TypeFormatFlags.NoTruncation,
        ),
        description: ts.displayPartsToString(
          prop.getDocumentationComment(checker),
        ),
      }));
    return [
      {
        name,
        source: relative(process.cwd(), declaration.getSourceFile().fileName),
        props,
      },
    ];
  });
  if (!components.length) throw Error("No component signatures: " + row.id);
  return { ...row, code, components };
});
const labels: Record<string, string> = {
  base: "Base components · 基础组件",
  application: "Application components · 应用组件",
  marketing: "Marketing components · 营销组件",
};
output(
  "apps/gallery/src/handbook-data.json",
  JSON.stringify(rows, null, 2) + "\n",
);
output(
  "apps/gallery/src/handbook-examples.ts",
  rows
    .map((r, i) => "import Example" + i + ' from "./examples/' + r.id + '";')
    .join("\n") +
    '\nimport type {ComponentType} from "react";\nexport const examples:Record<string,ComponentType>={\n' +
    rows.map((r, i) => JSON.stringify(r.id) + ":Example" + i).join(",\n") +
    "\n};\n",
);
const escape = (s: string) => s.replaceAll("|", "\\|").replaceAll("\n", " ");
for (const row of rows) {
  const props = row.components
    .map(
      (c) =>
        "### " +
        c.name +
        "\n\n[Implementation](../../" +
        c.source +
        ")\n\n| Prop | Required | Type | Description |\n| --- | --- | --- | --- |\n" +
        c.props
          .map(
            (p) =>
              "| " +
              p.name +
              " | " +
              (p.required ? "yes" : "no") +
              " | \u0060" +
              escape(p.type) +
              "\u0060 | " +
              escape(p.description) +
              " |",
          )
          .join("\n"),
    )
    .join("\n\n");
  output(
    "docs/components/" + row.id + ".md",
    "# " +
      row.reference +
      "\n\n[All components](index.md) · " +
      labels[row.group] +
      "\n\nPublic imports: " +
      row.exports.map((s) => "\u0060" + s + "\u0060").join(", ") +
      " from \u0060@mirai/gpuix-kit\u0060.\n\n[Behavior and host boundaries](../../" +
      row.guide +
      ") · [Runnable source](../../apps/gallery/src/examples/" +
      row.id +
      ".tsx)\n\n![Light preview](../images/components/" +
      row.id +
      "-light.png)\n\n![Dark preview](../images/components/" +
      row.id +
      "-dark.png)\n\n## Example\n\nRender inside \u0060UIKitProvider\u0060 and \u0060AppShell\u0060; see [quick start](../getting-started.md). State and service callbacks belong to your application.\n\n\u0060\u0060\u0060tsx\n" +
      row.code +
      "\u0060\u0060\u0060\n\n## Props\n\nGenerated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).\n\n" +
      props +
      "\n",
  );
}
output(
  "docs/components/index.md",
  "# Component handbook · " +
    inventory.version +
    "\n\n[Quick start](../getting-started.md) · [Full API index](../api-index.md) · [Apple sidebar guide](../../packages/uikit/docs/sidebars.md)\n\nRun \u0060bun run dev\u0060 for native previews, search, Props and copyable JSX in one window. All 85 reference categories below have runnable examples and both theme previews. Supporting primitives, models and adapters remain in the API index.\n\nNaming follows the [Untitled UI directory](https://www.untitledui.com/react/components) and [searchable icon resources](https://www.untitledui.com/resources/icons). Existing public PascalCase exports stay compatible; category identifiers use kebab-case. Visuals use the kit's Darwin themes.\n\n" +
    Object.entries(labels)
      .map(
        ([g, label]) =>
          "## " +
          label +
          "\n\n" +
          rows
            .filter((r) => r.group === g)
            .map(
              (r) =>
                "- [" +
                r.reference +
                "](" +
                r.id +
                ".md) — " +
                r.exports.join(", "),
            )
            .join("\n"),
      )
      .join("\n\n") +
    "\n",
);
console.log("PASS handbook: " + rows.length + " examples and API pages");
