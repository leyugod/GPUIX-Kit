import { useRef, useState } from "react";
import type { PublicInstance } from "@gpuix/react";
import assert from "node:assert/strict";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Button,
  Text,
  Dialog,
  Slider,
  Calendar,
  RangeCalendar,
  DatePicker,
  type DateRange,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 900, height: 800 });
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
let changed = 0;
function Invalid() {
  return (
    <UIKitProvider>
      <AppShell>
        <Stack>
          <Slider
            testId="invalid-slider"
            value={NaN}
            step={0}
            onValueChange={() => {
              changed++;
            }}
          />
          <Calendar
            testId="invalid-calendar"
            month="2024-13"
            onMonthChange={() => {
              changed++;
            }}
            value={null}
            onValueChange={() => {
              changed++;
            }}
          />
          <Slider
            testId="locked"
            value={5}
            min={5}
            max={5}
            onValueChange={() => {
              changed++;
            }}
          />
          <Slider
            testId="controlled"
            value={5}
            onValueChange={() => {
              changed++;
            }}
          />
          <Button
            testId="after"
            onPress={() => {
              changed++;
            }}
          >
            After
          </Button>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function Bounds() {
  const [month, setMonth] = useState("0001-01");
  return (
    <UIKitProvider>
      <AppShell>
        <Calendar
          testId="bounds"
          month={month}
          onMonthChange={setMonth}
          value={null}
          onValueChange={() => {
            changed++;
          }}
        />
        <Button testId="last-year" onPress={() => setMonth("9999-12")}>
          Last year
        </Button>
      </AppShell>
    </UIKitProvider>
  );
}
function Range() {
  const [value, setValue] = useState<DateRange>({ start: null, end: null });
  return (
    <UIKitProvider>
      <AppShell>
        <RangeCalendar
          testId="short-range"
          month="2024-02"
          onMonthChange={() => {}}
          value={value}
          onValueChange={setValue}
          maxRangeDays={3}
        />
        <Text testId="range-state">
          {value.start ?? "none"} / {value.end ?? "none"}
        </Text>
      </AppShell>
    </UIKitProvider>
  );
}
function Nested() {
  const [open, setOpen] = useState(true),
    [value, setValue] = useState<string | null>(null),
    [month, setMonth] = useState("2024-02");
  const trigger = useRef<PublicInstance>(null);
  return (
    <UIKitProvider>
      <AppShell
        overlay={
          <Dialog
            testId="outer"
            title="Schedule"
            open={open}
            onOpenChange={setOpen}
            restoreFocusRef={trigger}
          >
            <DatePicker
              testId="nested-date"
              month={month}
              onMonthChange={setMonth}
              value={value}
              onValueChange={setValue}
            />
          </Dialog>
        }
      >
        <Button
          ref={trigger}
          testId="outer-trigger"
          onPress={() => setOpen(true)}
        >
          Schedule
        </Button>
      </AppShell>
    </UIKitProvider>
  );
}
function Drag({ disabled = false }: { disabled?: boolean }) {
  return (
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 30 }}>
          <Slider
            testId="cancel-disable"
            disabled={disabled}
            value={40}
            onValueChange={() => {
              changed++;
            }}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
try {
  root.render(<Invalid />);
  await settle();
  assert(get("invalid-slider-error"));
  assert(!get("invalid-slider-thumb-0"));
  assert(get("invalid-calendar-error"));
  await press("locked-thumb-0", "right");
  assert.equal(changed, 0);
  await press("controlled-thumb-0", "right");
  assert.equal(changed, 1);
  assert.equal(
    await app.getByTestId("controlled-value").textContent(),
    "5",
    "Application owns controlled values",
  );
  await press("controlled-thumb-0", "tab");
  root.renderer.simulateKeystrokes("enter");
  await settle();
  assert.equal(changed, 2, "Slider Tab proceeds to next control");
  root.render(<Bounds />);
  await settle();
  await press("bounds-grid", "left");
  assert(
    (await app.getByTestId("bounds-active").textContent()).startsWith(
      "0001-01-01",
    ),
  );
  await click("last-year");
  await press("bounds-grid", "end");
  await press("bounds-grid", "pagedown");
  assert(
    (await app.getByTestId("bounds-active").textContent()).startsWith(
      "9999-12",
    ),
  );
  assert(get("bounds-day-9999-12-31"));
  root.render(<Range />);
  await settle();
  await click("short-range-day-2024-02-20");
  await click("short-range-day-2024-02-24");
  assert(get("short-range-selection-error"));
  assert.equal(
    await app.getByTestId("range-state").textContent(),
    "2024-02-20 / none",
  );
  await click("short-range-day-2024-02-18");
  assert.equal(
    await app.getByTestId("range-state").textContent(),
    "2024-02-18 / 2024-02-20",
  );
  root.render(<Nested />);
  await settle();
  await click("nested-date-trigger");
  root.renderer.simulateKeystrokes("escape");
  await settle();
  assert(!get("nested-date-popover"));
  assert(get("outer"), "First Escape closes date popup only");
  root.renderer.simulateKeystrokes("escape");
  await settle();
  assert(!get("outer"));
  root.renderer.simulateKeystrokes("enter");
  await settle();
  assert(get("outer"), "Dialog restores outer trigger focus");
  root.render(<Drag />);
  await settle();
  const b = await app.getByTestId("cancel-disable-thumb-0").bounds();
  root.renderer.nativeSimulateMouseDown(b.x + 10, b.y + 10);
  await settle();
  assert(get("cancel-disable-drag"));
  root.render(<Drag disabled />);
  await settle();
  assert(!get("cancel-disable-drag"));
  const before = changed;
  root.renderer.nativeSimulateMouseMove(b.x + 80, b.y + 10, 0);
  root.renderer.nativeSimulateMouseUp(b.x + 80, b.y + 10, 0);
  await settle();
  assert.equal(changed, before);
  console.log(
    "PASS controls invalid/constant/controlled states, Tab, date domain ends, range duration/reverse, nested Escape and disable during drag",
  );
} finally {
  root.render(null);
  await app.close();
}
