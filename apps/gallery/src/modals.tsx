import { useRef, useState } from "react";
import { type PublicInstance } from "@gpuix/react";
import {
  UIKitProvider,
  AppShell,
  Toolbar,
  Input,
  SegmentedControl,
  Row,
  Stack,
  Text,
  Button,
  Card,
  CardHeader,
  CardContent,
  AlertDialog,
  ConfirmDialog,
  PromptDialog,
  Sheet,
  Drawer,
  ProgressDialog,
  ColorPicker,
  type ProgressTask,
  type ThemeMode,
} from "@mirai/gpuix-kit";
export function ModalsGallery() {
  const [mode, setMode] = useState<ThemeMode>("dark"),
    [name, setName] = useState("Panel studio"),
    [event, setEvent] = useState("Ready");
  const [alert, setAlert] = useState(false),
    [confirm, setConfirm] = useState(false),
    [prompt, setPrompt] = useState(false),
    [sheet, setSheet] = useState(false),
    [drawer, setDrawer] = useState(false),
    [progress, setProgress] = useState(false),
    [nested, setNested] = useState(false);
  const [color, setColor] = useState<string | null>("#8B5CF6"),
    [colorOpen, setColorOpen] = useState(false),
    [draft, setDraft] = useState("Workspace settings");
  const [task, setTask] = useState<ProgressTask>({
    id: "export",
    title: "Export documents",
    status: "running",
    completed: 42,
    total: 100,
    cancellable: true,
    pausable: true,
  });
  const alertRef = useRef<PublicInstance>(null),
    confirmRef = useRef<PublicInstance>(null),
    promptRef = useRef<PublicInstance>(null),
    sheetRef = useRef<PublicInstance>(null),
    drawerRef = useRef<PublicInstance>(null),
    progressRef = useRef<PublicInstance>(null),
    nestedRef = useRef<PublicInstance>(null);
  return (
    <UIKitProvider mode={mode}>
      <AppShell
        overlay={
          <>
            <AlertDialog
              testId="alert"
              title="Ready to continue"
              description="This message stays inside your application."
              open={alert}
              onOpenChange={setAlert}
              restoreFocusRef={alertRef}
            >
              <Text size={13}>
                An acknowledgement with an explicit keyboard target.
              </Text>
            </AlertDialog>
            <ConfirmDialog
              testId="confirm"
              title="Remove the local draft?"
              description="The example records an action without deleting any file."
              open={confirm}
              onOpenChange={setConfirm}
              restoreFocusRef={confirmRef}
              destructive
              confirmLabel="Remove draft"
              onConfirm={async () => {
                setEvent("confirmed");
              }}
            />
            <PromptDialog
              testId="prompt"
              title="Rename workspace"
              description="Cancel keeps the current application value."
              open={prompt}
              onOpenChange={setPrompt}
              restoreFocusRef={promptRef}
              value={name}
              label="Workspace name"
              validate={(v) => (v.trim() ? "" : "Enter a workspace name.")}
              onSubmit={async (value) => {
                setName(value);
                setEvent("renamed");
              }}
            />
            <Sheet
              testId="sheet"
              title="Workspace preferences"
              description="A window-contained sheet with a scrolling body."
              open={sheet}
              onOpenChange={setSheet}
              restoreFocusRef={sheetRef}
              height={440}
              footer={
                <Button
                  testId="sheet-save"
                  variant="primary"
                  onPress={() => {
                    setSheet(false);
                    setEvent("sheet:saved");
                  }}
                >
                  Done
                </Button>
              }
            >
              <Input
                testId="sheet-input"
                value={draft}
                onValueChange={setDraft}
              />
              <ColorPicker
                testId="sheet-color"
                value={color}
                onValueChange={setColor}
                open={colorOpen}
                onOpenChange={setColorOpen}
              />
              <Button
                ref={nestedRef}
                testId="sheet-nested"
                onPress={() => setNested(true)}
              >
                Open a nested drawer
              </Button>
              {Array.from({ length: 12 }, (_, i) => (
                <Text key={i} size={12}>
                  Preference section {i + 1} · Sample content
                </Text>
              ))}
              <Drawer
                testId="nested"
                title="Selection details"
                description="Escape returns to the parent sheet."
                open={nested}
                onOpenChange={setNested}
                restoreFocusRef={nestedRef}
                width={360}
              >
                <Text size={13}>
                  A nested modal owns its own focus and backdrop.
                </Text>
                <Button testId="nested-done" onPress={() => setNested(false)}>
                  Done
                </Button>
              </Drawer>
            </Sheet>
            <Drawer
              testId="drawer"
              title="Document inspector"
              description="Modal drawer aligned to the right window edge."
              open={drawer}
              onOpenChange={setDrawer}
              restoreFocusRef={drawerRef}
              width={380}
              footer={
                <Button testId="drawer-done" onPress={() => setDrawer(false)}>
                  Done
                </Button>
              }
            >
              <Text size={13}>
                Drawer content is provided by the application.
              </Text>
              {Array.from({ length: 30 }, (_, i) => (
                <Text key={i} size={12}>
                  Document property {i + 1}
                </Text>
              ))}
            </Drawer>
            <ProgressDialog
              testId="progress"
              title="Export status"
              description="The UIKit displays state; the application owns the task."
              open={progress}
              onOpenChange={setProgress}
              restoreFocusRef={progressRef}
              task={task}
              onTaskAction={async (_, action) => {
                setTask((t) => ({
                  ...t,
                  status:
                    action === "cancel"
                      ? "cancelled"
                      : action === "pause"
                        ? "paused"
                        : "running",
                }));
                setEvent("task:" + action);
              }}
            />
          </>
        }
      >
        <Toolbar>
          <Input
            testId="modals-name"
            value={name}
            onValueChange={setName}
            style={{ width: 300 }}
          />
          <Row style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <SegmentedControl
              testId="modals-theme"
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
          testId="modals-scroll"
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
            Give each action its space.
          </Text>
          <Text size={12}>
            Acknowledgements, confirmation, input and window-contained panels.
          </Text>
          <Row gap={16} style={{ flexWrap: "wrap", alignItems: "stretch" }}>
            <Card style={{ width: 370 }}>
              <CardHeader
                title="Decisions"
                description="Confirm explicitly, keep drafts on cancellation."
              />
              <CardContent>
                <Button
                  ref={alertRef}
                  testId="open-alert"
                  onPress={() => setAlert(true)}
                >
                  Show acknowledgement
                </Button>
                <Button
                  ref={confirmRef}
                  testId="open-confirm"
                  onPress={() => setConfirm(true)}
                >
                  Confirm an action
                </Button>
                <Button
                  ref={promptRef}
                  testId="open-prompt"
                  onPress={() => setPrompt(true)}
                >
                  Rename workspace
                </Button>
              </CardContent>
            </Card>
            <Card style={{ width: 370 }}>
              <CardHeader
                title="Panels"
                description="Nested focus and independently scrolling content."
              />
              <CardContent>
                <Button
                  ref={sheetRef}
                  testId="open-sheet"
                  onPress={() => setSheet(true)}
                >
                  Open sheet
                </Button>
                <Button
                  ref={drawerRef}
                  testId="open-drawer"
                  onPress={() => setDrawer(true)}
                >
                  Open drawer
                </Button>
                <Button
                  ref={progressRef}
                  testId="open-progress"
                  onPress={() => {
                    setTask({
                      id: "export",
                      title: "Export documents",
                      status: "running",
                      completed: 42,
                      total: 100,
                      cancellable: true,
                      pausable: true,
                    });
                    setProgress(true);
                  }}
                >
                  Show task progress
                </Button>
              </CardContent>
            </Card>
            <Card style={{ width: 370 }}>
              <CardHeader
                title="Apple-style sidebars"
                description="Planned next: v0.15.0"
              />
              <CardContent>
                <Text size={13}>
                  Grouped source lists, fixed search and footer, resize and
                  visibility controls.
                </Text>
                <Text size={12}>
                  Two- and three-column app layouts with an optional inspector.
                </Text>
                <Text size={11}>
                  Layout and interaction first. System materials require a
                  separate host capability check.
                </Text>
              </CardContent>
            </Card>
          </Row>
          <Text testId="modals-event" size={12}>
            {event}
          </Text>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
