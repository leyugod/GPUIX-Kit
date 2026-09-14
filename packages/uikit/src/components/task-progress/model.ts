export type TaskStatus =
  | "queued"
  | "running"
  | "paused"
  | "succeeded"
  | "failed"
  | "cancelled";
export type TaskAction = "pause" | "resume" | "cancel" | "retry";
export interface ProgressTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  completed?: number;
  total?: number;
  error?: string;
  cancellable?: boolean;
  pausable?: boolean;
  retryable?: boolean;
  revision?: number | string;
}
export function taskError(task: ProgressTask): string | null {
  if (!task.id.trim() || !task.title.trim())
    return "Tasks require a non-empty id and title.";
  if (
    ![
      "queued",
      "running",
      "paused",
      "succeeded",
      "failed",
      "cancelled",
    ].includes(task.status)
  )
    return "Unknown task status.";
  if (
    task.completed !== undefined &&
    (!Number.isFinite(task.completed) || task.completed < 0)
  )
    return "Completed must be a finite non-negative number.";
  if (
    task.total !== undefined &&
    (!Number.isFinite(task.total) ||
      task.total <= 0 ||
      (task.completed ?? 0) > task.total)
  )
    return "Total must be positive and cannot be below completed.";
  return null;
}
export function taskCollectionError(
  tasks: readonly ProgressTask[],
): string | null {
  if (tasks.length > 200)
    return "Pass at most 200 tasks; page larger collections in the application.";
  const ids = new Set<string>();
  for (const task of tasks) {
    const error = taskError(task);
    if (error) return error;
    if (ids.has(task.id)) return "Task ids must be unique.";
    ids.add(task.id);
  }
  return null;
}
export function taskActions(task: ProgressTask): TaskAction[] {
  if (taskError(task)) return [];
  const actions: TaskAction[] = [];
  if (task.pausable && task.status === "running") actions.push("pause");
  if (task.pausable && task.status === "paused") actions.push("resume");
  if (task.cancellable && ["queued", "running", "paused"].includes(task.status))
    actions.push("cancel");
  if (task.retryable && ["failed", "cancelled"].includes(task.status))
    actions.push("retry");
  return actions;
}
export function taskFraction(task: ProgressTask): number | null {
  if (taskError(task)) return null;
  if (task.status === "succeeded") return 1;
  return task.total === undefined ? null : (task.completed ?? 0) / task.total;
}
export function summarizeTasks(tasks: readonly ProgressTask[]) {
  const counts: Record<TaskStatus, number> = {
    queued: 0,
    running: 0,
    paused: 0,
    succeeded: 0,
    failed: 0,
    cancelled: 0,
  };
  for (const task of tasks) counts[task.status]++;
  return {
    ...counts,
    total: tasks.length,
    active: counts.queued + counts.running + counts.paused,
  };
}
export function progressFraction(
  value: number | null,
  max = 100,
): number | null {
  if (value === null) return null;
  return Number.isFinite(value) &&
    Number.isFinite(max) &&
    max > 0 &&
    value >= 0 &&
    value <= max
    ? value / max
    : null;
}
