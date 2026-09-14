import { TrackExamples } from "./tracks";
import { useState } from "react";
import {
  UIKitProvider,
  AppShell,
  Toolbar,
  Input,
  SegmentedControl,
  Stack,
  Row,
  Text,
  Card,
  CardHeader,
  CardContent,
  Slider,
  RangeSlider,
  Calendar,
  RangeCalendar,
  DatePicker,
  DateRangePicker,
  type DateRange,
  type ThemeMode,
} from "@mirai/gpuix-kit";
const unavailable = (date: string) => date === "2024-02-13";
export function ControlsGallery({
  initialPage = "sliders",
}: { initialPage?: string } = {}) {
  const [mode, setMode] = useState<ThemeMode>("dark"),
    [name, setName] = useState("Native controls"),
    [page, setPage] = useState(initialPage);
  const [volume, setVolume] = useState(40),
    [range, setRange] = useState<[number, number]>([20, 70]),
    [vertical, setVertical] = useState(50),
    [decimal, setDecimal] = useState(0.35),
    [commits, setCommits] = useState(0);
  const [month, setMonth] = useState("2024-02"),
    [date, setDate] = useState<string | null>("2024-02-29"),
    [rangeMonth, setRangeMonth] = useState("2024-02"),
    [dates, setDates] = useState<DateRange>({
      start: "2024-02-10",
      end: "2024-02-12",
    });
  const [pickerMonth, setPickerMonth] = useState("2024-02"),
    [picked, setPicked] = useState<string | null>(null),
    [pickerRangeMonth, setPickerRangeMonth] = useState("2024-02"),
    [pickedRange, setPickedRange] = useState<DateRange>({
      start: null,
      end: null,
    });
  return (
    <UIKitProvider mode={mode}>
      <AppShell>
        <Toolbar>
          <Input
            testId="controls-name"
            value={name}
            onValueChange={setName}
            style={{ width: 260 }}
          />
          <Row style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <SegmentedControl
              testId="controls-theme"
              value={mode}
              onValueChange={(v) => setMode(v as ThemeMode)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </Row>
        </Toolbar>
        <Stack
          gap={18}
          style={{
            padding: 24,
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            overflowY: "scroll",
          }}
          testId="controls-scroll"
        >
          <Text size={26} weight={600}>
            Precision, dates and ranges.
          </Text>
          <Text>
            Controlled native inputs · keyboard navigation · Darwin light and
            dark themes
          </Text>
          <SegmentedControl
            testId="controls-page"
            value={page}
            onValueChange={setPage}
            options={[
              { value: "sliders", label: "Sliders" },
              { value: "tracks", label: "Tracks and marks" },
              { value: "calendar", label: "Calendars" },
              { value: "pickers", label: "Date pickers" },
            ]}
          />
          {page === "tracks" ? (
            <TrackExamples />
          ) : page === "sliders" ? (
            <Row gap={18} style={{ alignItems: "stretch", flexWrap: "wrap" }}>
              <Card style={{ width: 380 }}>
                <CardHeader
                  title="Values and intervals"
                  description="Drag a thumb, or use arrows, Home / End and Page keys."
                />
                <CardContent>
                  <Slider
                    testId="volume"
                    label="Volume"
                    value={volume}
                    onValueChange={setVolume}
                    onValueCommit={() => setCommits((n) => n + 1)}
                    step={5}
                    formatValue={(v) => `${v}%`}
                  />
                  <RangeSlider
                    testId="range"
                    label="Working interval"
                    value={range}
                    onValueChange={setRange}
                    step={5}
                  />
                  <Slider
                    testId="decimal"
                    label="Decimal increments"
                    value={decimal}
                    onValueChange={setDecimal}
                    min={0.1}
                    max={1}
                    step={0.05}
                  />
                  <Text testId="commit-count">Commits: {commits}</Text>
                </CardContent>
              </Card>
              <Card style={{ width: 330 }}>
                <CardHeader title="Orientation and state" />
                <CardContent>
                  <Slider
                    testId="vertical"
                    label="Vertical"
                    value={vertical}
                    onValueChange={setVertical}
                    orientation="vertical"
                    length={160}
                    step={10}
                  />
                  <Slider
                    testId="disabled-slider"
                    label="Disabled"
                    value={30}
                    onValueChange={() => {}}
                    disabled
                  />
                </CardContent>
              </Card>
            </Row>
          ) : page === "calendar" ? (
            <Row
              gap={18}
              style={{ alignItems: "flex-start", flexWrap: "wrap" }}
            >
              <Card style={{ width: 330 }}>
                <CardHeader
                  title="Calendar"
                  description="Leap year · localized month · bounded dates"
                />
                <CardContent>
                  <Calendar
                    testId="calendar"
                    month={month}
                    onMonthChange={setMonth}
                    value={date}
                    onValueChange={setDate}
                    min="2024-01-01"
                    max="2025-12-31"
                    today="2024-02-29"
                    locale="zh-CN"
                    isDateDisabled={unavailable}
                  />
                  <Text testId="calendar-value">{date ?? "none"}</Text>
                </CardContent>
              </Card>
              <Card style={{ width: 330 }}>
                <CardHeader
                  title="Range calendar"
                  description="13 February is unavailable, including inside a range."
                />
                <CardContent>
                  <RangeCalendar
                    testId="range-calendar"
                    month={rangeMonth}
                    onMonthChange={setRangeMonth}
                    value={dates}
                    onValueChange={setDates}
                    min="2024-01-01"
                    max="2025-12-31"
                    isDateDisabled={unavailable}
                    maxRangeDays={30}
                  />
                  <Text testId="range-calendar-value">
                    {dates.start ?? "none"} / {dates.end ?? "none"}
                  </Text>
                </CardContent>
              </Card>
            </Row>
          ) : (
            <Stack>
              <Card style={{ width: 620 }}>
                <CardHeader
                  title="Popover date selection"
                  description="Escape restores trigger focus. Clear resets controlled values."
                />
                <CardContent>
                  <DatePicker
                    testId="date-picker"
                    month={pickerMonth}
                    onMonthChange={setPickerMonth}
                    value={picked}
                    onValueChange={setPicked}
                    min="2024-02-10"
                    max="2024-04-30"
                    isDateDisabled={unavailable}
                  />
                  <Text testId="picked-value">{picked ?? "none"}</Text>
                  <DateRangePicker
                    testId="range-picker"
                    month={pickerRangeMonth}
                    onMonthChange={setPickerRangeMonth}
                    value={pickedRange}
                    onValueChange={setPickedRange}
                    min="2024-02-10"
                    max="2024-04-30"
                    isDateDisabled={unavailable}
                  />
                  <Text testId="picked-range-value">
                    {pickedRange.start ?? "none"} / {pickedRange.end ?? "none"}
                  </Text>
                </CardContent>
              </Card>
            </Stack>
          )}
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
