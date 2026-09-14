import assert from "node:assert/strict";
import { useState } from "react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Text,
  MonthPicker,
  YearPicker,
  DualCalendar,
  DualRangeCalendar,
  DateRangePresets,
  DateRangeDialog,
  DateRangePanel,
  DatePicker,
  Dialog,
  type DateRange,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 1000, height: 800 }),
  app = await connectTest(root.renderer);
let changes = 0;
const changed = () => {
  changes++;
};
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const text = (id: string) => app.getByTestId(id).textContent();
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const key = async (key: string) => {
  root.renderer.simulateKeystrokes(key);
  await settle();
};
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
function Bounds() {
  const [month, setMonth] = useState("9999-12"),
    [date, setDate] = useState<string | null>("9999-12-31");
  return (
    <UIKitProvider>
      <AppShell>
        <Stack>
          <YearPicker
            testId="last-years"
            pageYear={9999}
            onPageYearChange={changed}
            value={9999}
            onValueChange={changed}
          />
          <DualCalendar
            testId="domain"
            month={month}
            onMonthChange={setMonth}
            value={date}
            onValueChange={setDate}
          />
          <Text testId="domain-date">{date}</Text>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function RangeCases() {
  const [month, setMonth] = useState("2024-02"),
    [value, setValue] = useState<DateRange>({ start: null, end: null });
  return (
    <UIKitProvider>
      <AppShell>
        <DualRangeCalendar
          testId="blocked-range"
          value={value}
          onValueChange={setValue}
          month={month}
          onMonthChange={setMonth}
          maxRangeDays={10}
          isDateDisabled={(d) => d === "2024-03-01"}
        />
        <Text testId="range-result">{`${value.start} / ${value.end}`}</Text>
      </AppShell>
    </UIKitProvider>
  );
}
function Nested() {
  const [open, setOpen] = useState(true),
    [month, setMonth] = useState("2024-02");
  return (
    <UIKitProvider>
      <AppShell
        children={null}
        overlay={
          <DateRangeDialog
            testId="nested"
            open={open}
            onOpenChange={setOpen}
            month={month}
            onMonthChange={setMonth}
            value={{ start: "2024-02-01", end: "2024-02-03" }}
            onValueChange={changed}
          />
        }
      />
    </UIKitProvider>
  );
}
function Popup() {
  const [open, setOpen] = useState(true),
    [month, setMonth] = useState("2024-02");
  return (
    <UIKitProvider>
      <AppShell
        children={null}
        overlay={
          <Dialog
            testId="outer"
            title="Date navigation"
            open={open}
            onOpenChange={setOpen}
          >
            <DatePicker
              testId="popup"
              month={month}
              onMonthChange={setMonth}
              value={null}
              onValueChange={changed}
              navigation="month-year"
            />
          </Dialog>
        }
      />
    </UIKitProvider>
  );
}
try {
  root.render(
    <UIKitProvider>
      <AppShell>
        <MonthPicker
          testId="bad-month"
          year={0}
          onYearChange={changed}
          value={null}
          onValueChange={changed}
        />
        <YearPicker
          testId="bad-year"
          pageYear={2024}
          min={2050}
          max={2000}
          onPageYearChange={changed}
          value={null}
          onValueChange={changed}
        />
        <MonthPicker
          testId="readonly"
          year={2024}
          onYearChange={changed}
          value="2024-01"
          readOnly
          onValueChange={changed}
        />
        <MonthPicker
          testId="disabled"
          year={2024}
          onYearChange={changed}
          value={null}
          disabled
          onValueChange={changed}
        />
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  assert(get("bad-month-error"));
  assert(get("bad-year-error"));
  await press("readonly-grid", "right");
  await key("enter");
  assert.equal(changes, 0);
  await press("disabled-grid", "enter");
  assert.equal(changes, 0);
  root.render(<Bounds />);
  await settle();
  assert(get("last-years-item-9999"));
  assert(!get("last-years-item-10000"));
  await press("last-years-next", "enter");
  assert.equal(changes, 0);
  await press("domain-right-grid", "end");
  await key("enter");
  assert.equal(await text("domain-date"), "9999-12-31");
  await press("domain-left-grid", "right");
  assert(get("domain-right-grid"));
  root.render(
    <UIKitProvider>
      <AppShell>
        <DualCalendar
          testId="first"
          month="0001-01"
          onMonthChange={changed}
          value="0001-01-31"
          onValueChange={changed}
          layout="vertical"
          readOnly
        />
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  const firstLeft = await app.getByTestId("first-left-grid").bounds(),
    firstRight = await app.getByTestId("first-right-grid").bounds();
  assert(firstRight.y > firstLeft.y);
  await press("first-left-grid", "right");
  assert.equal(await text("first-right-active"), "0001-02-01");
  await key("left");
  assert.equal(await text("first-left-active"), "0001-01-31");
  await key("enter");
  assert.equal(changes, 0);
  root.render(<RangeCases />);
  await settle();
  await click("blocked-range-left-day-2024-02-28");
  await click("blocked-range-right-day-2024-03-02");
  assert(get("blocked-range-selection-error"));
  assert.equal(await text("range-result"), "2024-02-28 / null");
  await click("blocked-range-left-day-2024-02-29");
  assert.equal(await text("range-result"), "2024-02-28 / 2024-02-29");
  await click("blocked-range-right-day-2024-03-20");
  await click("blocked-range-right-day-2024-03-02");
  assert(get("blocked-range-selection-error"));
  assert.equal(await text("range-result"), "2024-03-20 / null");
  const invalidPreset = {
    id: "blocked",
    label: "Blocked interior",
    value: { start: "2024-02-28", end: "2024-03-02" },
  };
  root.render(
    <UIKitProvider>
      <AppShell>
        <DateRangePresets
          testId="presets"
          presets={[invalidPreset]}
          value={{ start: null, end: null }}
          onValueChange={changed}
          isDateDisabled={(d) => d === "2024-02-29"}
        />
        <DateRangePresets
          testId="duplicates"
          presets={[invalidPreset, invalidPreset]}
          value={{ start: null, end: null }}
          onValueChange={changed}
        />
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  assert(get("duplicates-error"));
  await press("presets-blocked", "enter");
  assert.equal(changes, 0);
  const renderPanel = (value: DateRange) =>
    root.render(
      <UIKitProvider>
        <AppShell>
          <DateRangePanel
            testId="external-panel"
            month="2024-02"
            onMonthChange={() => {}}
            value={value}
            onApply={changed}
            onCancel={() => {}}
          />
        </AppShell>
      </UIKitProvider>,
    );
  renderPanel({ start: "2024-02-01", end: "2024-02-03" });
  await settle();
  await click("external-panel-calendar-left-day-2024-02-10");
  assert.equal(await text("external-panel-draft"), "2024-02-10 – …");
  renderPanel({ start: "2024-02-20", end: "2024-02-22" });
  await settle();
  assert.equal(
    await text("external-panel-draft"),
    "2024-02-20 – 2024-02-22",
    "An explicit external value change replaces the open draft",
  );
  root.render(<Nested />);
  await settle();
  await press("nested-panel-calendar-month-button", "enter");
  await press("nested-panel-calendar-months-title", "enter");
  assert(get("nested-panel-calendar-years"));
  await key("escape");
  assert(get("nested-panel-calendar-months"));
  assert(get("nested"));
  await key("escape");
  assert(get("nested-panel-calendar-left-grid"));
  assert(get("nested"));
  await press("nested-panel-calendar-right-grid", "tab");
  await key("enter");
  assert(
    get("nested"),
    "Returning from month/year navigation must preserve calendar-to-footer focus order",
  );
  assert.equal(await text("nested-panel-draft"), "… – …");
  await key("escape");
  assert(!get("nested"));
  root.render(<Popup />);
  await settle();
  await press("popup-trigger", "enter");
  await press("popup-calendar-month-button", "enter");
  await press("popup-calendar-months-title", "enter");
  await key("escape");
  assert(get("popup-calendar-months"));
  await key("escape");
  assert(get("popup-calendar-grid"));
  await key("escape");
  assert(!get("popup-popover"));
  assert(get("outer"));
  await key("escape");
  assert(!get("outer"));
  console.log(
    "PASS dates invalid/readonly/disabled/year-domain, disabled range interiors/duration, invalid presets and multi-level Escape in Dialog/Popover",
  );
} finally {
  root.render(null);
  await app.close();
}
