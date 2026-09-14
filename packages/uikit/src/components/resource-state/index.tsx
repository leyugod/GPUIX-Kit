import { useRef } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { useFocusTarget, focusElement } from "../../core/focus";
import { useRequestActions } from "./requests";
export interface ResourceStateProps {
  state: "loading" | "empty" | "error";
  testId: string;
  title?: string;
  description?: string;
  onRetry?: () => void | Promise<void>;
  retryLabel?: string;
  workingLabel?: string;
  failureLabel?: string;
  resourceKey?: string;
  revision?: string | number;
  disabled?: boolean;
  height?: number;
}
export function ResourceState({
  state,
  testId,
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  workingLabel = "Working…",
  failureLabel = "The request failed. Try again.",
  resourceKey = testId,
  revision = 0,
  disabled = false,
  height = 180,
}: ResourceStateProps) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix(),
    host = useRef<PublicInstance>(null),
    nested = useRef(false),
    focus = useFocusTarget(false, host);
  const requests = useRequestActions(JSON.stringify([resourceKey, revision]), [
      "retry",
    ]),
    pending = requests.pending("retry");
  return (
    <div
      ref={focus.ref}
      testId={testId}
      tabIndex={0}
      onKeyDown={(e) => {
        if (!nested.current) focus.onKeyDown(e);
      }}
      style={{
        height: Number.isFinite(height) ? Math.max(180, height) : 180,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 16,
        overflow: "hidden",
        backgroundColor: c.surface,
        borderRadius: 8,
      }}
    >
      <Text size={14} weight={600} lines={2}>
        {title ??
          (state === "loading"
            ? "Loading…"
            : state === "empty"
              ? "No items"
              : "Unable to load")}
      </Text>
      {description ? (
        <Text size={12} color={c.muted} lines={2}>
          {description}
        </Text>
      ) : null}
      {requests.failed("retry") ? (
        <Text testId={testId + "-error"} size={12} color={c.danger} lines={2}>
          {failureLabel}
        </Text>
      ) : null}
      {state === "error" && onRetry ? (
        <Button
          testId={testId + "-retry"}
          size="sm"
          loading={pending}
          loadingText={workingLabel}
          disabled={disabled}
          onKeyDown={() => {
            nested.current = true;
            void Promise.resolve().then(() => {
              nested.current = false;
            });
            return false;
          }}
          onPress={() => {
            if (host.current) focusElement(renderer, host.current.id);
            void requests.run("retry", onRetry);
          }}
        >
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
export interface LoadMoreButtonProps {
  state: "idle" | "loading" | "error" | "end";
  onLoadMore: () => void | Promise<void>;
  testId: string;
  resourceKey?: string;
  revision?: string | number;
  disabled?: boolean;
  label?: string;
  retryLabel?: string;
  loadingLabel?: string;
  endLabel?: string;
  errorLabel?: string;
}
export function LoadMoreButton({
  state,
  onLoadMore,
  testId,
  resourceKey = testId,
  revision = 0,
  disabled = false,
  label = "Load more",
  retryLabel = "Retry loading",
  loadingLabel = "Loading…",
  endLabel = "All items loaded",
  errorLabel = "Unable to load more.",
}: LoadMoreButtonProps) {
  const requests = useRequestActions(JSON.stringify([resourceKey, revision]), [
      "more",
    ]),
    pending = requests.pending("more"),
    { colors: c } = useTheme(),
    { renderer } = useGpuix(),
    host = useRef<PublicInstance>(null),
    nested = useRef(false),
    focus = useFocusTarget(false, host);
  return (
    <div
      ref={focus.ref}
      testId={testId}
      tabIndex={0}
      onKeyDown={(e) => {
        if (!nested.current) focus.onKeyDown(e);
      }}
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
    >
      {state !== "end" && (state === "error" || requests.failed("more")) ? (
        <Text testId={testId + "-error"} color={c.danger} size={12} lines={2}>
          {errorLabel}
        </Text>
      ) : null}
      <Button
        testId={testId + "-button"}
        onKeyDown={() => {
          nested.current = true;
          void Promise.resolve().then(() => {
            nested.current = false;
          });
          return false;
        }}
        onPress={() => {
          if (host.current) focusElement(renderer, host.current.id);
          void requests.run("more", onLoadMore);
        }}
        disabled={disabled || state === "end" || state === "loading"}
        loading={pending}
        loadingText={loadingLabel}
      >
        {state === "end"
          ? endLabel
          : state === "loading"
            ? loadingLabel
            : state === "error" || requests.failed("more")
              ? retryLabel
              : label}
      </Button>
    </div>
  );
}
