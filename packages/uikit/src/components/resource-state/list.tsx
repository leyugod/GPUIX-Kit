import { Text } from "../../base";
import { ListView, type ListViewProps } from "../list-view";
import { ResourceState } from "./index";
export interface AsyncListViewProps<
  T extends { id: string; disabled?: boolean },
> extends Omit<ListViewProps<T>, "loading"> {
  status: "loading" | "ready" | "error";
  errorLabel?: string;
  onRetry?: () => void | Promise<void>;
  resourceKey?: string;
  revision?: string | number;
  refreshing?: boolean;
  disabled?: boolean;
}
export function AsyncListView<T extends { id: string; disabled?: boolean }>({
  status,
  errorLabel,
  onRetry,
  resourceKey,
  revision,
  refreshing = false,
  disabled = false,
  height = 260,
  ...props
}: AsyncListViewProps<T>) {
  const h = Number.isFinite(height) ? Math.max(180, height) : 260;
  if (status !== "ready" || !props.items.length)
    return (
      <ResourceState
        testId={props.testId + "-state"}
        height={h}
        state={status === "ready" ? "empty" : status}
        title={status === "ready" ? props.emptyLabel : undefined}
        description={status === "error" ? errorLabel : undefined}
        onRetry={onRetry}
        disabled={disabled}
        resourceKey={resourceKey}
        revision={revision}
      />
    );
  return (
    <div
      testId={props.testId + "-frame"}
      style={{
        height: h,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {refreshing ? (
        <Text
          testId={props.testId + "-refreshing"}
          size={11}
          style={{ height: 28, padding: 6 }}
        >
          Refreshing…
        </Text>
      ) : null}
      <ListView
        {...props}
        items={
          disabled
            ? props.items.map((item) => ({ ...item, disabled: true }))
            : props.items
        }
        height={h - (refreshing ? 28 : 0)}
      />
    </div>
  );
}
