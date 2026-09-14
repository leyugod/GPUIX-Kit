import assert from "node:assert/strict";
import { createRef } from "react";
import { resolve } from "node:path";
import { type PublicInstance } from "@gpuix/react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Button,
  Input,
  Text,
  Stack,
  Dialog,
  SourceListSidebar,
  SourceListRow,
  SourceListSectionHeader,
  SidebarToggle,
  NavigationSplitView,
  type SourceListGroup,
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
const get = (id: string) => root.renderer.findByTestId(id),
  click = async (id: string) => {
    await app.getByTestId(id).click();
    await settle();
  },
  press = async (id: string, k: string) => {
    await app.getByTestId(id).press(k);
    await settle();
  },
  key = async (k: string) => {
    root.renderer.simulateKeystrokes(k);
    await settle();
  };
let selected: string | null = "one",
  collapsed: string[] = [],
  disabled = false,
  loading = false,
  windowActive = true,
  follow = true,
  selectCount = 0,
  actionCount = 0,
  afterCount = 0;
let groups: SourceListGroup[] = [
  {
    id: "g",
    label: "Favorites",
    items: [
      {
        id: "one",
        label: "One",
        action: {
          label: "+",
          onPress: () => {
            actionCount++;
          },
        },
      },
      { id: "off", label: "Off", disabled: true },
      { id: "two", label: "Two" },
    ],
  },
  {
    id: "many",
    label: "Collections",
    items: Array.from({ length: 24 }, (_, i) => ({
      id: "n" + i,
      label: "Collection " + i,
    })),
  },
];
const source = () => (
  <SourceListSidebar
    testId="source"
    height={400}
    header={<Text>Workspace</Text>}
    search={<Input testId="source-query" value="" onValueChange={() => {}} />}
    footer={<Text>Fixed footer</Text>}
    groups={groups}
    value={selected}
    onValueChange={(id) => {
      selected = id;
      selectCount++;
      renderSource();
    }}
    collapsed={collapsed}
    onCollapsedChange={(v) => {
      collapsed = v;
      renderSource();
    }}
    disabled={disabled}
    loading={loading}
    windowActive={windowActive}
    selectionFollowsFocus={follow}
  />
);
const renderSource = () =>
  root.render(
    <UIKitProvider>
      <AppShell>
        <Stack style={{ width: 280 }}>
          {source()}
          <Button
            testId="after"
            onPress={() => {
              afterCount++;
            }}
          >
            After
          </Button>
        </Stack>
      </AppShell>
    </UIKitProvider>,
  );
try {
  renderSource();
  await settle();
  await click("source-item-one");
  assert.equal(selected, "one");
  await key("down");
  assert.equal(selected, "two", "disabled row skipped");
  await key("end");
  assert.equal(selected, "n23");
  assert(
    (root.renderer.getScrollOffset(get("source-scroll")!.id)?.[1] ?? 0) < 0,
  );
  const footer = await app.getByTestId("source-footer").bounds(),
    last = await app.getByTestId("source-item-n23").bounds();
  assert(last.y + last.height <= footer.y + 1);
  await key("left");
  await key("left");
  assert(!get("source-item-n23"));
  assert.equal(selected, "n23");
  await key("right");
  assert(get("source-item-n23"));
  await key("tab");
  await key("enter");
  assert.equal(afterCount, 1, "single Tab leaves source list");
  await press("source-list", "home");
  await key("right");
  assert.equal(selected, "one");
  await key("right");
  await key("enter");
  assert.equal(actionCount, 1);
  await key("left");
  await key("tab");
  await key("enter");
  assert.equal(afterCount, 2, "action returns to root before leaving list");
  const n = selectCount;
  await click("source-item-off");
  assert.equal(selectCount, n);
  await press("source-list", "home");
  await key("right");
  root.renderer.nativeSimulateKeyDown(get("source-list")!.id, "enter", true);
  await settle();
  assert.equal(selectCount, n + 1, "held activation suppressed");
  groups = groups.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.id !== "one"),
  }));
  selected = null;
  renderSource();
  await settle();
  assert.equal(
    selected,
    null,
    "collection changes do not mutate application selection",
  );
  await key("enter");
  assert(
    selected !== null && selected !== "one",
    "removed active target falls back without stale activation",
  );
  follow = false;
  renderSource();
  await settle();
  const retainedSelection = selected;
  await key("end");
  assert.equal(
    selected,
    retainedSelection,
    "manual activation mode retains selection",
  );
  await key("enter");
  assert.equal(selected, "n23");
  follow = true;
  disabled = true;
  renderSource();
  await settle();
  const blockedCount = selectCount;
  await press("source-list", "end");
  assert.equal(selectCount, blockedCount);
  assert.equal(get("source-list")!.customProps?.tabIndex, -1);
  disabled = false;
  loading = true;
  renderSource();
  await settle();
  assert(get("source-status"));
  assert(!get("source-item-two"));
  loading = false;
  groups = [];
  renderSource();
  await settle();
  assert(get("source-status"));
  await press("source-list", "tab");
  await key("enter");
  assert.equal(afterCount, 3);
  groups = [
    {
      id: "dup",
      label: "Invalid",
      items: [
        { id: "x", label: "A" },
        { id: "x", label: "B" },
      ],
    },
  ];
  renderSource();
  await settle();
  assert(
    (await app.getByTestId("source-status").textContent()).includes(
      "duplicate",
    ),
  );
  assert(!get("source-item-x"));
  let rowPress = 0,
    rowAction = 0,
    headerChanges = 0;
  root.render(
    <UIKitProvider>
      <AppShell>
        <Stack style={{ width: 260 }}>
          <SourceListRow
            testId="standalone"
            label="A long source label that stays bounded"
            selected
            badge="12"
            onPress={() => {
              rowPress++;
            }}
            action={{
              label: "+",
              onPress: () => {
                rowAction++;
              },
            }}
          />
          <SourceListSectionHeader
            testId="header"
            label="Standalone group"
            collapsed={false}
            onCollapsedChange={() => {
              headerChanges++;
            }}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  await press("standalone", "enter");
  assert.equal(rowPress, 1);
  await key("right");
  await key("enter");
  assert.equal(rowAction, 1);
  await key("left");
  await key("enter");
  assert.equal(rowPress, 2);
  await press("header", "enter");
  assert.equal(headerChanges, 1);
  root.render(
    <UIKitProvider>
      <AppShell>
        <SourceListRow
          testId="inactive"
          label="Inactive selection"
          selected
          windowActive={false}
          onPress={() => {}}
        />
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  assert.equal(get("inactive-surface")!.style.backgroundColor, "#303034");
  let dialogOpen = true,
    footerHits = 0;
  groups = [
    {
      id: "modal",
      label: "Sources",
      items: [
        {
          id: "a",
          label: "A",
          action: {
            label: "+",
            onPress: () => {
              actionCount++;
            },
          },
        },
      ],
    },
  ];
  selected = "a";
  collapsed = [];
  const modal = () =>
    root.render(
      <UIKitProvider>
        <AppShell
          overlay={
            <Dialog
              testId="dialog"
              title="Pick a source"
              open={dialogOpen}
              onOpenChange={(v) => {
                dialogOpen = v;
                modal();
              }}
              showClose={false}
              footer={
                <Button
                  testId="dialog-done"
                  onPress={() => {
                    footerHits++;
                  }}
                >
                  Done
                </Button>
              }
            >
              <SourceListSidebar
                testId="modal-source"
                height={220}
                groups={groups}
                value={selected}
                onValueChange={(id) => {
                  selected = id;
                }}
                collapsed={[]}
                onCollapsedChange={() => {}}
              />
            </Dialog>
          }
        >
          {null}
        </AppShell>
      </UIKitProvider>,
    );
  modal();
  await settle();
  await key("end");
  await key("tab");
  await key("enter");
  assert.equal(footerHits, 1, "modal Tab ignores row action nodes");
  await key("escape");
  assert(!dialogOpen);
  let navWidth = 1000,
    navSidebar = true,
    compact: "content" | "detail" = "detail",
    fallbackHits = 0,
    contentDraft = "Content draft",
    detailDraft = "Detail draft",
    navSize = 224,
    navDisabled = false,
    navContentVisible = true;
  const fallback = createRef<PublicInstance>();
  const nav = () =>
    root.render(
      <UIKitProvider>
        <AppShell>
          <SidebarToggle
            ref={fallback}
            testId="fallback"
            visible={navSidebar}
            onVisibleChange={(v) => {
              fallbackHits++;
              navSidebar = v;
              nav();
            }}
          />
          <NavigationSplitView
            testId="nav"
            disabled={navDisabled}
            contentVisible={navContentVisible}
            width={navWidth}
            height={500}
            sidebarVisible={navSidebar}
            sidebarWidth={navSize}
            onSidebarWidthChange={(v) => {
              navSize = v;
              nav();
            }}
            fallbackFocusRef={fallback}
            compactPane={compact}
            content={
              <Input
                testId="nav-content-input"
                value={contentDraft}
                onValueChange={(v) => {
                  contentDraft = v;
                  nav();
                }}
              />
            }
            sidebar={
              <Button testId="nav-source-button" onPress={() => {}}>
                Source
              </Button>
            }
          >
            <Input
              testId="nav-detail-input"
              value={detailDraft}
              onValueChange={(v) => {
                detailDraft = v;
                nav();
              }}
            />
          </NavigationSplitView>
        </AppShell>
      </UIKitProvider>,
    );
  nav();
  await settle();
  await click("nav-source-button");
  navWidth = 500;
  nav();
  await settle();
  assert(!get("nav-pane-sidebar"));
  assert(!get("nav-pane-content"));
  await key("enter");
  assert.equal(fallbackHits, 1, "hidden pane returns focus to toolbar");
  navSidebar = true;
  navWidth = 1000;
  nav();
  await settle();
  await click("nav-detail-input");
  await press("nav-detail-input", "escape");
  navWidth = 500;
  compact = "content";
  nav();
  await settle();
  assert(!get("nav-pane-detail"));
  assert(get("nav-pane-content"));
  await key("enter");
  assert.equal(
    fallbackHits,
    2,
    "compact detail removal restores explicit focus",
  );
  navSidebar = true;
  navWidth = 1000;
  compact = "detail";
  nav();
  await settle();
  const divider = await app.getByTestId("nav-sidebar-divider").bounds();
  root.renderer.nativeSimulateMouseDown(divider.x + 3, divider.y + 20, 0);
  await settle();
  assert(get("nav-sidebar-drag"));
  navSidebar = false;
  nav();
  await settle();
  assert(
    !get("nav-sidebar-drag"),
    "hiding a dragging sidebar destroys capture",
  );
  await key("enter");
  assert.equal(fallbackHits, 3, "hidden divider returns focus to toolbar");
  const secondDivider = await app.getByTestId("nav-sidebar-divider").bounds();
  root.renderer.nativeSimulateMouseDown(
    secondDivider.x + 3,
    secondDivider.y + 20,
    0,
  );
  await settle();
  assert(get("nav-sidebar-drag"));
  navDisabled = true;
  nav();
  await settle();
  assert(!get("nav-sidebar-drag"), "disable during drag destroys capture");
  navDisabled = false;
  navWidth = 640;
  navContentVisible = false;
  nav();
  await settle();
  await press("nav-sidebar-divider", "end");
  assert.equal(navSize, 314, "resizing reserves detail minimum");
  assert(
    get("nav-pane-sidebar"),
    "bounded resize does not hide the source being resized",
  );
  await app.screenshot({ path: resolve("artifacts/sidebars-states.png") });
  console.log(
    "PASS sidebar states: disabled/empty/invalid/mutations, roving focus, row actions, modal Tab, scroll, compact pane focus and drag cleanup",
  );
} finally {
  root.render(null);
  await app.close();
}
