import { useState } from "react";
import { Button, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { useFocusTarget } from "../../core/focus";
import {
  chartDomain,
  chartY,
  categoryX,
  lineSegments,
  validateChart,
  chartColor,
  pieModel,
  arcPath,
  type ChartCategory,
  type ChartSeries,
  type ChartDatum,
} from "./model";
export interface CartesianChartProps {
  categories: readonly ChartCategory[];
  series: readonly ChartSeries[];
  variant?: "line" | "area" | "bar" | "stacked-bar";
  width?: number;
  height?: number;
  hiddenSeriesIds?: readonly string[];
  onHiddenSeriesChange?: (ids: string[]) => void;
  activeIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  onActivate?: (category: ChartCategory) => void;
  formatValue?: (value: number) => string;
  loading?: boolean;
  emptyLabel?: string;
  testId: string;
}
const source = (width: number, height: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
function Shape({
  body,
  width,
  height,
  color,
  opacity = 1,
  testId,
}: {
  body: string;
  width: number;
  height: number;
  color: string;
  opacity?: number;
  testId?: string;
}) {
  return (
    <svg
      source={source(width, height, body)}
      testId={testId}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        color,
        opacity,
      }}
    />
  );
}
export function CartesianChart({
  categories,
  series,
  variant = "line",
  width: requestedWidth = 520,
  height: requestedHeight = 220,
  hiddenSeriesIds = [],
  onHiddenSeriesChange,
  activeIndex,
  onActiveIndexChange,
  onActivate,
  formatValue = (n) =>
    Math.abs(n) >= 1e6
      ? n.toExponential(1)
      : Number(n.toPrecision(4)).toString(),
  loading = false,
  emptyLabel = "No chart data",
  testId,
}: CartesianChartProps) {
  const widthValid =
      Number.isFinite(requestedWidth) &&
      requestedWidth >= 160 &&
      requestedWidth <= 4096,
    heightValid =
      Number.isFinite(requestedHeight) &&
      requestedHeight >= 108 &&
      requestedHeight <= 2048;
  const width = widthValid ? requestedWidth : 520,
    height = heightValid ? requestedHeight : 220;
  const { colors: c } = useTheme();
  const focus = useFocusTarget(loading);
  const [local, setLocal] = useState<number | null>(null);
  const error =
    !widthValid || !heightValid
      ? "Chart dimensions are outside the supported range."
      : validateChart(categories, series);
  const visible = series.filter((s) => !hiddenSeriesIds.includes(s.id));
  const domain = error
    ? { min: 0, max: 1 }
    : chartDomain(visible, variant === "stacked-bar");
  const plotWidth = Math.max(100, width - 58),
    plotHeight = Math.max(80, height - 28);
  const palette = [c.accent, c.success, c.warning, c.danger, c.muted];
  const raw = activeIndex === undefined ? local : activeIndex;
  const selected =
    raw !== null && Number.isInteger(raw) && raw >= 0 && raw < categories.length
      ? raw
      : null;
  const select = (index: number | null) => {
    setLocal(index);
    onActiveIndexChange?.(index);
  };
  const noData =
    !categories.length ||
    !visible.some((s) => s.values.some((v) => v !== null));
  const cellWidth = plotWidth / Math.max(1, categories.length);
  const baseline = chartY(0, domain, plotHeight);
  return (
    <Stack testId={testId} gap={8} style={{ width, minWidth: 0 }}>
      <Row gap={6} style={{ flexWrap: "wrap" }}>
        {series.map((s, index) =>
          onHiddenSeriesChange ? (
            <Button
              key={s.id}
              testId={`${testId}-legend-${s.id}`}
              size="sm"
              variant="ghost"
              disabled={loading}
              leading={
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: chartColor(
                      s.color,
                      palette[index % palette.length]!,
                    ),
                  }}
                />
              }
              onPress={() =>
                onHiddenSeriesChange(
                  hiddenSeriesIds.includes(s.id)
                    ? hiddenSeriesIds.filter((id) => id !== s.id)
                    : [...hiddenSeriesIds, s.id],
                )
              }
              style={{ opacity: hiddenSeriesIds.includes(s.id) ? 0.45 : 1 }}
            >
              {s.label}
            </Button>
          ) : (
            <Row key={s.id}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: chartColor(
                    s.color,
                    palette[index % palette.length]!,
                  ),
                }}
              />
              <Text size={11} color={c.muted}>
                {s.label}
              </Text>
            </Row>
          ),
        )}
      </Row>
      {loading || error || noData ? (
        <Stack
          testId={`${testId}-${loading ? "loading" : error ? "error" : "empty"}`}
          style={{
            height,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 8,
          }}
        >
          <Text size={12} color={error ? c.danger : c.muted}>
            {loading ? "Loading chart…" : (error ?? emptyLabel)}
          </Text>
        </Stack>
      ) : (
        <div
          ref={focus.ref}
          testId={`${testId}-plot`}
          tabIndex={0}
          onMouseDown={focus.onMouseDown}
          onKeyDown={(event) => {
            if (event.key === "escape" && selected !== null) {
              select(null);
              return;
            }
            focus.onKeyDown(event);
            if (event.key === "left" || event.key === "right") {
              select(
                selected === null
                  ? event.key === "right"
                    ? 0
                    : categories.length - 1
                  : Math.min(
                      categories.length - 1,
                      Math.max(0, selected + (event.key === "right" ? 1 : -1)),
                    ),
              );
            }
            if (event.key === "home") select(0);
            if (event.key === "end") select(categories.length - 1);
            if (event.key === "enter" && !event.isHeld && selected !== null)
              onActivate?.(categories[selected]!);
          }}
          style={{
            position: "relative",
            width,
            height,
            borderWidth: 1,
            borderColor: focus.focused ? c.accent : "transparent",
          }}
        >
          {[0, 1, 2, 3, 4].map((tick) => (
            <div
              key={tick}
              style={{
                position: "absolute",
                left: 0,
                top: (tick * plotHeight) / 4,
              }}
            >
              <Text size={10} color={c.muted} style={{ width: 46 }}>
                {formatValue(
                  domain.max - ((domain.max - domain.min) * tick) / 4,
                )}
              </Text>
            </div>
          ))}
          <div
            style={{
              position: "absolute",
              left: 50,
              top: 0,
              width: plotWidth,
              height: plotHeight,
            }}
          >
            {[0, 1, 2, 3, 4].map((tick) => (
              <div
                key={tick}
                style={{
                  position: "absolute",
                  left: 0,
                  top: (tick * plotHeight) / 4,
                  width: plotWidth,
                  height: 1,
                  backgroundColor: c.border,
                }}
              />
            ))}
            {variant === "line" || variant === "area"
              ? visible.map((s) => {
                  const color = chartColor(
                    s.color,
                    palette[series.indexOf(s) % palette.length]!,
                  );
                  const segments = lineSegments(
                    s.values,
                    domain,
                    plotWidth,
                    plotHeight,
                  );
                  return (
                    <div key={s.id}>
                      {variant === "area" ? (
                        <Shape
                          testId={`${testId}-area-${s.id}`}
                          width={plotWidth}
                          height={plotHeight}
                          color={color}
                          opacity={0.16}
                          body={segments
                            .map((d) => {
                              const match = d.match(/M([^,]+),/);
                              const last = d.match(/(?:M|L)([^,]+),[^ ]+$/);
                              return `<path fill="white" d="${d} L${last?.[1] ?? 0},${baseline} L${match?.[1] ?? 0},${baseline} Z"/>`;
                            })
                            .join("")}
                        />
                      ) : null}
                      <Shape
                        testId={`${testId}-line-${s.id}`}
                        width={plotWidth}
                        height={plotHeight}
                        color={color}
                        body={
                          segments
                            .map(
                              (d) =>
                                `<path fill="none" stroke="white" stroke-width="2" stroke-linecap="round" d="${d}"/>`,
                            )
                            .join("") +
                          s.values
                            .map((v, i) =>
                              v === null
                                ? ""
                                : `<circle cx="${categoryX(i, categories.length, plotWidth)}" cy="${chartY(v, domain, plotHeight)}" r="2.5" fill="white"/>`,
                            )
                            .join("")
                        }
                      />
                    </div>
                  );
                })
              : categories.map((category, index) => {
                  let positive = 0,
                    negative = 0;
                  return (
                    <div key={category.id}>
                      {visible.map((s, si) => {
                        const value = s.values[index];
                        if (value === null || value === undefined) return null;
                        const base =
                          variant === "stacked-bar"
                            ? value >= 0
                              ? positive
                              : negative
                            : 0;
                        if (value >= 0) positive += value;
                        else negative += value;
                        const end = base + value,
                          y = Math.min(
                            chartY(base, domain, plotHeight),
                            chartY(end, domain, plotHeight),
                          );
                        const barWidth =
                          (cellWidth * 0.72) /
                          (variant === "stacked-bar" ? 1 : visible.length);
                        return (
                          <div
                            key={s.id}
                            testId={`${testId}-bar-${category.id}-${s.id}`}
                            style={{
                              position: "absolute",
                              left:
                                index * cellWidth +
                                cellWidth * 0.14 +
                                (variant === "stacked-bar" ? 0 : si * barWidth),
                              top: y,
                              width: Math.max(1, barWidth - 1),
                              height: Math.max(
                                0,
                                Math.abs(
                                  chartY(base, domain, plotHeight) -
                                    chartY(end, domain, plotHeight),
                                ),
                              ),
                              backgroundColor: chartColor(
                                s.color,
                                palette[series.indexOf(s) % palette.length]!,
                              ),
                              borderRadius: 2,
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                })}
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                testId={`${testId}-point-${cat.id}`}
                onMouseEnter={() => select(index)}
                onClick={(event) => {
                  if (event.button !== undefined && event.button !== 0) return;
                  select(index);
                  onActivate?.(cat);
                }}
                style={{
                  position: "absolute",
                  left: index * cellWidth,
                  top: 0,
                  width: cellWidth,
                  height: plotHeight,
                  backgroundColor:
                    selected === index ? c.accentSoft : "transparent",
                  opacity: selected === index ? 0.3 : 1,
                  cursor: "crosshair",
                }}
              />
            ))}
          </div>
          {categories.map((category, index) =>
            index === 0 ||
            index === categories.length - 1 ||
            index % Math.max(1, Math.ceil(categories.length / 6)) === 0 ? (
              <div
                key={category.id}
                style={{
                  position: "absolute",
                  left: Math.min(
                    width - 76,
                    Math.max(
                      50,
                      50 + categoryX(index, categories.length, plotWidth) - 38,
                    ),
                  ),
                  top: plotHeight + 7,
                  width: 76,
                }}
              >
                <Text
                  size={10}
                  color={c.muted}
                  lines={1}
                  style={{ textAlign: "center" }}
                >
                  {category.label}
                </Text>
              </div>
            ) : null,
          )}
        </div>
      )}
      <Text testId={`${testId}-readout`} size={11} color={c.muted} lines={2}>
        {!loading && !error && selected !== null
          ? `${categories[selected]?.label}: ${visible.map((s) => `${s.label} ${s.values[selected] === null ? "—" : formatValue(s.values[selected]!)}`).join(" · ")}`
          : "Select a category with the pointer or arrow keys."}
      </Text>
    </Stack>
  );
}
export const LineChart = (props: Omit<CartesianChartProps, "variant">) => (
  <CartesianChart {...props} variant="line" />
);
export const AreaChart = (props: Omit<CartesianChartProps, "variant">) => (
  <CartesianChart {...props} variant="area" />
);
export const BarChart = ({
  stacked = false,
  ...props
}: Omit<CartesianChartProps, "variant"> & { stacked?: boolean }) => (
  <CartesianChart {...props} variant={stacked ? "stacked-bar" : "bar"} />
);
export interface PieChartProps {
  data: readonly ChartDatum[];
  size?: number;
  selectedId?: string | null;
  onSelectionChange?: (id: string) => void;
  loading?: boolean;
  testId: string;
  donut?: boolean;
}
export function PieChart({
  data,
  size: requestedSize = 180,
  selectedId,
  onSelectionChange,
  loading = false,
  testId,
  donut = false,
}: PieChartProps) {
  const sizeValid =
    Number.isFinite(requestedSize) &&
    requestedSize >= 80 &&
    requestedSize <= 1024;
  const size = sizeValid ? requestedSize : 180;
  const { colors: c } = useTheme();
  const focus = useFocusTarget(loading);
  const [local, setLocal] = useState<string | null>(null);
  const model = pieModel(data);
  if (!sizeValid) model.error = "Chart size must be between 80 and 1024.";
  const selected = selectedId === undefined ? local : selectedId;
  const palette = [c.accent, c.success, c.warning, c.danger, c.muted];
  const choose = (id: string) => {
    setLocal(id);
    onSelectionChange?.(id);
  };
  const active = model.segments.find((s) => s.datum.id === selected);
  return (
    <Stack testId={testId} gap={10}>
      <Row gap={20} style={{ alignItems: "center", flexWrap: "wrap" }}>
        <div
          testId={`${testId}-plot`}
          ref={focus.ref}
          tabIndex={loading ? -1 : 0}
          onMouseDown={focus.onMouseDown}
          onKeyDown={(event) => {
            focus.onKeyDown(event);
            if (loading || model.error) return;
            const n = model.segments.length;
            if (!n) return;
            const current = model.segments.findIndex(
              (s) => s.datum.id === selected,
            );
            const next =
              event.key === "home"
                ? 0
                : event.key === "end"
                  ? n - 1
                  : event.key === "right"
                    ? (current + 1 + n) % n
                    : event.key === "left"
                      ? current < 0
                        ? n - 1
                        : (current - 1 + n) % n
                      : -1;
            if (next >= 0) choose(model.segments[next]!.datum.id);
          }}
          style={{
            position: "relative",
            width: size,
            height: size,
            flexShrink: 0,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: focus.focused ? c.accent : "transparent",
          }}
        >
          {loading || model.error || !model.total ? (
            <Text
              testId={`${testId}-${loading ? "loading" : model.error ? "error" : "empty"}`}
              size={12}
              color={model.error ? c.danger : c.muted}
            >
              {loading
                ? "Loading chart…"
                : (model.error ?? "No positive values")}
            </Text>
          ) : (
            model.segments.map((segment) => (
              <Shape
                key={segment.datum.id}
                testId={`${testId}-slice-${segment.datum.id}`}
                width={size}
                height={size}
                color={chartColor(
                  segment.datum.color,
                  palette[data.indexOf(segment.datum) % palette.length]!,
                )}
                opacity={active && selected !== segment.datum.id ? 0.45 : 1}
                body={`<path fill="white" d="${arcPath(size / 2, size / 2, size / 2 - 8, segment.start, segment.end, donut ? size * 0.3 : 0)}"/>`}
              />
            ))
          )}
          {donut && !loading && !model.error && model.total ? (
            <div
              style={{
                position: "absolute",
                top: size / 2 - 12,
                left: size * 0.3,
                width: size * 0.4,
              }}
            >
              <Text size={18} weight={600}>
                {Number(model.total.toPrecision(4))}
              </Text>
            </div>
          ) : null}
        </div>
        <Stack gap={4}>
          {data.map((datum, index) => (
            <Button
              key={datum.id}
              testId={`${testId}-legend-${datum.id}`}
              size="sm"
              variant="ghost"
              disabled={loading || !!model.error || datum.value <= 0}
              style={{
                justifyContent: "flex-start",
                backgroundColor:
                  selected === datum.id ? c.accentSoft : "transparent",
              }}
              leading={
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: chartColor(
                      datum.color,
                      palette[index % palette.length]!,
                    ),
                  }}
                />
              }
              onPress={() => choose(datum.id)}
            >
              {datum.label}
            </Button>
          ))}
        </Stack>
      </Row>
      <Text testId={`${testId}-readout`} size={11} color={c.muted}>
        {!loading && !model.error && active
          ? `${active.datum.label}: ${active.datum.value} (${(active.fraction * 100).toFixed(1)}%)`
          : "Choose a slice from its legend or use arrow keys."}
      </Text>
    </Stack>
  );
}
export const DonutChart = (props: Omit<PieChartProps, "donut">) => (
  <PieChart {...props} donut />
);
export type { ChartCategory, ChartSeries, ChartDatum } from "./model";
