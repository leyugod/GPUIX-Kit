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
  Text,
  Dialog,
  ResourceState,
  LoadMoreButton,
  AsyncListView,
  CollectionView,
  CollectionItem,
  LazyTreeView,
  type LazyTreeNode,
  type ResourceStateProps,
  type LoadMoreButtonProps,
} from "@mirai/gpuix-kit";
import { getManagedFocus } from "@mirai/gpuix-kit/focus";
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
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const key = async (k: string) => {
  root.renderer.simulateKeystrokes(k);
  await settle();
};
const render = async (children: ReactNode) => {
  root.render(
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 24 }}>{children}</Stack>
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
};
const jobs: Array<{ resolve: () => void; reject: (e: Error) => void }> = [];
const pending = () =>
  new Promise<void>((resolve, reject) => jobs.push({ resolve, reject }));
let closes = 0;
const resource = (props: Partial<ResourceStateProps> = {}) => (
  <ResourceState
    testId="resource"
    state="error"
    description="Controlled failure description"
    onRetry={pending}
    {...props}
  />
);
const more = (props: Partial<LoadMoreButtonProps> = {}) => (
  <LoadMoreButton testId="more" state="idle" onLoadMore={pending} {...props} />
);
let items = Array.from({ length: 20 }, (_, i) => ({
    id: "i" + i,
    disabled: i === 2,
  })),
  selected: string[] = ["outside"],
  activate = 0,
  disabled = false,
  columns = 3,
  gridWidth = 600;
function Grid() {
  const [ids, setIds] = useState(selected);
  return (
    <CollectionView
      testId="grid"
      items={items}
      width={gridWidth}
      height={260}
      columns={columns}
      cardHeight={100}
      disabled={disabled}
      selectionMode="multiple"
      selectedIds={ids}
      onSelectionChange={(next) => {
        selected = next;
        setIds(next);
      }}
      onActivate={() => activate++}
      renderItem={(item, state) => (
        <CollectionItem
          title={item.id}
          selected={state.selected}
          active={state.active}
          disabled={item.disabled}
        />
      )}
    />
  );
}
let nodes: LazyTreeNode[] = [
    {
      id: "parent",
      label: "Parent",
      children: [{ id: "child", label: "Child", hasChildren: true }],
    },
    { id: "remote", label: "Remote", hasChildren: true },
    { id: "empty", label: "Empty", children: [], hasChildren: true },
    { id: "off", label: "Off", disabled: true, hasChildren: true },
    {
      id: "external",
      label: "External",
      hasChildren: true,
      loadState: "loading",
    },
  ],
  expanded: string[] = ["parent"],
  treeSelected: string[] = [],
  treeDisabled = false;
const requests: string[] = [];
function Tree() {
  const [open, setOpen] = useState(expanded),
    [ids, setIds] = useState(treeSelected);
  return (
    <LazyTreeView
      testId="tree"
      height={360}
      nodes={nodes}
      disabled={treeDisabled}
      expandedIds={open}
      onExpandedChange={(next) => {
        expanded = next;
        setOpen(next);
      }}
      selectedIds={ids}
      selectionMode="multiple"
      onSelectionChange={(next) => {
        treeSelected = next;
        setIds(next);
      }}
      onRequestChildren={(id) => {
        requests.push(id);
        return pending();
      }}
    />
  );
}
try {
  await render(resource());
  await press("resource-retry", "enter");
  await press("resource-retry", "enter");
  assert.equal(jobs.length, 1, "synchronous duplicate lock");
  assert.equal(
    getManagedFocus(root.renderer),
    get("resource")!.id,
    "pending resource keeps a focus target",
  );
  jobs[0]!.reject(Error("PRIVATE request payload"));
  await settle();
  assert(get("resource-error"));
  assert(!root.renderer.getPaintedText().includes("PRIVATE"));
  const retryBounds = await app.getByTestId("resource-retry").bounds();
  assert(
    retryBounds.y + retryBounds.height <= 204,
    "minimum resource height fits retry",
  );
  await app.screenshot({ path: resolve("artifacts/collections-states.png") });
  await click("resource-retry");
  const old = jobs.at(-1)!;
  await render(resource({ revision: 1 }));
  await click("resource-retry");
  const newer = jobs.at(-1)!;
  old.reject(Error("old"));
  await settle();
  assert(!get("resource-error"));
  assert((await text("resource-retry")).includes("Working"));
  newer.resolve();
  await settle();
  assert(!(await text("resource-retry")).includes("Working"));
  await click("resource-retry");
  const removed = jobs.at(-1)!;
  await render(<Text>Removed</Text>);
  removed.reject(Error("unmounted"));
  await settle();
  await render(more());
  await click("more-button");
  const moreJob = jobs.at(-1)!,
    before = jobs.length;
  await press("more-button", "enter");
  assert.equal(jobs.length, before);
  assert.equal(getManagedFocus(root.renderer), get("more")!.id);
  moreJob.reject(Error("PRIVATE"));
  await settle();
  assert(get("more-error"));
  await render(more({ state: "end" }));
  assert(!get("more-error"));
  await press("more-button", "enter");
  assert.equal(jobs.length, before);
  await render(more({ state: "loading", revision: 1 }));
  await press("more-button", "enter");
  assert.equal(jobs.length, before);
  await render(more({ disabled: true }));
  await press("more-button", "enter");
  assert.equal(jobs.length, before);
  // 待处理按钮转移焦点后仍能离开或关闭所属弹窗。
  for (const content of [
    resource({ revision: "modal" }),
    more({ revision: "modal" }),
  ]) {
    await render(
      <Dialog
        testId="dialog"
        open
        showClose={false}
        title="Pending resource"
        onOpenChange={() => closes++}
      >
        {content}
        <Button testId="next" onPress={() => {}}>
          Next
        </Button>
      </Dialog>,
    );
    const id =
      content.type === ResourceState ? "resource-retry" : "more-button";
    await click(id);
    await key("tab");
    assert.equal(
      getManagedFocus(root.renderer),
      get("next")!.id,
      "pending root forwards Tab once",
    );
    await key("escape");
    assert.equal(closes, content.type === ResourceState ? 1 : 2);
    jobs.at(-1)!.resolve();
    await settle();
  }
  await render(<Grid />);
  await press("grid", "ctrl-a");
  assert(selected.includes("outside") && !selected.includes("i2"));
  assert.equal(selected.length, 20);
  await press("grid", "home");
  assert.deepEqual(selected, ["i0"]);
  await press("grid", "right");
  assert.deepEqual(selected, ["i1"]);
  await press("grid", "shift-right");
  assert.deepEqual(selected, ["i1", "i3"]);
  await press("grid", "down");
  assert.deepEqual(selected, ["i6"]);
  await press("grid", "end");
  assert.deepEqual(selected, ["i19"]);
  const last = await app.getByTestId("grid-item-i19").bounds();
  assert(last.y >= 24 && last.y + last.height <= 285, "End reveals final card");
  await press("grid", "enter");
  assert.equal(activate, 1);
  root.renderer.nativeSimulateKeyDown(get("grid")!.id, "enter", true);
  await settle();
  assert.equal(activate, 1);
  await press("grid", "space");
  assert.deepEqual(selected, []);
  items = [];
  await render(<Grid />);
  assert(get("grid-status"));
  const status = await app.getByTestId("grid-status").bounds();
  assert(status.y >= 24, "empty state resets scroll");
  await press("grid", "enter");
  assert.equal(activate, 1);
  items = [
    { id: "same", disabled: false },
    { id: "same", disabled: false },
  ];
  await render(<Grid />);
  assert((await text("grid-status")).includes("duplicate"));
  items = [{ id: "only", disabled: true }];
  await render(<Grid />);
  await press("grid", "enter");
  assert.equal(activate, 1);
  items = Array.from({ length: 12 }, (_, i) => ({
    id: "i" + i,
    disabled: false,
  }));
  disabled = true;
  await render(<Grid />);
  await press("grid", "down");
  await click("grid-item-i0");
  assert.deepEqual(selected, []);
  disabled = false;
  gridWidth = 390;
  columns = 2;
  await render(<Grid />);
  await press("grid", "home");
  await press("grid", "down");
  assert.deepEqual(selected, ["i2"]);
  let listCalls = 0;
  const list = (
    status: "loading" | "ready" | "error",
    data = items,
    refreshing = false,
    disabled = false,
  ) => (
    <AsyncListView
      testId="list"
      status={status}
      items={data}
      selectedIds={["i1"]}
      onSelectionChange={() => listCalls++}
      onRetry={() => {
        listCalls++;
      }}
      disabled={disabled}
      refreshing={refreshing}
      renderItem={(item) => <Text>{item.id}</Text>}
    />
  );
  await render(list("loading"));
  assert(!get("list-i0"));
  await render(list("ready", []));
  assert((await text("list-state")).includes("No items"));
  await render(list("error", items, false, true));
  await press("list-state-retry", "enter");
  assert.equal(listCalls, 0, "disabled propagates to retry");
  await render(list("ready", items, true));
  assert(get("list-refreshing") && get("list-i1"));
  await click("list-i1");
  assert.equal(listCalls, 1);
  await render(<Tree />);
  await click("tree-toggle-child");
  assert.deepEqual(requests, ["child"]);
  const childJob = jobs.at(-1)!;
  await click("tree-toggle-parent");
  assert(!get("tree-item-child"));
  await click("tree-toggle-parent");
  await click("tree-toggle-child");
  await click("tree-toggle-child");
  assert.equal(requests.length, 1, "collapse retains child request lock");
  await click("tree-toggle-remote");
  assert.deepEqual(requests, ["child", "remote"]);
  const remoteJob = jobs.at(-1)!;
  childJob.reject(Error("PRIVATE"));
  await settle();
  assert((await text("tree-row-child")).includes("Unable to load"));
  assert(!root.renderer.getPaintedText().includes("PRIVATE"));
  await click("tree-retry-child");
  const replaced = jobs.at(-1)!;
  nodes = nodes.map((n) =>
    n.id === "parent"
      ? {
          ...n,
          children: [
            { id: "child", label: "New child", hasChildren: true, revision: 1 },
          ],
        }
      : n,
  );
  await render(<Tree />);
  await click("tree-retry-child");
  const replacement = jobs.at(-1)!;
  replaced.reject(Error("stale"));
  await settle();
  assert(!(await text("tree-row-child")).includes("Unable to load"));
  replacement.resolve();
  await settle();
  nodes = nodes.filter((n) => n.id !== "remote");
  await render(<Tree />);
  remoteJob.reject(Error("removed"));
  await settle();
  assert(!get("tree-row-remote"));
  const treeBefore = requests.length;
  await click("tree-toggle-empty");
  await press("tree", "right");
  assert.equal(
    requests.length,
    treeBefore,
    "loaded empty branch never requests",
  );
  await click("tree-toggle-off");
  await click("tree-toggle-external");
  await press("tree", "right");
  assert.equal(
    requests.length,
    treeBefore,
    "disabled/external-loading branch blocks requests",
  );
  treeDisabled = true;
  await render(<Tree />);
  await press("tree", "home");
  await press("tree", "right");
  assert.equal(requests.length, treeBefore);
  treeDisabled = false;
  nodes = [
    { id: "x", label: "X", children: [{ id: "x", label: "Hidden duplicate" }] },
  ];
  await render(<Tree />);
  assert(get("tree-invalid"));
  nodes = [];
  await render(<Tree />);
  assert(get("tree-empty"));
  await press("tree", "enter");
  console.log(
    "PASS collection states: pending locks/focus, rejection/retry/stale/unmount, modal Tab/Escape, grid range/2D/disabled/mutation/scroll, async list transitions and lazy tree concurrency/revisions/collapse/removal",
  );
} finally {
  root.render(null);
  await app.close();
}
