import { useState } from "react";
import {
  UIKitProvider,
  AppShell,
  Toolbar,
  Input,
  SegmentedControl,
  Row,
  Stack,
  Text,
  Card,
  CardHeader,
  CardContent,
  ButtonGroup,
  SplitButton,
  ToolbarActions,
  PathControl,
  WorkspaceSwitcher,
  AccountMenu,
  type UIKitAction,
  type ThemeMode,
} from "@mirai/gpuix-kit";

/** 示例只记录操作意图，切换工作区或退出账户不会连接真实服务。 */
export function ActionsGallery() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [name, setName] = useState("Desktop actions");
  const [event, setEvent] = useState("Ready");
  const [split, setSplit] = useState(false),
    [overflow, setOverflow] = useState(false);
  const [pathOpen, setPathOpen] = useState(false),
    [workspaceOpen, setWorkspaceOpen] = useState(false),
    [accountOpen, setAccountOpen] = useState(false);
  const [workspace, setWorkspace] = useState<string | null>("design");
  const action = (
    id: string,
    label: string,
    extra: Partial<UIKitAction> = {},
  ): UIKitAction => ({ id, label, run: () => setEvent(id), ...extra });
  const actions = [
    action("new", "New document"),
    action("save", "Save", { shortcut: "⌘S" }),
    action("rename", "Rename"),
    action("move", "Move"),
    action("copy", "Duplicate"),
    action("archive", "Archive", { disabled: true }),
    action("export", "Export PDF"),
    action("print", "Print"),
    action("share", "Share link"),
    action("history", "History"),
    action("delete", "Delete", { destructive: true }),
    action("hidden", "Hidden", { hidden: true }),
  ];
  return (
    <UIKitProvider mode={mode}>
      <AppShell>
        <Toolbar>
          <Input
            testId="actions-name"
            value={name}
            onValueChange={setName}
            style={{ width: 300 }}
          />
          <Row style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <SegmentedControl
              testId="actions-theme"
              value={mode}
              onValueChange={(v) => setMode(v as ThemeMode)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </Row>
        </Toolbar>
        <Stack
          testId="actions-scroll"
          gap={16}
          style={{
            padding: 24,
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            overflowY: "scroll",
          }}
        >
          <Text size={26} weight={600}>
            A place for every action.
          </Text>
          <Text size={12}>
            Native controls · shared menus · explicit application callbacks
          </Text>
          <Row gap={18} style={{ flexWrap: "wrap", alignItems: "stretch" }}>
            <Card style={{ width: 440 }}>
              <CardHeader
                title="Grouped & primary actions"
                description="Arrow keys move within a group. Split actions share a pending lock."
              />
              <CardContent>
                <ButtonGroup
                  testId="editing"
                  items={[
                    action("cut", "Cut"),
                    action("locked", "Locked", { disabled: true }),
                    action("paste", "Paste"),
                  ]}
                />
                <SplitButton
                  testId="publish"
                  primary={action("publish", "Publish draft")}
                  items={[
                    action("preview", "Preview"),
                    action("schedule", "Schedule"),
                    action("template", "Save template"),
                  ]}
                  open={split}
                  onOpenChange={setSplit}
                />
              </CardContent>
            </Card>
            <Card style={{ width: 440 }}>
              <CardHeader
                title="Toolbar overflow"
                description="Two visible actions. Remaining commands are paged in one shared menu."
              />
              <CardContent>
                <ToolbarActions
                  testId="tools"
                  items={actions}
                  visibleCount={2}
                  itemWidth={120}
                  open={overflow}
                  onOpenChange={setOverflow}
                />
                <Text size={12}>
                  Home / End reaches the first or last available action.
                </Text>
                <Text size={12}>
                  Disabled actions stay visible. Hidden actions do not mount.
                </Text>
              </CardContent>
            </Card>
            <Card style={{ width: 440 }}>
              <CardHeader
                title="Path control"
                description="The root and current location remain visible; intermediate segments move into a menu."
              />
              <CardContent>
                <PathControl
                  testId="path"
                  maxVisible={2}
                  segmentWidth={128}
                  items={[
                    "Library",
                    "Projects",
                    "Mirai",
                    "Design",
                    "Components",
                  ].map((label, index) => ({ id: String(index), label }))}
                  onNavigate={(id) => setEvent("path:" + id)}
                  open={pathOpen}
                  onOpenChange={setPathOpen}
                />
                <Text size={12}>
                  Path navigation emits an id. Routing and filesystem access
                  belong to the application.
                </Text>
              </CardContent>
            </Card>
            <Card style={{ width: 440 }}>
              <CardHeader
                title="Workspace & account"
                description="Controlled selection and application-owned account actions."
              />
              <CardContent>
                <WorkspaceSwitcher
                  testId="workspace"
                  value={workspace}
                  items={[
                    {
                      id: "design",
                      label: "Mirai Design",
                      description: "Design systems and shared components",
                    },
                    { id: "engineering", label: "Engineering" },
                    {
                      id: "private",
                      label: "Private workspace",
                      disabled: true,
                    },
                  ]}
                  onValueChange={(value) => {
                    setWorkspace(value);
                    setEvent("workspace:" + value);
                  }}
                  open={workspaceOpen}
                  onOpenChange={setWorkspaceOpen}
                />
                <AccountMenu
                  testId="account"
                  account={{ name: "Alex Morgan", detail: "alex@example.test" }}
                  items={[
                    action("profile", "Profile"),
                    action("settings", "Account settings"),
                    action("signout", "Sign out", { destructive: true }),
                  ]}
                  open={accountOpen}
                  onOpenChange={setAccountOpen}
                />
              </CardContent>
            </Card>
          </Row>
          <Row>
            <Text size={12}>Latest intent</Text>
            <Text size={12} testId="actions-event">
              {event}
            </Text>
          </Row>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
