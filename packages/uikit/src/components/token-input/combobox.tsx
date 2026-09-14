import { useEffect, useRef, useState } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { Tag } from "../tags";
import {
  tokenConfigurationError,
  prepareTokens,
  type Token,
  type TokenRules,
} from "../tags/model";
import { Popover } from "../popover";
import { focusElement } from "../../core/focus";
import { useTheme } from "../../core/theme";
import { TokenInput } from "./input";
import { TokenSuggestionList } from "./suggestions";
import {
  addTokenSuggestion,
  createSuggestedToken,
  filterTokenSuggestions,
  suggestionConfigurationError,
  type TokenSuggestion,
} from "./model";
export interface TokenComboboxProps extends TokenRules {
  value: readonly Token[];
  onValueChange: (value: Token[]) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  options: readonly TokenSuggestion[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId: string;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  allowCreate?: boolean;
  placeholder?: string;
  label?: string;
  width?: number;
}
export function TokenCombobox(props: TokenComboboxProps) {
  return <TokenChooser {...props} floating />;
}
/** 草稿面板共享同一选择逻辑；inline 版本不创建第二层 Popover。 */
export function TokenChooser({
  value,
  onValueChange,
  inputValue,
  onInputValueChange,
  options,
  open,
  onOpenChange,
  testId,
  disabled,
  readOnly,
  loading,
  error,
  onRetry,
  allowCreate = false,
  placeholder = "Search labels…",
  label,
  width = 360,
  floating = false,
  ...rules
}: TokenComboboxProps & { floating?: boolean }) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix(),
    input = useRef<PublicInstance>(null),
    list = useRef<PublicInstance>(null);
  const [failure, setFailure] = useState<string | null>(null),
    [enterList, setEnterList] = useState(false);
  const invalid =
    tokenConfigurationError(value, rules) ??
    suggestionConfigurationError(options, rules);
  const blocked = disabled || readOnly || !!invalid,
    shown = open && !blocked;
  const candidates = filterTokenSuggestions(
    options,
    inputValue,
    value,
    rules.caseSensitive,
  );
  useEffect(() => {
    setFailure(null);
  }, [inputValue, value]);
  useEffect(() => {
    if (shown && enterList && list.current) {
      focusElement(renderer, list.current.id);
      setEnterList(false);
    }
  }, [shown, enterList, renderer]);
  const focusInput = () => {
    if (input.current && !disabled) focusElement(renderer, input.current.id);
  };
  const close = () => {
    onOpenChange(false);
    focusInput();
  };
  const commit = (result: ReturnType<typeof prepareTokens>) => {
    if (!result.ok) {
      setFailure(result.message);
      return;
    }
    onValueChange(result.value);
    onInputValueChange("");
    setFailure(null);
    if (floating) onOpenChange(false);
    focusInput();
  };
  const select = (option: TokenSuggestion) => {
    if (!blocked && !loading && !error)
      commit(addTokenSuggestion(value, option, rules));
  };
  const create = () => {
    if (!blocked && !loading && !error && allowCreate)
      commit(createSuggestedToken(value, inputValue, options, rules));
  };
  const submit = () => {
    if (blocked || loading || error) return;
    const first = candidates.find((t) => !t.disabled);
    if (first) select(first);
    else create();
  };
  const anchor = (
    <Stack gap={7}>
      {label ? (
        <Text size={12} weight={600}>
          {label}
        </Text>
      ) : null}
      {!invalid && value.length ? (
        <Row gap={5} style={{ flexWrap: "wrap" }}>
          {value.map((token) => (
            <Tag
              key={token.id}
              testId={testId + "-token-" + token.id}
              label={token.label}
              disabled={disabled || token.disabled}
              readOnly={readOnly}
              maxWidth={200}
              onRemove={
                token.removable === false
                  ? undefined
                  : () => {
                      if (!blocked && !token.disabled) {
                        onValueChange(value.filter((t) => t.id !== token.id));
                        focusInput();
                      }
                    }
              }
            />
          ))}
        </Row>
      ) : null}
      <Row gap={6}>
        <TokenInput
          ref={input}
          testId={testId + "-input"}
          value={inputValue}
          disabled={disabled || !!invalid}
          readOnly={readOnly}
          invalid={!!failure || !!invalid}
          placeholder={placeholder}
          style={{ width: undefined, flexGrow: 1, flexShrink: 1 }}
          onValueChange={(text) => {
            onInputValueChange(text);
            setFailure(null);
            if (!blocked) onOpenChange(true);
          }}
          onSubmit={submit}
          onKeyDown={(event) => {
            if (event.key === "escape" && shown && floating) {
              close();
              return true;
            }
            if (
              event.key === "down" &&
              !event.modifiers?.cmd &&
              !event.modifiers?.ctrl &&
              !event.modifiers?.alt &&
              !blocked
            ) {
              onOpenChange(true);
              setEnterList(true);
              return true;
            }
            return false;
          }}
        />
        {floating ? (
          <Button
            testId={testId + "-toggle"}
            size="sm"
            disabled={blocked}
            onPress={() => {
              if (shown) close();
              else {
                onOpenChange(true);
                setEnterList(true);
              }
            }}
          >
            {shown ? "Close" : "Browse"}
          </Button>
        ) : null}
        {allowCreate ? (
          <Button
            testId={testId + "-create"}
            size="sm"
            disabled={blocked || loading || !!error || !inputValue.trim()}
            onPress={create}
          >
            Create
          </Button>
        ) : null}
      </Row>
    </Stack>
  );
  const suggestions = (
    <TokenSuggestionList
      ref={list}
      options={options}
      query={inputValue}
      value={value}
      onSelect={select}
      testId={testId + "-suggestions"}
      pageSize={floating ? 5 : 2}
      showDescriptions={floating}
      maxTokenLength={rules.maxTokenLength}
      caseSensitive={rules.caseSensitive}
      disabled={disabled}
      readOnly={readOnly}
      loading={loading}
      error={error}
      onRetry={onRetry}
      onEscape={floating ? close : undefined}
    />
  );
  return (
    <Stack testId={testId} gap={5}>
      {floating ? (
        <Popover
          testId={testId + "-popup"}
          anchor={anchor}
          open={shown}
          onOpenChange={onOpenChange}
          autoFocus={false}
          restoreFocusRef={input}
          width={Math.max(
            240,
            Math.min(480, Number.isFinite(width) ? width : 360),
          )}
        >
          {suggestions}
        </Popover>
      ) : (
        <>
          {anchor}
          {!invalid ? suggestions : null}
        </>
      )}
      {invalid || failure ? (
        <Text testId={testId + "-error"} size={11} color={c.danger} lines={2}>
          {invalid ?? failure}
        </Text>
      ) : null}
      <Text testId={testId + "-count"} size={10} color={c.muted}>
        {value.length}/{rules.maxTokens ?? 20}
      </Text>
    </Stack>
  );
}
