import { useRef, useState } from "react";
import type { PublicInstance } from "@gpuix/react";
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
  Button,
  MonthPicker,
  YearPicker,
  Calendar,
  DualCalendar,
  DateRangePanel,
  DateRangeDialog,
  createDateRangePresets,
  type DateRange,
  type ThemeMode,
} from "@mirai/gpuix-kit";
const presets = createDateRangePresets("2024-03-15");
const blockedDay = (date: string) => date === "2024-03-05";
export function DatesGallery() {
  const [mode, setMode] = useState<ThemeMode>("dark"),
    [name, setName] = useState("Dates and planning"),
    [page, setPage] = useState("periods");
  const [year, setYear] = useState(2024),
    [month, setMonth] = useState<string | null>("2024-02"),
    [yearPage, setYearPage] = useState(2024),
    [chosenYear, setChosenYear] = useState<number | null>(2024);
  const [visible, setVisible] = useState("2024-02"),
    [date, setDate] = useState<string | null>("2024-02-29"),
    [dualMonth, setDualMonth] = useState("2024-02"),
    [dualDate, setDualDate] = useState<string | null>("2024-02-29");
  const [rangeMonth, setRangeMonth] = useState("2024-02"),
    [range, setRange] = useState<DateRange>({
      start: "2024-02-26",
      end: "2024-03-02",
    }),
    [cancelled, setCancelled] = useState(0),
    [open, setOpen] = useState(false);
  const trigger = useRef<PublicInstance>(null);
  return (
    <UIKitProvider mode={mode}>
      <AppShell
        overlay={
          <DateRangeDialog
            testId="range-dialog"
            open={open}
            onOpenChange={setOpen}
            value={range}
            onValueChange={setRange}
            month={rangeMonth}
            onMonthChange={setRangeMonth}
            presets={presets}
            min="2023-01-01"
            max="2025-12-31"
            maxRangeDays={62}
            restoreFocusRef={trigger}
          />
        }
      >
        <Toolbar>
          <Input
            testId="dates-name"
            value={name}
            onValueChange={setName}
            style={{ width: 300 }}
          />
          <Row style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <SegmentedControl
              testId="dates-theme"
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
          testId="dates-scroll"
          gap={18}
          style={{
            padding: 24,
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            overflowY: "scroll",
          }}
        >
          <Text size={26} weight={600}>
            Plan across months. Commit with intent.
          </Text>
          <Text>Months, years, adjacent calendars and date range drafts.</Text>
          <SegmentedControl
            testId="dates-page"
            value={page}
            onValueChange={setPage}
            options={[
              { value: "periods", label: "Months and years" },
              { value: "navigation", label: "Quick navigation" },
              { value: "duals", label: "Two months" },
              { value: "ranges", label: "Range workflows" },
            ]}
          />
          {page === "periods" ? (
            <Row gap={18} style={{ alignItems: "stretch", flexWrap: "wrap" }}>
              <Card style={{ width: 320 }}>
                <CardHeader
                  title="Month picker"
                  description="A year at a glance. Page keys change year."
                />
                <CardContent>
                  <MonthPicker
                    testId="month-picker"
                    year={year}
                    onYearChange={setYear}
                    value={month}
                    onValueChange={setMonth}
                    min="2023-03"
                    max="2025-10"
                    locale="zh-CN"
                    isMonthDisabled={(m) => m === "2024-06"}
                  />
                  <Text testId="month-picked">{month ?? "None"}</Text>
                </CardContent>
              </Card>
              <Card style={{ width: 320 }}>
                <CardHeader
                  title="Year picker"
                  description="Twelve years per page. The full date domain remains reachable."
                />
                <CardContent>
                  <YearPicker
                    testId="year-picker"
                    pageYear={yearPage}
                    onPageYearChange={setYearPage}
                    value={chosenYear}
                    onValueChange={setChosenYear}
                    min={1900}
                    max={2100}
                  />
                  <Text testId="year-picked">{String(chosenYear)}</Text>
                </CardContent>
              </Card>
            </Row>
          ) : page === "navigation" ? (
            <Card style={{ width: 420 }}>
              <CardHeader
                title="Jump to a month or year"
                description="Click the calendar heading, then the year. Escape steps back through the views."
              />
              <CardContent>
                <Calendar
                  testId="quick-calendar"
                  value={date}
                  onValueChange={setDate}
                  month={visible}
                  onMonthChange={setVisible}
                  navigation="month-year"
                  min="2020-01-01"
                  max="2030-12-31"
                />
                <Text testId="quick-date">{date}</Text>
              </CardContent>
            </Card>
          ) : page === "duals" ? (
            <Card style={{ width: 620 }}>
              <CardHeader
                title="Adjacent months, one selection"
                description="Arrow keys cross between the two grids. Unavailable dates remain visible."
              />
              <CardContent>
                <DualCalendar
                  testId="dual"
                  value={dualDate}
                  onValueChange={setDualDate}
                  month={dualMonth}
                  onMonthChange={setDualMonth}
                  min="2024-01-01"
                  max="2024-12-31"
                  isDateDisabled={blockedDay}
                />
                <Text testId="dual-date">{dualDate}</Text>
              </CardContent>
            </Card>
          ) : (
            <Card style={{ width: 620 }}>
              <CardHeader
                title="Review before applying"
                description="Preset or calendar changes remain a draft until you apply them."
              />
              <CardContent>
                <DateRangePanel
                  testId="range-panel"
                  value={range}
                  onApply={setRange}
                  onCancel={() => setCancelled((n) => n + 1)}
                  month={rangeMonth}
                  onMonthChange={setRangeMonth}
                  presets={presets}
                  min="2023-01-01"
                  max="2025-12-31"
                  maxRangeDays={62}
                />
                <Text testId="range-committed">{`${range.start} / ${range.end}`}</Text>
                <Text
                  testId="range-cancels"
                  size={11}
                >{`Cancelled: ${cancelled}`}</Text>
                <Button
                  testId="range-dialog-trigger"
                  ref={trigger}
                  onPress={() => setOpen(true)}
                >
                  Open range dialog
                </Button>
              </CardContent>
            </Card>
          )}
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
