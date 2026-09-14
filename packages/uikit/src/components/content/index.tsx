import { useEffect, useState, type ReactNode } from "react";
import { Button, Row, Stack, Text } from "../../base";
import { useNativeTheme, useTheme } from "../../core/theme";
import { Progress } from "../../data";
import { clamp } from "../../core/rules";
export function CodeBlock({
  code,
  language,
  path,
  showLineNumbers = true,
  testId,
  height = 260,
}: {
  code: string;
  language?: string;
  path?: string;
  showLineNumbers?: boolean;
  testId: string;
  height?: number;
}) {
  const theme = useNativeTheme();
  const { colors: c } = useTheme();
  return (
    <Stack
      testId={testId}
      gap={0}
      style={{
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 8,
        backgroundColor: c.surface,
        overflow: "hidden",
      }}
    >
      <Text size={11} color={c.muted} style={{ padding: 10 }}>
        {path ?? language ?? "Code"}
      </Text>
      <div style={{ height, overflowY: "scroll" }}>
        <code
          testId={`${testId}-source`}
          code={code}
          language={language}
          path={path}
          showLineNumbers={showLineNumbers}
          theme={theme}
          style={{ color: c.text, fontSize: 12, padding: 10 }}
        />
      </div>
    </Stack>
  );
}
export function DiffView({
  patch,
  testId,
  height = 280,
  maxLines = 300,
  collapsedPaths = [],
  onCollapsedPathsChange,
}: {
  patch: string;
  testId: string;
  height?: number;
  maxLines?: number;
  collapsedPaths?: string[];
  onCollapsedPathsChange?: (paths: string[]) => void;
}) {
  const theme = useNativeTheme();
  const { colors: c } = useTheme();
  const [limit, setLimit] = useState(maxLines);
  useEffect(() => setLimit(maxLines), [patch, maxLines]);
  return (
    <diff
      testId={testId}
      patch={patch}
      theme={theme}
      wordDiff
      scroll
      maxLines={limit}
      onShowMore={() => setLimit((n) => n + maxLines)}
      collapsedPaths={collapsedPaths}
      onToggleFile={(event) => {
        const path = event.value;
        if (path)
          onCollapsedPathsChange?.(
            collapsedPaths.includes(path)
              ? collapsedPaths.filter((p) => p !== path)
              : [...collapsedPaths, path],
          );
      }}
      style={{
        height,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 8,
        backgroundColor: c.surface,
        color: c.text,
      }}
    />
  );
}
export interface FileItem {
  id: string;
  name: string;
  detail?: string;
  status: "ready" | "queued" | "uploading" | "failed" | "complete";
  progress?: number;
  error?: string;
  disabled?: boolean;
}
/** 文件仅是显示模型；打开、重试和移除均由应用执行，UIKit 不访问路径。 */
export function FileList({
  files,
  onOpen,
  onRetry,
  onRemove,
  testId,
  emptyLabel = "No files",
}: {
  files: readonly FileItem[];
  onOpen?: (id: string) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  testId: string;
  emptyLabel?: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack testId={testId} gap={10}>
      {!files.length ? (
        <Text color={c.muted} size={12}>
          {emptyLabel}
        </Text>
      ) : (
        files.map((file) => (
          <Stack
            key={file.id}
            testId={`${testId}-${file.id}`}
            gap={6}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: file.status === "failed" ? c.danger : c.border,
              borderRadius: 8,
              backgroundColor: c.surface,
            }}
          >
            <Row>
              <Stack gap={3} style={{ flexGrow: 1, flexShrink: 1 }}>
                <Text size={13} lines={1}>
                  {file.name}
                </Text>
                <Text
                  size={11}
                  color={file.status === "failed" ? c.danger : c.muted}
                >
                  {file.error ?? file.detail ?? file.status}
                </Text>
              </Stack>
              {onOpen ? (
                <Button
                  testId={`${testId}-open-${file.id}`}
                  size="sm"
                  disabled={
                    file.disabled ||
                    !["ready", "complete"].includes(file.status)
                  }
                  onPress={() => onOpen(file.id)}
                >
                  Open
                </Button>
              ) : null}
              {file.status === "failed" && onRetry ? (
                <Button
                  testId={`${testId}-retry-${file.id}`}
                  size="sm"
                  disabled={file.disabled}
                  onPress={() => onRetry(file.id)}
                >
                  Retry
                </Button>
              ) : null}
              {onRemove ? (
                <Button
                  testId={`${testId}-remove-${file.id}`}
                  size="sm"
                  variant="ghost"
                  disabled={file.disabled}
                  onPress={() => onRemove(file.id)}
                >
                  Remove
                </Button>
              ) : null}
            </Row>
            {file.status === "uploading" ? (
              <Progress
                testId={`${testId}-progress-${file.id}`}
                value={clamp(file.progress ?? 0)}
                label="Uploading"
              />
            ) : null}
          </Stack>
        ))
      )}
    </Stack>
  );
}
export function FilePickerArea({
  onChoose,
  disabled = false,
  testId,
  description = "Choose files to attach",
  chooseLabel = "Choose files",
}: {
  onChoose: () => void;
  disabled?: boolean;
  testId: string;
  description?: string;
  chooseLabel?: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack
      testId={testId}
      style={{
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: c.borderStrong,
        borderRadius: 10,
        backgroundColor: c.subtle,
      }}
    >
      <Text size={12} color={c.muted}>
        {description}
      </Text>
      <Button
        testId={`${testId}-choose`}
        disabled={disabled}
        onPress={onChoose}
      >
        {chooseLabel}
      </Button>
    </Stack>
  );
}
export function ContentPreview({
  title,
  children,
  onClose,
  testId,
}: {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  testId: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack testId={testId} gap={12}>
      <Row>
        <Text weight={600} size={15} style={{ flexGrow: 1 }}>
          {title}
        </Text>
        {onClose ? (
          <Button
            testId={`${testId}-close`}
            size="sm"
            variant="ghost"
            onPress={onClose}
          >
            Close
          </Button>
        ) : null}
      </Row>
      {children}
      <Text size={11} color={c.muted}>
        Preview
      </Text>
    </Stack>
  );
}
