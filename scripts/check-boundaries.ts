import ts from "typescript";
import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
const roots = ["apps", "packages"];
const violations: string[] = [];
const packageGraph = new Map<string, Set<string>>();
const publicExports = new Map<string, Set<string>>();
// 子路径也必须由目标包显式公开，不能通过内部源码路径绕过边界。
for (const entry of new Bun.Glob("{apps,packages}/*/package.json").scanSync(
  ".",
)) {
  const manifest = JSON.parse(readFileSync(entry, "utf8"));
  const exports = manifest.exports;
  publicExports.set(
    manifest.name,
    new Set(
      typeof exports === "string"
        ? ["."]
        : Object.keys(exports ?? {}).filter((key) => exports[key] !== null),
    ),
  );
}
for (const area of roots) {
  for (const entry of new Bun.Glob(`${area}/*/package.json`).scanSync(".")) {
    const manifest = JSON.parse(readFileSync(entry, "utf8")) as {
      name: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
    const base = resolve(entry, "..");
    const deps = {
      ...manifest.peerDependencies,
      ...manifest.dependencies,
      ...manifest.devDependencies,
    };
    const edges = new Set(
      Object.keys(deps).filter((d) => publicExports.has(d)),
    );
    packageGraph.set(manifest.name, edges);
    for (const file of new Bun.Glob("**/*.{ts,tsx}").scanSync({
      cwd: base,
      onlyFiles: true,
    })) {
      if (file.startsWith("node_modules/")) continue;
      const full = resolve(base, file);
      const sf = ts.createSourceFile(
        full,
        readFileSync(full, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
      const visit = (node: ts.Node) => {
        let spec: string | undefined;
        if (
          (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier)
        )
          spec = node.moduleSpecifier.text;
        if (
          ts.isCallExpression(node) &&
          node.arguments[0] &&
          ts.isStringLiteral(node.arguments[0]) &&
          (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
            (ts.isIdentifier(node.expression) &&
              node.expression.text === "require"))
        )
          spec = node.arguments[0].text;
        if (spec) {
          const test = file.endsWith(".test.ts");
          const label = relative(process.cwd(), full);
          const problem = (reason: string) =>
            violations.push(`${label}: ${reason} (${spec})`);
          const packageName = spec.startsWith("@")
            ? spec.split("/").slice(0, 2).join("/")
            : spec.split("/")[0]!;
          if (
            publicExports.has(packageName) &&
            spec !== packageName &&
            !publicExports
              .get(packageName)
              ?.has("." + spec.slice(packageName.length))
          )
            problem("跨包只能使用声明的公开入口");
          if (
            spec.startsWith(".") &&
            !resolve(full, "..", spec).startsWith(base + "/")
          )
            problem("相对路径越过 Workspace 边界");
          if (
            !spec.startsWith(".") &&
            !spec.startsWith("node:") &&
            !spec.startsWith("bun:") &&
            !test &&
            !(packageName in deps)
          )
            problem("未声明依赖");
          if (
            manifest.name === "@mirai/gpuix-kit" &&
            /@mirai\/gallery|apps\/|node:|bun:|react-dom/.test(spec)
          )
            problem("UIKit 不得依赖应用、平台存储或 DOM 渲染器");
        }
        if (
          manifest.name === "@mirai/gpuix-kit" &&
          ts.isIdentifier(node) &&
          ["document", "localStorage", "sessionStorage"].includes(node.text)
        )
          violations.push(`${file}: UIKit 不得使用浏览器全局对象 ${node.text}`);
        if (
          (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
          node.tagName.getText(sf) === "text" &&
          !file.endsWith("base/primitives.tsx")
        )
          violations.push(`${file}: 普通文字必须使用 UIKit Text`);
        ts.forEachChild(node, visit);
      };
      visit(sf);
    }
  }
}
function walk(name: string, path: string[]) {
  if (path.includes(name)) {
    violations.push(`循环依赖: ${[...path, name].join(" → ")}`);
    return;
  }
  for (const next of packageGraph.get(name) ?? []) walk(next, [...path, name]);
}
for (const name of packageGraph.keys()) walk(name, []);
if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log(
  `PASS: TypeScript AST import/re-export/dynamic-import checks; ${packageGraph.size} Workspace packages; dependency graph acyclic`,
);
