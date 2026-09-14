import { useEffect, useRef, useState } from "react";
import { type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { Popover } from "../popover";
import {
  tokenConfigurationError,
  type Token,
  type TokenRules,
} from "../tags/model";
import { useTheme } from "../../core/theme";
import { TokenChooser } from "./combobox";
import { suggestionConfigurationError, type TokenSuggestion } from "./model";
export interface TokenPickerPanelProps extends TokenRules {
  value: readonly Token[];
  options: readonly TokenSuggestion[];
  onApply: (value: Token[]) => void;
  onCancel: () => void;
  testId: string;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  allowCreate?: boolean;
  title?: string;
}
export function TokenPickerPanel({
  value,
  options,
  onApply,
  onCancel,
  testId,
  disabled,
  readOnly,
  loading,
  error,
  onRetry,
  allowCreate,
  title = "Choose labels",
  ...rules
}: TokenPickerPanelProps) {
  const { colors: c } = useTheme(),
    [draft, setDraft] = useState<Token[]>(() => value.map((t) => ({ ...t }))),
    [query, setQuery] = useState("");
  const external = JSON.stringify(value),
    [source, setSource] = useState(external);
  // 外部值变化立即采用新快照，避免 effect 执行前提交旧草稿。
  const current = source === external ? draft : value;
  useEffect(() => {
    setSource(external);
    setDraft(value.map((t) => ({ ...t })));
    setQuery("");
  }, [external]);
  const invalid =
    tokenConfigurationError(current, rules) ??
    suggestionConfigurationError(options, rules);
  return (
    <Stack testId={testId} gap={8}>
      <Text size={13} weight={600}>
        {title}
      </Text>
      <TokenChooser
        {...rules}
        testId={testId + "-chooser"}
        value={current}
        onValueChange={setDraft}
        inputValue={query}
        onInputValueChange={setQuery}
        options={options}
        open
        onOpenChange={() => {}}
        disabled={disabled}
        readOnly={readOnly}
        loading={loading}
        error={error}
        onRetry={onRetry}
        allowCreate={allowCreate}
      />
      {invalid ? (
        <Text testId={testId + "-error"} size={11} color={c.danger}>
          {invalid}
        </Text>
      ) : null}
      <Row style={{ justifyContent: "flex-end" }}>
        <Button
          testId={testId + "-cancel"}
          size="sm"
          onPress={() => {
            setDraft(value.map((t) => ({ ...t })));
            setSource(external);
            setQuery("");
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button
          testId={testId + "-apply"}
          size="sm"
          variant="primary"
          disabled={disabled || readOnly || loading || !!error || !!invalid}
          onPress={() => {
            if (!disabled && !readOnly && !loading && !error && !invalid)
              onApply(current.map((t) => ({ ...t })));
          }}
        >
          Apply
        </Button>
      </Row>
    </Stack>
  );
}
export interface TokenPickerProps
  extends Omit<TokenPickerPanelProps, "onApply" | "onCancel"> {
  onValueChange: (value: Token[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label?: string;
  width?: number;
}
export function TokenPicker({
  onValueChange,
  open,
  onOpenChange,
  label = "Choose labels",
  width = 400,
  ...props
}: TokenPickerProps) {
  const trigger = useRef<PublicInstance>(null),
    blocked = props.disabled || props.readOnly;
  const size = Number.isFinite(width)
    ? Math.max(260, Math.min(480, width))
    : 400;
  return (
    <Popover
      testId={props.testId + "-popup"}
      open={open && !blocked}
      onOpenChange={onOpenChange}
      restoreFocusRef={trigger}
      width={size}
      anchor={
        <Button
          ref={trigger}
          testId={props.testId + "-trigger"}
          disabled={blocked}
          onPress={() => onOpenChange(!open)}
        >
          {label + " (" + props.value.length + ")"}
        </Button>
      }
    >
      <TokenPickerPanel
        {...props}
        testId={props.testId + "-panel"}
        onApply={(value) => {
          onValueChange(value);
          onOpenChange(false);
        }}
        onCancel={() => onOpenChange(false)}
      />
    </Popover>
  );
}
