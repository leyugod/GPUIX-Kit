import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
const version = JSON.parse(readFileSync("package.json", "utf8"))
  .version as string;
const run = (args: string[], cwd: string) => {
  const r = Bun.spawnSync(args, { cwd, stdout: "pipe", stderr: "pipe" });
  assert.equal(r.exitCode, 0, String(r.stderr));
};
run([process.execPath, "run", "pack"], process.cwd());
const staging = mkdtempSync(join(tmpdir(), "gpuix-kit-starters-"));
try {
  for (const name of ["minimal", "sidebar"]) {
    const directory = join(staging, "gpuix-kit-" + name);
    cpSync("templates/" + name, directory, { recursive: true });
    mkdirSync(join(directory, "vendor"), { recursive: true });
    cpSync(
      "artifacts/mirai-gpuix-kit-" + version + ".tgz",
      join(directory, "vendor/gpuix-kit.tgz"),
    );
    const manifest = JSON.parse(
      readFileSync(join(directory, "package.json"), "utf8"),
    );
    manifest.dependencies["@mirai/gpuix-kit"] = "file:./vendor/gpuix-kit.tgz";
    writeFileSync(
      join(directory, "package.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
    // 冻结模板依赖；发布归档不携带 node_modules 或本机绝对路径。
    run([process.execPath, "install", "--ignore-scripts"], directory);
    run([process.execPath, "run", "typecheck"], directory);
    rmSync(join(directory, "node_modules"), { recursive: true });
    run(
      [
        "tar",
        "-czf",
        resolve("artifacts/gpuix-kit-" + name + "-" + version + ".tar.gz"),
        "-C",
        staging,
        "gpuix-kit-" + name,
      ],
      process.cwd(),
    );
  }
  console.log("PASS standalone starter archives: minimal, sidebar");
} finally {
  rmSync(staging, { recursive: true, force: true });
}
