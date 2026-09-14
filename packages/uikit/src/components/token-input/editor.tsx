import { useEffect, useRef, useState } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { Tag } from "../tags";
import { tokenConfigurationError } from "../tags/model";
import { focusElement, useFocusTarget } from "../../core/focus";
import { useTheme } from "../../core/theme";
import { TokenInput } from "./input";
import {
  renameToken,
  clearRemovableTokens,
  tokenPage,
  type EditableToken,
  type TokenEditRules,
} from "./model";
export interface EditableTagProps extends TokenEditRules {
  token: EditableToken;
  peers?: readonly EditableToken[];
  onTokenChange: (token: EditableToken) => void;
  onRemove?: () => void;
  testId: string;
  disabled?: boolean;
  readOnly?: boolean;
}
export function EditableTag({
  token,
  peers,
  onTokenChange,
  onRemove,
  testId,
  disabled,
  readOnly,
  ...rules
}: EditableTagProps) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix(),
    edit = useRef<PublicInstance>(null),
    input = useRef<PublicInstance>(null);
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(token.label),
    [error, setError] = useState<string | null>(null);
  const identity = JSON.stringify([
    token.id,
    token.label,
    token.disabled,
    token.editable,
    token.removable,
  ]);
  const value = peers ?? [token],
    invalid = tokenConfigurationError(value, rules);
  const blocked =
    disabled ||
    readOnly ||
    token.disabled ||
    token.editable === false ||
    !!invalid;
  const editingIdentity = useRef<string | null>(null);
  const activeEdit =
    editing && editingIdentity.current === identity && !blocked;
  useEffect(() => {
    if (editing && !blocked && edit.current)
      focusElement(renderer, edit.current.id);
    setEditing(false);
    setDraft(token.label);
    setError(null);
  }, [identity]);
  useEffect(() => {
    if (blocked) setEditing(false);
  }, [blocked]);
  useEffect(() => {
    if (activeEdit && input.current) focusElement(renderer, input.current.id);
  }, [activeEdit, renderer]);
  const finish = () => {
    setEditing(false);
    setError(null);
    if (edit.current && !blocked) focusElement(renderer, edit.current.id);
  };
  const save = () => {
    if (blocked || !activeEdit) return;
    const result = renameToken(value, token.id, draft, rules);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    const next = result.value.find((t) => t.id === token.id)!;
    if (next.label !== token.label) onTokenChange(next);
    finish();
  };
  return (
    <Stack testId={testId} gap={6}>
      <Row gap={6} style={{ justifyContent: "space-between" }}>
        <Tag
          testId={testId + "-tag"}
          label={token.label}
          disabled={disabled || token.disabled}
          readOnly={readOnly || activeEdit}
          maxWidth={250}
          onRemove={
            onRemove && token.removable !== false
              ? () => {
                  if (!disabled && !readOnly && !activeEdit && !token.disabled)
                    onRemove();
                }
              : undefined
          }
        />
        <Button
          ref={edit}
          testId={testId + "-edit"}
          size="sm"
          variant="ghost"
          disabled={blocked || activeEdit}
          onPress={() => {
            editingIdentity.current = identity;
            setDraft(token.label);
            setError(null);
            setEditing(true);
          }}
        >
          Edit
        </Button>
      </Row>
      {activeEdit ? (
        <Stack gap={5}>
          <TokenInput
            ref={input}
            testId={testId + "-input"}
            value={draft}
            onValueChange={(v) => {
              setDraft(v);
              setError(null);
            }}
            invalid={!!error}
            onSubmit={save}
            onKeyDown={(e) => {
              if (e.key === "escape") {
                finish();
                return true;
              }
              return false;
            }}
          />
          <Row style={{ justifyContent: "flex-end" }}>
            <Button testId={testId + "-cancel"} size="sm" onPress={finish}>
              Cancel
            </Button>
            <Button
              testId={testId + "-save"}
              size="sm"
              variant="primary"
              onPress={save}
            >
              Save
            </Button>
          </Row>
        </Stack>
      ) : null}
      {invalid || error ? (
        <Text testId={testId + "-error"} size={11} color={c.danger} lines={2}>
          {invalid ?? error}
        </Text>
      ) : null}
    </Stack>
  );
}
export interface TokenEditorProps extends TokenEditRules {
  value: readonly EditableToken[];
  onValueChange: (value: EditableToken[]) => void;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  testId: string;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  label?: string;
  allowClear?: boolean;
}
export function TokenEditor({
  value,
  onValueChange,
  page,
  onPageChange,
  pageSize = 4,
  testId,
  disabled,
  readOnly,
  loading,
  label = "Manage labels",
  allowClear = true,
  ...rules
}: TokenEditorProps) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix(),
    previous = useRef<PublicInstance>(null),
    next = useRef<PublicInstance>(null),
    clear = useRef<PublicInstance>(null);
  const root = useRef<PublicInstance>(null);
  const rootFocus = useFocusTarget(Boolean(disabled), root);
  const restore = () => {
    if (root.current && !disabled) focusElement(renderer, root.current.id);
  };
  const invalid = tokenConfigurationError(value, rules),
    window = tokenPage(page, pageSize, value.length),
    blocked = disabled || readOnly || loading || !!invalid;
  const retained = clearRemovableTokens(value);
  const remove = (id: string) => {
    if (blocked) return;
    const token = value.find((t) => t.id === id);
    if (!token || token.disabled || token.removable === false) return;
    restore();
    onValueChange(value.filter((t) => t.id !== id));
  };
  return (
    <div
      testId={testId}
      ref={rootFocus.ref}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={rootFocus.onKeyDown}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 0,
        flexShrink: 0,
      }}
    >
      <Row style={{ justifyContent: "space-between" }}>
        <Text size={13} weight={600}>
          {label}
        </Text>
        <Text testId={testId + "-count"} size={11} color={c.muted}>
          {value.length} labels
        </Text>
      </Row>
      {invalid ? (
        <Text testId={testId + "-error"} color={c.danger} size={11}>
          {invalid}
        </Text>
      ) : loading ? (
        <Text testId={testId + "-loading"} size={12}>
          Loading labels…
        </Text>
      ) : !value.length ? (
        <Text testId={testId + "-empty"} size={12} color={c.muted}>
          No labels.
        </Text>
      ) : (
        value.slice(window.start, window.end).map((token) => (
          <EditableTag
            key={token.id}
            {...rules}
            token={token}
            peers={value}
            testId={testId + "-token-" + token.id}
            disabled={disabled}
            readOnly={readOnly}
            onTokenChange={(updated) => {
              if (!blocked)
                onValueChange(
                  value.map((t) => (t.id === updated.id ? updated : t)),
                );
            }}
            onRemove={() => remove(token.id)}
          />
        ))
      )}
      {!invalid && !loading && window.pages > 1 ? (
        <Row style={{ justifyContent: "space-between" }}>
          <Button
            ref={previous}
            testId={testId + "-previous"}
            size="sm"
            disabled={disabled || window.page === 0}
            onPress={() => onPageChange(window.page - 1)}
          >
            Previous
          </Button>
          <Text testId={testId + "-page"} size={10}>
            {window.page + 1} / {window.pages}
          </Text>
          <Button
            ref={next}
            testId={testId + "-next"}
            size="sm"
            disabled={disabled || window.page === window.pages - 1}
            onPress={() => onPageChange(window.page + 1)}
          >
            Next
          </Button>
        </Row>
      ) : null}
      {allowClear ? (
        <Button
          ref={clear}
          testId={testId + "-clear"}
          size="sm"
          variant="ghost"
          disabled={blocked || retained.length === value.length}
          onPress={() => {
            if (!blocked) {
              restore();
              onValueChange(retained);
            }
          }}
        >
          Clear removable
        </Button>
      ) : null}
    </div>
  );
}
