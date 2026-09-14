import { useState } from "react";
import { useWindowSize } from "@gpuix/react";
import * as UI from "@mirai/gpuix-kit";
import data from "./handbook-data.json";
import { examples } from "./handbook-examples";
export { examples };
export const handbookEntries = data;
const groups = [
  { id: "base", label: "Base components" },
  { id: "application", label: "Application components" },
  { id: "marketing", label: "Marketing components" },
];
type Clipboard = Pick<
  ReturnType<typeof UI.createHostAdapter>,
  "capabilities" | "writeClipboardText"
>;
// 宿主能力由启动入口注入；浏览组件不会触发外部服务。
export function Handbook({
  initialMode = "light",
  initialId = "base-buttons",
  clipboard = UI.createHostAdapter(),
}: {
  initialMode?: UI.ThemeMode;
  initialId?: string;
  clipboard?: Clipboard;
}) {
  const [mode, setMode] = useState<UI.ThemeMode>(initialMode);
  return (
    <UI.UIKitProvider mode={mode}>
      <Content
        mode={mode}
        setMode={setMode}
        initialId={initialId}
        clipboard={clipboard}
      />
    </UI.UIKitProvider>
  );
}
function Content({
  mode,
  setMode,
  initialId,
  clipboard,
}: {
  mode: UI.ThemeMode;
  setMode: (mode: UI.ThemeMode) => void;
  initialId: string;
  clipboard: Clipboard;
}) {
  const { width, height } = useWindowSize(),
    { colors: c } = UI.useTheme();
  const [selected, setSelected] = useState(initialId),
    [query, setQuery] = useState(""),
    [tab, setTab] = useState("preview"),
    [collapsed, setCollapsed] = useState<string[]>([]),
    [copied, setCopied] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(268);
  const entry = data.find((e) => e.id === selected) ?? data[0]!,
    Example = examples[entry.id]!;
  const filtered = data.filter((e) =>
    (e.reference + " " + e.exports.join(" ") + " " + e.id)
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const navigation = groups
    .map((g) => ({
      ...g,
      items: filtered
        .filter((e) => e.group === g.id)
        .map((e) => ({ id: e.id, label: e.reference })),
    }))
    .filter((g) => g.items.length);
  const select = (id: string) => {
    setSelected(id);
    setTab("preview");
    setCopied("");
  };
  return (
    <UI.AppShell>
      <UI.Stack gap={0} style={{ width: "100%", height: "100%" }}>
        <UI.Toolbar>
          <UI.Text size={17} weight={700}>
            GPUIX Kit
          </UI.Text>
          <UI.Text color={c.muted}>Component handbook · 85 categories</UI.Text>
          <UI.Row style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <UI.SegmentedControl
              testId="handbook-theme"
              value={mode}
              onValueChange={(v) => setMode(v as UI.ThemeMode)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </UI.Row>
        </UI.Toolbar>
        <UI.NavigationSplitView
          testId="handbook-layout"
          width={width}
          height={height - 62}
          sidebarWidth={sidebarWidth}
          onSidebarWidthChange={setSidebarWidth}
          detailMinWidth={600}
          sidebar={
            <UI.Stack gap={10} style={{ height: "100%", padding: 12 }}>
              <UI.SearchField
                testId="handbook-search"
                value={query}
                onValueChange={setQuery}
                placeholder="Search components or API…"
              />
              <UI.Text testId="handbook-count" size={11} color={c.muted}>
                {filtered.length} categories
              </UI.Text>
              {navigation.length ? (
                <UI.SourceListSidebar
                  key={query}
                  testId="handbook-nav"
                  height={height - 164}
                  groups={navigation}
                  value={entry.id}
                  onValueChange={select}
                  collapsed={collapsed}
                  onCollapsedChange={setCollapsed}
                />
              ) : (
                <UI.Text testId="handbook-empty">
                  No matching components
                </UI.Text>
              )}
            </UI.Stack>
          }
        >
          <UI.Stack gap={16} style={{ height: "100%", padding: 24 }}>
            <UI.Text testId="handbook-title" size={26} weight={700}>
              {entry.reference}
            </UI.Text>
            <UI.Text color={c.muted}>{entry.exports.join(" · ")}</UI.Text>
            <UI.Row style={{ justifyContent: "space-between" }}>
              <UI.SegmentedControl
                testId="handbook-tab"
                value={tab}
                onValueChange={setTab}
                options={[
                  { value: "preview", label: "Preview" },
                  { value: "code", label: "Code" },
                  { value: "props", label: "Props" },
                ]}
              />
              <UI.Button
                testId="handbook-copy"
                disabled={!clipboard.capabilities.writeClipboardText}
                onPress={async () => {
                  const result = await clipboard.writeClipboardText(entry.code);
                  setCopied(result.ok ? "Copied JSX" : result.message);
                }}
              >
                Copy JSX
              </UI.Button>
            </UI.Row>
            <UI.Text testId="handbook-copy-status" size={11} color={c.muted}>
              {copied ||
                "Controlled state · Application-owned callbacks · Native GPUIX"}
            </UI.Text>
            <div
              key={entry.id + tab}
              testId="handbook-content"
              style={{
                flexGrow: 1,
                minHeight: 0,
                overflow: tab === "preview" ? "hidden" : "scroll",
                backgroundColor: c.surface,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 12,
                padding: 20,
              }}
            >
              {tab === "preview" ? (
                <Example key={entry.id} />
              ) : tab === "code" ? (
                <UI.Text size={12}>{entry.code}</UI.Text>
              ) : (
                <UI.Stack gap={18}>
                  {entry.components.map((component) => (
                    <UI.Stack key={component.name} gap={8}>
                      <UI.Text size={16} weight={600}>
                        {component.name}
                      </UI.Text>
                      {component.props.map((prop) => (
                        <UI.Stack key={prop.name} gap={2}>
                          <UI.Text weight={600}>
                            {prop.name +
                              (prop.required ? " · required" : " · optional")}
                          </UI.Text>
                          <UI.Text size={12} color={c.muted}>
                            {prop.type}
                          </UI.Text>
                          {prop.description ? (
                            <UI.Text size={11}>{prop.description}</UI.Text>
                          ) : null}
                        </UI.Stack>
                      ))}
                    </UI.Stack>
                  ))}
                </UI.Stack>
              )}
            </div>
          </UI.Stack>
        </UI.NavigationSplitView>
      </UI.Stack>
    </UI.AppShell>
  );
}
