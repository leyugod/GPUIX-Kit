import { useEffect, useRef, useState } from "react";
import { type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { SegmentedControl } from "../../layout";
import { Slider } from "../slider";
import { Popover } from "../popover";
import { ColorWell } from "./swatch";
import { ColorField } from "./field";
import { ColorPalette } from "./palette";
import {
  normalizeHexColor,
  parseHexColor,
  setColorChannel,
  type PaletteColor,
  type ColorChannel,
} from "./model";
export {
  ColorSwatch,
  ColorWell,
  type ColorSwatchProps,
  type ColorWellProps,
} from "./swatch";
export { ColorField, type ColorFieldProps } from "./field";
export { ColorPalette, type ColorPaletteProps } from "./palette";
export {
  parseHexColor,
  formatHexColor,
  normalizeHexColor,
  defaultPalette,
  type RGBAColor,
  type ColorChannel,
  type PaletteColor,
} from "./model";
export interface ColorPanelProps {
  /** 文本编辑时可为未完成草稿；通道和调色板发出规范化颜色。 */
  value: string;
  onValueChange: (raw: string) => void;
  onValueCommit?: (color: string) => void;
  testId: string;
  items?: readonly PaletteColor[];
  disabled?: boolean;
  readOnly?: boolean;
  allowAlpha?: boolean;
}
export function ColorPanel({
  value,
  onValueChange,
  onValueCommit,
  testId,
  items,
  disabled,
  readOnly,
  allowAlpha = true,
}: ColorPanelProps) {
  const [page, setPage] = useState("channels");
  const parsed = parseHexColor(value, allowAlpha);
  const channels: ColorChannel[] = allowAlpha
    ? ["r", "g", "b", "a"]
    : ["r", "g", "b"];
  // 保留隐藏视图的组件身份以维持弹层 Tab 顺序；隐藏控件不注册焦点。
  return (
    <Stack testId={testId} gap={6} style={{ width: 280, maxWidth: "100%" }}>
      <ColorField
        testId={testId + "-hex"}
        value={value}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
        disabled={disabled}
        readOnly={readOnly}
        allowAlpha={allowAlpha}
      />
      <SegmentedControl
        testId={testId + "-mode"}
        value={page}
        onValueChange={(v) => {
          setPage(v);
        }}
        disabled={disabled}
        options={[
          { value: "channels", label: "Channels" },
          { value: "palette", label: "Palette" },
        ]}
      />
      <Stack
        gap={0}
        style={{
          height: page === "channels" ? undefined : 0,
          maxHeight: page === "channels" ? undefined : 0,
          overflow: "hidden",
        }}
      >
        {channels.map((channel) => (
          <Row key={channel} gap={4}>
            <Text size={11} style={{ width: 14 }}>
              {channel.toUpperCase()}
            </Text>
            <Slider
              testId={testId + "-" + channel}
              value={parsed?.[channel] ?? 0}
              min={0}
              max={255}
              step={1}
              length={210}
              showValue={false}
              disabled={disabled || page !== "channels" || !parsed}
              readOnly={readOnly}
              onValueChange={(next) => {
                const color = setColorChannel(value, channel, next);
                if (color) onValueChange(color);
              }}
              onValueCommit={(next) => {
                const color = setColorChannel(value, channel, next);
                if (color) onValueCommit?.(color);
              }}
            />
            <Text
              testId={testId + "-" + channel + "-value"}
              size={11}
              style={{ width: 28, textAlign: "right" }}
            >
              {parsed?.[channel] ?? "—"}
            </Text>
          </Row>
        ))}
      </Stack>
      <Stack
        gap={0}
        style={{
          height: page === "palette" ? undefined : 0,
          maxHeight: page === "palette" ? undefined : 0,
          overflow: "hidden",
        }}
      >
        <ColorPalette
          testId={testId + "-palette"}
          value={value}
          items={items}
          columns={6}
          allowAlpha={allowAlpha}
          disabled={disabled || page !== "palette"}
          readOnly={readOnly}
          onValueChange={(color) => {
            onValueChange(color);
            onValueCommit?.(color);
          }}
        />
      </Stack>
    </Stack>
  );
}
export interface ColorPickerProps {
  value: string | null;
  onValueChange: (color: string | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId: string;
  label?: string;
  items?: readonly PaletteColor[];
  allowAlpha?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}
export function ColorPicker({
  value,
  onValueChange,
  open,
  onOpenChange,
  testId,
  label,
  items,
  allowAlpha = true,
  clearable = false,
  disabled,
  readOnly,
}: ColorPickerProps) {
  const trigger = useRef<PublicInstance>(null);
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => setDraft(value ?? ""), [value, open]);
  const normalized = normalizeHexColor(draft, allowAlpha);
  return (
    <Popover
      testId={testId + "-popup"}
      width={300}
      open={open && !disabled && !readOnly}
      onOpenChange={onOpenChange}
      restoreFocusRef={trigger}
      anchor={
        <ColorWell
          ref={trigger}
          value={value}
          testId={testId + "-trigger"}
          label={label}
          disabled={disabled}
          readOnly={readOnly}
          onPress={() => onOpenChange(!open)}
          onKeyDown={(event) => {
            if (event.key === "down" && !event.isHeld) {
              onOpenChange(true);
              return true;
            }
            return false;
          }}
        />
      }
    >
      <ColorPanel
        testId={testId + "-panel"}
        value={draft}
        onValueChange={setDraft}
        items={items}
        allowAlpha={allowAlpha}
      />
      <Row style={{ justifyContent: "flex-end" }}>
        {clearable ? (
          <Button
            testId={testId + "-clear"}
            size="sm"
            variant="ghost"
            disabled={value === null}
            onPress={() => {
              onValueChange(null);
              onOpenChange(false);
            }}
          >
            Clear
          </Button>
        ) : null}
        <Button
          testId={testId + "-cancel"}
          size="sm"
          variant="ghost"
          onPress={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          testId={testId + "-apply"}
          size="sm"
          variant="primary"
          disabled={!normalized}
          onPress={() => {
            if (normalized) {
              onValueChange(normalized);
              onOpenChange(false);
            }
          }}
        >
          Apply
        </Button>
      </Row>
    </Popover>
  );
}
