import { useEffect, useLayoutEffect, useRef, useState, type Ref } from "react";
import { useGpuix, type EventPayload, type PublicInstance } from "@gpuix/react";
import { Button, Input, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { focusElement, useFocusTarget } from "../../core/focus";
import { isActivation } from "../../core/rules";
import { toneColors, type Tone } from "../../core/tokens";
import {
  prepareTokens,
  tokenConfigurationError,
  type Token,
  type TokenRules,
} from "./model";
export interface TagProps {
  label: string;
  testId: string;
  tone?: Tone;
  selected?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  maxWidth?: number;
  ref?: Ref<PublicInstance>;
  onKeyDown?: (event: EventPayload) => boolean | void;
}
/** 标签主体和移除按钮是相邻焦点节点，避免嵌套可激活控件。 */
export function Tag({
  label,
  testId,
  tone = "neutral",
  selected = false,
  disabled = false,
  readOnly = false,
  onPress,
  onRemove,
  maxWidth = 220,
  ref,
  onKeyDown,
}: TagProps) {
  const { colors: c } = useTheme();
  const toneColor = toneColors(c, tone);
  const focus = useFocusTarget(disabled || !onPress, ref);
  const width = Number.isFinite(maxWidth)
    ? Math.max(48, Math.min(600, maxWidth))
    : 220;
  return (
    <Row
      testId={testId}
      gap={3}
      style={{
        maxWidth: width,
        paddingLeft: 8,
        paddingRight: onRemove ? 3 : 8,
        height: 28,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: selected || focus.focused ? c.accent : c.border,
        backgroundColor: selected ? c.accentSoft : toneColor.background,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <div
        testId={`${testId}-label`}
        ref={focus.ref}
        tabIndex={onPress && !disabled ? 0 : -1}
        onMouseDown={(event) => {
          if (event.button === undefined || event.button === 0)
            focus.onMouseDown();
        }}
        onClick={(event) => {
          if (!disabled && (event.button === undefined || event.button === 0))
            onPress?.();
        }}
        onKeyDown={(event) => {
          if (disabled || !onPress) return;
          focus.onMouseDown();
          if (onKeyDown?.(event) === true) return;
          focus.onKeyDown(event);
          if (!event.isHeld && isActivation(event.key)) onPress();
        }}
        style={{
          minWidth: 0,
          flexShrink: 1,
          cursor: onPress && !disabled ? "pointer" : "default",
        }}
      >
        <Text
          testId={`${testId}-text`}
          size={11}
          color={toneColor.text}
          lines={1}
        >
          {label}
        </Text>
      </div>
      {onRemove ? (
        <Button
          testId={`${testId}-remove`}
          variant="ghost"
          size="sm"
          disabled={disabled || readOnly}
          onPress={onRemove}
          style={{ width: 20, height: 20, paddingLeft: 0, paddingRight: 0 }}
        >
          ×
        </Button>
      ) : null}
    </Row>
  );
}
export interface TokenFieldProps extends TokenRules {
  value: readonly Token[];
  onValueChange: (value: Token[]) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  placeholder?: string;
  addLabel?: string;
  hint?: string;
  testId: string;
}
export function TokenField({
  value,
  onValueChange,
  inputValue,
  onInputValueChange,
  disabled = false,
  readOnly = false,
  label,
  placeholder = "Enter tags…",
  addLabel = "Add",
  hint = "Enter or Add submits the draft. Shift+Tab selects the last tag; arrows move and Delete removes.",
  testId,
  ...rules
}: TokenFieldProps) {
  const { colors: c } = useTheme();
  const { renderer } = useGpuix();
  const input = useRef<PublicInstance>(null),
    nodes = useRef(new Map<string, PublicInstance>());
  const [active, setActive] = useState<string | null>(null),
    [error, setError] = useState<string | null>(null);
  // 0.7.0 的 Tab 导航仍会插入制表符；重建原生编辑器以恢复受控草稿。
  const tabDraft = useRef<{ value: string } | null>(null);
  const [inputRevision, setInputRevision] = useState(0);
  const configError = tokenConfigurationError(value, rules);
  const blocked = disabled || readOnly || !!configError;
  const ids = value.filter((t) => !t.disabled).map((t) => t.id);
  const selected = active && ids.includes(active) ? active : null;
  useEffect(() => {
    setError(null);
  }, [inputValue, value]);
  const focusInput = () => {
    setActive(null);
    if (input.current) focusElement(renderer, input.current.id);
  };
  const focusToken = (id: string) => {
    setActive(id);
    const node = nodes.current.get(id);
    if (node) focusElement(renderer, node.id);
  };
  const remove = (token: Token) => {
    if (blocked || token.disabled || token.removable === false) return;
    const index = ids.indexOf(token.id),
      target = ids[index + 1] ?? ids[index - 1];
    onValueChange(value.filter((t) => t.id !== token.id));
    setError(null);
    if (target) focusToken(target);
    else focusInput();
  };
  const add = () => {
    if (blocked) return;
    const result = prepareTokens(value, inputValue, rules);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onValueChange(result.value);
    onInputValueChange("");
    setError(null);
    focusInput();
  };
  const key = (token: Token, event: EventPayload) => {
    const index = ids.indexOf(token.id);
    if (event.key === "escape" && selected) {
      focusInput();
      return true;
    }
    if (event.modifiers?.cmd || event.modifiers?.ctrl || event.modifiers?.alt)
      return false;
    if (event.key === "left") {
      focusToken(ids[Math.max(0, index - 1)]!);
      return true;
    }
    if (event.key === "right") {
      const next = ids[index + 1];
      if (next) focusToken(next);
      else focusInput();
      return true;
    }
    if (event.key === "home" || event.key === "end") {
      focusToken(event.key === "home" ? ids[0]! : ids.at(-1)!);
      return true;
    }
    if (event.key === "backspace" || event.key === "delete") {
      if (!event.isHeld) remove(token);
      return true;
    }
    return false;
  };
  return (
    <Stack testId={testId} gap={7}>
      {label ? (
        <Text size={13} weight={600}>
          {label}
        </Text>
      ) : null}
      <Stack
        gap={10}
        style={{
          padding: 10,
          borderWidth: 1,
          borderColor: configError || error ? c.danger : c.border,
          borderRadius: 10,
          backgroundColor: c.surface,
        }}
      >
        {!configError && value.length ? (
          <Row gap={6} style={{ flexWrap: "wrap" }}>
            {value.map((token) => (
              <Tag
                key={token.id}
                ref={(node) => {
                  if (node) nodes.current.set(token.id, node);
                  else nodes.current.delete(token.id);
                }}
                testId={`${testId}-token-${token.id}`}
                label={token.label}
                selected={selected === token.id}
                disabled={disabled || token.disabled}
                readOnly={readOnly}
                onPress={() => focusToken(token.id)}
                onRemove={
                  token.removable === false ? undefined : () => remove(token)
                }
                onKeyDown={(event) => key(token, event)}
              />
            ))}
          </Row>
        ) : null}
        <Row>
          <Input
            ref={input}
            testId={`${testId}-input`}
            value={inputValue}
            resetKey={inputRevision}
            disabled={disabled || !!configError}
            readOnly={readOnly}
            invalid={!!(error || configError)}
            onValueChange={(text) => {
              if (tabDraft.current) {
                tabDraft.current = null;
                setInputRevision((revision) => revision + 1);
                return;
              }
              onInputValueChange(text);
              setActive(null);
              setError(null);
            }}
            onSubmit={add}
            onKeyDown={(event) => {
              if (event.key === "tab") {
                const snapshot = { value: inputValue };
                tabDraft.current = snapshot;
                void Promise.resolve().then(() => {
                  if (tabDraft.current === snapshot) tabDraft.current = null;
                });
              }
              if (
                !event.modifiers?.cmd &&
                !event.modifiers?.ctrl &&
                !event.modifiers?.alt &&
                event.modifiers?.shift &&
                event.key === "tab" &&
                ids.length
              ) {
                focusToken(ids.at(-1)!);
                return true;
              }
              return false;
            }}
            placeholder={placeholder}
            style={{ width: undefined, flexGrow: 1, flexShrink: 1 }}
          />
          <Button
            testId={`${testId}-add`}
            disabled={blocked || !inputValue.trim()}
            onPress={add}
          >
            {addLabel}
          </Button>
        </Row>
      </Stack>
      {configError || error ? (
        <Text testId={`${testId}-error`} size={11} color={c.danger}>
          {configError ?? error}
        </Text>
      ) : hint ? (
        <Text size={11} color={c.muted}>
          {hint}
        </Text>
      ) : null}
      <Text testId={`${testId}-count`} size={10} color={c.muted}>
        {value.length}/{rules.maxTokens ?? 20}
      </Text>
    </Stack>
  );
}
export type { Token, TokenRules, TokenResult } from "./model";
