import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const manifest = (await Bun.file("package.json").json()) as {
  version: string;
  scripts: Record<string, string>;
};
if (process.platform !== "darwin") {
  console.error(
    "Native release verification requires a macOS graphical session.",
  );
  process.exit(1);
}
mkdirSync("artifacts/release-logs", { recursive: true });
const commands = Object.entries(manifest.scripts)
  .filter(
    ([, cmd]) =>
      cmd.startsWith("bun tests/integration/") && !cmd.includes("live.ts"),
  )
  .map(([name]) => name);
const report: {
  version: string;
  status: string;
  commands: { command: string; status: string; log: string }[];
} = { version: manifest.version, status: "running", commands: [] };
for (const name of commands) {
  const path = "artifacts/release-logs/" + name.replaceAll(":", "-") + ".log";
  const child = Bun.spawn([process.execPath, "run", name], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [out, err, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  writeFileSync(path, out + err);
  report.commands.push({
    command: "bun run " + name,
    status: code === 0 ? "passed" : "failed",
    log: path,
  });
  report.status = code === 0 ? "running" : "failed";
  writeFileSync(
    "artifacts/native-release.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log((code === 0 ? "PASS " : "FAIL ") + name);
  if (code !== 0) {
    console.error(out + err);
    process.exit(code ?? 1);
  }
}
report.status = "passed";
writeFileSync(
  "artifacts/native-release.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  "PASS all " + commands.length + " native scripts for " + manifest.version,
);
