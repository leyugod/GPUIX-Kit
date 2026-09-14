import assert from "node:assert/strict";
import { useState } from "react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  ButtonGroup,
  SplitButton,
  ToolbarActions,
  PathControl,
  WorkspaceSwitcher,
  AccountMenu,
  Dialog,
  Input,
  type UIKitAction,
  type WorkspaceItem,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 1000, height: 720 });
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const press = async (id: string, k: string) => {
  await app.getByTestId(id).press(k);
  await settle();
};
const key = async (k: string) => {
  root.renderer.simulateKeystrokes(k);
  await settle();
};
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
let log: string[] = [];
const action = (id: string, extra: Partial<UIKitAction> = {}): UIKitAction => ({
  id,
  label: id,
  run: () => {
    log.push(id);
  },
  ...extra,
});
const workspaces: WorkspaceItem[] = Array.from({ length: 40 }, (_, i) => ({
  id: String(i),
  label: "Workspace " + i,
}));
function WorkspaceFixture({
  items = workspaces,
  disabled = false,
  readOnly = false,
  loading = false,
}: {
  items?: readonly WorkspaceItem[];
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 24 }}>
          <WorkspaceSwitcher
            testId="ws"
            items={items}
            value="31"
            onValueChange={(id) => log.push(id)}
            open={open}
            onOpenChange={setOpen}
            disabled={disabled}
            readOnly={readOnly}
            loading={loading}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function AccountFixture({ items }: { items: readonly UIKitAction[] }) {
  const [open, setOpen] = useState(false);
  return (
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 24 }}>
          <AccountMenu
            testId="ac"
            account={{
              name: "Long account name ".repeat(15),
              detail: "Long account description ".repeat(15),
            }}
            items={items}
            open={open}
            onOpenChange={setOpen}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function Nested() {
  const [dialog, setDialog] = useState(true),
    [open, setOpen] = useState(false);
  return (
    <UIKitProvider>
      <AppShell
        children={null}
        overlay={
          <Dialog
            testId="dialog"
            open={dialog}
            onOpenChange={setDialog}
            title="Workspace"
          >
            <WorkspaceSwitcher
              testId="nested"
              items={[]}
              value={null}
              onValueChange={() => {}}
              open={open}
              onOpenChange={setOpen}
            />
          </Dialog>
        }
      />
    </UIKitProvider>
  );
}
function Locked({ loading = false }: { loading?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 24 }}>
          <SplitButton
            testId="split"
            primary={action("run", { loading })}
            items={[action("alt")]}
            disabled={!loading}
            open={open}
            onOpenChange={setOpen}
          />
          <ToolbarActions
            testId="toolbar"
            items={[action("one"), action("two")]}
            visibleCount={1}
            open={open}
            onOpenChange={setOpen}
            loading={loading}
            disabled={!loading}
          />
          <PathControl
            testId="path"
            items={[
              { id: "a", label: "A" },
              { id: "b", label: "B" },
              { id: "c", label: "C" },
              { id: "d", label: "D" },
            ]}
            maxVisible={2}
            open={open}
            onOpenChange={setOpen}
            loading={loading}
            disabled={!loading}
            onNavigate={(id) => log.push(id)}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
try {
  root.render(<WorkspaceFixture />);
  await settle();
  await click("ws");
  assert(get("ws-item-31"));
  assert(!get("ws-item-0"));
  let mounted = 0;
  for (let i = 0; i < 40; i++) if (get("ws-item-" + i)) mounted++;
  assert.equal(mounted, 6, "Only one six-row page mounts");
  await key("enter");
  assert.equal(
    log.length,
    0,
    "Initial focus is selected workspace, not first row",
  );
  await click("ws");
  await key("end");
  assert(get("ws-item-39"));
  await key("enter");
  assert.equal(log.at(-1), "39");
  await click("ws");
  await key("home");
  assert(get("ws-item-0"));
  await key("down");
  await key("enter");
  assert.equal(log.at(-1), "1");
  await click("ws");
  await key("end");
  root.render(<WorkspaceFixture items={workspaces.slice(0, 2)} />);
  await settle();
  assert(get("ws-item-0"));
  await key("enter");
  assert.equal(
    log.at(-1),
    "0",
    "Shrinking collection clamps page and repairs focus",
  );
  root.render(<WorkspaceFixture items={[]} />);
  await settle();
  await click("ws");
  assert(get("ws-close"));
  await key("escape");
  assert(!get("ws-popup"));
  for (const props of [
    { disabled: true },
    { readOnly: true },
    { loading: true },
  ]) {
    root.render(<WorkspaceFixture {...props} />);
    await settle();
    await press("ws", "enter");
    assert(!get("ws-popup"));
  }
  root.render(
    <WorkspaceFixture
      items={[
        { id: "same", label: "One" },
        { id: "same", label: "Two" },
      ]}
    />,
  );
  await settle();
  assert(get("ws-error"));
  assert(!get("ws"));
  root.render(
    <WorkspaceFixture items={[{ id: "a", label: "Locked", disabled: true }]} />,
  );
  await settle();
  await click("ws");
  await key("escape");
  assert(
    !get("ws-popup"),
    "All-disabled list can escape from a focusable close action",
  );
  root.render(
    <AccountFixture
      items={[
        action("a"),
        action("b", { disabled: true }),
        action("c", { loading: true }),
        action("d", { hidden: true }),
        action("e"),
      ]}
    />,
  );
  await settle();
  await click("ac");
  await key("down");
  await key("enter");
  assert.equal(log.at(-1), "e");
  await click("ac");
  const node = get("ac-item-a")!;
  root.renderer.nativeSimulateKeyDown(node.id, "enter", true);
  await settle();
  assert(get("ac-popup"), "Held activation does not execute");
  const bounds = await app.getByTestId("ac-item-a").bounds();
  assert(bounds);
  root.renderer.nativeSimulateClick(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
    2,
  );
  await settle();
  assert(get("ac-popup"), "Secondary pointer does not execute");
  root.render(
    <AccountFixture items={[action("a", { disabled: true }), action("e")]} />,
  );
  await settle();
  await key("enter");
  assert.equal(
    log.at(-1),
    "e",
    "Dynamically disabled active item transfers focus",
  );
  root.render(
    <AccountFixture
      items={Array.from({ length: 13 }, (_, i) =>
        action(String(i), { disabled: i < 6 }),
      )}
    />,
  );
  await settle();
  await click("ac");
  assert(get("ac-close"));
  const fallbackBounds = await app.getByTestId("ac-close").bounds();
  assert(
    fallbackBounds &&
      fallbackBounds.y >= 0 &&
      fallbackBounds.y + fallbackBounds.height <= 720,
  );
  await key("pagedown");
  assert(get("ac-item-6"));
  await key("enter");
  assert.equal(log.at(-1), "6");
  await click("ac");
  await key("end");
  await key("pagedown");
  await key("enter");
  assert.equal(
    log.at(-1),
    "12",
    "PageDown at final page preserves actual focus",
  );
  root.render(<Nested />);
  await settle();
  await click("nested");
  await key("escape");
  assert(!get("nested-popup"));
  assert(get("dialog-close"));
  await key("escape");
  assert(!get("dialog-close"));
  for (const loading of [false, true]) {
    const before: number = log.length;
    root.render(<Locked loading={loading} />);
    await settle();
    await press("split-primary", "enter");
    await press("split-menu", "enter");
    await press("toolbar-visible-one", "enter");
    await press("toolbar-overflow", "enter");
    await press("path-a", "enter");
    await press("path-overflow", "enter");
    assert.equal(log.length, before);
    assert(!get("split-menu-popup"));
    assert(!get("toolbar-overflow-popup"));
    assert(!get("path-overflow-popup"));
  }
  root.render(
    <UIKitProvider>
      <AppShell>
        <ButtonGroup
          testId="vertical"
          orientation="vertical"
          items={[action("a"), action("b", { loading: true }), action("c")]}
        />
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  await press("vertical-a", "down");
  await key("space");
  assert.equal(log.at(-1), "c");
  console.log(
    "PASS: selected initial focus, bounded pages, collection mutation, empty/disabled/readonly/loading, duplicate ids, held/right-click suppression, nested Escape and vertical group",
  );
} finally {
  root.render(null);
  await app.close();
}
