import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
// 清单只收录明确交付附件，不扫描整个 artifacts 目录。
const version = JSON.parse(readFileSync("package.json", "utf8"))
  .version as string;
const names = [
  "mirai-gpuix-kit-" + version + ".tgz",
  "gpuix-kit-minimal-" + version + ".tar.gz",
  "gpuix-kit-sidebar-" + version + ".tar.gz",
  "gpuixKit-" + version + "-source.tar.gz",
  "gpuixKit-" + version + "-source.manifest.json",
];
const lines = names.map(
  (name) =>
    createHash("sha256")
      .update(readFileSync("artifacts/" + name))
      .digest("hex") +
    "  " +
    name,
);
writeFileSync(
  "artifacts/" + version + "-SHA256SUMS.txt",
  lines.join("\n") + "\n",
);
console.log("READY " + names.length + " release assets with SHA-256 checksums");
