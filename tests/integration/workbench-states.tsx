import { useState } from "react";
import assert from "node:assert/strict";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Text,
  Button,
  Input,
  ListView,
  TreeView,
  DataGrid,
  DocumentTabs,
  closeDocument,
  useForm,
  required,
  FormActions,
  FormErrorSummary,
} from "@mirai/gpuix-kit";
let submissions = 0;
let rejectSave: ((reason?: unknown) => void) | undefined;
let calls = 0;
function Fixture() {
  const [values, setValues] = useState({ name: "Valid" });
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [children, setChildren] = useState(false);
  const [tabs, setTabs] = useState([
    { id: "one", label: "One" },
    { id: "two", label: "Two" },
    { id: "three", label: "Three", disabled: true },
  ]);
  const [active, setActive] = useState<string | null>("one");
  const form = useForm({
    values,
    onValuesChange: setValues,
    rules: { name: required() },
    onSubmit: () => {
      submissions++;
      return new Promise<void>((_, reject) => {
        rejectSave = reject;
      });
    },
  });
  return (
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 16 }}>
          <Input testId="state-name" {...form.field("name")} />
          <FormActions
            testId="state-form"
            submitting={form.submitting}
            onSubmit={() => {
              void form.submit();
            }}
          />
          {form.submitError ? (
            <Text testId="state-failure">{form.submitError}</Text>
          ) : null}
          <Text testId="state-value">{values.name}</Text>
          <FormErrorSummary
            testId="state-errors"
            errors={form.errors}
            onFocus={() => form.focusField("name")}
          />
          <ListView
            testId="empty-list"
            items={[]}
            selectedIds={[]}
            onSelectionChange={() => calls++}
            renderItem={() => null}
            height={45}
          />
          <ListView
            testId="loading-list"
            loading
            items={[{ id: "a" }]}
            selectedIds={[]}
            onSelectionChange={() => calls++}
            renderItem={() => null}
            height={45}
          />
          <ListView
            testId="disabled-list"
            items={[{ id: "a", disabled: true }]}
            selectedIds={[]}
            onSelectionChange={() => calls++}
            renderItem={() => <Text>Unavailable</Text>}
            height={45}
          />
          <TreeView
            testId="lazy-tree"
            height={130}
            nodes={[
              {
                id: "folder",
                label: "Folder",
                hasChildren: true,
                children: children
                  ? [{ id: "child", label: "Loaded child" }]
                  : undefined,
              },
            ]}
            expandedIds={expanded}
            onExpandedChange={setExpanded}
            onRequestChildren={() => setChildren(true)}
            selectedIds={selected}
            onSelectionChange={setSelected}
          />
          <DocumentTabs
            testId="state-tabs"
            tabs={tabs}
            value={active}
            onValueChange={setActive}
            onClose={(id) => {
              const next = closeDocument(tabs, active ?? "", id);
              setTabs(next.tabs);
              setActive(next.value);
            }}
          />
          <Text testId="state-active">{active ?? "none"}</Text>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function OverflowTabs() {
  const tabs = Array.from({ length: 20 }, (_, i) => ({
    id: `doc-${i}`,
    label: `Document ${i}`,
  }));
  const [value, setValue] = useState<string | null>("doc-0");
  return (
    <UIKitProvider>
      <AppShell>
        <DocumentTabs
          testId="overflow"
          tabs={tabs}
          value={value}
          onValueChange={setValue}
          onClose={() => {}}
        />
      </AppShell>
    </UIKitProvider>
  );
}
const root = createTestRoot({ width: 900, height: 800 });
root.render(<Fixture />);
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const get = (id: string) => root.renderer.findByTestId(id);
try {
  await settle();
  assert(get("empty-list-empty"));
  assert(get("loading-list-loading"));
  assert(!get("loading-list-a"));
  await press("empty-list", "down");
  await press("loading-list", "enter");
  await app.getByTestId("disabled-list-a").click();
  await settle();
  assert.equal(calls, 0);
  await press("state-form-submit", "enter");
  await press("state-form-submit", "enter");
  assert.equal(submissions, 1, "Pending save cannot be submitted twice");
  await app.getByTestId("state-name").fill("Overwrite");
  await settle();
  assert(
    (await app.getByTestId("state-value").textContent()).includes("Valid"),
    "Pending fields are read-only",
  );
  rejectSave?.(new Error("simulated failure"));
  await settle();
  await settle();
  assert(
    get("state-failure"),
    "Promise rejection becomes visible submit feedback",
  );
  await app.getByTestId("state-name").fill("");
  await settle();
  await press("state-form-submit", "enter");
  assert(get("state-errors"));
  assert.equal(submissions, 1);
  root.renderer.simulateKeystrokes("x");
  await settle();
  assert((await app.getByTestId("state-value").textContent()).includes("x"));
  await press("lazy-tree", "right");
  assert(get("lazy-tree-child"));
  await press("lazy-tree", "right");
  await press("lazy-tree", "left");
  await press("lazy-tree", "left");
  assert(!get("lazy-tree-child"));
  await press("state-tabs-close-one", "enter");
  assert(!get("state-tabs-one"));
  root.renderer.simulateKeystrokes("right");
  await settle();
  assert(
    (await app.getByTestId("state-active").textContent()).includes("two"),
    "Closing restores focus and skips disabled neighbor",
  );
  await press("state-tabs-two", "cmd-w");
  assert(!get("state-tabs-two"));
  assert(
    (await app.getByTestId("state-active").textContent()).includes("none"),
  );
  root.render(<OverflowTabs />);
  await settle();
  await press("overflow-doc-0", "end");
  const last = await app.getByTestId("overflow-doc-19").bounds();
  assert(
    last.x >= 0 && last.x + last.width <= 900,
    "End scrolls active document into the window",
  );
  root.renderer.simulateKeystrokes("home");
  await settle();
  const first = await app.getByTestId("overflow-doc-0").bounds();
  assert(
    first.x >= 0 && first.x + first.width <= 900,
    "Home restores first document visibility",
  );
  console.log(
    "PASS workbench empty/loading/disabled, submit lock/failure/focus, lazy tree, document close focus and keyboard",
  );
} finally {
  root.render(null);
  await app.close();
}
