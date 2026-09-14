import { useState } from "react";
import { useWindowSize } from "@gpuix/react";
import {
  UIKitProvider,
  AppShell,
  Toolbar,
  NavigationSplitView,
  NavigationPane,
  SourceListSidebar,
  SidebarToggle,
  Stack,
  Row,
  Text,
  Input,
  Button,
  SegmentedControl,
  Switch,
  type ThemeMode,
} from "@mirai/gpuix-kit";
// 导航、表单和主题受控；应用可在这些回调后接入自己的 ViewModel。
export function App() {
  const [mode, setMode] = useState<ThemeMode>("light");
  return (
    <UIKitProvider mode={mode}>
      <Workspace mode={mode} setMode={setMode} />
    </UIKitProvider>
  );
}
function Workspace({
  mode,
  setMode,
}: {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}) {
  const { width, height } = useWindowSize();
  const [page, setPage] = useState("inbox"),
    [sidebar, setSidebar] = useState(true),
    [sidebarWidth, setSidebarWidth] = useState(224),
    [collapsed, setCollapsed] = useState<string[]>([]);
  const [name, setName] = useState("My workspace"),
    [enabled, setEnabled] = useState(true),
    [count, setCount] = useState(0);
  return (
    <AppShell>
      <Toolbar>
        <SidebarToggle
          testId="starter-sidebar-toggle"
          visible={sidebar}
          onVisibleChange={setSidebar}
        />
        <Text weight={700}>My desktop app</Text>
        <Row style={{ flexGrow: 1, justifyContent: "flex-end" }}>
          <SegmentedControl
            testId="starter-theme"
            value={mode}
            onValueChange={(v) => setMode(v as ThemeMode)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </Row>
      </Toolbar>
      <NavigationSplitView
        testId="starter-layout"
        width={width}
        height={height - 62}
        sidebarVisible={sidebar}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={setSidebarWidth}
        sidebar={
          <SourceListSidebar
            testId="starter-nav"
            height={height - 62}
            groups={[
              {
                id: "workspace",
                label: "Workspace",
                items: [
                  { id: "inbox", label: "Inbox", badge: "3" },
                  { id: "favorites", label: "Favorites" },
                  { id: "settings", label: "Settings" },
                ],
              },
            ]}
            value={page}
            onValueChange={setPage}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
          />
        }
      >
        <NavigationPane
          testId="starter-detail"
          title={
            page === "settings"
              ? "Settings"
              : page === "favorites"
                ? "Favorites"
                : "Inbox"
          }
          subtitle="A native app built with GPUIX Kit"
        >
          <Stack gap={18} style={{ padding: 24 }}>
            <Input
              testId="starter-name"
              value={name}
              onValueChange={setName}
              placeholder="Workspace name"
            />
            <Text testId="starter-greeting">{name}</Text>
            {page === "settings" ? (
              <Switch
                testId="starter-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
                label="Enable local previews"
              />
            ) : (
              <>
                <Text>Replace this content with your own application.</Text>
                <Button
                  testId="starter-action"
                  variant="primary"
                  onPress={() => setCount((c) => c + 1)}
                >
                  Clicked {count} times
                </Button>
              </>
            )}
          </Stack>
        </NavigationPane>
      </NavigationSplitView>
    </AppShell>
  );
}
