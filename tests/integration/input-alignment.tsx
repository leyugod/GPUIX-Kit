import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PNG } from "pngjs";
import { useState } from "react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Row,
  Text,
  Input,
  Textarea,
  SearchField,
  NumberField,
  DateField,
  VerificationCodeInput,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 1040, height: 820 });
const app = await connectTest(root.renderer);
const settle = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((r) => setImmediate(r));
    root.renderer.flush();
    root.renderer.dispatchNativeEvents();
  }
};
const rows = [
  [
    { id: "small", size: "sm" as const },
    { id: "medium", size: "md" as const },
    { id: "large", size: "lg" as const },
  ],
  [
    { id: "placeholder", placeholder: "HHHH", value: "" },
    { id: "disabled", disabled: true },
    { id: "readonly", readOnly: true },
  ],
  [
    { id: "tall", style: { height: 56 } },
    { id: "font", style: { height: 56, fontSize: 18 } },
    { id: "symbols", value: "中 ⌕ Hgj" },
  ],
];
function Fields({ mode }: { mode: "light" | "dark" }) {
  const [value, setValue] = useState("HHHH"),
    [code, setCode] = useState("123456");
  return (
    <UIKitProvider mode={mode}>
      <AppShell>
        <Stack style={{ padding: 20 }} gap={16}>
          {rows.map((row, i) => (
            <Row key={i} gap={18}>
              {row.map(({ id, ...props }) => (
                <Stack key={id} style={{ width: 320 }} gap={4}>
                  <Text>{id}</Text>
                  <Input
                    testId={id}
                    value={value}
                    onValueChange={setValue}
                    {...props}
                  />
                </Stack>
              ))}
            </Row>
          ))}
          <Row gap={18}>
            <Stack style={{ width: 320 }}>
              <Text>Search</Text>
              <SearchField
                testId="search"
                value="HHHH"
                onValueChange={() => {}}
              />
            </Stack>
            <Stack style={{ width: 320 }}>
              <Text>Number</Text>
              <NumberField
                testId="number"
                value={1234}
                onValueChange={() => {}}
              />
            </Stack>
            <Stack style={{ width: 320 }}>
              <Text>Date</Text>
              <DateField
                testId="date"
                value="2026-09-14"
                onValueChange={() => {}}
              />
            </Stack>
          </Row>
          <Row gap={18}>
            <Stack style={{ width: 320 }}>
              <Text>Code</Text>
              <VerificationCodeInput
                testId="code"
                value={code}
                onValueChange={setCode}
              />
            </Stack>
            <Stack style={{ width: 650 }}>
              <Text>Multiline retains top alignment</Text>
              <Textarea
                testId="multiline"
                value="HHHH"
                onValueChange={() => {}}
                style={{ height: 140 }}
              />
            </Stack>
          </Row>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
// 测量原生截图的实际字形，而非只检查 style 属性；排除边框和圆角。
function ink(
  png: PNG,
  b: { x: number; y: number; width: number; height: number },
) {
  const scale = png.width / 1040,
    left = Math.round((b.x + 7) * scale),
    right = Math.round((b.x + b.width - (b.width > 100 ? 40 : 7)) * scale),
    top = Math.round((b.y + 3) * scale),
    bottom = Math.round((b.y + b.height - 3) * scale);
  const bgIndex =
    (Math.round((b.y + b.height / 2) * scale) * png.width + right - 3) * 4;
  const bg = [
    png.data[bgIndex]!,
    png.data[bgIndex + 1]!,
    png.data[bgIndex + 2]!,
  ];
  let min = Infinity,
    max = -Infinity;
  for (let y = top; y < bottom; y++)
    for (let x = left; x < right; x++) {
      const n = (y * png.width + x) * 4;
      if (Math.max(...bg.map((v, c) => Math.abs(png.data[n + c]! - v))) > 36) {
        min = Math.min(min, y);
        max = Math.max(max, y);
      }
    }
  assert(Number.isFinite(min), "visible ink");
  return {
    bounds: b,
    bg,
    offset: (min + max + 1) / 2 / scale - (b.y + b.height / 2),
    top: min / scale - b.y,
  };
}
const result: Record<string, unknown> = {};
try {
  for (const mode of ["light", "dark"] as const) {
    root.render(<Fields mode={mode} />);
    await settle();
    const path = resolve("artifacts/input-alignment-" + mode + ".png");
    await app.screenshot({ path });
    const png = PNG.sync.read(readFileSync(path)),
      measurements: Record<string, ReturnType<typeof ink>> = {};
    for (const id of [
      ...rows.flat().map((x) => x.id),
      "search",
      "number",
      "date",
      "code-input",
      "number-decrement",
      "number-increment",
    ]) {
      measurements[id] = ink(png, await app.getByTestId(id).bounds());
    }
    const multiline = ink(png, await app.getByTestId("multiline").bounds());
    result[mode] = { measurements, multiline };
    writeFileSync(
      "artifacts/input-alignment.json",
      JSON.stringify(result, null, 2) + "\n",
    );
    if (!process.argv.includes("--observe")) {
      for (const [id, m] of Object.entries(measurements))
        assert(
          Math.abs(m.offset) <= 2.5,
          mode + " " + id + " ink center offset " + m.offset,
        );
      assert(multiline.top < 30, "Multiline first line remains at top");
    }
  }
  await app.getByTestId("medium").fill("Edited");
  await settle();
  assert.equal(
    root.renderer.findByTestId("medium")?.customProps?.value,
    "Edited",
  );
  await app.getByTestId("code-input").fill("001234");
  await settle();
  assert.equal(
    root.renderer.findByTestId("code-input")?.customProps?.value,
    "001234",
  );
  console.log(
    (process.argv.includes("--observe") ? "OBSERVED" : "PASS") +
      " input alignment: actual glyphs, placeholders, symbols, sizes, custom heights, protected states, derived fields, stepper icons and multiline top alignment",
  );
} finally {
  root.render(null);
  await app.close();
}
