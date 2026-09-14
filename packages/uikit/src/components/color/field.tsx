import { useRef, useState } from "react";
import { Input, Row, Stack, Text, type ControlRef } from "../../base";
import { useTheme } from "../../core/theme";
import { ColorSwatch } from "./swatch";
import { normalizeHexColor } from "./model";
export interface ColorFieldProps {
  value: string;
  onValueChange: (raw: string) => void;
  onValueCommit?: (color: string) => void;
  testId: string;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  allowAlpha?: boolean;
  ref?: ControlRef;
}
export function ColorField({
  value,
  onValueChange,
  onValueCommit,
  testId,
  label,
  disabled,
  readOnly,
  allowAlpha = true,
  ref,
}: ColorFieldProps) {
  const { colors: c } = useTheme();
  const normalized = normalizeHexColor(value, allowAlpha);
  const [revision, setRevision] = useState(0);
  const tab = useRef<object | null>(null);
  return (
    <Stack testId={testId + "-field"} gap={4}>
      {label ? (
        <Text size={12} weight={500}>
          {label}
        </Text>
      ) : null}
      <Row gap={8}>
        <ColorSwatch
          value={value || null}
          testId={testId + "-preview"}
          size={28}
        />
        <Input
          ref={ref}
          testId={testId}
          value={value}
          resetKey={revision}
          placeholder={allowAlpha ? "#RRGGBB or #RRGGBBAA" : "#RRGGBB"}
          disabled={disabled}
          readOnly={readOnly}
          invalid={Boolean(value && !normalized)}
          style={{ width: undefined, flexGrow: 1, flexShrink: 1 }}
          onValueChange={(raw) => {
            // 与 TimeField 相同：抑制宿主 Tab 插入，保留组件焦点注册顺序。
            if (tab.current) {
              tab.current = null;
              setRevision((n) => n + 1);
              return;
            }
            onValueChange(raw);
          }}
          onSubmit={() => {
            if (!disabled && !readOnly && normalized)
              onValueCommit?.(normalized);
          }}
          onKeyDown={(event) => {
            if (event.key === "tab") {
              const pending = {};
              tab.current = pending;
              void Promise.resolve().then(() => {
                if (tab.current === pending) tab.current = null;
              });
            }
            return false;
          }}
        />
      </Row>
      {value && !normalized ? (
        <Text testId={testId + "-error"} size={11} color={c.danger}>
          {allowAlpha
            ? "Enter a valid hex color."
            : "Enter an opaque hex color."}
        </Text>
      ) : null}
    </Stack>
  );
}
