import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { useGpuix, useWindowSize, type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { toneColors, type Tone } from "../../core/tokens";
import { focusElement, useFocusTarget } from "../../core/focus";
import { useFeedbackAction } from "./hooks";
import { type NotificationQueue } from "./queue";
import { type Notification } from "./model";
export {
  createNotificationQueue,
  type NotificationQueue,
  type NotificationQueueOptions,
  type NotificationClock,
  type NotificationSnapshot,
  type DismissReason,
} from "./queue";
export { useNotificationQueue } from "./hooks";
export type { Notification, QueuedNotification, PauseReason } from "./model";
export interface NoticeCardProps {
  title: string;
  description?: string;
  tone?: Tone;
  testId: string;
  revision?: number | string;
  action?: { label: string; onPress: () => void | Promise<void> };
  onActionSuccess?: () => void;
  onActionFailure?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onDismiss?: () => void;
  paused?: boolean;
  onPauseToggle?: () => void;
  pauseDisabled?: boolean;
  onHoverChange?: (hover: boolean) => void;
  onKeyboardInteraction?: () => void;
  disabled?: boolean;
  errorLabel?: string;
}
export function NoticeCard({
  title,
  description,
  tone = "accent",
  testId,
  revision = 0,
  action,
  onActionSuccess,
  onActionFailure,
  onBusyChange,
  onDismiss,
  paused,
  onPauseToggle,
  pauseDisabled,
  onHoverChange,
  onKeyboardInteraction,
  disabled,
  errorLabel = "Action failed. Try again.",
}: NoticeCardProps) {
  const { colors: c } = useTheme(),
    ink = toneColors(c, tone);
  const { renderer } = useGpuix(),
    node = useRef<PublicInstance>(null);
  const hoverCallback = useRef(onHoverChange);
  hoverCallback.current = onHoverChange;
  useEffect(() => () => hoverCallback.current?.(false), []);
  const focus = useFocusTarget(Boolean(disabled), node);
  const operation = useFeedbackAction(JSON.stringify([testId, revision]));
  const keyboard = (key: string | undefined) => {
    onKeyboardInteraction?.();
    if (key === "escape" && !operation.pending && onDismiss) {
      onDismiss();
      return true;
    }
    return false;
  };
  return (
    <div
      testId={testId}
      ref={focus.ref}
      tabIndex={disabled ? -1 : 0}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onKeyDown={(event) => {
        if (disabled) return;
        if (!keyboard(event.key)) focus.onKeyDown(event);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 12,
        minWidth: 0,
        flexShrink: 0,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: focus.focused ? c.accent : c.border,
        backgroundColor: c.elevated,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Row gap={10} style={{ alignItems: "flex-start" }}>
        <Text color={ink.text} size={15}>
          {tone === "success" ? "✓" : tone === "danger" ? "!" : "i"}
        </Text>
        <Stack gap={4} style={{ flexGrow: 1, flexShrink: 1 }}>
          <Text testId={testId + "-title"} size={13} weight={600} lines={2}>
            {title}
          </Text>
          {description ? (
            <Text size={12} color={c.muted} lines={3}>
              {description}
            </Text>
          ) : null}
        </Stack>
      </Row>
      {operation.failed ? (
        <Text testId={testId + "-error"} size={11} color={c.danger} lines={2}>
          {errorLabel}
        </Text>
      ) : null}
      <Row gap={6} style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
        {action ? (
          <Button
            testId={testId + "-action"}
            size="sm"
            variant="secondary"
            disabled={disabled}
            loading={operation.pending}
            loadingText="Working…"
            labelLines={1}
            style={{ maxWidth: 200 }}
            onKeyDown={(event) => keyboard(event.key)}
            onPress={() => {
              if (disabled) return;
              if (node.current) focusElement(renderer, node.current.id);
              void operation.run(action.onPress, {
                busy: onBusyChange,
                success: onActionSuccess,
                failure: onActionFailure,
              });
            }}
          >
            {action.label}
          </Button>
        ) : null}
        {onPauseToggle ? (
          <Button
            testId={testId + "-pause"}
            size="sm"
            variant="ghost"
            disabled={disabled || operation.pending || pauseDisabled}
            onPress={onPauseToggle}
          >
            {paused ? "Resume" : "Pause"}
          </Button>
        ) : null}
        {onDismiss ? (
          <Button
            testId={testId + "-dismiss"}
            size="sm"
            variant="ghost"
            disabled={disabled || operation.pending}
            onKeyDown={(event) => keyboard(event.key)}
            onPress={onDismiss}
          >
            Dismiss
          </Button>
        ) : null}
      </Row>
    </div>
  );
}
export interface UndoToastProps
  extends Omit<NoticeCardProps, "action" | "onActionSuccess" | "tone"> {
  state: "available" | "undone" | "expired";
  onUndo: () => void | Promise<void>;
  onStateChange: (state: "undone") => void;
  undoLabel?: string;
}
export function UndoToast({
  state,
  onUndo,
  onStateChange,
  undoLabel = "Undo",
  title,
  description,
  ...props
}: UndoToastProps) {
  return (
    <NoticeCard
      {...props}
      revision={JSON.stringify([props.revision ?? 0, state])}
      title={title}
      description={
        state === "undone"
          ? "Action restored."
          : state === "expired"
            ? "Undo is no longer available."
            : description
      }
      tone={state === "undone" ? "success" : "neutral"}
      action={
        state === "available"
          ? { label: undoLabel, onPress: onUndo }
          : undefined
      }
      onActionSuccess={() => onStateChange("undone")}
    />
  );
}
export interface ToastViewportProps {
  queue: NotificationQueue;
  testId: string;
  onAction?: (notice: Readonly<Notification>) => void | Promise<void>;
  restoreFocusRef?: RefObject<PublicInstance | null>;
  placement?: "inline" | "top-right";
  width?: number;
}
export function ToastViewport({
  queue,
  testId,
  onAction,
  restoreFocusRef,
  placement = "inline",
  width = 360,
}: ToastViewportProps) {
  const snapshot = useSyncExternalStore(
    queue.subscribe,
    queue.getSnapshot,
    queue.getSnapshot,
  );
  const { renderer } = useGpuix(),
    window = useWindowSize(),
    { colors: c } = useTheme();
  const size = Math.min(
    Math.max(240, Math.min(480, Number.isFinite(width) ? width : 360)),
    Math.max(160, window.width - 32),
  );
  const restore = () => {
    if (restoreFocusRef?.current)
      focusElement(renderer, restoreFocusRef.current.id);
  };
  const contents = (
    <Stack
      testId={testId}
      gap={8}
      style={{
        width: size,
        ...(placement === "top-right"
          ? { maxHeight: window.height - 32, overflowY: "scroll" as const }
          : {}),
      }}
    >
      {snapshot.paused ? (
        <Text testId={testId + "-paused"} size={11} color={c.muted}>
          Notification timers paused
        </Text>
      ) : null}
      {snapshot.entries.slice(0, snapshot.visibleLimit).map((entry) => {
        const { notice, revision } = entry;
        const setPause = (
          reason: Parameters<NotificationQueue["setPaused"]>[1],
          paused: boolean,
        ) => queue.setPaused(notice.id, reason, paused, revision);
        const dismiss = (reason: "manual" | "action") => {
          if (queue.dismiss(notice.id, reason, revision)) restore();
        };
        const run = () => {
          if (
            queue
              .getSnapshot()
              .entries.some(
                (e) => e.notice.id === notice.id && e.revision === revision,
              )
          )
            return onAction?.(notice);
        };
        const sticky = entry.pauses.some((p) =>
          ["manual", "keyboard", "error"].includes(p),
        );
        const props: NoticeCardProps = {
          testId: testId + "-" + notice.id,
          revision,
          title: notice.title,
          description: notice.description,
          tone: notice.tone,
          onDismiss:
            notice.dismissible === false ? undefined : () => dismiss("manual"),
          onActionFailure: () => {
            setPause("error", true);
          },
          onBusyChange: (busy) => {
            setPause("busy", busy);
          },
          onHoverChange: (hover) => {
            setPause("hover", hover);
          },
          onKeyboardInteraction: () => {
            setPause("keyboard", true);
          },
          paused: sticky || snapshot.paused,
          pauseDisabled: snapshot.paused,
          onPauseToggle:
            entry.remainingMs === null
              ? undefined
              : () => {
                  if (sticky) {
                    for (const reason of [
                      "manual",
                      "keyboard",
                      "error",
                    ] as const)
                      setPause(reason, false);
                  } else setPause("manual", true);
                },
        };
        return notice.kind === "undo" && onAction ? (
          <UndoToast
            key={notice.id + ":" + revision}
            {...props}
            state="available"
            onUndo={run}
            onStateChange={() => dismiss("action")}
            undoLabel={notice.actionLabel ?? "Undo"}
          />
        ) : (
          <NoticeCard
            key={notice.id + ":" + revision}
            {...props}
            action={
              notice.actionLabel && onAction
                ? { label: notice.actionLabel, onPress: run }
                : undefined
            }
            onActionSuccess={() => dismiss("action")}
          />
        );
      })}
      {snapshot.entries.length > snapshot.visibleLimit ? (
        <Text testId={testId + "-queued"} size={11} color={c.muted}>
          {snapshot.entries.length - snapshot.visibleLimit} queued
        </Text>
      ) : null}
    </Stack>
  );
  if (placement === "top-right" && !snapshot.entries.length) return null;
  return placement === "top-right" ? (
    <anchored
      position={{ x: Math.max(8, window.width - size - 16), y: 16 }}
      deferred
      priority={3}
      occlude
      style={{ backgroundColor: "transparent" }}
    >
      {contents}
    </anchored>
  ) : (
    contents
  );
}
