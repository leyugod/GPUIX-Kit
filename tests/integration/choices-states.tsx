import { useRef, useState } from "react";
import type { PublicInstance } from "@gpuix/react";
import assert from "node:assert/strict";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Text,
  Button,
  Checkbox,
  CheckboxGroup,
  TokenField,
  Dialog,
  type Token,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 900, height: 800 });
const app = await connectTest(root.renderer);
let calls = 0;
let followingCalls = 0;
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
function States() {
  return (
    <UIKitProvider>
      <AppShell>
        <Stack>
          <Checkbox
            testId="held"
            label="Hold does not toggle"
            checked="indeterminate"
            onCheckedChange={() => {
              calls++;
            }}
          />
          <CheckboxGroup
            testId="all-disabled"
            options={[{ value: "x", label: "X", disabled: true }]}
            value={["x"]}
            onValueChange={() => {
              calls++;
            }}
          />
          <CheckboxGroup
            testId="duplicates"
            options={[
              { value: "x", label: "X" },
              { value: "x", label: "Again" },
            ]}
            value={[]}
            onValueChange={() => {
              calls++;
            }}
          />
          <TokenField
            testId="invalid-tokens"
            value={[
              { id: "same", label: "A" },
              { id: "same", label: "B" },
            ]}
            onValueChange={() => {
              calls++;
            }}
            inputValue="Draft"
            onInputValueChange={() => {}}
          />
          <TokenField
            testId="readonly"
            readOnly
            value={[{ id: "a", label: "A" }]}
            onValueChange={() => {
              calls++;
            }}
            inputValue=""
            onInputValueChange={() => {
              calls++;
            }}
          />
          <Button
            testId="after"
            onPress={() => {
              calls++;
            }}
          >
            After
          </Button>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function Nested() {
  const [open, setOpen] = useState(true),
    [tokens, setTokens] = useState<Token[]>([{ id: "one", label: "One" }]),
    [draft, setDraft] = useState("");
  const ref = useRef<PublicInstance>(null);
  return (
    <UIKitProvider>
      <AppShell
        overlay={
          <Dialog
            testId="outer"
            title="Labels"
            open={open}
            onOpenChange={setOpen}
            restoreFocusRef={ref}
          >
            <TokenField
              testId="nested"
              value={tokens}
              onValueChange={setTokens}
              inputValue={draft}
              onInputValueChange={setDraft}
            />
            <Text testId="nested-draft">{draft}</Text>
            <Button
              testId="following"
              onPress={() => {
                followingCalls++;
              }}
            >
              Following control
            </Button>
          </Dialog>
        }
      >
        <Button ref={ref} testId="trigger" onPress={() => setOpen(true)}>
          Labels
        </Button>
      </AppShell>
    </UIKitProvider>
  );
}
function Factory() {
  const [draft, setDraft] = useState("safe,bad");
  return (
    <UIKitProvider>
      <AppShell>
        <TokenField
          testId="factory"
          value={[]}
          onValueChange={() => {
            calls++;
          }}
          inputValue={draft}
          onInputValueChange={setDraft}
          createToken={(label) => {
            if (label === "bad") throw Error("private details");
            return { id: label, label };
          }}
        />
        <Text testId="factory-draft">{draft}</Text>
      </AppShell>
    </UIKitProvider>
  );
}
try {
  root.render(<States />);
  await settle();
  const held = get("held");
  assert(held);
  root.renderer.nativeSimulateKeyDown(held.id, "space", true);
  await settle();
  assert.equal(calls, 0);
  await press("all-disabled-all", "enter");
  assert.equal(calls, 0);
  assert(get("duplicates-error"));
  assert(!get("duplicates-x"));
  assert(get("invalid-tokens-error"));
  await press("invalid-tokens-add", "enter");
  assert.equal(calls, 0);
  await press("readonly-input", "shift-tab");
  root.renderer.simulateKeystrokes("backspace");
  await settle();
  assert(get("readonly-token-a"));
  assert.equal(calls, 0);
  await press("readonly-input", "tab");
  root.renderer.simulateKeystrokes("enter");
  await settle();
  assert.equal(calls, 1, "Read-only field can navigate to following button");
  root.render(<Nested />);
  await settle();
  await press("nested-input", "shift-tab");
  root.renderer.simulateKeystrokes("escape");
  await settle();
  assert(get("outer"), "Token Escape clears token selection first");
  root.renderer.simulateKeystrokes("x");
  await settle();
  assert.equal(await app.getByTestId("nested-draft").textContent(), "x");
  root.renderer.simulateKeystrokes("escape");
  await settle();
  assert(!get("outer"));
  root.renderer.simulateKeystrokes("enter");
  await settle();
  assert(get("outer"), "Dialog restores focus");
  await app.getByTestId("nested-input").fill("");
  await settle();
  await press("nested-input", "shift-tab");
  root.renderer.simulateKeystrokes("backspace");
  await settle();
  assert(!get("nested-token-one"));
  root.renderer.simulateKeystrokes("n");
  await settle();
  assert.equal(
    await app.getByTestId("nested-draft").textContent(),
    "n",
    "Deleting final token restores input",
  );
  const beforeReset = get("nested-input")?.id;
  await press("nested-input", "tab");
  assert.equal(
    await app.getByTestId("nested-draft").textContent(),
    "n",
    "Tab does not write into the controlled draft",
  );
  assert.notEqual(get("nested-input")?.id, beforeReset);
  root.renderer.simulateKeystrokes("tab");
  await settle();
  root.renderer.simulateKeystrokes("enter");
  await settle();
  assert.equal(
    followingCalls,
    1,
    "Rebuilt editor retains component focus order: editor, Add, following control",
  );
  root.render(<Factory />);
  await settle();
  await press("factory-input", "enter");
  assert(get("factory-error"));
  assert.equal(
    await app.getByTestId("factory-draft").textContent(),
    "safe,bad",
  );
  assert(
    !(await app.getByTestId("factory-error").textContent()).includes(
      "private details",
    ),
  );
  assert.equal(calls, 1);
  console.log(
    "PASS choices held/disabled/invalid/read-only, Tab, nested Escape, final-token focus and atomic factory failure",
  );
} finally {
  root.render(null);
  await app.close();
}
