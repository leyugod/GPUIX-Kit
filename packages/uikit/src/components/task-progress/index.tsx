import { useRef } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { Badge, Progress } from "../../data";
import { useTheme } from "../../core/theme";
import { type Tone } from "../../core/tokens";
import { useFocusTarget, focusElement } from "../../core/focus";
import { useFeedbackAction } from "../notifications/hooks";
import {
  progressFraction,
  taskError,
  taskCollectionError,
  taskActions,
  taskFraction,
  summarizeTasks,
  type ProgressTask,
  type TaskAction,
  type TaskStatus,
} from "./model";
export {
  taskActions,
  taskFraction,
  taskError,
  taskCollectionError,
  summarizeTasks,
  type ProgressTask,
  type TaskAction,
  type TaskStatus,
} from "./model";
const tones: Record<TaskStatus, Tone> = {
  queued: "neutral",
  running: "accent",
  paused: "warning",
  succeeded: "success",
  failed: "danger",
  cancelled: "neutral",
};
export interface ProgressRingProps {
  value: number | null;
  max?: number;
  size?: number;
  testId: string;
  label?: string;
  tone?: Tone;
}
export function ProgressRing({
  value,
  max = 100,
  size = 48,
  testId,
  label,
  tone = "accent",
}: ProgressRingProps) {
  const { colors: c } = useTheme();
  const fraction = progressFraction(value, max),
    invalid = value !== null && fraction === null;
  const diameter = Number.isFinite(size)
    ? Math.max(28, Math.min(128, size))
    : 48;
  const radius = 40,
    circumference = 2 * Math.PI * radius;
  const circle = (length: number) =>
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" transform="rotate(-90 50 50)" stroke-dasharray="' +
    length +
    " " +
    circumference +
    '"/></svg>';
  return (
    <div
      testId={testId}
      style={{
        position: "relative",
        width: diameter,
        height: diameter,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        source={circle(circumference)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: diameter,
          height: diameter,
          color: c.border,
        }}
      />
      {!invalid && (fraction === null || fraction > 0) ? (
        <svg
          source={circle(circumference * (fraction ?? 0.22))}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: diameter,
            height: diameter,
            color: tone === "neutral" ? c.muted : c[tone],
          }}
        />
      ) : null}
      <Text
        testId={testId + "-label"}
        size={diameter < 40 ? 9 : 11}
        color={invalid ? c.danger : c.text}
        lines={1}
        style={{ maxWidth: diameter * 0.72 }}
      >
        {label ??
          (invalid
            ? "?"
            : fraction === null
              ? "…"
              : Math.round(fraction * 100) + "%")}
      </Text>
    </div>
  );
}
export interface TaskProgressProps {
  task: ProgressTask;
  testId: string;
  onAction?: (id: string, action: TaskAction) => void | Promise<void>;
  disabled?: boolean;
  errorLabel?: string;
}
export function TaskProgress({
  task,
  testId,
  onAction,
  disabled,
  errorLabel = "Request failed. Try again.",
}: TaskProgressProps) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix();
  const node = useRef<PublicInstance>(null),
    focus = useFocusTarget(Boolean(disabled), node);
  const operation = useFeedbackAction(
    JSON.stringify([task.id, task.revision ?? 0]),
  );
  const error = taskError(task),
    fraction = taskFraction(task),
    actions = taskActions(task);
  return (
    <div
      testId={testId}
      ref={focus.ref}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={focus.onKeyDown}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 12,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: focus.focused ? c.accent : c.border,
        backgroundColor: c.surface,
        opacity: disabled ? 0.45 : 1,
        minWidth: 0,
        flexShrink: 0,
      }}
    >
      <Row gap={10}>
        <ProgressRing
          testId={testId + "-ring"}
          value={fraction === null ? null : fraction * 100}
          size={42}
          tone={tones[task.status] ?? "neutral"}
        />
        <Stack gap={4} style={{ flexGrow: 1, flexShrink: 1 }}>
          <Text size={13} weight={600} lines={2}>
            {task.title}
          </Text>
          {task.description ? (
            <Text size={11} color={c.muted} lines={2}>
              {task.description}
            </Text>
          ) : null}
        </Stack>
        <Badge
          testId={testId + "-status"}
          tone={tones[task.status] ?? "neutral"}
        >
          {task.status}
        </Badge>
      </Row>
      {error ? (
        <Text testId={testId + "-error"} color={c.danger} size={11}>
          {error}
        </Text>
      ) : (
        <>
          {fraction !== null ? (
            <Progress testId={testId + "-progress"} value={fraction * 100} />
          ) : (
            <Text testId={testId + "-unknown"} size={11} color={c.muted}>
              Progress not reported
            </Text>
          )}
          {task.error || operation.failed ? (
            <Text
              testId={testId + "-error"}
              size={11}
              color={c.danger}
              lines={3}
            >
              {operation.failed ? errorLabel : task.error}
            </Text>
          ) : null}
          {onAction && actions.length ? (
            <Row
              gap={6}
              style={{ justifyContent: "flex-end", flexWrap: "wrap" }}
            >
              {actions.map((action) => (
                <Button
                  key={action}
                  testId={testId + "-" + action}
                  size="sm"
                  variant={action === "cancel" ? "ghost" : "secondary"}
                  disabled={disabled || operation.pending}
                  onPress={() => {
                    if (disabled) return;
                    if (node.current) focusElement(renderer, node.current.id);
                    void operation.run(() => onAction(task.id, action));
                  }}
                >
                  {operation.pending
                    ? "Working…"
                    : action[0]!.toUpperCase() + action.slice(1)}
                </Button>
              ))}
            </Row>
          ) : null}
        </>
      )}
    </div>
  );
}
export interface TaskListProps {
  tasks: readonly ProgressTask[];
  page: number;
  onPageChange: (page: number) => void;
  testId: string;
  pageSize?: number;
  onAction?: TaskProgressProps["onAction"];
  disabled?: boolean;
  loading?: boolean;
  emptyLabel?: string;
}
export function TaskList({
  tasks,
  page,
  onPageChange,
  testId,
  pageSize = 4,
  onAction,
  disabled,
  loading,
  emptyLabel = "No tasks.",
}: TaskListProps) {
  const { colors: c } = useTheme(),
    error = taskCollectionError(tasks);
  const count = Number.isFinite(pageSize)
    ? Math.max(1, Math.min(10, Math.floor(pageSize)))
    : 4;
  const pages = Math.max(1, Math.ceil(tasks.length / count));
  const current = Number.isFinite(page)
    ? Math.max(0, Math.min(pages - 1, Math.floor(page)))
    : 0;
  return (
    <Stack testId={testId} gap={8}>
      {error ? (
        <Text testId={testId + "-error"} color={c.danger} size={12}>
          {error}
        </Text>
      ) : loading ? (
        <Text testId={testId + "-loading"} size={12} color={c.muted}>
          Loading tasks…
        </Text>
      ) : tasks.length ? (
        tasks
          .slice(current * count, (current + 1) * count)
          .map((task) => (
            <TaskProgress
              key={task.id}
              task={task}
              testId={testId + "-" + task.id}
              onAction={onAction}
              disabled={disabled}
            />
          ))
      ) : (
        <Text testId={testId + "-empty"} size={12} color={c.muted}>
          {emptyLabel}
        </Text>
      )}
      {!error && !loading && pages > 1 ? (
        <Row style={{ justifyContent: "space-between" }}>
          <Button
            testId={testId + "-previous"}
            size="sm"
            disabled={disabled || current === 0}
            onPress={() => onPageChange(current - 1)}
          >
            Previous
          </Button>
          <Text testId={testId + "-page"} size={11}>
            {current + 1} / {pages}
          </Text>
          <Button
            testId={testId + "-next"}
            size="sm"
            disabled={disabled || current === pages - 1}
            onPress={() => onPageChange(current + 1)}
          >
            Next
          </Button>
        </Row>
      ) : null}
    </Stack>
  );
}
export function TaskSummary({
  tasks,
  testId,
  title = "Task overview",
}: {
  tasks: readonly ProgressTask[];
  testId: string;
  title?: string;
}) {
  const { colors: c } = useTheme(),
    error = taskCollectionError(tasks);
  if (error)
    return (
      <Text testId={testId + "-error"} color={c.danger} size={12}>
        {error}
      </Text>
    );
  const counts = summarizeTasks(tasks);
  return (
    <Row
      testId={testId}
      gap={12}
      style={{ padding: 12, borderRadius: 10, backgroundColor: c.subtle }}
    >
      <ProgressRing
        testId={testId + "-ring"}
        value={counts.succeeded}
        max={Math.max(1, counts.total)}
        tone={counts.failed ? "warning" : "success"}
      />
      <Stack gap={5} style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
        <Text size={13} weight={600} lines={1}>
          {title}
        </Text>
        <Text testId={testId + "-counts"} size={11} color={c.muted} lines={2}>
          {counts.succeeded} / {counts.total} succeeded · {counts.active} active
          · {counts.failed} failed · {counts.cancelled} cancelled
        </Text>
      </Stack>
    </Row>
  );
}
