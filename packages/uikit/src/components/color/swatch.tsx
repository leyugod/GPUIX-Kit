import { useRef } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { focusElement } from "../../core/focus";
import { Button, Row, Text, type ControlRef } from "../../base";
import { useTheme } from "../../core/theme";
import { compositeColor, parseHexColor } from "./model";
export interface ColorSwatchProps {
  value: string | null;
  testId: string;
  size?: number;
}
export function ColorSwatch({ value, testId, size = 28 }: ColorSwatchProps) {
  const { colors: c } = useTheme();
  const length = Number.isFinite(size) ? Math.max(16, Math.min(96, size)) : 28;
  const parsed = value === null ? null : parseHexColor(value);
  return (
    <div
      testId={testId}
      style={{
        position: "relative",
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        width: length,
        height: length,
        flexShrink: 0,
        borderRadius: 4,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: c.borderStrong,
        backgroundColor: c.subtle,
      }}
    >
      {parsed ? (
        Array.from({ length: 4 }, (_, row) => (
          <Row key={row} gap={0} style={{ height: (length - 2) / 4 }}>
            {Array.from({ length: 4 }, (_, column) => (
              <div
                key={column}
                style={{
                  width: (length - 2) / 4,
                  height: (length - 2) / 4,
                  backgroundColor: compositeColor(
                    parsed,
                    (row + column) % 2 ? "#B8BDC7" : "#FFFFFF",
                  )!,
                }}
              />
            ))}
          </Row>
        ))
      ) : (
        <Text
          testId={testId + "-status"}
          lines={1}
          size={12}
          color={value === null ? c.muted : c.danger}
          style={{ textAlign: "center" }}
        >
          {value === null ? "—" : "?"}
        </Text>
      )}
    </div>
  );
}
export interface ColorWellProps extends ColorSwatchProps {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  ref?: ControlRef;
  onKeyDown?: Parameters<typeof Button>[0]["onKeyDown"];
}
/** ColorWell 只发出打开意图；应用可组合弹层、对话框或自有面板。 */
export function ColorWell({
  value,
  testId,
  size = 22,
  label,
  disabled,
  readOnly,
  ref,
  onPress,
  onKeyDown,
}: ColorWellProps) {
  const node = useRef<PublicInstance>(null);
  const { renderer } = useGpuix();
  const blocked = disabled || readOnly;
  return (
    <Button
      ref={(instance) => {
        node.current = instance;
        if (typeof ref === "function") ref(instance);
        else if (ref) ref.current = instance;
      }}
      testId={testId}
      disabled={disabled || readOnly}
      onPress={onPress}
      onKeyDown={onKeyDown}
      labelLines={1}
      style={{ maxWidth: 280, position: "relative" }}
      trailing={
        <div
          testId={testId + "-hit"}
          onMouseDown={() => {
            if (!blocked && node.current)
              focusElement(renderer, node.current.id);
          }}
          onClick={(event) => {
            if (!blocked && (event.button === undefined || event.button === 0))
              onPress();
          }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
            pointerEvents: "auto",
          }}
        />
      }
      leading={
        <ColorSwatch
          testId={testId + "-swatch"}
          value={value}
          size={Number.isFinite(size) ? Math.max(16, Math.min(24, size)) : 22}
        />
      }
    >
      {label ?? value ?? "No color"}
    </Button>
  );
}
