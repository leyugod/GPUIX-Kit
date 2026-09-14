import { useEffect, useRef, useState, type Ref } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { useFocusTarget, focusElement } from "../../core/focus";
import { isActivation } from "../../core/rules";
import {
  filterTokenSuggestions,
  suggestionConfigurationError,
  tokenPage,
  type TokenSuggestion,
  type TokenEditRules,
} from "./model";
import type { Token } from "../tags/model";
export interface TokenSuggestionListProps extends TokenEditRules {
  options: readonly TokenSuggestion[];
  query?: string;
  value?: readonly Token[];
  onSelect: (token: TokenSuggestion) => void;
  testId: string;
  pageSize?: number;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyLabel?: string;
  showDescriptions?: boolean;
  onEscape?: () => void;
  ref?: Ref<PublicInstance>;
}
export function TokenSuggestionList({
  options,
  query = "",
  value = [],
  onSelect,
  testId,
  pageSize = 5,
  disabled,
  readOnly,
  loading,
  error,
  onRetry,
  emptyLabel = "No matching suggestions.",
  showDescriptions = true,
  onEscape,
  ref,
  ...rules
}: TokenSuggestionListProps) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix(),
    node = useRef<PublicInstance>(null);
  const external = useRef(ref);
  external.current = ref;
  const focus = useFocusTarget(Boolean(disabled), node);
  // 单一列表焦点跨页保留，行只接受指针；避免挂载数量改变 Tab 顺序。
  const [active, setActive] = useState<string | null>(null),
    [page, setPage] = useState(0);
  const invalid = suggestionConfigurationError(options, rules);
  const items =
    invalid || loading || error
      ? []
      : filterTokenSuggestions(options, query, value, rules.caseSensitive);
  const identity = JSON.stringify([
    query,
    items.map((t) => [t.id, Boolean(t.disabled)]),
  ]);
  useEffect(() => {
    setPage(0);
    setActive(items.find((t) => !t.disabled)?.id ?? null);
  }, [identity]);
  const window = tokenPage(page, pageSize, items.length),
    visible = items.slice(window.start, window.end);
  const current =
    visible.find((t) => t.id === active && !t.disabled) ??
    visible.find((t) => !t.disabled);
  const focusList = () => {
    if (node.current) focusElement(renderer, node.current.id);
  };
  const choose = (item: TokenSuggestion) => {
    if (disabled || readOnly || loading || invalid || error || item.disabled)
      return;
    setActive(item.id);
    focusList();
    onSelect(item);
  };
  const movePage = (next: number) => {
    const slice = tokenPage(next, pageSize, items.length);
    setPage(slice.page);
    setActive(
      items.slice(slice.start, slice.end).find((t) => !t.disabled)?.id ?? null,
    );
    focusList();
  };
  return (
    <Stack testId={testId} gap={5}>
      <div
        ref={(instance) => {
          focus.ref(instance);
          const target = external.current;
          if (typeof target === "function") target(instance);
          else if (target) target.current = instance;
        }}
        testId={testId + "-list"}
        tabIndex={disabled ? -1 : 0}
        onMouseDown={(event) => {
          if (!disabled && (event.button === undefined || event.button === 0))
            focusList();
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "escape" && onEscape) {
            onEscape();
            return;
          }
          if (
            !event.modifiers?.cmd &&
            !event.modifiers?.ctrl &&
            !event.modifiers?.alt
          ) {
            const enabled = items.filter((t) => !t.disabled),
              index = enabled.findIndex((t) => t.id === current?.id);
            let target: TokenSuggestion | undefined;
            if (event.key === "home") target = enabled[0];
            if (event.key === "end") target = enabled.at(-1);
            if (event.key === "up")
              target =
                index < 0
                  ? [...enabled]
                      .reverse()
                      .find((t) => items.indexOf(t) < window.start)
                  : enabled[Math.max(0, index - 1)];
            if (event.key === "down")
              target =
                index < 0
                  ? enabled.find((t) => items.indexOf(t) >= window.end)
                  : enabled[Math.min(enabled.length - 1, index + 1)];
            if (target) {
              setActive(target.id);
              setPage(Math.floor(items.indexOf(target) / window.size));
              focusList();
              return;
            }
            if (event.key === "pageup" || event.key === "pagedown") {
              movePage(window.page + (event.key === "pageup" ? -1 : 1));
              return;
            }
            if (isActivation(event.key)) {
              if (!event.isHeld && current) choose(current);
              return;
            }
          }
          focus.onKeyDown(event);
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          flexShrink: 0,
          borderWidth: 1,
          borderRadius: 8,
          borderColor: focus.focused ? c.accent : c.border,
          padding: 3,
          gap: 3,
        }}
      >
        {invalid || error ? (
          <Text testId={testId + "-error"} size={11} color={c.danger} lines={2}>
            {invalid ?? error}
          </Text>
        ) : loading ? (
          <Text testId={testId + "-loading"} size={12} color={c.muted}>
            Loading suggestions…
          </Text>
        ) : !visible.length ? (
          <Text testId={testId + "-empty"} size={12} color={c.muted}>
            {emptyLabel}
          </Text>
        ) : (
          visible.map((item) => (
            <div
              key={item.id}
              testId={testId + "-item-" + item.id}
              tabIndex={-1}
              onClick={(event) => {
                if (event.button === undefined || event.button === 0)
                  choose(item);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                minWidth: 0,
                flexShrink: 0,
                padding: 7,
                borderRadius: 5,
                backgroundColor:
                  current?.id === item.id ? c.accentSoft : "transparent",
                opacity: item.disabled || disabled ? 0.45 : 1,
                cursor: readOnly || item.disabled ? "default" : "pointer",
              }}
            >
              <Text size={12} lines={1}>
                {item.label}
              </Text>
              {showDescriptions && item.description ? (
                <Text size={10} color={c.muted} lines={1}>
                  {item.description}
                </Text>
              ) : null}
            </div>
          ))
        )}
      </div>
      {error && !invalid && onRetry ? (
        <Button
          testId={testId + "-retry"}
          size="sm"
          disabled={disabled || loading}
          onPress={onRetry}
        >
          Retry
        </Button>
      ) : null}
      {!invalid && !loading && !error && window.pages > 1 ? (
        <Row style={{ justifyContent: "space-between" }}>
          <Button
            testId={testId + "-previous"}
            size="sm"
            disabled={disabled || window.page === 0}
            onPress={() => movePage(window.page - 1)}
          >
            Previous
          </Button>
          <Text testId={testId + "-page"} size={10}>
            {window.page + 1} / {window.pages}
          </Text>
          <Button
            testId={testId + "-next"}
            size="sm"
            disabled={disabled || window.page === window.pages - 1}
            onPress={() => movePage(window.page + 1)}
          >
            Next
          </Button>
        </Row>
      ) : null}
    </Stack>
  );
}
