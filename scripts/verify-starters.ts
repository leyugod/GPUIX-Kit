import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
  realpathSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
const version = JSON.parse(readFileSync("package.json", "utf8"))
  .version as string;
const run = (args: string[], cwd = process.cwd(), env = process.env) => {
  const r = Bun.spawnSync(args, { cwd, env, stdout: "pipe", stderr: "pipe" });
  assert.equal(r.exitCode, 0, String(r.stdout) + "\n" + String(r.stderr));
  return String(r.stdout);
};
if (!process.argv.includes("--existing"))
  run([process.execPath, "run", "build:starters"]);
const directory = mkdtempSync(join(tmpdir(), "gpuix-kit-starter-consumer-"));
try {
  for (const name of ["minimal", "sidebar"]) {
    run([
      "tar",
      "-xzf",
      resolve("artifacts/gpuix-kit-" + name + "-" + version + ".tar.gz"),
      "-C",
      directory,
    ]);
    const cwd = join(directory, "gpuix-kit-" + name);
    run(
      [process.execPath, "install", "--frozen-lockfile", "--ignore-scripts"],
      cwd,
    );
    run([process.execPath, "run", "typecheck"], cwd);
    assert(
      realpathSync(join(cwd, "node_modules/@mirai/gpuix-kit")).startsWith(
        realpathSync(directory),
      ),
      "UIKit must resolve inside independent consumer",
    );
    writeFileSync(
      join(cwd, "verify.tsx"),
      'import assert from "node:assert/strict";\nimport {createTestRoot} from "@gpuix/react/testing";\nimport {connectTest} from "@gpuix/react/automation";\nimport {App} from "./src/app";\nconst root=createTestRoot({width:1100,height:760});\nconst app=await connectTest(root.renderer);\nconst settle=async()=>{for(let i=0;i<3;i++){await new Promise(r=>setImmediate(r));root.renderer.flush();root.renderer.dispatchNativeEvents();}};\ntry{\n root.render(<App/>);await settle();\n await app.getByTestId("starter-name").fill("Independent app");await settle();\n assert((await app.getByTestId("starter-greeting").textContent()).includes("Independent app"));\n await app.getByTestId("starter-action").click();await settle();\n assert((await app.getByTestId("starter-action").textContent()).includes("1"));\n if(process.env.STARTER_KIND==="sidebar"){\n  await app.getByTestId("starter-nav-item-settings").click();await settle();\n  assert(root.renderer.findByTestId("starter-enabled"));\n  await app.getByTestId("starter-enabled").click();await settle();\n  await app.getByTestId("starter-sidebar-toggle").click();await settle();\n  assert(!root.renderer.findByTestId("starter-nav"));\n  await app.getByTestId("starter-sidebar-toggle").click();await settle();\n  assert(root.renderer.findByTestId("starter-nav"));\n }\n for(const mode of ["light","dark"]){\n  await app.getByTestId("starter-theme-"+mode).click();await settle();\n  await app.screenshot({path:process.env.STARTER_ARTIFACTS+"/starter-"+process.env.STARTER_KIND+"-"+mode+".png"});\n }\n console.log("PASS isolated native starter: "+process.env.STARTER_KIND);\n}finally{root.render(null);await app.close();}\n',
    );
    console.log(
      run([process.execPath, "verify.tsx"], cwd, {
        ...process.env,
        STARTER_KIND: name,
        STARTER_ARTIFACTS: resolve("artifacts"),
      }),
    );
    console.log(
      run(
        [
          process.execPath,
          resolve("scripts/verify-delivery-live.ts"),
          join(cwd, "src/main.tsx"),
          "starter",
          name,
        ],
        cwd,
        { ...process.env, DELIVERY_ARTIFACTS: resolve("artifacts") },
      ),
    );
  }
  writeFileSync(
    "artifacts/starters-validation.json",
    JSON.stringify(
      {
        version,
        status: "passed",
        templates: ["minimal", "sidebar"],
        checks: [
          "frozen install",
          "isolated dependency resolution",
          "typecheck",
          "native interactions",
          "real window input and both themes",
        ],
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
