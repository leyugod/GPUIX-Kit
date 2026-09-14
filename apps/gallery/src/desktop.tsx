import { useRef, useState } from "react";
import type { PublicInstance } from "@gpuix/react";
import {
  AppShell,
  UIKitProvider,
  useTheme,
  SidebarNavigation,
  SplitView,
  Inspector,
  InspectorSection,
  Button,
  Breadcrumb,
  Row,
  Stack,
  Text,
  Toolbar,
  SegmentedControl,
  Card,
  CardContent,
  CardHeader,
  Field,
  Input,
  ComboBox,
  MultiSelect,
  NumberField,
  DateField,
  DropdownMenu,
  ContextMenu,
  CommandPalette,
  Popover,
  Badge,
  Progress,
  type ThemeMode,
  type SidebarNavigationProps,
  type Command,
} from "@mirai/gpuix-kit";
const options = [
  { value: "design", label: "Design" },
  { value: "locked", label: "Archived", disabled: true },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
];
export function DesktopGallery({
  initialMode = "dark",
}: {
  initialMode?: ThemeMode;
}) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  return (
    <UIKitProvider mode={mode}>
      <DesktopContent mode={mode} setMode={setMode} />
    </UIKitProvider>
  );
}
function DesktopContent({
  mode,
  setMode,
}: {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}) {
  const { colors: c } = useTheme();
  const [variant, setVariant] =
    useState<SidebarNavigationProps["variant"]>("simple");
  const [selected, setSelected] = useState("projects");
  const [rail, setRail] = useState("workspace");
  const [expanded, setExpanded] = useState<string[]>(["workspace"]);
  const [size, setSize] = useState(370);
  const [inspector, setInspector] = useState(true);
  const [team, setTeam] = useState<string | null>("design");
  const [members, setMembers] = useState<string[]>(["design"]);
  const [number, setNumber] = useState(2);
  const [date, setDate] = useState("2026-09-13");
  const [name, setName] = useState("Desktop foundation");
  const [menu, setMenu] = useState(false);
  const [context, setContext] = useState(false);
  const [palette, setPalette] = useState(false);
  const [popover, setPopover] = useState(false);
  const [actions, setActions] = useState(0);
  const trigger = useRef<PublicInstance>(null),
    details = useRef<PublicInstance>(null);
  const commands: Command[] = [
    {
      id: "new",
      label: "New project",
      group: "Workspace",
      shortcut: "⌘N",
      keywords: ["create", "项目"],
      run: () => setActions((n) => n + 1),
    },
    {
      id: "locked",
      label: "Delete protected project",
      disabled: true,
      destructive: true,
      run: () => setActions((n) => n + 100),
    },
    {
      id: "inspector",
      label: "Toggle inspector",
      group: "View",
      checked: inspector,
      run: () => setInspector((v) => !v),
    },
    {
      id: "theme",
      label: "Switch appearance",
      group: "View",
      run: () => setMode(mode === "dark" ? "light" : "dark"),
    },
  ];
  return (
    <AppShell
      sidebar={
        <SidebarNavigation
          testId="desktop-nav"
          variant={variant}
          value={selected}
          onValueChange={setSelected}
          expanded={expanded}
          onExpandedChange={setExpanded}
          rail={{
            items: [
              { id: "workspace", label: "Workspace" },
              { id: "settings", label: "Settings" },
            ],
            value: rail,
            onValueChange: setRail,
          }}
          header={
            <Text weight={600} size={variant === "slim" ? 12 : 17}>
              {variant === "slim" ? "◈" : "◈  Mirai UIKit"}
            </Text>
          }
          footer={
            variant === "slim" ? (
              <Badge>02</Badge>
            ) : (
              <Stack gap={10}>
                <Progress value={42} label="Demo workspace storage" />
                <Text size={11} color={c.muted}>
                  Desktop components · Preview
                </Text>
              </Stack>
            )
          }
          sections={[
            {
              id: "main",
              label: rail === "settings" ? "SETTINGS" : "WORKSPACE",
              items: [
                { id: "home", label: "Overview" },
                {
                  id: "workspace",
                  label: "Workspace",
                  children: [
                    { id: "projects", label: "Projects", badge: "8" },
                    { id: "people", label: "People" },
                    { id: "locked", label: "Archived", disabled: true },
                  ],
                },
              ],
            },
            {
              id: "support",
              label: "RESOURCES",
              items: [
                { id: "library", label: "Component library" },
                { id: "help", label: "Help & shortcuts" },
              ],
            },
          ]}
        />
      }
      overlay={
        <CommandPalette
          open={palette}
          onOpenChange={setPalette}
          commands={commands}
          testId="desktop-command"
          restoreFocusRef={trigger}
        />
      }
    >
      <Toolbar
        style={{ height: 64, padding: 14, justifyContent: "space-between" }}
      >
        <Breadcrumb
          testId="desktop-path"
          items={[
            { id: "workspace", label: "Workspace" },
            { id: selected, label: selected },
          ]}
          onNavigate={setSelected}
        />
        <Row gap={6}>
          <Button
            testId="desktop-command-trigger"
            ref={trigger}
            onPress={() => setPalette(true)}
          >
            Commands
          </Button>
          <SegmentedControl
            testId="desktop-theme"
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
        gap={14}
        style={{ padding: 20, flexGrow: 1, flexShrink: 1, minHeight: 0 }}
      >
        <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Stack gap={5}>
            <Text size={24} weight={600}>
              Build a desktop workspace.
            </Text>
            <Text size={12} color={c.muted}>
              Navigation, resizable panes and shared commands.
            </Text>
          </Stack>
          <DropdownMenu
            testId="desktop-menu"
            label="Actions ⌄"
            open={menu}
            onOpenChange={setMenu}
            items={[
              ...commands.slice(0, 2),
              { id: "view", label: "View", children: commands.slice(2) },
            ]}
          />
        </Row>
        <SegmentedControl
          testId="desktop-variant"
          value={variant ?? "simple"}
          onValueChange={(v) =>
            setVariant(v as SidebarNavigationProps["variant"])
          }
          options={[
            { value: "simple", label: "Grouped sidebar" },
            { value: "slim", label: "Slim" },
            { value: "dual-tier", label: "Dual tier" },
          ]}
        />
        <SplitView
          testId="desktop-split"
          size={size}
          onSizeChange={setSize}
          minSize={250}
          maxSize={430}
          style={{
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 10,
          }}
          primary={
            <Stack
              gap={16}
              style={{
                padding: 16,
                height: "100%",
                minHeight: 0,
                overflowY: "scroll",
              }}
            >
              <Row>
                <Badge tone="accent">{selected}</Badge>
                <Text testId="desktop-size" size={11} color={c.muted}>
                  {size} px
                </Text>
              </Row>
              <Field label="Project name">
                <Input
                  testId="desktop-name"
                  value={name}
                  onValueChange={setName}
                />
              </Field>
              <Field label="Team · searchable single selection">
                <ComboBox
                  testId="desktop-combo"
                  value={team}
                  onValueChange={setTeam}
                  options={options}
                />
              </Field>
              <Field label="Contributors · multiple selection">
                <MultiSelect
                  testId="desktop-multi"
                  value={members}
                  onValueChange={setMembers}
                  options={options}
                />
              </Field>
              <Text
                testId="desktop-values"
                size={11}
                color={c.muted}
              >{`${team ?? "none"} / ${members.join(",")}`}</Text>
            </Stack>
          }
        >
          {inspector ? (
            <Inspector
              testId="desktop-inspector"
              onClose={() => setInspector(false)}
            >
              <InspectorSection title="PROJECT DETAILS">
                <Field label="Seats">
                  <NumberField
                    testId="desktop-number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={number}
                    onValueChange={setNumber}
                  />
                </Field>
                <Field label="Start date">
                  <DateField
                    testId="desktop-date"
                    value={date}
                    onValueChange={setDate}
                    min="2026-01-01"
                    max="2026-12-31"
                  />
                </Field>
              </InspectorSection>
              <InspectorSection title="INFORMATION">
                <Text size={12} color={c.muted}>
                  Use arrow keys on the divider to resize. Shift makes larger
                  steps.
                </Text>
                <Popover
                  testId="desktop-popover"
                  open={popover}
                  onOpenChange={setPopover}
                  restoreFocusRef={details}
                  anchor={
                    <Button
                      testId="desktop-details"
                      ref={details}
                      onPress={() => setPopover((v) => !v)}
                    >
                      Project details
                    </Button>
                  }
                >
                  <Text size={12}>{name}</Text>
                  <Button
                    testId="desktop-popover-close"
                    onPress={() => setPopover(false)}
                  >
                    Done
                  </Button>
                </Popover>
              </InspectorSection>
              <ContextMenu
                testId="desktop-context"
                open={context}
                onOpenChange={setContext}
                items={commands}
              >
                <Text testId="desktop-actions" size={12} color={c.muted}>
                  Actions: {actions}
                </Text>
                <Text size={11} color={c.faint}>
                  Right-click for project actions
                </Text>
              </ContextMenu>
            </Inspector>
          ) : (
            <Stack style={{ padding: 16 }}>
              <Text>Inspector is hidden</Text>
              <Button
                testId="desktop-inspector-show"
                onPress={() => setInspector(true)}
              >
                Show inspector
              </Button>
            </Stack>
          )}
        </SplitView>
      </Stack>
    </AppShell>
  );
}
