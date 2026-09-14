import { useState } from "react";
import { Button, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { NumberField } from "../value-input";
import { ColorField } from "../color";
import {
  gradientError,
  gradientAt,
  type GradientValue,
  bounded,
} from "../catalog-model";
export type { GradientValue, GradientStop } from "../catalog-model";
export { gradientError, gradientAt } from "../catalog-model";
export function GradientPreview({
  value,
  width = 280,
  height = 60,
  testId,
}: {
  value: GradientValue;
  width?: number;
  height?: number;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    w = bounded(width, 80, 1000),
    h = bounded(height, 24, 300);
  if (gradientError(value))
    return (
      <Text color={c.danger} testId={testId + "-error"}>
        Invalid gradient
      </Text>
    );
  // 宿主只支持双停靠线性背景；多停靠用同色空间的原生小段组成。
  const stops = [...value.stops].sort((a, b) => a.position - b.position),
    radians = (value.angle * Math.PI) / 180,
    dx = Math.sin(radians),
    dy = -Math.cos(radians),
    extent = Math.abs(dx) * w + Math.abs(dy) * h;
  const tiles = Array.from({ length: 24 * 8 }, (_, i) => {
    const x = i % 24,
      y = Math.floor(i / 24),
      t =
        0.5 +
        (((x + 0.5) / 24 - 0.5) * w * dx + ((y + 0.5) / 8 - 0.5) * h * dy) /
          extent;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: (x * w) / 24,
          top: (y * h) / 8,
          width: w / 24 + 1,
          height: h / 8 + 1,
          background: {
            type: "linear-gradient",
            angle: value.angle,
            colorSpace: "srgb",
            stops: [
              {
                position: 0,
                color: gradientAt(
                  { ...value, stops },
                  bounded(
                    t -
                      ((Math.abs(dx) * w) / 24 + (Math.abs(dy) * h) / 8) /
                        extent /
                        2,
                    0,
                    1,
                  ),
                ),
              },
              {
                position: 1,
                color: gradientAt(
                  { ...value, stops },
                  bounded(
                    t +
                      ((Math.abs(dx) * w) / 24 + (Math.abs(dy) * h) / 8) /
                        extent /
                        2,
                    0,
                    1,
                  ),
                ),
              },
            ],
          },
        }}
      />
    );
  });
  return (
    <div
      testId={testId}
      style={{
        width: w,
        height: h,
        position: "relative",
        overflow: "hidden",
        borderRadius: 8,
      }}
    >
      {tiles}
    </div>
  );
}
function StopColor({
  value,
  onCommit,
  disabled,
  testId,
}: {
  value: string;
  onCommit: (color: string) => void;
  disabled?: boolean;
  testId: string;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <ColorField
      testId={testId}
      value={draft}
      disabled={disabled}
      onValueChange={setDraft}
      onValueCommit={onCommit}
    />
  );
}
export function GradientPicker({
  value,
  onValueChange,
  disabled,
  testId,
}: {
  value: GradientValue;
  onValueChange: (value: GradientValue) => void;
  disabled?: boolean;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    [selected, setSelected] = useState(value.stops[0]?.id ?? ""),
    error = gradientError(value),
    active = value.stops.find((s) => s.id === selected) ?? value.stops[0];
  if (error || !active)
    return (
      <Text testId={testId + "-error"} color={c.danger}>
        {error ?? "No stops"}
      </Text>
    );
  const change = (patch: Partial<typeof active>) =>
    onValueChange({
      ...value,
      stops: value.stops.map((s) =>
        s.id === active.id ? { ...s, ...patch } : { ...s },
      ),
    });
  return (
    <Stack testId={testId}>
      <GradientPreview value={value} testId={testId + "-preview"} />
      <Row style={{ flexWrap: "wrap" }}>
        {value.stops.map((s) => (
          <Button
            key={s.id}
            size="sm"
            testId={testId + "-stop-" + s.id}
            variant={active.id === s.id ? "secondary" : "ghost"}
            onPress={() => setSelected(s.id)}
          >
            {Math.round(s.position * 100)}%
          </Button>
        ))}
      </Row>
      <Text size={12}>Angle</Text>
      <NumberField
        testId={testId + "-angle"}
        value={value.angle}
        min={0}
        max={360}
        disabled={disabled}
        onValueChange={(angle) => onValueChange({ ...value, angle })}
      />
      <Text size={12}>Position</Text>
      <NumberField
        testId={testId + "-position"}
        value={active.position * 100}
        min={0}
        max={100}
        disabled={disabled}
        onValueChange={(n) => change({ position: n / 100 })}
      />
      <StopColor
        key={active.id + active.color}
        testId={testId + "-color"}
        value={active.color}
        disabled={disabled}
        onCommit={(color) => change({ color })}
      />
      <Row>
        <Button
          testId={testId + "-add"}
          disabled={disabled || value.stops.length >= 8}
          onPress={() => {
            let i = 1;
            while (value.stops.some((s) => s.id === "stop-" + i)) i++;
            const id = "stop-" + i;
            onValueChange({
              ...value,
              stops: [
                ...value.stops,
                { id, position: 0.5, color: gradientAt(value, 0.5) },
              ],
            });
            setSelected(id);
          }}
        >
          Add stop
        </Button>
        <Button
          testId={testId + "-remove"}
          disabled={disabled || value.stops.length <= 2}
          onPress={() => {
            onValueChange({
              ...value,
              stops: value.stops.filter((s) => s.id !== active.id),
            });
            setSelected(value.stops.find((s) => s.id !== active.id)!.id);
          }}
        >
          Remove
        </Button>
      </Row>
    </Stack>
  );
}

export type GradientPreviewProps = Parameters<typeof GradientPreview>[0];

export type GradientPickerProps = Parameters<typeof GradientPicker>[0];
