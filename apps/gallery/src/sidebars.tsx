import { useRef, useState } from "react";
import { useWindowSize, type PublicInstance } from "@gpuix/react";
import {
  UIKitProvider,
  AppShell,
  Input,
  Button,
  Text,
  Row,
  Stack,
  SegmentedControl,
  ListView,
  Progress,
  SourceListSidebar,
  SidebarToggle,
  NavigationPane,
  NavigationSplitView,
  Inspector,
  InspectorSection,
  useTheme,
  type ThemeMode,
  type SourceListGroup,
} from "@mirai/gpuix-kit";
export function SidebarsGallery() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  return (
    <UIKitProvider mode={mode}>
      <SidebarWorkspace mode={mode} setMode={setMode} />
    </UIKitProvider>
  );
}
function SidebarWorkspace({
  mode,
  setMode,
}: {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}) {
  const { width, height } = useWindowSize(),
    { colors: c } = useTheme();
  const [name, setName] = useState("Northstar"),
    [query, setQuery] = useState(""),
    [kind, setKind] = useState("mail");
  const [source, setSource] = useState("inbox"),
    [collapsed, setCollapsed] = useState<string[]>([]);
  const [sidebar, setSidebar] = useState(true),
    [inspector, setInspector] = useState(false),
    [activeWindow, setActiveWindow] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(224),
    [contentWidth, setContentWidth] = useState(292),
    [inspectorWidth, setInspectorWidth] = useState(240);
  const [selected, setSelected] = useState("m0"),
    [draft, setDraft] = useState(
      "Thanks for the update. The new workspace is ready.",
    ),
    [event, setEvent] = useState("All changes stay in this example.");
  const [removed, setRemoved] = useState(false),
    [compactPane, setCompactPane] = useState<"content" | "detail">("detail");
  const toggle = useRef<PublicInstance>(null);
  const symbol = (s: string, color = c.accent) => (
    <Text size={16} color={color}>
      {s}
    </Text>
  );
  const all: SourceListGroup[] =
    kind === "mail"
      ? [
          {
            id: "favorites",
            label: "Favorites",
            items: [
              {
                id: "inbox",
                label: "All inboxes",
                icon: symbol("▱"),
                badge: "12",
              },
              { id: "unread", label: "Unread", icon: symbol("●"), badge: "5" },
              {
                id: "starred",
                label: "Flagged",
                icon: symbol("⚑", c.warning),
                badge: "3",
              },
              {
                id: "drafts",
                label: "Drafts",
                icon: symbol("▤"),
                badge: "2",
                action: {
                  label: "＋",
                  onPress: () => setEvent("New draft requested"),
                },
              },
            ],
          },
          {
            id: "work",
            label: "Northstar",
            items: [
              { id: "sent", label: "Sent", icon: symbol("↗") },
              { id: "archive", label: "Archive", icon: symbol("▣") },
              ...(!removed
                ? [
                    {
                      id: "project",
                      label: "Project correspondence and planning",
                      icon: symbol("▱"),
                      badge: "8",
                      action: {
                        label: "−",
                        onPress: () => {
                          setRemoved(true);
                          if (source === "project") setSource("inbox");
                          setEvent("Project source removed");
                        },
                      },
                    },
                  ]
                : []),
              {
                id: "offline",
                label: "Offline account",
                icon: symbol("○"),
                disabled: true,
              },
            ],
          },
          {
            id: "tags",
            label: "Tags",
            items: [
              { id: "design", label: "Design", icon: symbol("●", c.warning) },
              {
                id: "engineering",
                label: "Engineering",
                icon: symbol("●", c.success),
              },
              {
                id: "personal",
                label: "Personal",
                icon: symbol("●", c.accent),
              },
            ],
          },
        ]
      : [
          {
            id: "favorites",
            label: "Favorites",
            items: [
              { id: "recent", label: "Recents", icon: symbol("◷") },
              {
                id: "documents",
                label: "Documents",
                icon: symbol("▤"),
                badge: "24",
              },
              {
                id: "downloads",
                label: "Downloads",
                icon: symbol("↓"),
                badge: "8",
              },
            ],
          },
          {
            id: "locations",
            label: "Locations",
            items: [
              { id: "computer", label: "This Mac", icon: symbol("▣") },
              {
                id: "drive",
                label: "Studio drive",
                icon: symbol("▱"),
                action: {
                  label: "↗",
                  onPress: () => setEvent("Open drive requested"),
                },
              },
              {
                id: "network",
                label: "Network unavailable",
                icon: symbol("○"),
                disabled: true,
              },
            ],
          },
          {
            id: "tags",
            label: "Tags",
            items: Array.from({ length: 16 }, (_, i) => ({
              id: "tag" + i,
              label:
                ["Blue", "Green", "Orange", "Personal"][i % 4] +
                " collection " +
                (i + 1),
              icon: symbol(
                "●",
                [c.accent, c.success, c.warning, c.muted][i % 4],
              ),
              badge: String(i + 1),
            })),
          },
        ];
  const groups = query.trim()
    ? all
        .map((g) => ({
          ...g,
          items: g.items.filter((i) =>
            i.label.toLowerCase().includes(query.trim().toLowerCase()),
          ),
        }))
        .filter((g) => g.items.length)
    : all;
  const title =
    all.flatMap((g) => g.items).find((i) => i.id === source)?.label ??
    "Sources";
  const records = Array.from({ length: 8 }, (_, i) => ({
    id: "m" + i,
    title:
      kind === "mail"
        ? [
            "A quieter place to focus",
            "Autumn release notes",
            "Design review · Thursday",
            "The next chapter",
            "Updated project brief",
            "A few details for tomorrow",
            "Welcome to the studio",
            "Weekly reading list",
          ][i]!
        : "Workspace document " + (i + 1),
    sender: ["Maya Chen", "Alex Rivera", "Product Studio", "Sam Lee"][i % 4]!,
    time: i === 0 ? "10:42" : "Yesterday",
  }));
  const record = records.find((m) => m.id === selected) ?? records[0]!;
  const paneHeight = Math.max(200, height - 108);
  return (
    <AppShell>
      <Row
        testId="sidebars-toolbar"
        style={{
          height: 60,
          padding: 12,
          borderBottomWidth: 1,
          borderColor: c.border,
          backgroundColor: c.surface,
        }}
      >
        <SidebarToggle
          ref={toggle}
          testId="sidebars-toggle"
          visible={sidebar}
          onVisibleChange={setSidebar}
        />
        <Input
          testId="sidebars-name"
          value={name}
          onValueChange={setName}
          style={{ width: 140 }}
        />
        <SegmentedControl
          testId="sidebars-kind"
          value={kind}
          onValueChange={(v) => {
            setKind(v);
            setSource(v === "mail" ? "inbox" : "documents");
            setQuery("");
            setCollapsed([]);
          }}
          options={[
            { value: "mail", label: "Mail" },
            { value: "files", label: "Files" },
          ]}
        />
        <div style={{ flexGrow: 1 }} />
        <Button
          testId="sidebars-inspector-toggle"
          size="sm"
          onPress={() => setInspector(!inspector)}
        >
          Inspector
        </Button>
        <SegmentedControl
          testId="sidebars-theme"
          value={mode}
          onValueChange={(v) => setMode(v as ThemeMode)}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Row>
      <NavigationSplitView
        testId="sidebars-layout"
        width={width}
        height={paneHeight}
        sidebarVisible={sidebar}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={setSidebarWidth}
        contentWidth={contentWidth}
        onContentWidthChange={setContentWidth}
        inspectorVisible={inspector}
        inspectorWidth={inspectorWidth}
        onInspectorWidthChange={setInspectorWidth}
        compactPane={compactPane}
        fallbackFocusRef={toggle}
        sidebar={
          <SourceListSidebar
            testId="sidebars-source"
            groups={groups}
            value={source}
            onValueChange={(id) => {
              setSource(id);
              setSelected("m0");
              setEvent("Selected " + id);
            }}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            height={paneHeight}
            windowActive={activeWindow}
            header={
              <Row>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: c.accentSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text color={c.accent} weight={600}>
                    N
                  </Text>
                </div>
                <Stack gap={1}>
                  <Text size={13} weight={600}>
                    {name}
                  </Text>
                  <Text size={10} color={c.muted}>
                    Personal workspace
                  </Text>
                </Stack>
              </Row>
            }
            search={
              <Input
                testId="sidebars-search"
                value={query}
                onValueChange={setQuery}
                placeholder="Search sources"
              />
            }
            footer={
              <Stack gap={5}>
                <Row>
                  <Text size={11} color={c.muted} style={{ flexGrow: 1 }}>
                    Local library
                  </Text>
                  <Text size={10} color={c.muted}>
                    64%
                  </Text>
                </Row>
                <Progress value={64} />
              </Stack>
            }
          />
        }
        content={
          <NavigationPane
            testId="sidebars-content"
            title={title}
            subtitle="8 items · local sample"
            footer={
              <Text size={11} color={c.muted}>
                Updated just now
              </Text>
            }
          >
            <ListView
              testId="sidebars-messages"
              items={records}
              selectedIds={[selected]}
              onSelectionChange={(ids) => setSelected(ids[0] ?? "m0")}
              onActivate={() => setCompactPane("detail")}
              height={Math.max(60, paneHeight - 102)}
              rowHeight={88}
              renderItem={(m, { selected: isSelected }) => (
                <Stack
                  gap={5}
                  style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}
                >
                  <Row>
                    <Text size={12} weight={600} style={{ flexGrow: 1 }}>
                      {m.sender}
                    </Text>
                    <Text size={10} color={c.muted}>
                      {m.time}
                    </Text>
                  </Row>
                  <Text size={12} weight={isSelected ? 600 : 400} lines={1}>
                    {m.title}
                  </Text>
                  <Text size={11} color={c.muted} lines={1}>
                    A small update from the team, with a few things to explore.
                  </Text>
                </Stack>
              )}
            />
          </NavigationPane>
        }
        inspector={
          <Inspector
            testId="sidebars-inspector"
            title="Details"
            onClose={() => setInspector(false)}
          >
            <InspectorSection title="SOURCE">
              <Text size={12}>{title}</Text>
            </InspectorSection>
            <InspectorSection title="STORAGE">
              <Text size={12}>Application supplied metadata</Text>
              <Text size={11} color={c.muted}>
                No file or email service connected.
              </Text>
            </InspectorSection>
          </Inspector>
        }
      >
        <NavigationPane
          testId="sidebars-detail"
          title={kind === "mail" ? "Reading room" : "Document preview"}
          subtitle={title}
          actions={
            <Button
              testId="sidebars-detail-action"
              size="sm"
              variant="ghost"
              onPress={() => setEvent("More actions requested")}
            >
              ···
            </Button>
          }
          scroll
          footer={
            <Row>
              <Text testId="sidebars-selection" size={11} color={c.muted}>
                {source + " / " + selected}
              </Text>
              <div style={{ flexGrow: 1 }} />
              <Button
                testId="sidebars-save"
                size="sm"
                variant="primary"
                onPress={() => setEvent("Local draft saved")}
              >
                Save draft
              </Button>
            </Row>
          }
        >
          <Stack gap={20} style={{ padding: 28 }}>
            <Text size={25} weight={600} lines={3}>
              {record.title}
            </Text>
            <Row>
              <div
                style={{
                  height: 36,
                  width: 36,
                  borderRadius: 18,
                  backgroundColor: c.accentSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size={13} weight={600} color={c.accent}>
                  MC
                </Text>
              </div>
              <Stack gap={3}>
                <Text size={13} weight={600}>
                  {record.sender}
                </Text>
                <Text size={11} color={c.muted}>
                  To the Northstar team · Today, 10:42
                </Text>
              </Stack>
            </Row>
            <Text size={14} lines={5}>
              Hi team,
            </Text>
            <Text size={14} lines={6}>
              The workspace is taking shape. A clear source list on the left, a
              focused collection in the middle, and room to read and work on the
              right.
            </Text>
            <Text size={14} lines={6}>
              Try collapsing a group, changing the selected source, or adjusting
              the dividers. Your application owns the selection and layout
              preferences.
            </Text>
            <Stack
              gap={8}
              style={{
                padding: 16,
                borderRadius: 10,
                backgroundColor: c.surface,
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              <Text size={12} weight={600}>
                Quick reply
              </Text>
              <Input
                testId="sidebars-draft"
                value={draft}
                onValueChange={setDraft}
              />
              <Text size={11} color={c.muted}>
                This example keeps your draft in memory.
              </Text>
            </Stack>
          </Stack>
        </NavigationPane>
      </NavigationSplitView>
      <Row
        style={{
          height: 48,
          padding: 8,
          borderTopWidth: 1,
          borderColor: c.border,
          backgroundColor: c.surface,
        }}
      >
        <Text
          testId="sidebars-event"
          size={11}
          color={c.muted}
          lines={1}
          style={{ flexGrow: 1, flexShrink: 1 }}
        >
          {event}
        </Text>
        <Button
          testId="sidebars-window-active"
          size="sm"
          variant="ghost"
          onPress={() => setActiveWindow(!activeWindow)}
        >
          {activeWindow ? "Active selection" : "Inactive selection"}
        </Button>
        <Button
          testId="sidebars-compact"
          size="sm"
          variant="ghost"
          onPress={() =>
            setCompactPane(compactPane === "detail" ? "content" : "detail")
          }
        >
          {compactPane === "detail" ? "Prefer list" : "Prefer detail"}
        </Button>
      </Row>
    </AppShell>
  );
}
