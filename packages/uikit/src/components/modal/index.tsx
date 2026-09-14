import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Input, Stack, Text } from "../../base";
import { focusElement } from "../../core/focus";
import { useTheme } from "../../core/theme";
import { useFeedbackAction } from "../notifications/hooks";
import {
  TaskProgress,
  type ProgressTask,
  type TaskAction,
} from "../task-progress";
import { ModalSurface, type ModalSurfaceProps } from "./surface";
import { validatePrompt } from "./model";
export type { ModalSurfaceProps } from "./surface";
type Common = Pick<
  ModalSurfaceProps,
  | "open"
  | "onOpenChange"
  | "title"
  | "description"
  | "testId"
  | "width"
  | "restoreFocusRef"
>;
export interface AlertDialogProps extends Common {
  children?: ReactNode;
  acknowledgeLabel?: string;
}
export function AlertDialog({
  acknowledgeLabel = "OK",
  children,
  ...props
}: AlertDialogProps) {
  const acknowledge = useRef<PublicInstance>(null);
  return (
    <ModalSurface
      {...props}
      showClose={false}
      initialFocusRef={acknowledge}
      footer={
        <Button
          ref={acknowledge}
          testId={props.testId + "-acknowledge"}
          variant="primary"
          onPress={() => props.onOpenChange(false)}
        >
          {acknowledgeLabel}
        </Button>
      }
    >
      {children}
    </ModalSurface>
  );
}
export interface ConfirmDialogProps extends Common {
  children?: ReactNode;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  revision?: string | number;
  errorLabel?: string;
}
export function ConfirmDialog(props: ConfirmDialogProps) {
  return props.open ? <OpenConfirm {...props} /> : null;
}
function OpenConfirm({
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  revision = 0,
  errorLabel = "The action failed. Try again.",
  children,
  ...props
}: ConfirmDialogProps) {
  const { renderer } = useGpuix(),
    { colors: c } = useTheme(),
    cancel = useRef<PublicInstance>(null),
    surface = useRef<PublicInstance>(null);
  const operation = useFeedbackAction(JSON.stringify([props.testId, revision]));
  const submit = () => {
    if (surface.current) focusElement(renderer, surface.current.id);
    void operation.run(onConfirm, { success: () => props.onOpenChange(false) });
  };
  return (
    <ModalSurface
      {...props}
      showClose={false}
      dismissible={!operation.pending}
      surfaceRef={surface}
      initialFocusRef={cancel}
      footer={
        <>
          <Button
            ref={cancel}
            testId={props.testId + "-cancel"}
            disabled={operation.pending}
            onPress={() => props.onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            testId={props.testId + "-confirm"}
            variant={destructive ? "destructive" : "primary"}
            loading={operation.pending}
            loadingText="Working…"
            onPress={submit}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
      {operation.failed ? (
        <Text
          testId={props.testId + "-error"}
          color={c.danger}
          size={12}
          lines={3}
        >
          {errorLabel}
        </Text>
      ) : null}
    </ModalSurface>
  );
}
export interface PromptDialogProps extends Common {
  value: string;
  onSubmit: (value: string) => void | Promise<void>;
  validate?: (value: string) => string | null;
  label?: string;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  revision?: string | number;
  errorLabel?: string;
}
export function PromptDialog(props: PromptDialogProps) {
  return props.open ? <OpenPrompt {...props} /> : null;
}
function OpenPrompt({
  value,
  onSubmit,
  validate,
  label = "Value",
  placeholder,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  revision = 0,
  errorLabel = "Unable to save. Try again.",
  ...props
}: PromptDialogProps) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix(),
    input = useRef<PublicInstance>(null),
    surface = useRef<PublicInstance>(null);
  const [draft, setDraft] = useState(value),
    [source, setSource] = useState(value),
    [failure, setFailure] = useState<string | null>(null);
  const [inputRevision, setInputRevision] = useState(0),
    tab = useRef<object | null>(null);
  const submission = useRef<{ value: string } | null>(null);
  // 原样提交后的应用回写是确认；不同外部值才隔离旧结果，避免保存成功后面板留开。
  const observed = useRef({ value, epoch: 0 });
  if (observed.current.value !== value) {
    if (submission.current?.value !== value) observed.current.epoch++;
    observed.current.value = value;
  }
  const current = source === value ? draft : value,
    operation = useFeedbackAction(
      JSON.stringify([props.testId, revision, observed.current.epoch]),
    );
  useEffect(() => {
    setSource(value);
    setDraft(value);
    setFailure(null);
  }, [value, revision]);
  const submit = () => {
    if (operation.pending) return;
    const error = validatePrompt(current, validate);
    setFailure(error);
    if (error) {
      if (input.current) focusElement(renderer, input.current.id);
      return;
    }
    const snapshot = current;
    const request = { value: snapshot };
    submission.current = request;
    if (surface.current) focusElement(renderer, surface.current.id);
    void operation.run(() => onSubmit(snapshot), {
      busy: (busy) => {
        if (!busy && submission.current === request) submission.current = null;
      },
      success: () => props.onOpenChange(false),
    });
  };
  return (
    <ModalSurface
      {...props}
      showClose={false}
      dismissible={!operation.pending}
      initialFocusRef={input}
      surfaceRef={surface}
      footer={
        <>
          <Button
            testId={props.testId + "-cancel"}
            disabled={operation.pending}
            onPress={() => props.onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            testId={props.testId + "-submit"}
            variant="primary"
            loading={operation.pending}
            loadingText="Saving…"
            onPress={submit}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <Stack gap={6}>
        <Text size={12} weight={600}>
          {label}
        </Text>
        <Input
          ref={input}
          testId={props.testId + "-input"}
          value={current}
          disabled={operation.pending}
          resetKey={inputRevision}
          placeholder={placeholder}
          invalid={!!failure}
          onValueChange={(text) => {
            if (tab.current) {
              tab.current = null;
              setInputRevision((v) => v + 1);
              return;
            }
            setDraft(text);
            setFailure(null);
          }}
          onSubmit={submit}
          onKeyDown={(event) => {
            if (event.key === "tab") {
              const mark = {};
              tab.current = mark;
              void Promise.resolve().then(() => {
                if (tab.current === mark) tab.current = null;
              });
            }
            return false;
          }}
        />
      </Stack>
      {failure || operation.failed ? (
        <Text
          testId={props.testId + "-error"}
          size={12}
          color={c.danger}
          lines={3}
        >
          {failure ?? errorLabel}
        </Text>
      ) : null}
    </ModalSurface>
  );
}
export interface SheetProps
  extends Omit<ModalSurfaceProps, "presentation" | "side"> {}
export function Sheet(props: SheetProps) {
  return <ModalSurface {...props} presentation="sheet" />;
}
export interface DrawerProps extends Omit<ModalSurfaceProps, "presentation"> {}
export function Drawer(props: DrawerProps) {
  return <ModalSurface {...props} presentation="drawer" />;
}
export interface ProgressDialogProps extends Common {
  task: ProgressTask;
  onTaskAction?: (id: string, action: TaskAction) => void | Promise<void>;
  allowBackground?: boolean;
  closeLabel?: string;
  hideLabel?: string;
}
export function ProgressDialog({
  task,
  onTaskAction,
  allowBackground = false,
  closeLabel = "Close",
  hideLabel = "Hide",
  ...props
}: ProgressDialogProps) {
  const active = ["queued", "running", "paused"].includes(task.status),
    canClose = !active || allowBackground;
  return (
    <ModalSurface
      {...props}
      showClose={false}
      dismissible={canClose}
      footer={
        <Button
          testId={props.testId + "-done"}
          disabled={!canClose}
          onPress={() => props.onOpenChange(false)}
        >
          {active ? hideLabel : closeLabel}
        </Button>
      }
    >
      <TaskProgress
        testId={props.testId + "-task"}
        task={task}
        onAction={onTaskAction}
      />
    </ModalSurface>
  );
}
