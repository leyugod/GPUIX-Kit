import { useEffect, useRef, useState } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Input, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import {
  focusElement,
  getManagedFocus,
  useFocusTarget,
} from "../../core/focus";
import { SegmentedControl } from "../../layout";
import { ActionMenu } from "../actions/menu";
import { useRequestActions } from "../resource-state/requests";
import {
  cloneFilter,
  conditionLabel,
  conditionValueError,
  defaultCondition,
  filterExpressionError,
  filterFieldsError,
  filterFingerprint,
  filterOperators,
  filterShapeError,
  nextConditionId,
  normalizeViewName,
  operatorLabels,
  savedViewsError,
  valuelessOperator,
  viewNameError,
  type FilterCondition,
  type FilterExpression,
  type FilterField,
  type FilterOperator,
  type SavedFilterView,
} from "./model";
export type {
  FilterCondition,
  FilterExpression,
  FilterField,
  FilterKind,
  FilterOperator,
  SavedFilterView,
} from "./model";
function ErrorText({ children, testId }: { children: string; testId: string }) {
  const { colors: c } = useTheme();
  return (
    <Text testId={testId} size={12} color={c.danger} lines={2}>
      {children}
    </Text>
  );
}
function Choice({
  value,
  options,
  onChange,
  testId,
  disabled,
}: {
  value: string;
  options: readonly { value: string; label: string; disabled?: boolean }[];
  onChange: (value: string) => void;
  testId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <ActionMenu
      testId={testId}
      label={options.find((o) => o.value === value)?.label ?? "Choose…"}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
      width={260}
      items={options.map((o) => ({
        id: o.value,
        label: o.label,
        disabled: o.disabled,
        checked: o.value === value,
        run: () => onChange(o.value),
      }))}
    />
  );
}
export interface FilterChipProps {
  label: string;
  testId: string;
  onRemove?: () => void;
  disabled?: boolean;
}
export function FilterChip({
  label,
  testId,
  onRemove,
  disabled,
}: FilterChipProps) {
  const { colors: c } = useTheme();
  return (
    <Row
      testId={testId}
      gap={6}
      style={{
        padding: 6,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 8,
        backgroundColor: c.subtle,
        maxWidth: 380,
      }}
    >
      <Text size={12} lines={1} style={{ flexShrink: 1, minWidth: 0 }}>
        {label}
      </Text>
      {onRemove ? (
        <Button
          testId={testId + "-remove"}
          size="sm"
          disabled={disabled}
          onPress={onRemove}
        >
          ×
        </Button>
      ) : null}
    </Row>
  );
}
export interface FilterSummaryProps {
  fields: readonly FilterField[];
  value: FilterExpression;
  testId: string;
  onRemove?: (id: string) => void;
  onClear?: () => void;
  disabled?: boolean;
}
export function FilterSummary({
  fields,
  value,
  testId,
  onRemove,
  onClear,
  disabled,
}: FilterSummaryProps) {
  const nested = useRef(false);
  const { renderer } = useGpuix(),
    host = useRef<PublicInstance>(null),
    focus = useFocusTarget(false, host),
    error = filterShapeError(fields, value);
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
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
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
        {error ? (
          <ErrorText testId={testId + "-error"}>{error}</ErrorText>
        ) : (
          <>
            <Text size={12}>
              {value.conditions.length
                ? value.match === "all"
                  ? "Match all conditions"
                  : "Match any condition"
                : "No filters"}
            </Text>
            <Row style={{ flexWrap: "wrap" }}>
              {value.conditions.map((condition) => (
                <FilterChip
                  key={condition.id}
                  testId={testId + "-" + condition.id}
                  label={conditionLabel(fields, condition)}
                  disabled={disabled}
                  onRemove={
                    onRemove
                      ? () => {
                          restore();
                          onRemove(condition.id);
                        }
                      : undefined
                  }
                />
              ))}
            </Row>
            {onClear && value.conditions.length ? (
              <Button
                testId={testId + "-clear"}
                size="sm"
                disabled={disabled}
                onPress={() => {
                  restore();
                  onClear();
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
export interface FilterConditionRowProps {
  fields: readonly FilterField[];
  value: FilterCondition;
  onValueChange: (value: FilterCondition) => void;
  onRemove?: () => void;
  testId: string;
  disabled?: boolean;
}
export function FilterConditionRow({
  fields,
  value,
  onValueChange,
  onRemove,
  testId,
  disabled,
}: FilterConditionRowProps) {
  const { colors: c } = useTheme(),
    field = fields.find((f) => f.id === value.fieldId),
    shape = filterShapeError(fields, { match: "all", conditions: [value] });
  if (shape || !field)
    return (
      <ErrorText testId={testId + "-error"}>
        {shape ?? "Unknown field."}
      </ErrorText>
    );
  const error = conditionValueError(field, value),
    locked = disabled || field.disabled;
  return (
    <Stack
      testId={testId}
      gap={8}
      style={{
        padding: 10,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 8,
        backgroundColor: c.surface,
      }}
    >
      <Row>
        <Choice
          testId={testId + "-field"}
          value={field.id}
          options={fields.map((f) => ({
            value: f.id,
            label: f.label,
            disabled: f.disabled,
          }))}
          disabled={disabled}
          onChange={(id) => {
            const next = fields.find((f) => f.id === id);
            if (!disabled && next && !next.disabled)
              onValueChange(defaultCondition(value.id, next));
          }}
        />
        <Choice
          testId={testId + "-operator"}
          value={value.operator}
          options={filterOperators(field.kind).map((op) => ({
            value: op,
            label: operatorLabels[op],
          }))}
          disabled={locked}
          onChange={(op) => {
            if (!locked)
              onValueChange({
                ...value,
                operator: op as FilterOperator,
                value: valuelessOperator(op as FilterOperator)
                  ? ""
                  : valuelessOperator(value.operator)
                    ? defaultCondition(value.id, field).value
                    : value.value,
              });
          }}
        />
        <div style={{ flexGrow: 1 }} />
        {onRemove ? (
          <Button
            testId={testId + "-remove"}
            size="sm"
            disabled={disabled}
            onPress={onRemove}
          >
            Remove
          </Button>
        ) : null}
      </Row>
      {valuelessOperator(value.operator) ? (
        <Text size={12}>No value needed</Text>
      ) : field.kind === "enum" || field.kind === "boolean" ? (
        <Choice
          testId={testId + "-value"}
          value={value.value}
          options={
            field.kind === "boolean"
              ? [
                  { value: "true", label: "True" },
                  { value: "false", label: "False" },
                ]
              : (field.options ?? [])
          }
          disabled={locked}
          onChange={(next) => {
            if (!locked) onValueChange({ ...value, value: next });
          }}
        />
      ) : (
        <Input
          testId={testId + "-value"}
          value={value.value}
          disabled={locked}
          invalid={!!error}
          placeholder={
            field.kind === "date"
              ? "YYYY-MM-DD"
              : field.kind === "number"
                ? "Decimal number"
                : "Value"
          }
          onValueChange={(next) => {
            if (!locked) onValueChange({ ...value, value: next });
          }}
        />
      )}
      {error ? (
        <ErrorText testId={testId + "-value-error"}>{error}</ErrorText>
      ) : null}
    </Stack>
  );
}
export interface FilterBuilderProps {
  fields: readonly FilterField[];
  value: FilterExpression;
  onValueChange: (value: FilterExpression) => void;
  testId: string;
  disabled?: boolean;
  pageSize?: number;
}
export function FilterBuilder({
  fields,
  value,
  onValueChange,
  testId,
  disabled,
  pageSize = 2,
}: FilterBuilderProps) {
  const nested = useRef(false);
  const { renderer } = useGpuix(),
    host = useRef<PublicInstance>(null),
    focus = useFocusTarget(false, host),
    [page, setPage] = useState(0);
  const size = Number.isFinite(pageSize)
      ? Math.max(1, Math.min(3, Math.floor(pageSize)))
      : 2,
    pages = Math.max(1, Math.ceil(value.conditions.length / size)),
    current = Math.min(page, pages - 1),
    error = filterShapeError(fields, value),
    field = fields.find((f) => !f.disabled),
    canAdd = !disabled && !error && !!field && value.conditions.length < 12;
  const restore = () => {
    if (host.current) focusElement(renderer, host.current.id);
  };
  return (
    <div
      ref={focus.ref}
      testId={testId}
      tabIndex={0}
      onKeyDown={(e) => {
        if (!nested.current && getManagedFocus(renderer) === host.current?.id)
          focus.onKeyDown(e);
      }}
      style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}
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
        <Row>
          <SegmentedControl
            testId={testId + "-match"}
            value={value.match}
            disabled={disabled || !!error}
            onValueChange={(match) => {
              if (!disabled)
                onValueChange({
                  ...cloneFilter(value),
                  match: match as "all" | "any",
                });
            }}
            options={[
              { value: "all", label: "All" },
              { value: "any", label: "Any" },
            ]}
          />
          <Text size={12}>conditions</Text>
          <div style={{ flexGrow: 1 }} />
          <Button
            testId={testId + "-add"}
            disabled={!canAdd}
            size="sm"
            onPress={() => {
              if (!canAdd || !field) return;
              const conditions = [
                ...value.conditions,
                defaultCondition(nextConditionId(value), field),
              ];
              setPage(Math.floor((conditions.length - 1) / size));
              onValueChange({ ...value, conditions });
            }}
          >
            Add condition
          </Button>
        </Row>
        {error ? (
          <ErrorText testId={testId + "-error"}>{error}</ErrorText>
        ) : !value.conditions.length ? (
          <Text testId={testId + "-empty"} size={12}>
            No conditions. All records are included.
          </Text>
        ) : (
          value.conditions
            .slice(current * size, (current + 1) * size)
            .map((condition) => (
              <FilterConditionRow
                key={condition.id}
                testId={testId + "-" + condition.id}
                fields={fields}
                value={condition}
                disabled={disabled}
                onValueChange={(next) => {
                  if (!disabled)
                    onValueChange({
                      ...value,
                      conditions: value.conditions.map((c) =>
                        c.id === next.id ? next : c,
                      ),
                    });
                }}
                onRemove={() => {
                  if (disabled) return;
                  restore();
                  onValueChange({
                    ...value,
                    conditions: value.conditions.filter(
                      (c) => c.id !== condition.id,
                    ),
                  });
                }}
              />
            ))
        )}
        <Row>
          <Button
            testId={testId + "-previous"}
            size="sm"
            disabled={disabled || current === 0}
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
            disabled={disabled || current >= pages - 1}
            onPress={() => {
              restore();
              setPage(current + 1);
            }}
          >
            Next
          </Button>
        </Row>
      </div>
    </div>
  );
}
export interface FilterPanelProps
  extends Omit<FilterBuilderProps, "onValueChange" | "pageSize"> {
  onApply: (value: FilterExpression) => void;
  onCancel: () => void;
  revision?: string | number;
}
/** 外部筛选或字段版本变化重建草稿；取消不提交，应用控制面板是否关闭。 */
export function FilterPanel(props: FilterPanelProps) {
  const { renderer } = useGpuix(),
    host = useRef<PublicInstance>(null),
    focus = useFocusTarget(false, host),
    nested = useRef(false);
  const restore = () => {
    if (host.current) focusElement(renderer, host.current.id);
  };
  return (
    <div
      testId={props.testId + "-focus"}
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
        style={{ display: "flex", flexDirection: "column", minWidth: 0 }}
      >
        <PanelSession
          key={JSON.stringify([props.revision, props.fields, props.value])}
          {...props}
          onApply={(value) => {
            restore();
            props.onApply(value);
          }}
          onCancel={() => {
            restore();
            props.onCancel();
          }}
        />
      </div>
    </div>
  );
}
function PanelSession({
  fields,
  value,
  onApply,
  onCancel,
  testId,
  disabled,
}: FilterPanelProps) {
  const [draft, setDraft] = useState(() => cloneFilter(value)),
    error = filterExpressionError(fields, draft);
  return (
    <Stack testId={testId} gap={12}>
      <FilterBuilder
        testId={testId + "-builder"}
        fields={fields}
        value={draft}
        onValueChange={setDraft}
        disabled={disabled}
      />
      {error ? <ErrorText testId={testId + "-error"}>{error}</ErrorText> : null}
      <Row>
        <Button
          testId={testId + "-reset"}
          disabled={disabled}
          onPress={() => setDraft(cloneFilter(value))}
        >
          Reset draft
        </Button>
        <div style={{ flexGrow: 1 }} />
        <Button testId={testId + "-cancel"} onPress={onCancel}>
          Cancel
        </Button>
        <Button
          testId={testId + "-apply"}
          variant="primary"
          disabled={disabled || !!error}
          onPress={() => {
            if (!disabled && !error) onApply(cloneFilter(draft));
          }}
        >
          Apply
        </Button>
      </Row>
    </Stack>
  );
}
export interface SavedViewPickerProps {
  fields: readonly FilterField[];
  views: readonly SavedFilterView[];
  value: string | null;
  filter: FilterExpression;
  onValueChange: (id: string) => void;
  testId: string;
  disabled?: boolean;
  revision?: string | number;
  onCreate?: (name: string, filter: FilterExpression) => void | Promise<void>;
  onUpdate?: (id: string, filter: FilterExpression) => void | Promise<void>;
  onRename?: (id: string, name: string) => void | Promise<void>;
  onRemove?: (id: string) => void | Promise<void>;
}
export function SavedViewPicker({
  fields,
  views,
  value,
  filter,
  onValueChange,
  testId,
  disabled,
  revision,
  onCreate,
  onUpdate,
  onRename,
  onRemove,
}: SavedViewPickerProps) {
  const { renderer } = useGpuix(),
    host = useRef<PublicInstance>(null),
    focus = useFocusTarget(false, host),
    nested = useRef(false),
    [name, setName] = useState("");
  const error = savedViewsError(fields, views),
    selected = views.find((v) => v.id === value),
    identity = JSON.stringify([revision, fields, views, value, filter]),
    requests = useRequestActions(identity, ["save"]),
    pending = requests.pending("save"),
    locked = disabled || pending || !!error;
  useEffect(() => setName(selected?.label ?? ""), [value, selected?.label]);
  const invalid = filterExpressionError(fields, filter),
    createError = viewNameError(name, views),
    renameError = viewNameError(name, views, selected?.id),
    mutable = selected && !selected.readOnly && !selected.disabled;
  const act = (action: () => void | Promise<void>) => {
    if (locked) return;
    if (host.current) focusElement(renderer, host.current.id);
    void requests.run("save", action);
  };
  const childKey = () => {
    nested.current = true;
    void Promise.resolve().then(() => {
      nested.current = false;
    });
    return false;
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
      style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}
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
        {error ? (
          <ErrorText testId={testId + "-error"}>{error}</ErrorText>
        ) : (
          <Choice
            testId={testId + "-select"}
            value={value ?? ""}
            disabled={locked}
            options={views.map((v) => ({
              value: v.id,
              label: v.label,
              disabled: v.disabled,
            }))}
            onChange={(id) => {
              if (!locked) onValueChange(id);
            }}
          />
        )}
        <Text testId={testId + "-status"} size={12}>
          {pending
            ? "Saving…"
            : selected
              ? filterFingerprint(selected.filter) === filterFingerprint(filter)
                ? "Saved view unchanged"
                : "Unsaved filter changes"
              : "Custom filter"}
        </Text>
        <Input
          testId={testId + "-name"}
          value={name}
          onValueChange={setName}
          disabled={locked}
          placeholder="View name"
        />
        {name && createError && (!onRename || renameError) ? (
          <ErrorText testId={testId + "-name-error"}>{createError}</ErrorText>
        ) : null}
        {requests.failed("save") ? (
          <ErrorText testId={testId + "-save-error"}>
            Unable to save changes. Try again.
          </ErrorText>
        ) : null}
        {invalid ? (
          <ErrorText testId={testId + "-filter-error"}>{invalid}</ErrorText>
        ) : null}
        <Row style={{ flexWrap: "wrap" }}>
          {onCreate ? (
            <Button
              testId={testId + "-create"}
              size="sm"
              disabled={
                locked || !!createError || !!invalid || views.length >= 50
              }
              onKeyDown={childKey}
              onPress={() => {
                const snapshot = cloneFilter(filter);
                act(() => onCreate(normalizeViewName(name), snapshot));
              }}
            >
              Save new
            </Button>
          ) : null}
          {onUpdate ? (
            <Button
              testId={testId + "-update"}
              size="sm"
              disabled={locked || !mutable || !!invalid}
              onKeyDown={childKey}
              onPress={() => {
                if (mutable) {
                  const snapshot = cloneFilter(filter);
                  act(() => onUpdate(selected.id, snapshot));
                }
              }}
            >
              Update
            </Button>
          ) : null}
          {onRename ? (
            <Button
              testId={testId + "-rename"}
              size="sm"
              disabled={locked || !mutable || !!renameError}
              onKeyDown={childKey}
              onPress={() => {
                if (mutable)
                  act(() => onRename(selected.id, normalizeViewName(name)));
              }}
            >
              Rename
            </Button>
          ) : null}
          {onRemove ? (
            <Button
              testId={testId + "-remove"}
              size="sm"
              variant="destructive"
              disabled={locked || !mutable}
              onKeyDown={childKey}
              onPress={() => {
                if (mutable) act(() => onRemove(selected.id));
              }}
            >
              Delete
            </Button>
          ) : null}
        </Row>
      </div>
    </div>
  );
}
