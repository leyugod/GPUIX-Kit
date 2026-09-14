import { useState } from "react";
import {
  Select as NativeSelect,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@gpuix/react/select";
import type { StyleDesc } from "@gpuix/react";
import { useTheme } from "../core/theme";
import { isActivation, nextEnabled, normalizeKey } from "../core/rules";
import { controlSizes, radius, type ControlSize } from "../core/tokens";
import { Row, Stack, Text } from "./primitives";
import { useFocusTarget } from "../core/focus";
import type { CheckboxState } from "../components/checkbox/model";
export type { CheckboxState } from "../components/checkbox/model";
export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
  testId: string;
  style?: StyleDesc;
}
export interface CheckboxProps extends Omit<ToggleProps, "checked"> {
  checked: CheckboxState;
}
function Toggle({
  checked,
  onCheckedChange,
  label,
  disabled,
  readOnly = false,
  testId,
  style,
  kind,
}: CheckboxProps & { kind: "checkbox" | "switch" }) {
  const { colors: c } = useTheme();
  const focus = useFocusTarget(disabled);
  return (
    <div
      ref={focus.ref}
      testId={testId}
      tabIndex={disabled ? -1 : 0}
      onMouseDown={focus.onMouseDown}
      onClick={(event) => {
        if (
          !disabled &&
          !readOnly &&
          (event.button === undefined || event.button === 0)
        )
          onCheckedChange(checked !== true);
      }}
      onKeyDown={(e) => {
        focus.onKeyDown(e);
        if (!disabled && !readOnly && !e.isHeld && isActivation(e.key))
          onCheckedChange(checked !== true);
      }}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        minHeight: 30,
        flexShrink: 0,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled || readOnly ? "default" : "pointer",
        userSelect: "none",
        ...style,
      }}
    >
      <div
        testId={`${testId}-indicator`}
        style={{
          width: kind === "switch" ? 36 : 18,
          height: kind === "switch" ? 22 : 18,
          borderRadius: kind === "switch" ? 11 : 5,
          backgroundColor: checked ? c.primary : c.elevated,
          borderWidth: 1,
          borderColor: focus.focused
            ? c.accent
            : checked
              ? c.primary
              : c.borderStrong,
          display: "flex",
          alignItems: "center",
          justifyContent:
            kind === "switch"
              ? checked
                ? "flex-end"
                : "flex-start"
              : "center",
          padding: kind === "switch" ? 2 : 0,
          flexShrink: 0,
        }}
      >
        {kind === "switch" ? (
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: "#FFFFFF",
            }}
          />
        ) : checked ? (
          <Text size={12} color={c.onPrimary}>
            {checked === "indeterminate" ? "−" : "✓"}
          </Text>
        ) : null}
      </div>
      <Text size={13} style={{ flexShrink: 1, minWidth: 0 }}>
        {label}
      </Text>
    </div>
  );
}
export const Checkbox = (props: CheckboxProps) => (
  <Toggle {...props} kind="checkbox" />
);
export const Switch = (props: ToggleProps) => (
  <Toggle {...props} kind="switch" />
);
export interface Choice {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface ChoiceProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly Choice[];
  testId: string;
  disabled?: boolean;
  style?: StyleDesc;
}
export function RadioGroup({
  value,
  onValueChange,
  options,
  testId,
  disabled,
  style,
}: ChoiceProps) {
  return (
    <Stack testId={testId} gap={4} style={style}>
      {options.map((option) => (
        <RadioChoice
          key={option.value}
          option={option}
          value={value}
          onValueChange={onValueChange}
          options={options}
          testId={testId}
          disabled={disabled}
        />
      ))}
    </Stack>
  );
}
function RadioChoice({
  option,
  value,
  onValueChange,
  options,
  testId,
  disabled,
}: ChoiceProps & { option: Choice }) {
  const { colors: c } = useTheme();
  const blocked = disabled || option.disabled;
  const focus = useFocusTarget(blocked);
  return (
    <div
      ref={focus.ref}
      testId={`${testId}-${option.value}`}
      tabIndex={blocked ? -1 : 0}
      onMouseDown={focus.onMouseDown}
      onClick={() => {
        if (!blocked) onValueChange(option.value);
      }}
      onKeyDown={(e) => {
        focus.onKeyDown(e);
        if (blocked) return;
        const key = normalizeKey(e.key);
        if (isActivation(key)) onValueChange(option.value);
        else if (["down", "right", "up", "left"].includes(key)) {
          const next = nextEnabled(
            options,
            value,
            key === "down" || key === "right" ? 1 : -1,
          );
          if (next) onValueChange(next);
        }
      }}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        height: 30,
        opacity: blocked ? 0.45 : 1,
        cursor: blocked ? "default" : "pointer",
        borderWidth: 1,
        borderColor: focus.focused ? c.accent : "transparent",
        borderRadius: 5,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 1,
          borderColor: value === option.value ? c.primary : c.borderStrong,
        }}
      >
        {value === option.value ? (
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: c.primary,
            }}
          />
        ) : null}
      </div>
      <Text size={13}>{option.label}</Text>
    </div>
  );
}
/** 浮层、方向键、Escape 和焦点归还复用已安装 GPUIX 的公开 Select。 */
export function Select({
  value,
  onValueChange,
  options,
  testId,
  disabled,
  style,
  placeholder = "Select…",
  size = "md",
}: ChoiceProps & { placeholder?: string; size?: ControlSize }) {
  const { colors: c } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((item) => item.value === value);
  const focus = useFocusTarget(disabled);
  return (
    <NativeSelect
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      style={{ width: "100%", ...style }}
    >
      <SelectTrigger
        ref={focus.ref}
        onKeyDown={(event) => {
          if (!open) focus.onKeyDown(event);
        }}
        onMouseDown={focus.onMouseDown}
        testId={testId}
        style={({ open }) => ({
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: controlSizes[size].height,
          paddingLeft: 12,
          paddingRight: 12,
          borderWidth: 1,
          borderColor: open ? c.accent : c.border,
          borderRadius: radius.md,
          backgroundColor: c.subtle,
          opacity: disabled ? 0.45 : 1,
        })}
      >
        <Text size={13} color={selected ? c.text : c.muted}>
          {selected?.label ?? placeholder}
        </Text>
        <Text color={c.muted} size={12}>
          ⌄
        </Text>
      </SelectTrigger>
      <SelectContent
        testId={`${testId}-menu`}
        sideOffset={6}
        style={{
          width: 240,
          maxHeight: 260,
          overflowY: "scroll",
          padding: 5,
          backgroundColor: c.elevated,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: c.border,
          boxShadow: {
            offsetX: 0,
            offsetY: 8,
            blurRadius: 24,
            spreadRadius: 0,
            color: c.shadow,
          },
        }}
      >
        {options.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            textValue={item.label}
            disabled={item.disabled}
            testId={`${testId}-${item.value}`}
            style={({ highlighted }) => ({
              height: 32,
              paddingLeft: 9,
              paddingRight: 9,
              borderRadius: 5,
              backgroundColor: highlighted ? c.accentSoft : "transparent",
              opacity: item.disabled ? 0.45 : 1,
              display: "flex",
              justifyContent: "center",
            })}
          >
            {({ selected }) => (
              <Row style={{ justifyContent: "space-between" }}>
                <Text size={13}>{item.label}</Text>
                {selected ? <Text color={c.accent}>✓</Text> : null}
              </Row>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </NativeSelect>
  );
}
