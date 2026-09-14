import type { ReactNode } from "react";
import { useTheme, useNativeTheme } from "../core/theme";
import { toneColors, type Tone } from "../core/tokens";
import { clamp, pageWindow } from "../core/rules";
import { Button, Row, Stack, Text, type ViewProps } from "../base";
export function Badge({
  children,
  tone = "neutral",
  testId,
}: ViewProps & { tone?: Tone }) {
  const { colors } = useTheme();
  const c = toneColors(colors, tone);
  return (
    <Row
      testId={testId}
      gap={6}
      style={{
        backgroundColor: c.background,
        paddingLeft: 8,
        paddingRight: 8,
        height: 23,
        borderRadius: 6,
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: 3,
          backgroundColor: c.text,
        }}
      />
      <Text color={c.text} size={11} weight={500}>
        {children}
      </Text>
    </Row>
  );
}
export function Avatar({
  name,
  size = 32,
  src,
  testId,
}: {
  name: string;
  size?: number;
  src?: string;
  testId?: string;
}) {
  const { colors: c } = useTheme();
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => [...part][0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  return (
    <div
      testId={testId}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c.accentSoft,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          objectFit="cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <Text size={size * 0.36} weight={600} color={c.accent}>
          {initials}
        </Text>
      )}
    </div>
  );
}
export function Progress({
  value,
  max = 100,
  label,
  testId = "progress",
}: {
  value: number;
  max?: number;
  label?: string;
  testId?: string;
}) {
  const { colors: c } = useTheme();
  const percent = max > 0 ? clamp((value / max) * 100) : 0;
  return (
    <Stack gap={8} testId={testId}>
      {label ? (
        <Row style={{ justifyContent: "space-between" }}>
          <Text size={12} color={c.muted}>
            {label}
          </Text>
          <Text size={12} color={c.muted}>
            {Math.round(percent)}%
          </Text>
        </Row>
      ) : null}
      <div
        style={{
          height: 6,
          width: "100%",
          backgroundColor: c.border,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          testId={`${testId}-fill`}
          style={{
            height: 6,
            width: `${percent}%`,
            backgroundColor: c.primary,
            borderRadius: 3,
          }}
        />
      </div>
    </Stack>
  );
}
export function Skeleton({ style, testId }: Omit<ViewProps, "children">) {
  const { colors: c } = useTheme();
  return (
    <div
      testId={testId}
      style={{
        height: 16,
        width: "100%",
        borderRadius: 6,
        backgroundColor: c.border,
        ...style,
      }}
    />
  );
}
export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  testId: string;
  labels?: {
    previous: string;
    next: string;
    summary: (start: number, end: number, total: number) => string;
  };
}
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  testId,
  labels,
}: PaginationProps) {
  const p = pageWindow(page, pageSize, total);
  const { colors: c } = useTheme();
  return (
    <Row
      testId={testId}
      style={{ justifyContent: "space-between", width: "100%" }}
    >
      <Text size={12} color={c.muted}>
        {labels?.summary(p.total ? p.start + 1 : 0, p.end, p.total) ??
          `${p.total ? p.start + 1 : 0}–${p.end} / ${p.total}`}
      </Text>
      <Row>
        <Button
          size="sm"
          testId={`${testId}-previous`}
          disabled={p.page === 1}
          onPress={() => onPageChange(p.page - 1)}
        >
          {labels?.previous ?? "Previous"}
        </Button>
        <Button
          size="sm"
          testId={`${testId}-next`}
          disabled={p.page === p.pages}
          onPress={() => onPageChange(p.page + 1)}
        >
          {labels?.next ?? "Next"}
        </Button>
      </Row>
    </Row>
  );
}
export interface TableColumn<T> {
  key: string;
  header: string;
  width?: number;
  render: (row: T) => ReactNode;
}
/** 表格只接收当前页，避免先挂载整个数据集；排序和查询由 ViewModel 承担。 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  empty = "No results",
  testId,
  loading = false,
}: {
  columns: readonly TableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  empty?: string;
  testId: string;
  loading?: boolean;
}) {
  const { colors: c } = useTheme();
  const cellStyle = (width?: number) => ({
    width,
    flexGrow: width ? 0 : 1,
    flexBasis: width ?? 0,
    minWidth: 0,
    flexShrink: 1,
    padding: 12,
  });
  return (
    <Stack
      testId={testId}
      gap={0}
      style={{
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <Row gap={0} style={{ backgroundColor: c.subtle }}>
        {columns.map((col) => (
          <div key={col.key} style={cellStyle(col.width)}>
            <Text size={11} weight={600} color={c.muted}>
              {col.header}
            </Text>
          </div>
        ))}
      </Row>
      {loading ? (
        <Stack style={{ padding: 16 }}>
          <Skeleton />
          <Skeleton />
        </Stack>
      ) : rows.length ? (
        rows.map((row) => (
          <Row
            testId={`${testId}-${rowKey(row)}`}
            key={rowKey(row)}
            gap={0}
            style={{ minHeight: 46, borderTopWidth: 1, borderColor: c.border }}
          >
            {columns.map((col) => (
              <div key={col.key} style={cellStyle(col.width)}>
                {col.render(row)}
              </div>
            ))}
          </Row>
        ))
      ) : (
        <Text size={13} color={c.muted} style={{ padding: 24 }}>
          {empty}
        </Text>
      )}
    </Stack>
  );
}
export function Markdown({
  source,
  testId,
}: {
  source: string;
  testId?: string;
}) {
  const theme = useNativeTheme();
  return (
    <markdown
      source={source}
      theme={theme}
      testId={testId}
      style={{ width: "100%", minWidth: 0, color: theme.text }}
    />
  );
}
