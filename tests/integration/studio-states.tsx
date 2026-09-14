import { useState } from "react";
import assert from "node:assert/strict";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Text,
  Button,
  CartesianChart,
  PieChart,
  MessageComposer,
  MessageList,
  Timeline,
  type MessageDraft,
  type MessageAttachment,
} from "@mirai/gpuix-kit";
let count = 0;
let afterChartActivations = 0;
let rejectSend: ((reason?: unknown) => void) | undefined;
let snapshot: MessageDraft | undefined;
function Charts() {
  const categories = [{ id: "a", label: "A" }];
  return (
    <UIKitProvider>
      <AppShell>
        <Stack gap={8} style={{ padding: 10 }}>
          <CartesianChart
            testId="chart-loading"
            loading
            categories={categories}
            series={[{ id: "s", label: "S", values: [1] }]}
            width={300}
            height={108}
          />
          <CartesianChart
            testId="chart-empty"
            categories={[]}
            series={[]}
            width={300}
            height={108}
          />
          <CartesianChart
            testId="chart-invalid"
            categories={categories}
            series={[{ id: "s", label: "S", values: [NaN] }]}
            width={300}
            height={108}
          />
          <PieChart
            testId="pie-zero"
            data={[{ id: "a", label: "A", value: 0 }]}
            size={100}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function Messaging() {
  const [text, setText] = useState("draft"),
    [attachments, setAttachments] = useState<MessageAttachment[]>([]),
    [disabled, setDisabled] = useState(false);
  return (
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 16 }}>
          <Button testId="disable" onPress={() => setDisabled((v) => !v)}>
            Toggle disabled
          </Button>
          <Button
            testId="attach-pending"
            onPress={() =>
              setAttachments([
                { id: "a", name: "pending.txt", state: "loading" },
              ])
            }
          >
            Pending attachment
          </Button>
          <Button
            testId="attach-ready"
            onPress={() =>
              setAttachments([{ id: "a", name: "ready.txt", state: "ready" }])
            }
          >
            Ready attachment
          </Button>
          <MessageComposer
            testId="composer"
            value={text}
            onValueChange={setText}
            maxLength={20}
            disabled={disabled}
            attachments={attachments}
            onRemoveAttachment={() => setAttachments([])}
            onSend={(draft) => {
              count++;
              snapshot = draft;
              return new Promise<void>((_, reject) => {
                rejectSend = reject;
              });
            }}
          />
          <Text testId="draft-value">{text}</Text>
          <MessageList testId="messages-empty" messages={[]} height={40} />
          <Timeline testId="timeline-empty" items={[]} />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
const root = createTestRoot({ width: 900, height: 900 });
root.render(<Charts />);
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
const fill = async (value: string) => {
  await app.getByTestId("composer-input").fill(value);
  await settle();
};
try {
  await settle();
  assert(get("chart-loading-loading"));
  assert(!get("chart-loading-plot"));
  assert(get("chart-empty-empty"));
  assert(get("chart-invalid-error"));
  assert(!get("chart-invalid-line-s"));
  assert(get("pie-zero-empty"));
  await press("pie-zero-legend-a", "enter");
  assert(!get("pie-zero-slice-a"));
  // 非整数受控索引不能进入数值格式化；饼图首次向左应选最后一项。
  root.render(
    <UIKitProvider>
      <AppShell>
        <Stack>
          <CartesianChart
            testId="fractional"
            categories={[{ id: "a", label: "A" }]}
            series={[{ id: "s", label: "S", values: [3] }]}
            activeIndex={0.5}
          />
          <PieChart
            testId="pie-keyboard"
            data={[
              { id: "a", label: "A", value: 1 },
              { id: "b", label: "B", value: 2 },
              { id: "c", label: "C", value: 3 },
            ]}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  assert(
    (await app.getByTestId("fractional-readout").textContent()).includes(
      "Select a category",
    ),
  );
  await press("pie-keyboard-plot", "left");
  assert(
    (await app.getByTestId("pie-keyboard-readout").textContent()).includes(
      "C: 3",
    ),
  );
  // 错误图表仍应允许 Tab 离开，不能形成键盘陷阱。
  root.render(
    <UIKitProvider>
      <AppShell>
        <Stack>
          <PieChart
            testId="pie-invalid"
            data={[{ id: "a", label: "A", value: -1 }]}
          />
          <Button
            testId="after-pie"
            onPress={() => {
              afterChartActivations++;
            }}
          >
            After chart
          </Button>
        </Stack>
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  await press("pie-invalid-plot", "tab");
  root.renderer.simulateKeystrokes("enter");
  await settle();
  assert.equal(afterChartActivations, 1, "Tab leaves the invalid chart");
  root.render(<Messaging />);
  await settle();
  assert(get("messages-empty-empty"));
  assert(get("timeline-empty-empty"));
  await press("composer-input", "shift-enter");
  assert.equal(count, 0, "Shift+Enter creates a newline, not a send");
  assert((await app.getByTestId("draft-value").textContent()).includes("\n"));
  await press("composer-send", "enter");
  await press("composer-send", "enter");
  assert.equal(count, 1, "Pending send is locked");
  await fill("overwrite");
  assert(
    (await app.getByTestId("draft-value").textContent()).includes("draft"),
    "Pending composer is read-only",
  );
  rejectSend?.(new Error("simulated"));
  await settle();
  await settle();
  assert(get("composer-error"));
  assert(snapshot?.text.includes("draft"));
  await fill("this draft exceeds twenty characters");
  await press("composer-send", "enter");
  assert.equal(count, 1);
  await fill("short");
  await press("attach-pending", "enter");
  assert(get("composer-pending-attachments"));
  await press("composer-send", "enter");
  assert.equal(count, 1);
  await press("composer-remove-a", "enter");
  await press("disable", "enter");
  await press("composer-send", "enter");
  assert.equal(count, 1);
  await press("disable", "enter");
  await fill("");
  await press("attach-ready", "enter");
  await press("composer-send", "enter");
  assert.equal(count, 2);
  assert.deepEqual(snapshot?.attachmentIds, ["a"]);
  assert.equal(snapshot?.text, "");
  root.render(null);
  rejectSend?.(new Error("unmount"));
  await settle();
  console.log(
    "PASS Studio invalid/empty/loading charts, empty feeds, composer newline/lock/failure/length/disabled/attachments/unmount",
  );
} finally {
  root.render(null);
  await app.close();
}
