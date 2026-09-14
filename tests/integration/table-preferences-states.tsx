import assert from "node:assert/strict";
import { useState, type ReactNode } from "react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Button,
  Dialog,
  Text,
  ColumnVisibilityMenu,
  ColumnOrderList,
  SortRuleList,
  TablePreferencesPanel,
  ConfigurableDataGrid,
  type TableColumnOption,
  type TablePreferences,
} from "@mirai/gpuix-kit";
import {
  defaultTablePreferences,
  cloneTablePreferences,
  reconcileTablePreferences,
} from "@mirai/gpuix-kit/table-preferences-model";
import { getManagedFocus } from "@mirai/gpuix-kit/focus";
const columns: TableColumnOption[] = Array.from({ length: 8 }, (_, i) => ({
  id: "c" + i,
  label: "Column " + i,
  sortable: i < 4,
  hideable: i !== 0,
  reorderable: i !== 0,
}));
let value = defaultTablePreferences(columns),
  disabled = false,
  cancelled = 0,
  applied: TablePreferences | undefined;
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
const key = async (k: string) => {
  root.renderer.simulateKeystrokes(k);
  await settle();
};
const press = async (id: string, k: string) => {
  await app.getByTestId(id).press(k);
  await settle();
};
const choose = async (id: string, item: string) => {
  await click(id);
  await click(id + "-item-" + item);
};
const render = async (children: ReactNode) => {
  root.render(
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 20, width: 600 }}>{children}</Stack>
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
};
function Controls() {
  const [p, setP] = useState(value);
  const change = (next: TablePreferences) => {
    value = next;
    setP(next);
  };
  return (
    <>
      <ColumnVisibilityMenu
        testId="visible"
        columns={columns}
        value={p}
        onValueChange={change}
        disabled={disabled}
      />
      <ColumnOrderList
        testId="order"
        columns={columns}
        value={p}
        onValueChange={change}
        disabled={disabled}
      />
      <SortRuleList
        testId="sort"
        columns={columns}
        value={p}
        onValueChange={change}
        disabled={disabled}
      />
    </>
  );
}
try {
  await render(<Controls />);
  await click("visible");
  await click("visible-item-c0");
  assert.deepEqual(value.hiddenIds, []);
  await key("escape");
  await choose("visible", "c1");
  assert.deepEqual(value.hiddenIds, ["c1"]);
  await choose("visible", "c1");
  assert.deepEqual(value.hiddenIds, []);
  await click("order-up-c1");
  assert.deepEqual(
    value.order,
    columns.map((c) => c.id),
  );
  await click("order-down-c1");
  assert.equal(value.order[2], "c1");
  assert.equal(getManagedFocus(root.renderer), get("order")!.id);
  await click("order-next");
  assert(get("order-row-c7"));
  await click("order-up-c5");
  assert.equal(await text("order-page"), "2 / 2");
  await choose("sort-add", "c0");
  await choose("sort-add", "c1");
  await choose("sort-add", "c2");
  assert.equal(value.sorts.length, 3);
  await click("sort-add");
  assert(!get("sort-add-item-c3"));
  await click("sort-direction-c1");
  assert.equal(value.sorts[1]!.direction, "desc");
  await click("sort-up-c2");
  assert.equal(value.sorts[1]!.columnId, "c2");
  await click("sort-remove-c2");
  assert.equal(value.sorts.length, 2);
  disabled = true;
  await render(<Controls />);
  const prior = JSON.stringify(value);
  await click("sort-remove-c1");
  await click("order-down-c6");
  await click("visible");
  assert.equal(JSON.stringify(value), prior);
  disabled = false;
  const source = cloneTablePreferences(value);
  const panel = () => (
    <TablePreferencesPanel
      testId="panel"
      columns={columns}
      value={source}
      disabled={disabled}
      onApply={(v) => {
        applied = v;
      }}
      onCancel={() => cancelled++}
    />
  );
  await render(panel());
  await click("panel-tab-display");
  await click("panel-density-compact");
  assert.equal(source.density, "regular");
  await click("panel-cancel");
  assert.equal(cancelled, 1);
  assert(!applied);
  await click("panel-reset");
  await click("panel-apply");
  assert.equal(applied!.density, "regular");
  assert.notEqual(applied, source);
  assert.notEqual(applied!.sorts, source.sorts);
  await click("panel-density-comfortable");
  await click("panel-apply");
  assert.equal(applied!.density, "comfortable");
  source.density = "compact";
  await render(panel());
  await click("panel-tab-display");
  await click("panel-apply");
  assert.equal(applied!.density, "compact", "external values reset draft");
  const invalid = { ...source, order: ["unknown"] };
  await render(
    <ColumnOrderList
      testId="bad"
      columns={columns}
      value={invalid}
      onValueChange={() => {
        throw Error("invalid mutation");
      }}
    />,
  );
  assert(get("bad-error"));
  const c = [{ id: "a", label: "A" }],
    one = defaultTablePreferences(c);
  await render(
    <ColumnVisibilityMenu
      testId="last"
      columns={c}
      value={one}
      onValueChange={() => {
        throw Error("last hidden");
      }}
    />,
  );
  await click("last");
  await click("last-item-a");
  await key("escape");
  let closes = 0;
  function Modal() {
    const [p, setP] = useState(defaultTablePreferences(columns));
    return (
      <Dialog
        testId="modal"
        open
        showClose={false}
        title="Preferences"
        onOpenChange={() => closes++}
      >
        <TablePreferencesPanel
          testId="modal-prefs"
          columns={columns}
          value={p}
          onApply={setP}
          onCancel={() => {}}
        />
      </Dialog>
    );
  }
  await render(<Modal />);
  await click("modal-prefs-visibility");
  await key("escape");
  assert.equal(closes, 0);
  await click("modal-prefs-tab-display");
  await click("modal-prefs-density-compact");
  await click("modal-prefs-apply");
  assert.equal(getManagedFocus(root.renderer), get("modal-prefs-focus")!.id);
  await key("escape");
  assert.equal(closes, 1);
  const gridColumns = columns.map((c) => ({
    ...c,
    header: c.label,
    width: 100,
    value: (r: { id: string; n: number }) => (c.id === "c0" ? r.id : r.n),
  }));
  let sorted: TablePreferences | undefined;
  const preferences = {
    ...defaultTablePreferences(columns),
    sorts: [
      { columnId: "c0", direction: "asc" as const },
      { columnId: "c1", direction: "desc" as const },
    ],
  };
  await render(
    <ConfigurableDataGrid
      testId="grid"
      columns={gridColumns}
      rows={[{ id: "one", n: 1 }]}
      rowKey={(r) => r.id}
      preferences={preferences}
      onPreferencesChange={(p) => {
        sorted = p;
      }}
      selectedIds={[]}
      onSelectionChange={() => {}}
    />,
  );
  await click("grid-sort-c0");
  assert.equal(sorted!.sorts[0]!.direction, "desc");
  assert.equal(sorted!.sorts[1]!.columnId, "c1");
  await render(
    <ConfigurableDataGrid
      testId="invalid-grid"
      columns={gridColumns}
      rows={[]}
      rowKey={(r: { id: string; n: number }) => r.id}
      preferences={invalid}
      onPreferencesChange={() => {}}
      selectedIds={[]}
      onSelectionChange={() => {}}
    />,
  );
  assert(get("invalid-grid-error"));
  const reduced = columns.slice(0, 2),
    migrated = reconcileTablePreferences(reduced, value);
  assert.deepEqual(migrated.order, ["c0", "c1"]);
  console.log(
    "PASS table preference states: required/last/locked columns, pages and priorities, disabled/cap/invalid, snapshot/reset/migration, nested Escape and Apply focus",
  );
} finally {
  root.render(null);
  await app.close();
}
