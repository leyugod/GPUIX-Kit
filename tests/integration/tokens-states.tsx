import assert from "node:assert/strict";
import { resolve } from "node:path";
import { useState, type ReactNode } from "react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Button,
  Dialog,
  TokenSuggestionList,
  TokenCombobox,
  EditableTag,
  TokenEditor,
  TokenPicker,
  TokenPickerPanel,
  type Token,
  type EditableToken,
  type TokenSuggestion,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 1000, height: 720 }),
  app = await connectTest(root.renderer);
const settle = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((r) => setImmediate(r));
    root.renderer.flush();
    root.renderer.dispatchNativeEvents();
  }
};
const get = (id: string) => root.renderer.findByTestId(id);
const text = (id: string) => app.getByTestId(id).textContent();
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const press = async (id: string, k: string) => {
  await app.getByTestId(id).press(k);
  await settle();
};
const key = async (k: string) => {
  root.renderer.simulateKeystrokes(k);
  await settle();
};
const fill = async (id: string, v: string) => {
  await app.getByTestId(id).fill(v);
  await settle();
};
const render = async (node: ReactNode) => {
  root.render(
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 24, width: 480 }}>{node}</Stack>
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
};
const options: TokenSuggestion[] = Array.from({ length: 25 }, (_, i) => ({
  id: String(i),
  label: "Label " + i,
  disabled: i === 0 || i === 4 || i === 5 || i === 6 || i === 7,
}));
let events: string[] = [];
function Combo({
  readOnly = false,
  disabled = false,
  loading = false,
  error,
}: {
  readOnly?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
}) {
  const [value, setValue] = useState<Token[]>([
      { id: "protected", label: "Protected", removable: false },
    ]),
    [query, setQuery] = useState(""),
    [open, setOpen] = useState(false);
  return (
    <TokenCombobox
      testId="c"
      options={options}
      value={value}
      onValueChange={(v) => {
        events.push(v.map((t) => t.id).join(","));
        setValue(v);
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      open={open}
      onOpenChange={setOpen}
      allowCreate
      readOnly={readOnly}
      disabled={disabled}
      loading={loading}
      error={error}
    />
  );
}
function Nested() {
  const [dialog, setDialog] = useState(true),
    [open, setOpen] = useState(false),
    [value, setValue] = useState<Token[]>([]);
  return (
    <Dialog
      testId="dialog"
      open={dialog}
      onOpenChange={setDialog}
      title="Nested picker"
    >
      <TokenPicker
        testId="p"
        options={options}
        value={value}
        onValueChange={setValue}
        open={open}
        onOpenChange={setOpen}
      />
      <Button testId="following" onPress={() => events.push("following")}>
        Following
      </Button>
    </Dialog>
  );
}
try {
  await render(
    <TokenSuggestionList
      testId="s"
      options={options}
      pageSize={4}
      onSelect={(t) => events.push(t.id)}
    />,
  );
  assert(!get("s-item-4"));
  await press("s-list", "enter");
  assert.deepEqual(events, ["1"]);
  const node = get("s-list")!;
  root.renderer.nativeSimulateKeyDown(node.id, "enter", true);
  await settle();
  assert.equal(events.length, 1);
  await press("s-list", "end");
  assert(get("s-item-24"));
  await key("enter");
  assert.equal(events.at(-1), "24");
  await press("s-list", "home");
  await click("s-next");
  assert(get("s-item-4"));
  const before = events.length;
  await press("s-list", "enter");
  assert.equal(
    events.length,
    before,
    "Disabled page must not select another page",
  );
  await press("s-list", "down");
  await key("enter");
  assert.equal(events.at(-1), "8");
  await render(
    <TokenSuggestionList
      testId="s"
      options={options.slice(0, 2)}
      readOnly
      onSelect={(t) => events.push(t.id)}
    />,
  );
  const count = events.length;
  await press("s-list", "enter");
  await click("s-item-1");
  assert.equal(events.length, count);
  await render(
    <TokenSuggestionList testId="s" options={[]} onSelect={() => {}} />,
  );
  assert(get("s-empty"));
  await render(
    <TokenSuggestionList
      testId="s"
      options={options}
      loading
      onSelect={() => {}}
    />,
  );
  assert(get("s-loading"));
  assert(!get("s-item-1"));
  await render(
    <TokenSuggestionList
      testId="s"
      options={options}
      error="Directory unavailable"
      onSelect={() => {}}
      onRetry={() => events.push("retry")}
    />,
  );
  await click("s-retry");
  assert.equal(events.at(-1), "retry");
  await render(
    <TokenSuggestionList
      testId="s"
      options={[options[0]!, options[0]!]}
      onSelect={() => {}}
    />,
  );
  assert(get("s-error"));
  assert(!get("s-item-0"));
  await render(<Combo />);
  await fill("c-input", "Label 2");
  await press("c-input", "down");
  assert(get("c-popup"));
  await key("enter");
  assert(!get("c-popup"));
  assert(get("c-token-2"));
  await fill("c-input", "Fresh");
  await press("c-input", "tab");
  assert(!root.renderer.getPaintedText().includes("Fresh\t"));
  await click("c-create");
  assert(get("c-token-fresh"));
  await fill("c-input", "Label 3");
  await click("c-create");
  assert(get("c-error"));
  assert(!get("c-token-label 3"));
  await press("c-input", "escape");
  assert(!get("c-popup"));
  await render(<Combo readOnly />);
  const protectedCount = events.length;
  await press("c-toggle", "enter");
  await press("c-create", "enter");
  assert(!get("c-popup"));
  assert.equal(events.length, protectedCount);
  await render(<Combo disabled />);
  await press("c-input", "down");
  assert(!get("c-popup"));
  await render(<Combo loading />);
  await fill("c-input", "Loading");
  await press("c-input", "enter");
  assert(get("c-suggestions-loading"));
  assert.equal(events.length, protectedCount);
  let edited: EditableToken = { id: "a", label: "Alpha" };
  const editView = (token = edited) => (
    <EditableTag
      testId="e"
      token={token}
      peers={[token, { id: "b", label: "Beta" }]}
      onTokenChange={(t) => {
        edited = t;
        events.push(t.label);
      }}
    />
  );
  await render(editView());
  await click("e-edit");
  await fill("e-input", "Beta");
  await press("e-input", "enter");
  assert(get("e-error"));
  assert.equal(edited.label, "Alpha");
  await fill("e-input", "Next");
  await press("e-input", "tab");
  await key("enter");
  assert(!get("e-input"));
  assert.equal(edited.label, "Alpha", "Tab followed by Enter activates Cancel");
  await click("e-edit");
  await fill("e-input", "External draft");
  edited = { id: "a", label: "Server value" };
  await render(editView());
  assert(!get("e-input"));
  assert.equal(await text("e-tag-text"), "Server value");
  await key("enter");
  assert(get("e-input"), "External rename restores the edit trigger");
  await fill("e-input", "Renamed");
  await click("e-save");
  assert.equal(edited.id, "a");
  assert.equal(edited.label, "Renamed");
  await render(
    <EditableTag
      testId="e"
      token={{ id: "a", label: "Protected", editable: false }}
      onTokenChange={() => {
        throw Error("must not run");
      }}
    />,
  );
  await press("e-edit", "enter");
  assert(!get("e-input"));
  await render(
    <TokenEditor
      testId="ed"
      value={[
        { id: "a", label: "A" },
        { id: "b", label: "B", disabled: true },
        { id: "c", label: "C", removable: false },
      ]}
      onValueChange={(v) => events.push(v.map((t) => t.id).join(","))}
      page={99}
      pageSize={2}
      onPageChange={() => {}}
    />,
  );
  assert(get("ed-token-c"));
  assert(!get("ed-token-a"));
  await click("ed-clear");
  assert.equal(events.at(-1), "b,c");
  await render(
    <TokenEditor
      testId="ed"
      value={[]}
      onValueChange={() => {}}
      page={0}
      onPageChange={() => {}}
    />,
  );
  assert(get("ed-empty"));
  await render(
    <TokenEditor
      testId="ed"
      value={[]}
      loading
      onValueChange={() => {}}
      page={0}
      onPageChange={() => {}}
    />,
  );
  assert(get("ed-loading"));
  let applied: Token[] = [];
  const panel = (value: Token[] = []) => (
    <TokenPickerPanel
      testId="panel"
      options={options}
      value={value}
      onApply={(v) => {
        applied = v;
      }}
      onCancel={() => events.push("cancel")}
    />
  );
  await render(panel());
  await click("panel-chooser-suggestions-item-1");
  assert.equal(applied.length, 0);
  await click("panel-cancel");
  assert(!get("panel-chooser-token-1"));
  await click("panel-chooser-suggestions-item-1");
  await render(panel([{ id: "external", label: "External" }]));
  assert(!get("panel-chooser-token-1"));
  await click("panel-apply");
  assert.deepEqual(
    applied.map((t) => t.id),
    ["external"],
  );
  await render(<Nested />);
  await click("p-trigger");
  assert(get("p-popup"));
  await press("p-panel-chooser-input", "escape");
  assert(!get("p-popup"));
  assert(get("dialog"));
  await key("enter");
  assert(get("p-popup"));
  await press("p-panel-cancel", "enter");
  assert(!get("p-popup"));
  await key("escape");
  assert(!get("dialog"));
  await render(
    <TokenSuggestionList
      testId="long"
      options={[
        {
          id: "long",
          label: "Long label ".repeat(15),
          description: "Description ".repeat(80),
        },
      ]}
      maxTokenLength={1000}
      onSelect={() => {}}
    />,
  );
  const bounds = await app.getByTestId("long-item-long").bounds();
  assert(bounds.height < 75 && bounds.width < 480);
  await app.screenshot({ path: resolve("artifacts/tokens-states.png") });
  console.log(
    "PASS token input states: paging/disabled/held keys, suggestion identity/create conflicts, Tab, external rename/draft reset, protected clear, nested Escape and text bounds",
  );
} finally {
  root.render(null);
  await app.close();
}
