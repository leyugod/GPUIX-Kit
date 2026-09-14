import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { CatalogGallery, catalogPages } from "@mirai/gallery/catalog";
const narrow = process.argv.includes("--narrow"),
  width = narrow ? 1000 : 1320,
  height = narrow ? 720 : 920;
mkdirSync("artifacts", { recursive: true });
const root = createTestRoot({ width, height });
root.render(<CatalogGallery />);
const app = await connectTest(root.renderer);
const settle = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((r) => setImmediate(r));
    root.renderer.flush();
    root.renderer.dispatchNativeEvents();
  }
};
try {
  await settle();
  for (const mode of ["dark", "light"]) {
    await app.getByTestId("catalog-theme-" + mode).click();
    await settle();
    for (const page of catalogPages) {
      await app.getByTestId("catalog-page-" + page).click();
      await settle();
      assert(root.renderer.getPaintedText().length > 0);
      await app.screenshot({
        path: resolve(
          "artifacts/catalog-" +
            page +
            "-" +
            mode +
            (narrow ? "-narrow" : "") +
            ".png",
        ),
      });
      if (page === "gradient") {
        const png = PNG.sync.read(
          readFileSync(
            resolve(
              "artifacts/catalog-" +
                page +
                "-" +
                mode +
                (narrow ? "-narrow" : "") +
                ".png",
            ),
          ),
        );
        const decoded = jsQR(
          new Uint8ClampedArray(png.data),
          png.width,
          png.height,
        );
        assert.equal(
          decoded?.data,
          "https://gpuix.dev/",
          "native QR screenshot decodes",
        );
      }
      const footer = await app.getByTestId("catalog-event").bounds();
      assert(footer.y + footer.height <= height + 1, "footer within viewport");
    }
  }
  console.log(
    "PASS catalog " +
      width +
      "x" +
      height +
      ": " +
      catalogPages.length +
      " pages in both themes; native QR decoded",
  );
} finally {
  root.render(null);
  await app.close();
}
