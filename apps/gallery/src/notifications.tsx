import { useEffect, useRef, useState } from "react";
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
  ToastViewport,
  UndoToast,
  useNotificationQueue,
  TaskList,
  TaskSummary,
  ProgressRing,
  type ProgressTask,
  type TaskAction,
  type ThemeMode,
} from "@mirai/gpuix-kit";
const initialTasks: ProgressTask[] = [
  {
    id: "download",
    title: "Download design assets",
    description: "Sample task · no network connection",
    status: "running",
    completed: 35,
    total: 100,
    pausable: true,
    cancellable: true,
  },
  {
    id: "index",
    title: "Build search index",
    status: "failed",
    completed: 42,
    total: 100,
    retryable: true,
    error: "A sample failure. Retry to update the local task state.",
  },
  {
    id: "backup",
    title: "Prepare backup",
    status: "queued",
    cancellable: true,
  },
  {
    id: "sync",
    title: "Sync workspace",
    status: "paused",
    completed: 60,
    total: 100,
    pausable: true,
    cancellable: true,
  },
  {
    id: "done",
    title: "Export report",
    status: "succeeded",
    completed: 1,
    total: 1,
  },
  {
    id: "cancelled",
    title: "Generate preview",
    status: "cancelled",
    retryable: true,
  },
  {
    id: "archive",
    title: "Scan archive",
    status: "running",
    cancellable: true,
  },
  { id: "verify", title: "Verify files", status: "queued" },
];
export function NotificationsGallery() {
  const [mode, setMode] = useState<ThemeMode>("dark"),
    [name, setName] = useState("Feedback studio");
  const [event, setEvent] = useState("Ready"),
    [tasks, setTasks] = useState(initialTasks),
    [page, setPage] = useState(0);
  const [undoState, setUndoState] = useState<
      "available" | "undone" | "expired"
    >("available"),
    [paused, setPaused] = useState(false);
  const queue = useNotificationQueue({ visibleLimit: 2, capacity: 12 });
  const trigger = useRef<PublicInstance>(null),
    sequence = useRef(0);
  useEffect(() => {
    queue.enqueue({
      id: "welcome",
      title: "Workspace is ready",
      description: "Reusable notifications stay inside this application.",
      tone: "success",
      durationMs: null,
    });
    queue.enqueue({
      id: "removed",
      title: "Item moved to archive",
      description:
        "Undo is an application callback; this example only changes local state.",
      kind: "undo",
      durationMs: null,
    });
  }, [queue]);
  const handleTask = async (id: string, action: TaskAction) => {
    setEvent(id + ":" + action);
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status:
                action === "pause"
                  ? "paused"
                  : action === "resume"
                    ? "running"
                    : action === "cancel"
                      ? "cancelled"
                      : "queued",
              error: undefined,
              ...(action === "retry" ? { completed: 0 } : {}),
            }
          : task,
      ),
    );
  };
  return (
    <UIKitProvider mode={mode}>
      <AppShell>
        <Toolbar>
          <Input
            testId="notifications-name"
            value={name}
            onValueChange={setName}
            style={{ width: 300 }}
          />
          <Row style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <SegmentedControl
              testId="notifications-theme"
              value={mode}
              onValueChange={(value) => setMode(value as ThemeMode)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </Row>
        </Toolbar>
        <Stack
          testId="notifications-scroll"
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
            Keep work visible.
          </Text>
          <Text size={12}>
            Notifications, reversible actions and application-owned task
            progress.
          </Text>
          <Row gap={18} style={{ alignItems: "stretch", flexWrap: "wrap" }}>
            <Card style={{ width: 440 }}>
              <CardHeader
                title="Notification queue"
                description="Two visible notices. Waiting notices start their timer when shown."
              />
              <CardContent>
                <Row gap={6} style={{ flexWrap: "wrap" }}>
                  <Button
                    ref={trigger}
                    testId="notice-add"
                    size="sm"
                    onPress={() =>
                      queue.enqueue({
                        id: "new-" + ++sequence.current,
                        title: "A new notification",
                        description: "This example stays until dismissed.",
                        durationMs: null,
                      })
                    }
                  >
                    Add notice
                  </Button>
                  <Button
                    testId="notice-timed"
                    size="sm"
                    onPress={() =>
                      queue.enqueue({
                        id: "timed",
                        title: "Saved locally",
                        tone: "success",
                        durationMs: 5000,
                      })
                    }
                  >
                    Timed notice
                  </Button>
                  <Button
                    testId="notice-pause-all"
                    size="sm"
                    onPress={() => {
                      queue.setPausedAll(!paused);
                      setPaused(!paused);
                    }}
                  >
                    {paused ? "Resume all" : "Pause all"}
                  </Button>
                  <Button
                    testId="notice-clear"
                    size="sm"
                    variant="ghost"
                    onPress={() => queue.clear()}
                  >
                    Clear
                  </Button>
                </Row>
                <ToastViewport
                  queue={queue}
                  testId="notices"
                  width={400}
                  restoreFocusRef={trigger}
                  onAction={async (notice) => {
                    setEvent("undo:" + notice.id);
                  }}
                />
                <UndoToast
                  testId="undo-example"
                  title="An explicit undo window"
                  description="Applications decide when the action expires."
                  state={undoState}
                  onUndo={async () => {
                    setEvent("restored");
                  }}
                  onStateChange={setUndoState}
                  onDismiss={() => setUndoState("expired")}
                />
                <Button
                  testId="undo-reset"
                  size="sm"
                  variant="ghost"
                  onPress={() => setUndoState("available")}
                >
                  Reset example
                </Button>
              </CardContent>
            </Card>
            <Card style={{ width: 440 }}>
              <CardHeader
                title="Task progress"
                description="Actions request a state change. No job runs inside the UIKit."
              />
              <CardContent>
                <TaskSummary testId="task-summary" tasks={tasks} />
                <TaskList
                  testId="tasks"
                  tasks={tasks}
                  page={page}
                  onPageChange={setPage}
                  pageSize={2}
                  onAction={handleTask}
                />
              </CardContent>
            </Card>
          </Row>
          <Row gap={20}>
            <ProgressRing testId="ring-zero" value={0} />
            <ProgressRing testId="ring-half" value={50} />
            <ProgressRing testId="ring-full" value={100} tone="success" />
            <ProgressRing testId="ring-unknown" value={null} />
            <Stack gap={3}>
              <Text size={12}>Unknown work has no invented percentage.</Text>
              <Text testId="notifications-event" size={11}>
                {event}
              </Text>
            </Stack>
          </Row>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
