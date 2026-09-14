import { useRef, useState, type ReactNode } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { SegmentedControl } from "../../layout";
import { useTheme } from "../../core/theme";
import {
  focusElement,
  getManagedFocus,
  useFocusTarget,
} from "../../core/focus";
import { ActionMenu } from "../actions/menu";
import { DataGrid, type DataColumn, type DataGridProps } from "../data-grid";
import {
  cloneTablePreferences,
  defaultTablePreferences,
  moveColumn,
  tablePreferencesError,
  toggleColumn,
  type TableColumnOption,
  type TableDensity,
  type TablePreferences,
} from "./model";
export type {
  TableColumnOption,
  TableDensity,
  TablePreferences,
  TableSortRule,
} from "./model";
function ErrorText({ error, testId }: { error: string; testId: string }) {
  const { colors: c } = useTheme();
  return (
    <Text testId={testId} size={12} color={c.danger} lines={2}>
      {error}
    </Text>
  );
}
/** 固定入口在子节点移除后保留焦点，内层隔离宿主祖先按键重派。 */
function FocusFrame({
  testId,
  children,
}: {
  testId: string;
  children: (restore: () => void) => ReactNode;
}) {
  const { renderer } = useGpuix(),
    host = useRef<PublicInstance>(null),
    focus = useFocusTarget(false, host),
    nested = useRef(false);
  const restore = () => {
    if (host.current) focusElement(renderer, host.current.id);
  };
  return (
    <div
      testId={testId}
      ref={focus.ref}
      tabIndex={0}
      onKeyDown={(e) => {
        if (!nested.current && getManagedFocus(renderer) === host.current?.id)
          focus.onKeyDown(e);
      }}
      style={{ display: "flex", flexDirection: "column", minWidth: 0 }}
    >
      <div
        onKeyDown={() => {
          nested.current = true;
          void Promise.resolve().then(() => {
            nested.current = false;
          });
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          minWidth: 0,
        }}
      >
        {children(restore)}
      </div>
    </div>
  );
}
export interface TablePreferenceControlProps {
  columns: readonly TableColumnOption[];
  value: TablePreferences;
  onValueChange: (value: TablePreferences) => void;
  testId: string;
  disabled?: boolean;
}
export function ColumnVisibilityMenu({
  columns,
  value,
  onValueChange,
  testId,
  disabled,
}: TablePreferenceControlProps) {
  const [open, setOpen] = useState(false),
    error = tablePreferencesError(columns, value);
  if (error) return <ErrorText testId={testId + "-error"} error={error} />;
  return (
    <ActionMenu
      testId={testId}
      label={
        "Columns · " +
        (columns.length - value.hiddenIds.length) +
        "/" +
        columns.length
      }
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
      items={value.order.map((id) => {
        const column = columns.find((c) => c.id === id)!,
          next = toggleColumn(columns, value, id);
        return {
          id,
          label: column.label,
          checked: !value.hiddenIds.includes(id),
          disabled:
            next.hiddenIds.includes(id) === value.hiddenIds.includes(id),
          run: () => {
            if (!disabled) onValueChange(next);
          },
        };
      })}
    />
  );
}
export function ColumnOrderList({
  columns,
  value,
  onValueChange,
  testId,
  disabled,
}: TablePreferenceControlProps) {
  const [page, setPage] = useState(0),
    error = tablePreferencesError(columns, value),
    pages = Math.max(1, Math.ceil(columns.length / 5)),
    current = Math.min(page, pages - 1);
  return (
    <FocusFrame testId={testId}>
      {(restore) => (
        <>
          {error ? (
            <ErrorText testId={testId + "-error"} error={error} />
          ) : (
            value.order.slice(current * 5, (current + 1) * 5).map((id) => {
              const column = columns.find((c) => c.id === id)!,
                up = moveColumn(columns, value, id, -1),
                down = moveColumn(columns, value, id, 1);
              const change = (next: TablePreferences) => {
                if (!disabled) {
                  restore();
                  onValueChange(next);
                }
              };
              return (
                <Row
                  key={id}
                  testId={testId + "-row-" + id}
                  style={{ height: 34 }}
                >
                  <Text
                    size={12}
                    lines={1}
                    style={{ flexGrow: 1, minWidth: 0 }}
                  >
                    {column.label +
                      (value.hiddenIds.includes(id) ? " · hidden" : "")}
                  </Text>
                  <Button
                    testId={testId + "-up-" + id}
                    size="sm"
                    disabled={
                      disabled ||
                      JSON.stringify(up.order) === JSON.stringify(value.order)
                    }
                    onPress={() => change(up)}
                  >
                    ↑
                  </Button>
                  <Button
                    testId={testId + "-down-" + id}
                    size="sm"
                    disabled={
                      disabled ||
                      JSON.stringify(down.order) === JSON.stringify(value.order)
                    }
                    onPress={() => change(down)}
                  >
                    ↓
                  </Button>
                </Row>
              );
            })
          )}
          <Row>
            <Button
              testId={testId + "-previous"}
              size="sm"
              disabled={disabled || !!error || current === 0}
              onPress={() => {
                restore();
                setPage(current - 1);
              }}
            >
              Previous
            </Button>
            <Text testId={testId + "-page"} size={12}>
              {current + 1 + " / " + pages}
            </Text>
            <Button
              testId={testId + "-next"}
              size="sm"
              disabled={disabled || !!error || current === pages - 1}
              onPress={() => {
                restore();
                setPage(current + 1);
              }}
            >
              Next
            </Button>
          </Row>
        </>
      )}
    </FocusFrame>
  );
}
export interface DensityControlProps {
  value: TableDensity;
  onValueChange: (value: TableDensity) => void;
  testId: string;
  disabled?: boolean;
}
export function DensityControl({
  value,
  onValueChange,
  testId,
  disabled,
}: DensityControlProps) {
  return (
    <SegmentedControl
      testId={testId}
      value={value}
      disabled={disabled}
      onValueChange={(v) => onValueChange(v as TableDensity)}
      options={[
        { value: "compact", label: "Compact" },
        { value: "regular", label: "Regular" },
        { value: "comfortable", label: "Comfortable" },
      ]}
    />
  );
}
export function SortRuleList({
  columns,
  value,
  onValueChange,
  testId,
  disabled,
}: TablePreferenceControlProps) {
  const [open, setOpen] = useState(false),
    error = tablePreferencesError(columns, value),
    available = columns.filter(
      (c) => c.sortable && !value.sorts.some((s) => s.columnId === c.id),
    );
  return (
    <FocusFrame testId={testId}>
      {(restore) => (
        <>
          {error ? (
            <ErrorText testId={testId + "-error"} error={error} />
          ) : (
            <>
              {!value.sorts.length ? (
                <Text testId={testId + "-empty"} size={12}>
                  No sorting
                </Text>
              ) : (
                value.sorts.map((sort, index) => (
                  <Row
                    key={sort.columnId}
                    testId={testId + "-row-" + sort.columnId}
                    style={{ flexWrap: "wrap" }}
                  >
                    <Text
                      size={12}
                      lines={1}
                      style={{ flexGrow: 1, minWidth: 0 }}
                    >
                      {index +
                        1 +
                        ". " +
                        columns.find((c) => c.id === sort.columnId)!.label}
                    </Text>
                    <Button
                      testId={testId + "-direction-" + sort.columnId}
                      size="sm"
                      disabled={disabled}
                      onPress={() => {
                        if (!disabled)
                          onValueChange({
                            ...cloneTablePreferences(value),
                            sorts: value.sorts.map((s) =>
                              s.columnId === sort.columnId
                                ? {
                                    ...s,
                                    direction:
                                      s.direction === "asc" ? "desc" : "asc",
                                  }
                                : s,
                            ),
                          });
                      }}
                    >
                      {sort.direction === "asc" ? "Ascending" : "Descending"}
                    </Button>
                    <Button
                      testId={testId + "-up-" + sort.columnId}
                      size="sm"
                      disabled={disabled || index === 0}
                      onPress={() => {
                        if (disabled) return;
                        const next = cloneTablePreferences(value),
                          sorts = [...next.sorts];
                        [sorts[index - 1], sorts[index]] = [
                          sorts[index]!,
                          sorts[index - 1]!,
                        ];
                        restore();
                        onValueChange({ ...next, sorts });
                      }}
                    >
                      ↑
                    </Button>
                    <Button
                      testId={testId + "-remove-" + sort.columnId}
                      size="sm"
                      disabled={disabled}
                      onPress={() => {
                        if (!disabled) {
                          restore();
                          onValueChange({
                            ...cloneTablePreferences(value),
                            sorts: value.sorts.filter(
                              (s) => s.columnId !== sort.columnId,
                            ),
                          });
                        }
                      }}
                    >
                      ×
                    </Button>
                  </Row>
                ))
              )}
              <ActionMenu
                testId={testId + "-add"}
                label="Add sort"
                open={open}
                onOpenChange={setOpen}
                disabled={
                  disabled || value.sorts.length >= 3 || !available.length
                }
                items={available.map((c) => ({
                  id: c.id,
                  label: c.label,
                  run: () => {
                    if (!disabled)
                      onValueChange({
                        ...cloneTablePreferences(value),
                        sorts: [
                          ...value.sorts,
                          { columnId: c.id, direction: "asc" },
                        ],
                      });
                  },
                }))}
              />
            </>
          )}
        </>
      )}
    </FocusFrame>
  );
}
export interface TablePreferencesPanelProps
  extends Omit<TablePreferenceControlProps, "onValueChange"> {
  onApply: (value: TablePreferences) => void;
  onCancel: () => void;
  revision?: string | number;
}
export function TablePreferencesPanel(props: TablePreferencesPanelProps) {
  return (
    <FocusFrame testId={props.testId + "-focus"}>
      {(restore) => (
        <PreferenceDraft
          key={JSON.stringify([props.columns, props.value, props.revision])}
          {...props}
          onApply={(v) => {
            restore();
            props.onApply(v);
          }}
          onCancel={() => {
            restore();
            props.onCancel();
          }}
        />
      )}
    </FocusFrame>
  );
}
function PreferenceDraft({
  columns,
  value,
  testId,
  disabled,
  onApply,
  onCancel,
}: TablePreferencesPanelProps) {
  const [draft, setDraft] = useState(() => cloneTablePreferences(value)),
    [tab, setTab] = useState("columns"),
    error = tablePreferencesError(columns, draft);
  const shared = { columns, value: draft, onValueChange: setDraft, disabled };
  return (
    <Stack testId={testId} gap={12}>
      <SegmentedControl
        testId={testId + "-tab"}
        value={tab}
        onValueChange={setTab}
        options={[
          { value: "columns", label: "Columns" },
          { value: "sort", label: "Sort" },
          { value: "display", label: "Display" },
        ]}
      />
      {tab === "columns" ? (
        <>
          <ColumnVisibilityMenu {...shared} testId={testId + "-visibility"} />
          <ColumnOrderList {...shared} testId={testId + "-order"} />
        </>
      ) : tab === "sort" ? (
        <SortRuleList {...shared} testId={testId + "-sort"} />
      ) : (
        <DensityControl
          testId={testId + "-density"}
          value={draft.density}
          disabled={disabled}
          onValueChange={(density) => setDraft({ ...draft, density })}
        />
      )}
      {error ? <ErrorText testId={testId + "-error"} error={error} /> : null}
      <Row style={{ flexWrap: "wrap" }}>
        <Button
          testId={testId + "-defaults"}
          size="sm"
          disabled={disabled}
          onPress={() => setDraft(defaultTablePreferences(columns))}
        >
          Defaults
        </Button>
        <Button
          testId={testId + "-reset"}
          size="sm"
          disabled={disabled}
          onPress={() => setDraft(cloneTablePreferences(value))}
        >
          Reset draft
        </Button>
        <div style={{ flexGrow: 1 }} />
        <Button testId={testId + "-cancel"} size="sm" onPress={onCancel}>
          Cancel
        </Button>
        <Button
          testId={testId + "-apply"}
          size="sm"
          variant="primary"
          disabled={disabled || !!error}
          onPress={() => {
            if (!disabled && !error) onApply(cloneTablePreferences(draft));
          }}
        >
          Apply
        </Button>
      </Row>
    </Stack>
  );
}
export type ConfigurableDataColumn<T> = DataColumn<T> & {
  hideable?: boolean;
  reorderable?: boolean;
};
export interface ConfigurableDataGridProps<T>
  extends Omit<
    DataGridProps<T>,
    "columns" | "sort" | "onSortChange" | "density"
  > {
  columns: readonly ConfigurableDataColumn<T>[];
  preferences: TablePreferences;
  onPreferencesChange: (value: TablePreferences) => void;
}
/** 只映射列与显示密度，不对已分页 rows 偷做多列排序。 */
export function ConfigurableDataGrid<T>({
  columns,
  preferences,
  onPreferencesChange,
  ...props
}: ConfigurableDataGridProps<T>) {
  const options = columns.map((c) => ({ ...c, label: c.header })),
    error = tablePreferencesError(options, preferences);
  if (error)
    return <ErrorText testId={props.testId + "-error"} error={error} />;
  const shown = preferences.order
    .filter((id) => !preferences.hiddenIds.includes(id))
    .map((id) => columns.find((c) => c.id === id)!);
  return (
    <DataGrid
      {...props}
      columns={shown}
      density={preferences.density}
      sort={preferences.sorts[0] ?? null}
      onSortChange={(sort) => {
        const sorts = sort
          ? [
              sort,
              ...preferences.sorts.filter((s) => s.columnId !== sort.columnId),
            ].slice(0, 3)
          : preferences.sorts.slice(1);
        onPreferencesChange({ ...cloneTablePreferences(preferences), sorts });
      }}
    />
  );
}
