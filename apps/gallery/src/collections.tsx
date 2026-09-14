import { useState } from "react";
import { useWindowSize } from "@gpuix/react";
import {
  UIKitProvider,
  AppShell,
  Input,
  Button,
  Text,
  Row,
  Stack,
  SegmentedControl,
  NavigationPane,
  NavigationSplitView,
  CollectionView,
  CollectionItem,
  AsyncListView,
  ResourceState,
  LoadMoreButton,
  LazyTreeView,
  type LazyTreeNode,
  type ThemeMode,
  useTheme,
} from "@mirai/gpuix-kit";
import { navigationLayout } from "@mirai/gpuix-kit/navigation-split-model";
export function CollectionsGallery() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  return (
    <UIKitProvider mode={mode}>
      <Browser mode={mode} onMode={setMode} />
    </UIKitProvider>
  );
}
function Browser({
  mode,
  onMode,
}: {
  mode: ThemeMode;
  onMode: (mode: ThemeMode) => void;
}) {
  const { width, height } = useWindowSize(),
    { colors: c } = useTheme();
  const [name, setName] = useState("Studio library"),
    [view, setView] = useState("grid"),
    [status, setStatus] = useState<"ready" | "loading" | "error" | "empty">(
      "ready",
    ),
    [refreshing, setRefreshing] = useState(false);
  const [count, setCount] = useState(12),
    [selected, setSelected] = useState<string[]>(["item-0"]),
    [event, setEvent] = useState("Choose a document"),
    [sideWidth, setSideWidth] = useState(250);
  const [expanded, setExpanded] = useState<string[]>(["local"]),
    [treeSelected, setTreeSelected] = useState<string[]>(["design"]),
    [nodes, setNodes] = useState<LazyTreeNode[]>([
      {
        id: "local",
        label: "On this device",
        children: [
          { id: "design", label: "Design library" },
          { id: "research", label: "Research notes" },
          { id: "private", label: "Unavailable folder", disabled: true },
        ],
      },
      { id: "remote", label: "Shared workspace", hasChildren: true },
      { id: "archive", label: "Archive", children: [] },
    ]);
  const [requestCount, setRequestCount] = useState(0),
    [retryCount, setRetryCount] = useState(0),
    [moreCount, setMoreCount] = useState(0),
    [moreState, setMoreState] = useState<"idle" | "loading" | "error" | "end">(
      "idle",
    );
  const palette = [c.accent, c.success, c.warning, c.muted];
  const items = Array.from({ length: count }, (_, i) => ({
    id: "item-" + i,
    label:
      [
        "Product direction",
        "Field notes",
        "Interface studies",
        "Release checklist",
        "Research archive",
        "Reading list",
      ][i % 6] +
      " " +
      (i + 1),
    kind: ["DOC", "NOTE", "BOARD"][i % 3]!,
    disabled: i === 3,
  }));
  const layout = navigationLayout({
      width,
      sidebarWidth: sideWidth,
      detailMinWidth: 400,
    }),
    bodyHeight = Math.max(240, height - 100),
    collectionHeight = Math.max(180, bodyHeight - 64 - 32 - 44 - 12 - 72);
  const retry = async () => {
    const attempt = retryCount + 1;
    setRetryCount(attempt);
    setStatus("loading");
    await Promise.resolve();
    if (attempt === 1) {
      setStatus("error");
      throw new Error("Local demonstration rejection");
    }
    setStatus("ready");
  };
  const loadMore = async () => {
    const attempt = moreCount + 1;
    setMoreCount(attempt);
    setMoreState("loading");
    await Promise.resolve();
    if (attempt === 1) {
      setMoreState("error");
      throw new Error("Local demonstration rejection");
    }
    const next = Math.min(24, count + 6);
    setCount(next);
    setMoreState(next === 24 ? "end" : "idle");
  };
  const requestChildren = async (id: string) => {
    const attempt = requestCount + 1;
    setRequestCount(attempt);
    setNodes((current) =>
      current.map((n) => (n.id === id ? { ...n, loadState: "loading" } : n)),
    );
    await Promise.resolve();
    if (attempt === 1) {
      setNodes((current) =>
        current.map((n) =>
          n.id === id
            ? { ...n, loadState: "error", errorLabel: "Sample load failed" }
            : n,
        ),
      );
      throw new Error("Local sample request");
    }
    setNodes((current) =>
      current.map((n) =>
        n.id === id
          ? {
              ...n,
              loadState: "ready",
              children: [
                { id: "shared-a", label: "Team documents" },
                { id: "shared-b", label: "Reference materials" },
              ],
            }
          : n,
      ),
    );
  };
  return (
    <AppShell>
      <Row
        style={{
          height: 60,
          padding: 12,
          gap: 12,
          borderBottomWidth: 1,
          borderColor: c.border,
          backgroundColor: c.surface,
        }}
      >
        <Text size={18} weight={600}>
          Collections
        </Text>
        <Input
          testId="collections-name"
          value={name}
          onValueChange={setName}
          style={{ width: 200 }}
        />
        <div style={{ flexGrow: 1 }} />
        <Text size={11} color={c.muted}>
          Native components · local samples
        </Text>
        <SegmentedControl
          testId="collections-theme"
          value={mode}
          onValueChange={(v) => onMode(v as ThemeMode)}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Row>
      <NavigationSplitView
        testId="collections-layout"
        width={width}
        height={bodyHeight}
        sidebarWidth={sideWidth}
        onSidebarWidthChange={setSideWidth}
        detailMinWidth={400}
        sidebar={
          <NavigationPane
            testId="collections-folders"
            title="Locations"
            subtitle="Expand to load children"
            footer={
              <Text size={11} color={c.muted}>
                No file or network service connected.
              </Text>
            }
          >
            <LazyTreeView
              testId="collections-tree"
              nodes={nodes}
              expandedIds={expanded}
              onExpandedChange={setExpanded}
              selectedIds={treeSelected}
              onSelectionChange={setTreeSelected}
              onRequestChildren={requestChildren}
              height={bodyHeight - 116}
            />
          </NavigationPane>
        }
      >
        <NavigationPane
          testId="collections-pane"
          title={name}
          subtitle="A reusable collection workspace"
          actions={
            <SegmentedControl
              testId="collections-view"
              value={view}
              onValueChange={setView}
              options={[
                { value: "grid", label: "Grid" },
                { value: "list", label: "List" },
              ]}
            />
          }
        >
          <Stack
            gap={12}
            style={{ padding: 16, flexGrow: 1, flexShrink: 1, minHeight: 0 }}
          >
            <Row style={{ height: 44 }}>
              <SegmentedControl
                testId="collections-status"
                value={status}
                onValueChange={(v) => setStatus(v as typeof status)}
                options={[
                  { value: "ready", label: "Ready" },
                  { value: "loading", label: "Loading" },
                  { value: "empty", label: "Empty" },
                  { value: "error", label: "Error" },
                ]}
              />
              <div style={{ flexGrow: 1 }} />
              <Button
                testId="collections-refresh"
                size="sm"
                onPress={() => setRefreshing(!refreshing)}
              >
                Refresh state
              </Button>
            </Row>
            {view === "list" ? (
              <AsyncListView
                testId="collections-list"
                status={status === "empty" ? "ready" : status}
                items={status === "empty" ? [] : items}
                selectedIds={selected}
                onSelectionChange={setSelected}
                selectionMode="multiple"
                height={collectionHeight}
                refreshing={refreshing}
                onRetry={retry}
                errorLabel="A sample failure. Retry stays inside this demo."
                renderItem={(item) => (
                  <Row style={{ flexGrow: 1 }}>
                    <Text size={12} style={{ flexGrow: 1 }}>
                      {item.label}
                    </Text>
                    <Text size={10} color={c.muted}>
                      {item.kind}
                    </Text>
                  </Row>
                )}
              />
            ) : status !== "ready" ? (
              <ResourceState
                testId="collections-state"
                state={status}
                height={collectionHeight}
                onRetry={retry}
                description={
                  status === "error"
                    ? "A sample failure. Retry stays inside this demo."
                    : undefined
                }
              />
            ) : (
              <CollectionView
                testId="collections-grid"
                width={layout.detailWidth - 32}
                height={collectionHeight}
                cardHeight={146}
                items={items}
                selectedIds={selected}
                onSelectionChange={setSelected}
                selectionMode="multiple"
                onActivate={(item) => setEvent("Opened " + item.label)}
                renderItem={(item, state) => (
                  <CollectionItem
                    title={item.label}
                    description="Updated today"
                    badge={item.kind}
                    selected={state.selected}
                    active={state.active}
                    disabled={item.disabled}
                    preview={
                      <Text
                        size={30}
                        color={palette[Number(item.id.split("-")[1]) % 4]}
                      >
                        ▤
                      </Text>
                    }
                  />
                )}
              />
            )}
            <Row style={{ minHeight: 60, alignItems: "center" }}>
              <Stack gap={4} style={{ flexGrow: 1 }}>
                <Text testId="collections-selected" size={12}>
                  {selected.join(", ") || "No selection"}
                </Text>
                <Text testId="collections-count" size={11} color={c.muted}>
                  {count + " local items"}
                </Text>
              </Stack>
              <LoadMoreButton
                testId="collections-more"
                state={moreState}
                onLoadMore={loadMore}
              />
            </Row>
          </Stack>
        </NavigationPane>
      </NavigationSplitView>
      <Row
        style={{
          height: 40,
          padding: 10,
          borderTopWidth: 1,
          borderColor: c.border,
        }}
      >
        <Text testId="collections-event" size={11} color={c.muted}>
          {event}
        </Text>
      </Row>
    </AppShell>
  );
}
