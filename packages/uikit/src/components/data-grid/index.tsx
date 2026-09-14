import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Input, Row, Stack, Text, Checkbox } from "../../base";
import { useTheme } from "../../core/theme";
import { focusElement } from "../../core/focus";
import { ListView } from "../list-view";
import { ColumnResize } from "./resize";
import {
  rowHeightForDensity,
  type TableDensity,
} from "../table-preferences/model";
import {
  nextSort,
  togglePageSelection,
  type SortDescriptor,
} from "../../interaction/selection";
export interface DataColumn<T> {
  id: string;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  value: (row: T) => string | number | null | undefined;
  render?: (row: T) => ReactNode;
  editable?: boolean;
  validate?: (value: string, row: T) => string | undefined;
}
export interface DataGridProps<T> {
  rows: readonly T[];
  columns: readonly DataColumn<T>[];
  rowKey: (row: T) => string;
  rowDisabled?: (row: T) => boolean;
  sort: SortDescriptor | null;
  onSortChange: (sort: SortDescriptor | null) => void;
  selectedIds: readonly string[];
  onSelectionChange: (ids: string[]) => void;
  columnWidths?: Readonly<Record<string, number>>;
  onColumnWidthsChange?: (widths: Record<string, number>) => void;
  onCellEdit?: (row: T, columnId: string, value: string) => void;
  onActivate?: (row: T) => void;
  height?: number;
  density?: TableDensity;
  loading?: boolean;
  testId: string;
}
/** 行是当前页；排序描述发回应用，避免只排序当前页却误称全局排序。 */
export function DataGrid<T>({
  rows,
  columns,
  rowKey,
  rowDisabled,
  sort,
  onSortChange,
  selectedIds,
  onSelectionChange,
  columnWidths = {},
  onColumnWidthsChange,
  onCellEdit,
  onActivate,
  height = 300,
  density = "regular",
  loading,
  testId,
}: DataGridProps<T>) {
  const { colors: c } = useTheme();
  const items = rows.map((row) => ({
    id: rowKey(row),
    disabled: rowDisabled?.(row),
    row,
  }));
  const width = (col: DataColumn<T>) =>
    Math.max(
      col.minWidth ?? 80,
      Math.min(col.maxWidth ?? 600, columnWidths[col.id] ?? col.width ?? 160),
    );
  const total = 20 + columns.reduce((n, col) => n + width(col), 0);
  return (
    <Stack testId={testId} gap={8}>
      <Row>
        <Checkbox
          testId={`${testId}-all`}
          checked={
            items.some((i) => !i.disabled) &&
            items
              .filter((i) => !i.disabled)
              .every((i) => selectedIds.includes(i.id))
          }
          disabled={loading || !items.some((i) => !i.disabled)}
          label="Select page"
          onCheckedChange={() =>
            onSelectionChange(togglePageSelection(items, selectedIds))
          }
        />
        <Text testId={`${testId}-selection`} size={11} color={c.muted}>
          {selectedIds.length} selected
        </Text>
      </Row>
      <div style={{ overflowX: "scroll", minWidth: 0 }}>
        <Stack gap={0} style={{ width: total, minWidth: total }}>
          <Row
            gap={0}
            style={{
              height: 38,
              backgroundColor: c.subtle,
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
            {columns.map((col) => (
              <Row
                key={col.id}
                gap={0}
                style={{ width: width(col), flexShrink: 0 }}
              >
                <Button
                  testId={`${testId}-sort-${col.id}`}
                  disabled={loading || !col.sortable}
                  variant="ghost"
                  size="sm"
                  style={{
                    width: width(col) - 5,
                    justifyContent: "flex-start",
                  }}
                  onPress={() => onSortChange(nextSort(sort, col.id))}
                >
                  {col.header}
                  {sort?.columnId === col.id
                    ? sort.direction === "asc"
                      ? " ↑"
                      : " ↓"
                    : ""}
                </Button>
                {onColumnWidthsChange ? (
                  <ColumnResize
                    testId={`${testId}-resize-${col.id}`}
                    width={width(col)}
                    min={col.minWidth ?? 80}
                    max={col.maxWidth ?? 600}
                    onChange={(next) =>
                      onColumnWidthsChange({ ...columnWidths, [col.id]: next })
                    }
                  />
                ) : null}
              </Row>
            ))}
          </Row>
          <ListView
            testId={`${testId}-rows`}
            items={items}
            height={height}
            rowHeight={rowHeightForDensity(density)}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
            selectionMode="multiple"
            loading={loading}
            onActivate={(item) => onActivate?.(item.row)}
            renderItem={(item) => (
              <Row gap={0}>
                {columns.map((col) => (
                  <div
                    key={col.id}
                    testId={`${testId}-cell-${item.id}-${col.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: width(col),
                      flexShrink: 0,
                      paddingRight: 8,
                    }}
                  >
                    {col.editable && onCellEdit ? (
                      <EditableCell
                        testId={`${testId}-edit-${item.id}-${col.id}`}
                        value={String(col.value(item.row) ?? "")}
                        disabled={item.disabled}
                        validate={(value) => col.validate?.(value, item.row)}
                        onCommit={(value) =>
                          onCellEdit(item.row, col.id, value)
                        }
                      />
                    ) : (
                      (col.render?.(item.row) ?? (
                        <Text size={12} lines={1}>
                          {String(col.value(item.row) ?? "—")}
                        </Text>
                      ))
                    )}
                  </div>
                ))}
              </Row>
            )}
          />
        </Stack>
      </div>
    </Stack>
  );
}
function EditableCell({
  value,
  onCommit,
  validate,
  disabled,
  testId,
}: {
  value: string;
  onCommit: (value: string) => void;
  validate: (value: string) => string | undefined;
  disabled?: boolean;
  testId: string;
}) {
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(value);
  const input = useRef<PublicInstance>(null),
    button = useRef<PublicInstance>(null);
  const { renderer } = useGpuix();
  const restore = useRef(false);
  useEffect(() => {
    if (editing && input.current) focusElement(renderer, input.current.id);
    else if (restore.current && button.current) {
      restore.current = false;
      focusElement(renderer, button.current.id);
    }
  }, [editing, renderer]);
  const finish = (commit: boolean) => {
    if (commit && validate(draft)) return;
    if (commit) onCommit(draft);
    setEditing(false);
    restore.current = true;
  };
  return editing ? (
    <Input
      ref={input}
      testId={`${testId}-input`}
      value={draft}
      disabled={disabled}
      invalid={!!validate(draft)}
      size="sm"
      onValueChange={setDraft}
      onSubmit={() => finish(true)}
      onKeyDown={(event) => {
        if (event.key === "escape") {
          finish(false);
          return true;
        }
        return false;
      }}
    />
  ) : (
    <Button
      ref={button}
      testId={testId}
      variant="ghost"
      size="sm"
      disabled={disabled}
      style={{ width: "100%", justifyContent: "flex-start" }}
      onPress={() => {
        setDraft(value);
        setEditing(true);
      }}
    >
      {value || "Edit…"}
    </Button>
  );
}
export { sortRows, type SortDescriptor } from "../../interaction/selection";
