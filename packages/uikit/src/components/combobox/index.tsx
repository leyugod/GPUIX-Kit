import { useRef, useState } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Input, Row, Stack, Text, type Choice } from "../../base";
import { focusElement } from "../../core/focus";
import { useTheme } from "../../core/theme";
import { Popover } from "../popover";
export interface ComboboxOption extends Choice {
  keywords?: readonly string[];
}
interface ChoiceProps {
  options: readonly ComboboxOption[];
  testId: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyLabel?: string;
  loadingLabel?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  /** 服务端已过滤的当前页数据可关闭本地过滤。 */
  filter?: boolean;
  popupWidth?: number;
}
export interface ComboBoxProps extends ChoiceProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
}
export interface MultiSelectProps extends ChoiceProps {
  value: readonly string[];
  onValueChange: (value: string[]) => void;
}
export function ComboBox({ value, onValueChange, ...props }: ComboBoxProps) {
  return (
    <SearchChoice
      {...props}
      values={value === null ? [] : [value]}
      onChange={(values) => onValueChange(values[0] ?? null)}
      multiple={false}
    />
  );
}
export function MultiSelect({
  value,
  onValueChange,
  ...props
}: MultiSelectProps) {
  return (
    <SearchChoice {...props} values={value} onChange={onValueChange} multiple />
  );
}
/** 使用原生 input + anchored；键盘选择规则独立，避免宿主搜索列表的挂载时序影响禁用项。 */
function SearchChoice({
  options,
  values,
  onChange,
  multiple,
  testId,
  placeholder = "Search…",
  disabled = false,
  loading = false,
  emptyLabel = "No results",
  loadingLabel = "Loading…",
  query: controlledQuery,
  onQueryChange,
  filter = true,
  popupWidth = 280,
}: ChoiceProps & {
  values: readonly string[];
  onChange: (values: string[]) => void;
  multiple: boolean;
}) {
  const { colors: c } = useTheme();
  const { renderer } = useGpuix();
  const [localQuery, setLocalQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const input = useRef<PublicInstance>(null);
  const query = controlledQuery ?? localQuery;
  const setQuery = (v: string) => {
    setLocalQuery(v);
    onQueryChange?.(v);
    setActive(null);
  };
  const needle = query.trim().toLocaleLowerCase();
  const matches = options.filter(
    (o) =>
      !filter ||
      [o.label, ...(o.keywords ?? [])]
        .join(" ")
        .toLocaleLowerCase()
        .includes(needle),
  );
  const shown = matches.slice(0, 50);
  const enabled = shown.filter((o) => !o.disabled);
  const highlighted = enabled.find((o) => o.value === active) ?? enabled[0];
  const select = (option: ComboboxOption) => {
    if (disabled || loading || option.disabled) return;
    onChange(
      multiple
        ? values.includes(option.value)
          ? values.filter((v) => v !== option.value)
          : [...values, option.value]
        : [option.value],
    );
    setQuery("");
    if (!multiple) setOpen(false);
    if (input.current) focusElement(renderer, input.current.id);
  };
  return (
    <Stack gap={6} testId={`${testId}-field`}>
      {values.length ? (
        <Row gap={4} style={{ flexWrap: "wrap" }}>
          {values.map((value) => {
            const option = options.find((o) => o.value === value);
            return (
              <Button
                key={value}
                size="sm"
                variant="secondary"
                disabled={disabled || option?.disabled}
                testId={`${testId}-remove-${value}`}
                onPress={() => onChange(values.filter((v) => v !== value))}
              >{`${option?.label ?? value}  ×`}</Button>
            );
          })}
        </Row>
      ) : null}
      <Popover
        scrollOffset={
          Math.max(
            0,
            shown.findIndex((o) => o.value === highlighted?.value) - 4,
          ) * 32
        }
        open={open && !disabled}
        onOpenChange={setOpen}
        testId={`${testId}-popup`}
        autoFocus={false}
        width={popupWidth}
        anchor={
          <Input
            ref={input}
            testId={testId}
            disabled={disabled}
            value={query}
            placeholder={placeholder}
            onValueChange={(v) => {
              setQuery(v);
              setOpen(true);
            }}
            onSubmit={() => {
              if (open && highlighted) select(highlighted);
              else setOpen(true);
            }}
            onKeyDown={(event) => {
              if (disabled) return true;
              if (event.key === "escape" && open) {
                setOpen(false);
                return true;
              }
              if (event.key === "tab") setOpen(false);
              if (event.key === "down" || event.key === "up") {
                if (!open) {
                  setOpen(true);
                  setActive(
                    event.key === "down"
                      ? (enabled[0]?.value ?? null)
                      : (enabled.at(-1)?.value ?? null),
                  );
                } else {
                  const index = enabled.findIndex(
                    (o) => o.value === highlighted?.value,
                  );
                  setActive(
                    enabled[
                      (index +
                        (event.key === "down" ? 1 : -1) +
                        enabled.length) %
                        enabled.length
                    ]?.value ?? null,
                  );
                }
                return true;
              }
              return false;
            }}
          />
        }
      >
        {loading ? (
          <Text size={12} color={c.muted}>
            {loadingLabel}
          </Text>
        ) : (
          shown.map((option) => (
            <Button
              key={option.value}
              testId={`${testId}-option-${option.value}`}
              size="sm"
              variant="ghost"
              disabled={option.disabled}
              fullWidth
              onPress={() => select(option)}
              style={{
                justifyContent: "space-between",
                backgroundColor:
                  highlighted?.value === option.value
                    ? c.accentSoft
                    : "transparent",
              }}
              trailing={
                values.includes(option.value) ? (
                  <Text color={c.accent}>✓</Text>
                ) : undefined
              }
            >
              {option.label}
            </Button>
          ))
        )}
        {!loading && !shown.length ? (
          <Text testId={`${testId}-empty`} size={12} color={c.muted}>
            {emptyLabel}
          </Text>
        ) : null}
        {!loading && matches.length > 50 ? (
          <Text size={11} color={c.muted}>
            Refine your search to see more options.
          </Text>
        ) : null}
      </Popover>
    </Stack>
  );
}
