import { useRef, useState, type ReactNode } from "react";
import type { PublicInstance } from "@gpuix/react";
import {
  UIKitProvider,
  useTheme,
  AppShell,
  Sidebar,
  Toolbar,
  Row,
  Stack,
  Text,
  Separator,
  Button,
  Input,
  Textarea,
  SearchField,
  Field,
  Checkbox,
  Switch,
  RadioGroup,
  Select,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  SegmentedControl,
  Tabs,
  Accordion,
  Badge,
  Avatar,
  Progress,
  Skeleton,
  Table,
  Pagination,
  Markdown,
  Alert,
  EmptyState,
  Toast,
  Dialog,
  Tooltip,
  type ThemeMode,
  type Tone,
} from "@mirai/gpuix-kit";
const sections = [
  { id: "overview", label: "Overview", badge: "01" },
  { id: "controls", label: "Form controls", badge: "02" },
  { id: "data", label: "Data display", badge: "03" },
  { id: "layout", label: "Layout & navigation", badge: "04" },
  { id: "feedback", label: "Feedback & overlays", badge: "05" },
];
const choices = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "archived", label: "Archived", disabled: true },
];
const records = Array.from({ length: 17 }, (_, index) => ({
  id: `member-${index}`,
  name: [
    "Olivia Martin",
    "Alex Chen",
    "Sofia Anderson",
    "James Wilson",
    "Emma Brown",
  ][index % 5]!,
  role: index % 3 === 0 ? "Admin" : "Member",
  active: index % 4 !== 3,
}));
export function Gallery({ initialMode = "dark" }: { initialMode?: ThemeMode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  return (
    <UIKitProvider mode={mode}>
      <GalleryContent mode={mode} onModeChange={setMode} />
    </UIKitProvider>
  );
}
function GalleryContent({
  mode,
  onModeChange,
}: {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}) {
  const { colors: c } = useTheme();
  const [section, setSection] = useState("overview");
  const [name, setName] = useState("Alex Morgan");
  const [notes, setNotes] = useState("");
  const [team, setTeam] = useState("design");
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [tab, setTab] = useState("general");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState(false);
  const [toast, setToast] = useState(false);
  const [saved, setSaved] = useState(0);
  const trigger = useRef<PublicInstance>(null);
  const action = () => {
    setSaved((n) => n + 1);
    setToast(true);
  };
  const controlCard = (
    <Card>
      <CardHeader
        title="Preferences"
        description="Small details. Consistent behavior."
      />
      <CardContent>
        <Switch
          testId="demo-switch"
          label="Enable notifications"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
        <Checkbox
          testId="demo-checkbox"
          label="Include in weekly digest"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <Separator />
        <Progress value={72} label="Workspace setup" testId="demo-progress" />
        <Row style={{ marginTop: 4 }}>
          <Avatar name={name} />
          <Stack gap={3}>
            <Text size={13} weight={500}>
              {name}
            </Text>
            <Text size={11} color={c.muted}>
              {enabled ? "Notifications on" : "Notifications paused"}
            </Text>
          </Stack>
          <div style={{ flexGrow: 1 }} />
          <Badge tone="success">Active</Badge>
        </Row>
      </CardContent>
    </Card>
  );
  const formCard = (
    <Card>
      <CardHeader
        title="Workspace profile"
        description="Native inputs, with clear labels and feedback."
      />
      <CardContent>
        <Field label="Display name" required>
          <Input
            testId="demo-name"
            value={name}
            onValueChange={setName}
            placeholder="Your name"
          />
        </Field>
        <Field label="Team">
          <Select
            testId="demo-team"
            value={team}
            onValueChange={setTeam}
            options={choices}
          />
        </Field>
      </CardContent>
      <CardFooter>
        <Text size={11} color={c.muted}>
          Changes stay in this demo.
        </Text>
        <div style={{ flexGrow: 1 }} />
        <Button testId="demo-save" variant="primary" size="sm" onPress={action}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
  const table = (
    <>
      <Table
        testId="demo-table"
        rows={records
          .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
          .slice((page - 1) * 5, page * 5)}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "name",
            header: "NAME",
            render: (row) => (
              <Row>
                <Avatar size={28} name={row.name} />
                <Text size={13}>{row.name}</Text>
              </Row>
            ),
          },
          {
            key: "role",
            header: "ROLE",
            width: 130,
            render: (row) => (
              <Text size={12} color={c.muted}>
                {row.role}
              </Text>
            ),
          },
          {
            key: "status",
            header: "STATUS",
            width: 130,
            render: (row) => (
              <Badge tone={row.active ? "success" : "warning"}>
                {row.active ? "Active" : "Pending"}
              </Badge>
            ),
          },
        ]}
      />
      <Pagination
        testId="demo-pagination"
        page={page}
        pageSize={5}
        total={
          records.filter((r) =>
            r.name.toLowerCase().includes(query.toLowerCase()),
          ).length
        }
        onPageChange={setPage}
      />
    </>
  );
  const panels: Record<string, ReactNode> = {
    overview: (
      <>
        <Row>
          <Badge tone="accent">Native GPUIX</Badge>
          <Text size={12} color={c.muted}>
            Darwin-inspired · v0.2.0
          </Text>
        </Row>
        <Stack gap={10}>
          <Text size={36} weight={600}>
            One kit. Every workspace.
          </Text>
          <Text color={c.muted} size={14}>
            A shared foundation for thoughtful desktop interfaces.
          </Text>
        </Stack>
        <Row gap={10}>
          <Button testId="demo-primary" variant="primary" onPress={action}>
            Create workspace
          </Button>
          <Button
            testId="demo-dialog-trigger"
            ref={trigger}
            onPress={() => setDialog(true)}
          >
            Open dialog
          </Button>
          <Button testId="demo-disabled" disabled onPress={action}>
            Unavailable
          </Button>
        </Row>
        <Row gap={18} style={{ alignItems: "stretch" }}>
          <Stack style={{ flexGrow: 1, flexBasis: 0 }}>{formCard}</Stack>
          <Stack style={{ flexGrow: 1, flexBasis: 0 }}>{controlCard}</Stack>
        </Row>
        <Card>
          <CardHeader
            title="Semantic colors"
            description="The same components, in two carefully balanced themes."
          />
          <CardContent>
            <Row gap={10}>
              {(
                [
                  "canvas",
                  "surface",
                  "elevated",
                  "border",
                  "primary",
                  "success",
                  "warning",
                  "danger",
                ] as const
              ).map((key) => (
                <Stack key={key} gap={7} style={{ flexGrow: 1, flexBasis: 0 }}>
                  <div
                    style={{
                      backgroundColor: c[key],
                      height: 34,
                      borderRadius: 7,
                      borderWidth: 1,
                      borderColor: c.border,
                    }}
                  />
                  <Text size={10} color={c.muted}>
                    {key}
                  </Text>
                </Stack>
              ))}
            </Row>
          </CardContent>
        </Card>
        <Alert
          title="Built for native applications"
          description="Reusable components. Controlled state. No browser runtime."
        />
      </>
    ),
    controls: (
      <>
        <Card>
          <CardHeader
            title="Buttons"
            description="Six variants · three sizes · disabled and loading states"
          />
          <CardContent>
            <Row style={{ flexWrap: "wrap" }}>
              {(
                [
                  "default",
                  "primary",
                  "secondary",
                  "outline",
                  "ghost",
                  "destructive",
                ] as const
              ).map((variant) => (
                <Button
                  key={variant}
                  testId={`variant-${variant}`}
                  variant={variant}
                  onPress={action}
                >
                  {variant}
                </Button>
              ))}
            </Row>
            <Row>
              <Button size="sm" testId="size-sm" onPress={action}>
                Small
              </Button>
              <Button testId="size-md" onPress={action}>
                Medium
              </Button>
              <Button size="lg" testId="size-lg" onPress={action}>
                Large
              </Button>
              <Button
                loading
                loadingText="Saving…"
                testId="demo-loading"
                onPress={action}
              >
                Save
              </Button>
            </Row>
          </CardContent>
        </Card>
        <Row gap={18} style={{ alignItems: "flex-start" }}>
          <Stack style={{ flexGrow: 1, flexBasis: 0 }}>
            {formCard}
            <Card>
              <CardContent>
                <Field
                  label="Description"
                  hint="Enter submits; Shift+Enter adds a line."
                >
                  <Textarea
                    value={notes}
                    onValueChange={setNotes}
                    testId="demo-notes"
                    placeholder="Describe your workspace…"
                  />
                </Field>
                <Field
                  label="Email address"
                  error="Enter a valid email address."
                >
                  <Input
                    value="alex@"
                    onValueChange={() => {}}
                    testId="demo-invalid"
                    invalid
                  />
                </Field>
              </CardContent>
            </Card>
          </Stack>
          <Stack style={{ flexGrow: 1, flexBasis: 0 }}>
            {controlCard}
            <Card>
              <CardHeader title="Choose a team" />
              <CardContent>
                <RadioGroup
                  testId="demo-radio"
                  value={team}
                  onValueChange={setTeam}
                  options={choices}
                />
              </CardContent>
            </Card>
          </Stack>
        </Row>
      </>
    ),
    data: (
      <>
        <Card>
          <CardHeader
            title="Team members"
            description="Page data before rendering. Search is managed by the application."
            trailing={<Badge>{records.length} members</Badge>}
          />
          <CardContent>
            <SearchField
              testId="demo-search"
              value={query}
              onValueChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
            />
            {table}
          </CardContent>
        </Card>
        <Row gap={18} style={{ alignItems: "stretch" }}>
          <Card style={{ flexGrow: 1, flexBasis: 0 }}>
            <CardHeader title="Status & identity" />
            <CardContent>
              <Row style={{ flexWrap: "wrap" }}>
                {(
                  [
                    "neutral",
                    "accent",
                    "success",
                    "warning",
                    "danger",
                  ] as Tone[]
                ).map((tone) => (
                  <Badge key={tone} tone={tone}>
                    {tone}
                  </Badge>
                ))}
              </Row>
              <Row>
                <Avatar name="Alex Chen" size={24} />
                <Avatar name="Sofia Anderson" size={36} />
                <Avatar name="Olivia Martin" size={48} />
              </Row>
              <Progress value={46} label="Import progress" />
              <Skeleton />
              <Skeleton style={{ width: "65%" }} />
            </CardContent>
          </Card>
          <Card style={{ flexGrow: 1, flexBasis: 0 }}>
            <EmptyState
              title="Nothing here yet"
              description="Your next idea starts with a clean workspace."
              action={
                <Button testId="demo-empty-action" onPress={action}>
                  Add an item
                </Button>
              }
            />
          </Card>
        </Row>
      </>
    ),
    layout: (
      <>
        <Card>
          <CardHeader
            title="Tabs"
            description="Selection is owned by your ViewModel."
          />
          <CardContent>
            <Tabs
              testId="demo-tabs"
              value={tab}
              onValueChange={setTab}
              options={[
                { value: "general", label: "General" },
                { value: "members", label: "Members" },
                { value: "billing", label: "Billing", disabled: true },
              ]}
              panels={{
                general: <Text>General preferences panel</Text>,
                members: <Text>Team members panel</Text>,
              }}
            />
          </CardContent>
        </Card>
        <Accordion
          title="How are components organized?"
          testId="demo-accordion"
        >
          <Text size={13}>
            Tokens → primitives → components → application layouts.
          </Text>
        </Accordion>
        <Accordion
          title="Who owns the data?"
          testId="demo-accordion-data"
          defaultOpen
        >
          <Text size={13}>
            The application owns persistence and business logic. UIKit only
            renders state and emits user intent.
          </Text>
        </Accordion>
        <Card>
          <CardHeader title="Native rich content" />
          <CardContent>
            <Markdown
              source={
                "## A common language\n\nUse **semantic tokens**, controlled inputs and public package exports.\n\n- Consistent colors\n- Predictable spacing\n- Native text and selection\n\n`UIKitProvider` supplies light and dark themes."
              }
            />
          </CardContent>
        </Card>
      </>
    ),
    feedback: (
      <>
        {(["accent", "success", "warning", "danger"] as Tone[]).map((tone) => (
          <Alert
            key={tone}
            tone={tone}
            title={`${tone[0]!.toUpperCase()}${tone.slice(1)} message`}
            description="A concise message that explains what happened and what comes next."
          />
        ))}
        <Card>
          <CardHeader
            title="Overlays"
            description="Native positioning, keyboard navigation and controlled open state."
          />
          <CardContent>
            <Row>
              <Button
                ref={trigger}
                testId="demo-dialog-trigger"
                onPress={() => setDialog(true)}
              >
                Open dialog
              </Button>
              <Tooltip content="A little extra context" testId="demo-tooltip">
                <Text size={13} color={c.accent}>
                  Hover or press Enter for a tooltip
                </Text>
              </Tooltip>
              <Button testId="demo-notify" onPress={action}>
                Show notification
              </Button>
            </Row>
          </CardContent>
        </Card>
      </>
    ),
  };
  return (
    <AppShell
      sidebar={
        <Sidebar
          title="◈  Mirai UIKit"
          items={sections}
          value={section}
          onValueChange={setSection}
          testId="gallery-nav"
          footer={
            <Stack gap={6}>
              <Separator />
              <Text size={11} color={c.muted}>
                GPUIX 0.7.0 · React 19
              </Text>
              <Text size={11} color={c.faint}>
                A foundation for what comes next.
              </Text>
            </Stack>
          }
        />
      }
      overlay={
        <Dialog
          open={dialog}
          onOpenChange={setDialog}
          title="Create a workspace"
          description="A focused space for your next project."
          testId="demo-dialog"
          restoreFocusRef={trigger}
          footer={
            <>
              <Button testId="dialog-cancel" onPress={() => setDialog(false)}>
                Cancel
              </Button>
              <Button
                testId="dialog-create"
                variant="primary"
                onPress={() => {
                  setDialog(false);
                  action();
                }}
              >
                Create workspace
              </Button>
            </>
          }
        >
          <Field label="Workspace name">
            <Input testId="dialog-name" value={name} onValueChange={setName} />
          </Field>
          <Field label="Description">
            <Textarea
              testId="dialog-notes"
              value={notes}
              onValueChange={setNotes}
            />
          </Field>
          <Alert
            title="Demo workspace"
            description="This preview keeps all changes in memory."
          />
        </Dialog>
      }
    >
      <Toolbar
        style={{
          justifyContent: "space-between",
          paddingLeft: 28,
          paddingRight: 28,
          height: 68,
        }}
      >
        <Row>
          <Text size={13} color={c.muted}>
            Components
          </Text>
          <Text size={13} color={c.faint}>
            /
          </Text>
          <Text size={13}>{sections.find((s) => s.id === section)?.label}</Text>
        </Row>
        <SegmentedControl
          testId="theme"
          value={mode}
          onValueChange={(value) => onModeChange(value as ThemeMode)}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Toolbar>
      <Stack
        testId="gallery-scroll"
        gap={22}
        style={{
          padding: 28,
          overflowY: "scroll",
          flexShrink: 1,
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        {panels[section]}
        <Text testId="demo-saved" size={11} color={c.faint}>
          Demo actions: {saved}
        </Text>
      </Stack>
      {toast ? (
        <div style={{ padding: 12, paddingLeft: 28, paddingRight: 28 }}>
          <Toast
            testId="demo-toast"
            title="Changes saved"
            description="Your demo state is up to date."
            onDismiss={() => setToast(false)}
          />
        </div>
      ) : null}
    </AppShell>
  );
}
