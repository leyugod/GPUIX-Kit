import assert from "node:assert/strict";
import { useState, type ReactNode } from "react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Button,
  Text,
  Dialog,
  FilterBuilder,
  FilterConditionRow,
  FilterPanel,
  FilterSummary,
  SavedViewPicker,
  type FilterField,
  type FilterExpression,
  type SavedFilterView,
} from "@mirai/gpuix-kit";
import { cloneFilter } from "@mirai/gpuix-kit/filter-model";
import { getManagedFocus } from "@mirai/gpuix-kit/focus";
const fields: FilterField[] = [
  { id: "text", label: "Text", kind: "text" },
  { id: "number", label: "Number", kind: "number" },
  { id: "date", label: "Date", kind: "date" },
  {
    id: "enum",
    label: "Enum",
    kind: "enum",
    options: [
      { value: "a", label: "Alpha" },
      { value: "off", label: "Off", disabled: true },
    ],
  },
  { id: "bool", label: "Boolean", kind: "boolean" },
  { id: "disabled", label: "Disabled", kind: "text", disabled: true },
];
const initial: FilterExpression = {
  match: "all",
  conditions: [
    { id: "a", fieldId: "text", operator: "contains", value: "Alpha" },
  ],
};
const root = createTestRoot({ width: 1000, height: 720 }),
  app = await connectTest(root.renderer);
const settle = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((r) => setImmediate(r));
    root.renderer.flush();
    root.renderer.dispatchNativeEvents();
  }
};
const get = (id: string) => root.renderer.findByTestId(id),
  text = (id: string) => app.getByTestId(id).textContent();
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const fill = async (id: string, value: string) => {
  await app.getByTestId(id).fill(value);
  await settle();
};
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const key = async (k: string) => {
  root.renderer.simulateKeystrokes(k);
  await settle();
};
const choose = async (id: string, value: string) => {
  await click(id);
  await click(id + "-item-" + value);
};
const render = async (children: ReactNode) => {
  root.render(
    <UIKitProvider>
      <AppShell>
        <Stack style={{ width: 650, padding: 20 }}>{children}</Stack>
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
};
let draft = cloneFilter(initial),
  builderDisabled = false;
function Builder() {
  const [value, setValue] = useState(draft);
  return (
    <FilterBuilder
      testId="builder"
      fields={fields}
      value={value}
      disabled={builderDisabled}
      onValueChange={(v) => {
        draft = v;
        setValue(v);
      }}
    />
  );
}
const jobs: Array<{
  resolve: () => void;
  reject: (error: Error) => void;
  filter?: FilterExpression;
}> = [];
const pending = (filter?: FilterExpression) =>
  new Promise<void>((resolve, reject) =>
    jobs.push({ resolve, reject, filter }),
  );
let current = cloneFilter(initial),
  views: SavedFilterView[] = [
    { id: "one", label: "One", filter: cloneFilter(initial) },
    {
      id: "readonly",
      label: "Read only",
      filter: cloneFilter(initial),
      readOnly: true,
    },
  ],
  selected: string | null = "one",
  revision = 0,
  savedDisabled = false,
  closes = 0;
function Saved() {
  return (
    <SavedViewPicker
      testId="saved"
      fields={fields}
      views={views}
      value={selected}
      filter={current}
      revision={revision}
      disabled={savedDisabled}
      onValueChange={(id) => {
        selected = id;
      }}
      onCreate={(_name, f) => pending(f)}
      onUpdate={(_id, f) => pending(f)}
      onRename={() => pending()}
      onRemove={() => pending()}
    />
  );
}
try {
  await render(<Builder />);
  await choose("builder-a-field", "number");
  assert.equal(draft.conditions[0]!.value, "");
  assert.equal(draft.conditions[0]!.operator, "equals");
  await fill("builder-a-value", "NaN");
  assert(get("builder-a-value-error"));
  await fill("builder-a-value", "-1.5");
  assert(!get("builder-a-value-error"));
  await choose("builder-a-operator", "isEmpty");
  assert.equal(draft.conditions[0]!.value, "");
  assert(!get("builder-a-value"));
  await choose("builder-a-operator", "gt");
  assert(get("builder-a-value"));
  assert.equal(draft.conditions[0]!.value, "");
  await choose("builder-a-field", "date");
  await fill("builder-a-value", "2025-02-29");
  assert(get("builder-a-value-error"));
  await fill("builder-a-value", "2024-02-29");
  assert(!get("builder-a-value-error"));
  await choose("builder-a-field", "enum");
  assert.equal(draft.conditions[0]!.value, "a");
  await click("builder-a-value");
  await click("builder-a-value-item-off");
  assert.equal(draft.conditions[0]!.value, "a");
  await key("escape");
  await choose("builder-a-field", "bool");
  assert.equal(draft.conditions[0]!.value, "true");
  await choose("builder-a-value", "false");
  assert.equal(draft.conditions[0]!.value, "false");
  for (let i = 0; i < 11; i++) await click("builder-add");
  assert.equal(draft.conditions.length, 12);
  assert.equal(await text("builder-page"), "6 / 6");
  assert(!get("builder-a-field"));
  await click("builder-add");
  assert.equal(draft.conditions.length, 12);
  await click("builder-condition-11-remove");
  await click("builder-condition-10-remove");
  assert.equal(await text("builder-page"), "5 / 5");
  assert(get("builder-condition-8-field"));
  builderDisabled = true;
  await render(<Builder />);
  const count = draft.conditions.length;
  await click("builder-add");
  await click("builder-condition-9-remove");
  assert.equal(draft.conditions.length, count);
  await render(
    <FilterBuilder
      testId="invalid"
      fields={fields}
      value={{
        match: "all",
        conditions: [...initial.conditions, ...initial.conditions],
      }}
      onValueChange={() => {
        throw Error("invalid mutated");
      }}
    />,
  );
  assert(get("invalid-error"));
  let applied: FilterExpression | undefined,
    cancelled = 0,
    source = cloneFilter(initial);
  const panel = () => (
    <FilterPanel
      testId="panel"
      fields={fields}
      value={source}
      onApply={(v) => {
        applied = v;
      }}
      onCancel={() => cancelled++}
    />
  );
  await render(panel());
  await fill("panel-builder-a-value", "a".repeat(501));
  assert(get("panel-builder-a-value-error"));
  assert(get("panel-builder-a-value"), "long drafts remain editable");
  await fill("panel-builder-a-value", "Draft");
  assert(!get("panel-builder-a-value-error"));
  assert.equal(source.conditions[0]!.value, "Alpha");
  await click("panel-cancel");
  assert.equal(cancelled, 1);
  assert(!applied);
  await click("panel-reset");
  assert.equal(get("panel-builder-a-value")!.customProps?.value, "Alpha");
  await fill("panel-builder-a-value", "");
  await click("panel-apply");
  assert(!applied);
  await fill("panel-builder-a-value", "Applied");
  await click("panel-apply");
  assert.equal(applied!.conditions[0]!.value, "Applied");
  assert.equal(source.conditions[0]!.value, "Alpha");
  source = { ...cloneFilter(initial), match: "any" };
  await render(panel());
  assert.equal(get("panel-builder-a-value")!.customProps?.value, "Alpha");
  await render(<Saved />);
  await click("saved-update");
  assert.equal(jobs.length, 1);
  assert.equal(getManagedFocus(root.renderer), get("saved")!.id);
  await click("saved-update");
  await click("saved-remove");
  assert.equal(jobs.length, 1);
  await fill("saved-name", "Blocked");
  assert.equal(get("saved-name")!.customProps?.value, "One");
  assert.notEqual(jobs[0]!.filter, current);
  assert.notEqual(jobs[0]!.filter!.conditions[0], current.conditions[0]);
  jobs[0]!.reject(Error("PRIVATE persistence payload"));
  await settle();
  assert(get("saved-save-error"));
  assert(!root.renderer.getPaintedText().includes("PRIVATE"));
  await click("saved-update");
  const old = jobs.at(-1)!;
  revision++;
  await render(<Saved />);
  await click("saved-update");
  const newer = jobs.at(-1)!;
  old.reject(Error("stale"));
  await settle();
  assert(!get("saved-save-error"));
  assert.equal(await text("saved-status"), "Saving…");
  newer.resolve();
  await settle();
  await click("saved-update");
  const unmounted = jobs.at(-1)!;
  await render(<Text>Removed</Text>);
  unmounted.reject(Error("removed"));
  await settle();
  selected = "readonly";
  await render(<Saved />);
  const before = jobs.length;
  await click("saved-update");
  await click("saved-remove");
  await click("saved-rename");
  assert.equal(jobs.length, before);
  await fill("saved-name", "One");
  await click("saved-create");
  assert.equal(jobs.length, before);
  await fill("saved-name", "Copy");
  await click("saved-create");
  assert.equal(jobs.length, before + 1);
  jobs.at(-1)!.resolve();
  await settle();
  savedDisabled = true;
  await render(<Saved />);
  await click("saved-create");
  assert.equal(jobs.length, before + 1);
  savedDisabled = false;
  views = [...views, views[0]!];
  await render(<Saved />);
  assert(get("saved-error"));
  await click("saved-create");
  assert.equal(jobs.length, before + 1);
  views = [{ id: "one", label: "One", filter: cloneFilter(initial) }];
  selected = "one";
  current = {
    match: "all",
    conditions: [{ ...initial.conditions[0]!, value: "" }],
  };
  await render(<Saved />);
  assert(get("saved-filter-error"));
  await click("saved-update");
  assert.equal(jobs.length, before + 1);
  current = cloneFilter(initial);
  builderDisabled = false;
  await render(
    <Dialog
      testId="modal"
      open
      showClose={false}
      title="Filters"
      onOpenChange={() => closes++}
    >
      <FilterBuilder
        testId="focus-builder"
        fields={fields}
        value={{ match: "all", conditions: [] }}
        onValueChange={() => {}}
      />
      <Button testId="after" onPress={() => {}}>
        After
      </Button>
    </Dialog>,
  );
  await press("focus-builder-add", "tab");
  assert.equal(
    getManagedFocus(root.renderer),
    get("focus-builder")!.id,
    "Child Tab visits the stable builder root once",
  );
  await key("escape");
  assert.equal(closes, 1);
  await render(
    <Dialog
      testId="save-modal"
      open
      showClose={false}
      title="Save"
      onOpenChange={() => closes++}
    >
      <Saved />
      <Button testId="save-after" onPress={() => {}}>
        After
      </Button>
    </Dialog>,
  );
  await press("saved-remove", "tab");
  assert.equal(
    getManagedFocus(root.renderer),
    get("saved")!.id,
    "Saved picker root not skipped",
  );
  await click("saved-update");
  await key("tab");
  assert.equal(getManagedFocus(root.renderer), get("save-after")!.id);
  await key("escape");
  assert.equal(closes, 2);
  jobs.at(-1)!.resolve();
  await settle();
  let summary = cloneFilter(initial);
  function Summary() {
    const [value, setValue] = useState(summary);
    return (
      <FilterSummary
        testId="summary"
        fields={fields}
        value={value}
        onRemove={(id) => {
          summary = {
            ...value,
            conditions: value.conditions.filter((c) => c.id !== id),
          };
          setValue(summary);
        }}
      />
    );
  }
  await render(<Summary />);
  await press("summary-a-remove", "enter");
  assert.equal(summary.conditions.length, 0);
  assert.equal(getManagedFocus(root.renderer), get("summary")!.id);
  function ModalPanel() {
    const [value, setValue] = useState(cloneFilter(initial));
    return (
      <Dialog
        testId="panel-modal"
        open
        showClose={false}
        title="Draft"
        onOpenChange={() => closes++}
      >
        <FilterPanel
          testId="modal-panel"
          fields={fields}
          value={value}
          onApply={setValue}
          onCancel={() => {}}
        />
      </Dialog>
    );
  }
  await render(<ModalPanel />);
  await click("modal-panel-builder-a-field");
  await key("escape");
  assert.equal(closes, 2, "nested menu Escape does not close the dialog");
  await fill("modal-panel-builder-a-value", "Changed");
  await click("modal-panel-apply");
  assert.equal(
    getManagedFocus(root.renderer),
    get("modal-panel-focus")!.id,
    "Apply preserves focus across draft remount",
  );
  await key("escape");
  assert.equal(closes, 3);
  console.log(
    "PASS filter states: typed values/reset, draft snapshots, bounded paging/removal/disabled, saved locks/rejection/stale/unmount/protection, malformed catalogs and modal keyboard focus",
  );
} finally {
  root.render(null);
  await app.close();
}
