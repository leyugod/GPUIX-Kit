import { useEffect, useState } from "react";
import { Button, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import {
  bounded,
  radarError,
  radarPoints,
  type RadarAxis,
  type RadarSeries,
} from "../catalog-model";
export type { RadarAxis, RadarSeries } from "../catalog-model";
export { radarError, radarPoints } from "../catalog-model";
const timers = globalThis as unknown as {
  setInterval: (callback: () => void, ms: number) => unknown;
  clearInterval: (handle: unknown) => void;
};
export function LoadingIndicator({
  label = "Loading",
  active = true,
  reducedMotion = false,
  testId,
}: {
  label?: string;
  active?: boolean;
  reducedMotion?: boolean;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active || reducedMotion) return;
    const timer = timers.setInterval(() => setTick((n) => (n + 1) % 8), 100);
    return () => timers.clearInterval(timer);
  }, [active, reducedMotion]);
  if (!active) return null;
  return (
    <Row testId={testId}>
      <div style={{ width: 28, height: 28, position: "relative" }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            testId={testId + "-dot-" + i}
            style={{
              position: "absolute",
              left: 11 + Math.cos((i * Math.PI) / 4) * 10,
              top: 11 + Math.sin((i * Math.PI) / 4) * 10,
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: c.accent,
              opacity: reducedMotion ? 1 : 0.2 + ((i - tick + 8) % 8) / 10,
            }}
          />
        ))}
      </div>
      <Text size={12} color={c.muted}>
        {label}
      </Text>
    </Row>
  );
}
export function ActivityGauge({
  value,
  max = 100,
  label,
  testId,
}: {
  value: number;
  max?: number;
  label: string;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    fraction = max > 0 ? bounded(value / max, 0, 1) : 0;
  return (
    <Stack testId={testId} gap={6}>
      <div style={{ width: 200, height: 116, position: "relative" }}>
        <svg
          testId={testId + "-track"}
          source={
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="116"><path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="currentColor" stroke-width="14"/></svg>'
          }
          style={{
            position: "absolute",
            width: 200,
            height: 116,
            color: c.border,
          }}
        />
        <svg
          testId={testId + "-arc"}
          source={
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="116"><path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="currentColor" stroke-width="14" stroke-dasharray="' +
            fraction * Math.PI * 80 +
            " " +
            Math.PI * 80 +
            '"/></svg>'
          }
          style={{
            position: "absolute",
            width: 200,
            height: 116,
            color: c.accent,
          }}
        />
      </div>
      <Text weight={600}>
        {Math.round(fraction * 100)}% · {label}
      </Text>
    </Stack>
  );
}
export function RadarChart({
  axes,
  series,
  hiddenIds = [],
  onHiddenChange,
  size = 240,
  testId,
}: {
  axes: readonly RadarAxis[];
  series: readonly RadarSeries[];
  hiddenIds?: readonly string[];
  onHiddenChange?: (ids: string[]) => void;
  size?: number;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    error = radarError(axes, series),
    n = bounded(size, 160, 480),
    r = (n - 30) / 2,
    palette = [c.accent, c.success, c.warning, c.danger, c.muted, c.primary];
  if (error)
    return (
      <Text color={c.danger} testId={testId + "-error"}>
        {error}
      </Text>
    );
  const points = (values: readonly number[]) =>
    radarPoints(axes, values, r)
      .map((p) => p.join(","))
      .join(" ");
  const grid = [0.25, 0.5, 0.75, 1]
    .map(
      (f) =>
        '<polygon points="' +
        points(axes.map((a) => a.max * f)) +
        '" fill="none" stroke="' +
        c.border +
        '"/>',
    )
    .join("");
  const lines = radarPoints(
    axes,
    axes.map((a) => a.max),
    r,
  )
    .map(
      (p) =>
        '<path d="M' +
        r +
        " " +
        r +
        "L" +
        p[0] +
        " " +
        p[1] +
        '" stroke="' +
        c.border +
        '"/>',
    )
    .join("");
  return (
    <Stack testId={testId}>
      <div
        testId={testId + "-plot"}
        style={{ width: n, height: n, position: "relative" }}
      >
        <svg
          testId={testId + "-grid"}
          source={
            '<svg xmlns="http://www.w3.org/2000/svg" width="' +
            n +
            '" height="' +
            n +
            '"><g transform="translate(15 15)">' +
            grid +
            lines +
            "</g></svg>"
          }
          style={{ width: n, height: n, position: "absolute", color: c.border }}
        />
        {series
          .filter((s) => !hiddenIds.includes(s.id))
          .map((s) => (
            <div
              key={s.id}
              style={{ position: "absolute", width: n, height: n }}
            >
              <svg
                testId={testId + "-area-" + s.id}
                source={
                  '<svg xmlns="http://www.w3.org/2000/svg" width="' +
                  n +
                  '" height="' +
                  n +
                  '"><polygon transform="translate(15 15)" points="' +
                  points(s.values) +
                  '" fill="currentColor"/></svg>'
                }
                style={{
                  width: n,
                  height: n,
                  position: "absolute",
                  color: palette[series.indexOf(s)],
                  opacity: 0.12,
                }}
              />
              <svg
                testId={testId + "-line-" + s.id}
                source={
                  '<svg xmlns="http://www.w3.org/2000/svg" width="' +
                  n +
                  '" height="' +
                  n +
                  '"><polygon transform="translate(15 15)" points="' +
                  points(s.values) +
                  '" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
                }
                style={{
                  width: n,
                  height: n,
                  position: "absolute",
                  color: palette[series.indexOf(s)],
                }}
              />
            </div>
          ))}
      </div>
      {!series.length ? <Text color={c.muted}>No data</Text> : null}
      <Row style={{ flexWrap: "wrap" }}>
        {series.map((s) => (
          <Button
            key={s.id}
            testId={testId + "-series-" + s.id}
            leading={
              <Text color={palette[series.indexOf(s)]}>
                {hiddenIds.includes(s.id) ? "○" : "●"}
              </Text>
            }
            disabled={!onHiddenChange}
            variant="ghost"
            onPress={() =>
              onHiddenChange?.(
                hiddenIds.includes(s.id)
                  ? hiddenIds.filter((id) => id !== s.id)
                  : [...hiddenIds, s.id],
              )
            }
          >
            {s.label}
          </Button>
        ))}
      </Row>
      {axes.map((a, i) => (
        <Row key={a.id}>
          <Text size={11} style={{ width: 100 }}>
            {a.label}
          </Text>
          <Text size={11}>
            {series
              .filter((s) => !hiddenIds.includes(s.id))
              .map((s) => s.label + ": " + s.values[i] + "/" + a.max)
              .join(" · ")}
          </Text>
        </Row>
      ))}
    </Stack>
  );
}

export type LoadingIndicatorProps = Parameters<typeof LoadingIndicator>[0];

export type ActivityGaugeProps = Parameters<typeof ActivityGauge>[0];

export type RadarChartProps = Parameters<typeof RadarChart>[0];
